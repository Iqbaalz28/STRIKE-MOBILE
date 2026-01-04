// src/routes/reviews.js
export default async function (fastify, options) {

    fastify.get('/location-public', async (request, reply) => {
        try {
            // Query: Ambil review, nama user, avatar, DAN nama lokasi
            const [rows] = await fastify.db.query(`
                SELECT 
                    lr.id, 
                    lr.comment, 
                    lr.rating, 
                    u.name as user_name, 
                    u.avatar_img,
                    l.name as location_name
                FROM location_reviews lr
                JOIN users u ON lr.id_user = u.id
                JOIN locations l ON lr.id_location = l.id
                ORDER BY lr.created_at DESC
                LIMIT 20
            `);
            return rows;
        } catch (error) {
            request.log.error(error);
            return reply.code(500).send({ message: 'Gagal mengambil data review lokasi' });
        }
    });

    fastify.post('/', {
        onRequest: [fastify.authenticate]
    }, async (request, reply) => {
        try {
            const userId = request.user.id;
            const { id_booking, id_location, rating, comment } = request.body;

            // Validasi sederhana
            if (!rating || !id_booking || !id_location) {
                return reply.code(400).send({ message: 'Data tidak lengkap (Rating, Booking ID, Location ID wajib ada)' });
            }

            // Cek apakah user ini benar pemilik booking tersebut (Security)
            const [bookingCheck] = await fastify.db.query(
                'SELECT id FROM bookings WHERE id = ? AND id_user = ?',
                [id_booking, userId]
            );

            if (bookingCheck.length === 0) {
                return reply.code(403).send({ message: 'Booking tidak valid atau bukan milik Anda.' });
            }

            // Insert ke database
            await fastify.db.query(`
                INSERT INTO location_reviews (id_user, id_location, id_booking, rating, comment)
                VALUES (?, ?, ?, ?, ?)
            `, [userId, id_location, id_booking, rating, comment]);

            return { message: 'Ulasan berhasil dikirim' };

        } catch (error) {
            // Handle error jika user mencoba review 2x pada booking yang sama (karena constraint UNIQUE di DB)
            if (error.code === 'ER_DUP_ENTRY') {
                return reply.code(409).send({ message: 'Anda sudah memberikan ulasan untuk pesanan ini.' });
            }
            request.log.error(error);
            return reply.code(500).send({ message: 'Gagal menyimpan ulasan' });
        }
    });
}
