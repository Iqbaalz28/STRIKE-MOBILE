// src/routes/references.js
export default async function (fastify, options) {
    
    // 1. GET Payment Methods
    fastify.get('/payment-methods', async () => {
        const [rows] = await fastify.db.execute('SELECT * FROM payment_methods');
        return rows;
    });

    // 2. GET Memberships
    fastify.get('/memberships', async () => {
        const [rows] = await fastify.db.execute('SELECT * FROM memberships');
        return rows;
    });

    // 3. GET Product Categories
    fastify.get('/categories', async () => {
        const [rows] = await fastify.db.execute('SELECT * FROM category_products');
        return rows;
    });

    fastify.get('/discounts', async (request, reply) => {
        try {
            // Mengambil semua data dari tabel discounts
            const [rows] = await fastify.db.query(
                'SELECT id, discount_value, code, used_count, max_usage FROM discounts'
            );
            return rows;
        } catch (error) {
            request.log.error(error);
            return reply.code(500).send({ message: 'Gagal mengambil data diskon' });
        }
    });

    fastify.post('/discounts/check', async (request, reply) => {
        try {
            const { code } = request.body;

            // 1. Cari kode di database
            const [discounts] = await fastify.db.query(
                'SELECT * FROM discounts WHERE code = ? LIMIT 1', 
                [code]
            );

            if (discounts.length === 0) {
                return reply.code(404).send({ message: 'Kode voucher tidak ditemukan.' });
            }

            const discount = discounts[0];

            // 2. Cek Kuota (used_count vs max_usage)
            if (discount.used_count >= discount.max_usage) {
                return reply.code(400).send({ message: 'Kuota voucher ini sudah habis.' });
            }

            // 3. Kirim info diskon ke frontend
            return { 
                valid: true, 
                discount_value: discount.discount_value, // misal "15%" atau "10000"
                message: 'Voucher berhasil dipasang!' 
            };

        } catch (error) {
            request.log.error(error);
            return reply.code(500).send({ message: 'Gagal mengecek voucher.' });
        }
    });
}
