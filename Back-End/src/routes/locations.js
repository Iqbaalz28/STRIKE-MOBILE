export default async function (fastify, options) {

    // --- 1. GET ALL LOCATIONS (List) ---
    // URL: GET /locations
    // INI YANG SEBELUMNYA HILANG
    fastify.get('/', async (request, reply) => {
        try {
            // Ambil semua kolom dari tabel locations
            const [rows] = await fastify.db.query('SELECT * FROM locations');
            return rows;
        } catch (error) {
            request.log.error(error);
            return reply.code(500).send({ message: 'Gagal memuat daftar lokasi' });
        }
    });

    // --- API BARU: CEK KETERSEDIAAN PER JAM (Availability) ---
    // URL: GET /locations/:id/availability?date=2025-11-24
    // Taruh route spesifik ini SEBELUM route /:id agar tidak tertukar
    fastify.get('/:id/availability', async (req, reply) => {
        const { id } = req.params;
        const { date } = req.query;

        try {
            // 1. Hitung Total Spot
            const [spots] = await fastify.db.query(
                'SELECT COUNT(*) as total FROM location_spots WHERE id_location = ?',
                [id]
            );
            const totalCapacity = spots[0].total;

            // 2. Ambil booking aktif
            const [bookings] = await fastify.db.query(`
                SELECT booking_start, duration 
                FROM bookings 
                WHERE id_location = ? 
                AND booking_date = ? 
                AND status != 'cancelled' 
                AND payment_status != 'failed'
            `, [id, date]);

            // 3. Hitung Usage
            const hoursUsage = {};
            for (let h = 8; h < 18; h++) {
                hoursUsage[h] = 0;
            }

            bookings.forEach(b => {
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
                const timeString = `${h.toString().padStart(2, '0')}:00`;
                availability.push({
                    time: timeString,
                    is_full: hoursUsage[h] >= totalCapacity,
                    remaining: totalCapacity - hoursUsage[h]
                });
            }

            return availability;

        } catch (error) {
            req.log.error(error);
            return reply.code(500).send({ message: 'Gagal memuat ketersediaan' });
        }
    });

    // 2. GET LOCATION DETAIL
    // URL: GET /locations/:id
    fastify.get('/:id', async (request, reply) => {
        try {
            const { id } = request.params;
            
            // A. Ambil Data Utama Lokasi
            const [locs] = await fastify.db.query('SELECT * FROM locations WHERE id = ?', [id]);
            if (locs.length === 0) return reply.code(404).send({ message: 'Lokasi tidak ditemukan' });
            const location = locs[0];

            // B. Ambil Semua Gambar Terkait
            const [images] = await fastify.db.query('SELECT img_path, img_type FROM location_images WHERE id_location = ?', [id]);
            
            location.images = images; 
            return location;
        } catch (error) {
            request.log.error(error);
            return reply.code(500).send({ message: 'Error server' });
        }
    });

    // 3. GET REVIEWS BY LOCATION
    // URL: GET /locations/:id/reviews
    fastify.get('/:id/reviews', async (request, reply) => {
        try {
            const { id } = request.params;
            const [rows] = await fastify.db.query(`
                SELECT 
                    lr.id, lr.rating, lr.comment, lr.created_at,
                    u.name as username, u.avatar_img as avatarUrl
                FROM location_reviews lr
                JOIN users u ON lr.id_user = u.id
                WHERE lr.id_location = ?
                ORDER BY lr.created_at DESC
            `, [id]);
            return rows;
        } catch (error) {
            return reply.code(500).send({ message: 'Gagal mengambil review' });
        }
    });

    // 4. GET SEAT AVAILABILITY
    // URL: GET /locations/:id/spots?date=YYYY-MM-DD
    fastify.get('/:id/spots', async (request, reply) => {
        try {
            const { id } = request.params;
            const { date } = request.query; 

            if (!date) return reply.code(400).send({ message: 'Tanggal booking wajib diisi' });

            // A. Ambil Master Spot
            const [allSpots] = await fastify.db.query(
                'SELECT spot_name FROM location_spots WHERE id_location = ?', 
                [id]
            );

            // B. Ambil Spot yang SUDAH DIBOOKING
            const [bookedSpots] = await fastify.db.query(`
                SELECT spot_number 
                FROM bookings 
                WHERE id_location = ? 
                AND booking_date = ? 
                AND status != 'cancelled'
            `, [id, date]);

            const occupiedSet = new Set(bookedSpots.map(b => b.spot_number));

            const results = allSpots.map(s => ({
                id: s.spot_name,
                name: s.spot_name,
                status: occupiedSet.has(s.spot_name) ? 'occupied' : 'available'
            }));

            return results;

        } catch (error) {
            request.log.error(error);
            return reply.code(500).send({ message: 'Gagal memuat data kursi' });
        }
    });
}
