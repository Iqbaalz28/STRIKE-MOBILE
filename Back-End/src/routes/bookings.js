export default async function (fastify, options) {

    // 1. GET Booking Saya (Riwayat Pesanan)
    // URL: GET /bookings/my-bookings
    fastify.get('/my-bookings', {
        onRequest: [fastify.authenticate] 
    }, async (request, reply) => {
        try {
            const userId = request.user.id;

            // Query lengkap dengan JOIN ke locations dan cek status review
            const [rows] = await fastify.db.query(`
                SELECT 
                    b.id,
                    b.id_location,
                    b.booking_start,
                    b.booking_end,
                    b.total_price,
                    b.status,
                    b.payment_status,
                    b.spot_number,
                    l.name as location_name,
                    l.city,
                    l.img as location_img,
                    -- Cek apakah user sudah memberikan review untuk booking ini
                    CASE WHEN lr.id IS NOT NULL THEN 1 ELSE 0 END as is_reviewed
                FROM bookings b
                JOIN locations l ON b.id_location = l.id
                LEFT JOIN location_reviews lr ON b.id = lr.id_booking
                WHERE b.id_user = ?
                ORDER BY b.booking_start DESC
            `, [userId]);

            return rows;
        } catch (error) {
            request.log.error(error);
            return reply.code(500).send({ message: 'Gagal mengambil riwayat pesanan' });
        }
    });

    // 2. CREATE Booking Baru (Dengan Fitur Voucher & Transaksi)
    // URL: POST /bookings/
    fastify.post('/', { onRequest: [fastify.authenticate] }, async (req, reply) => {
        const userId = req.user.id;
        const { 
            id_location, booking_date, booking_start, duration, 
            spot_number, first_name, last_name, phone,
            voucher_code,
            payment_method // FIX: Terima payment_method dari frontend
        } = req.body;

        // Kita gunakan connection (bukan pool langsung) untuk fitur Transaction
        const connection = await fastify.db.getConnection(); 
        
        try {
            // Mulai Transaksi Database
            await connection.beginTransaction();

            // A. Ambil Harga Lokasi
            const [locs] = await connection.query('SELECT price_per_hour FROM locations WHERE id = ?', [id_location]);
            if (locs.length === 0) {
                throw new Error('Lokasi tidak valid');
            }
            const pricePerHour = locs[0].price_per_hour;

            // B. Hitung Kalkulasi Awal
            let subtotal = pricePerHour * duration;
            let tax = subtotal * 0.10; // Pajak 10%
            let discountAmount = 0;

            // C. Logika Diskon (Server-Side Validation)
            if (voucher_code) {
                // Cek ketersediaan voucher dan kunci barisnya (FOR UPDATE)
                const [discounts] = await connection.query(
                    'SELECT id, discount_value, used_count, max_usage FROM discounts WHERE code = ? FOR UPDATE', 
                    [voucher_code]
                );

                if (discounts.length > 0) {
                    const disc = discounts[0];
                    
                    // Cek apakah kuota masih ada
                    if (disc.used_count < disc.max_usage) {
                        // Hitung nominal diskon
                        if (disc.discount_value.includes('%')) {
                            const percent = parseInt(disc.discount_value.replace('%', ''));
                            discountAmount = subtotal * (percent / 100);
                        } else {
                            discountAmount = parseInt(disc.discount_value);
                        }

                        // Update kuota terpakai (+1) secara permanen
                        await connection.query(
                            'UPDATE discounts SET used_count = used_count + 1 WHERE id = ?', 
                            [disc.id]
                        );
                    } else {
                        // Opsional: Throw error jika kuota habis saat proses berjalan
                        // throw new Error('Voucher habis');
                    }
                }
            }

            // D. Hitung Grand Total Akhir
            // Pastikan tidak minus
            const finalTotal = Math.max(0, subtotal + tax - discountAmount);
            
            const invoiceNumber = `INV-${Date.now()}`;
            
            // Hitung Waktu Selesai
            const startObj = new Date(booking_start);
            const endObj = new Date(startObj.getTime() + duration * 60 * 60 * 1000);
            const booking_end = endObj.toISOString().slice(0, 19).replace('T', ' ');

            // E. Simpan Booking ke Database
            // FIX: Tambahkan payment_method ke query INSERT
            await connection.query(`
                INSERT INTO bookings 
                (id_user, id_location, spot_number, first_name, last_name, phone, booking_date, booking_start, booking_end, duration, total_price, tax_amount, invoice_number, status, payment_status, payment_method)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 'unpaid', ?)
            `, [
                userId, 
                id_location, 
                spot_number, 
                first_name, 
                last_name, 
                phone, 
                booking_date, 
                booking_start, 
                booking_end, 
                duration, 
                finalTotal, 
                tax, 
                invoiceNumber,
                payment_method // FIX: Masukkan value payment_method
            ]);

            // Commit Transaksi (Simpan Perubahan)
            await connection.commit();
            
            // Lepaskan koneksi kembali ke pool
            connection.release();

            return { 
                message: 'Booking berhasil dibuat', 
                invoice: invoiceNumber, 
                total_paid: finalTotal 
            };

        } catch (err) {
            // Jika ada error, batalkan semua perubahan database (Rollback)
            await connection.rollback();
            connection.release();
            
            req.log.error(err);
            return reply.code(500).send({ message: err.message || 'Gagal membuat booking' });
        }
    });
}
