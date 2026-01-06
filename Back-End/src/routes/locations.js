export default async function (fastify, options) {
  // --- 1. GET ALL LOCATIONS (List) ---
  // URL: GET /locations
  // INI YANG SEBELUMNYA HILANG
  fastify.get("/", async (request, reply) => {
    try {
      // Ambil semua kolom dari tabel locations
      const [rows] = await fastify.db.query("SELECT * FROM locations");
      return rows;
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ message: "Gagal memuat daftar lokasi" });
    }
  });

  // --- API BARU: CEK KETERSEDIAAN PER JAM (Availability) ---
  // URL: GET /locations/:id/availability?date=2025-11-24
  // Taruh route spesifik ini SEBELUM route /:id agar tidak tertukar
  fastify.get("/:id/availability", async (req, reply) => {
    const { id } = req.params;
    const { date } = req.query;

    try {
      // 1. Hitung Total Spot
      const [spots] = await fastify.db.query(
        "SELECT COUNT(*) as total FROM location_spots WHERE id_location = ?",
        [id],
      );
      const totalCapacity = spots[0].total;

      // 2. Ambil booking aktif
      const [bookings] = await fastify.db.query(
        `
                SELECT booking_start, duration 
                FROM bookings 
                WHERE id_location = ? 
                AND booking_date = ? 
                AND status != 'cancelled' 
                AND payment_status != 'failed'
            `,
        [id, date],
      );

      // 3. Hitung Usage
      const hoursUsage = {};
      for (let h = 8; h < 18; h++) {
        hoursUsage[h] = 0;
      }

      bookings.forEach((b) => {
        const startHour = new Date(b.booking_start).getHours();
        const duration = b.duration;
        for (let i = 0; i < duration; i++) {
          const hour = startHour + i;
          if (hoursUsage[hour] !== undefined) {
            hoursUsage[hour]++;
          }
        }
      });

      // 4. Format Respon
      const availability = [];
      for (let h = 8; h < 18; h++) {
        const timeString = `${h.toString().padStart(2, "0")}:00`;
        availability.push({
          time: timeString,
          is_full: hoursUsage[h] >= totalCapacity,
          remaining: totalCapacity - hoursUsage[h],
        });
      }

      return availability;
    } catch (error) {
      req.log.error(error);
      return reply.code(500).send({ message: "Gagal memuat ketersediaan" });
    }
  });

  // 2. GET LOCATION DETAIL
  // URL: GET /locations/:id
  fastify.get("/:id", async (request, reply) => {
    try {
      const { id } = request.params;

      // A. Ambil Data Utama Lokasi
      const [locs] = await fastify.db.query(
        "SELECT * FROM locations WHERE id = ?",
        [id],
      );
      if (locs.length === 0)
        return reply.code(404).send({ message: "Lokasi tidak ditemukan" });
      const location = locs[0];

      // B. Ambil Semua Gambar Terkait
      const [images] = await fastify.db.query(
        "SELECT img_path, img_type FROM location_images WHERE id_location = ?",
        [id],
      );

      location.images = images;
      return location;
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ message: "Error server" });
    }
  });

  // 3. GET REVIEWS BY LOCATION
  // URL: GET /locations/:id/reviews
  fastify.get("/:id/reviews", async (request, reply) => {
    try {
      const { id } = request.params;
      const [rows] = await fastify.db.query(
        `
                SELECT 
                    lr.id, lr.rating, lr.comment, lr.created_at,
                    u.name as username, u.avatar_img as avatarUrl
                FROM location_reviews lr
                JOIN users u ON lr.id_user = u.id
                WHERE lr.id_location = ?
                ORDER BY lr.created_at DESC
            `,
        [id],
      );
      return rows;
    } catch (error) {
      return reply.code(500).send({ message: "Gagal mengambil review" });
    }
  });

  // 4. GET SEAT AVAILABILITY
  // URL: GET /locations/:id/spots?date=YYYY-MM-DD&hour=08&duration=2
  fastify.get("/:id/spots", async (request, reply) => {
    try {
      const { id } = request.params;
      const { date, hour, duration } = request.query;

      if (!date)
        return reply.code(400).send({ message: "Tanggal booking wajib diisi" });

      // A. Ambil Master Spot
      const [allSpots] = await fastify.db.query(
        "SELECT spot_name FROM location_spots WHERE id_location = ?",
        [id],
      );

      // B. Ambil Spot yang SUDAH DIBOOKING
      // Jika hour dan duration diberikan, filter berdasarkan overlap waktu
      let bookedSpotsQuery = `
        SELECT spot_number, booking_start, duration as booking_duration
        FROM bookings 
        WHERE id_location = ? 
        AND booking_date = ? 
        AND status != 'cancelled'
      `;
      const [bookedSpots] = await fastify.db.query(bookedSpotsQuery, [id, date]);

      // Filter spots berdasarkan overlap waktu jika hour diberikan
      let occupiedSet = new Set();
      const requestedHour = hour ? parseInt(hour) : null;
      const requestedDuration = duration ? parseInt(duration) : 2;

      if (requestedHour !== null) {
        // Hitung range waktu yang diminta
        const requestedStart = requestedHour;
        const requestedEnd = requestedHour + requestedDuration;

        bookedSpots.forEach((b) => {
          // Ambil jam mulai dari booking_start
          const bookingStartHour = new Date(b.booking_start).getHours();
          const bookingEndHour = bookingStartHour + (b.booking_duration || 2);

          // Cek overlap: (StartA < EndB) && (EndA > StartB)
          const hasOverlap = (requestedStart < bookingEndHour) && (requestedEnd > bookingStartHour);

          if (hasOverlap) {
            occupiedSet.add(b.spot_number);
          }
        });
      } else {
        // Jika tidak ada hour, anggap semua booking di tanggal itu occupied
        bookedSpots.forEach(b => occupiedSet.add(b.spot_number));
      }

      // FIX: Gabungkan spot dari master table DAN spot yang sudah dibooking
      const combinedSpotNames = new Set(allSpots.map(s => s.spot_name));

      // Masukkan juga spot yang ada di booking tapi tidak ada di master
      bookedSpots.forEach(b => combinedSpotNames.add(b.spot_number));

      let finalSpots = [];

      // Jika total spot (master + booked) masih kosong, kita generate default
      if (combinedSpotNames.size === 0) {
        // Generate A1-A5, B1-B8, C1-C8, D1-D5
        const generated = [];
        for (let i = 1; i <= 5; i++) generated.push(`A${i}`);
        for (let i = 1; i <= 8; i++) generated.push(`B${i}`);
        for (let i = 1; i <= 8; i++) generated.push(`C${i}`);
        for (let i = 1; i <= 5; i++) generated.push(`D${i}`);

        finalSpots = generated.map(name => ({
          number: name,
          status: occupiedSet.has(name) ? "booked" : "available"
        }));
      } else {
        // Return semua spot yang diketahui (baik dari master maupun history booking)
        finalSpots = Array.from(combinedSpotNames).map((name) => ({
          number: name,
          status: occupiedSet.has(name) ? "booked" : "available",
        }));
      }

      return finalSpots;
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ message: "Gagal memuat data kursi" });
    }
  });
}
