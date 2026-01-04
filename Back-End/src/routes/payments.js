export default async function (fastify, options) {


    // 1. BAYAR BOOKING (Simulasi)
    fastify.post('/pay/booking/:id', { onRequest: [fastify.authenticate] }, async (req, reply) => {
        const bookingId = req.params.id;
        const userId = req.user.id;

        // Pastikan booking itu milik user yang login
        const [check] = await fastify.db.execute(
            'SELECT id FROM bookings WHERE id = ? AND id_user = ?', 
            [bookingId, userId]
        );

        if (check.length === 0) return reply.code(404).send({ message: 'Booking tidak ditemukan' });

        // Update status jadi Paid & Confirmed
        await fastify.db.execute(`
            UPDATE bookings 
            SET payment_status = 'paid', status = 'confirmed' 
            WHERE id = ?
        `, [bookingId]);

        return { message: 'Pembayaran Booking Berhasil!', status: 'confirmed' };
    });

    // 2. BAYAR ORDER (Simulasi)
    fastify.post('/pay/order/:id', { onRequest: [fastify.authenticate] }, async (req, reply) => {
        const orderId = req.params.id;
        const userId = req.user.id;

        // Pastikan order milik user
        const [check] = await fastify.db.execute(
            'SELECT id FROM orders WHERE id = ? AND id_user = ?', 
            [orderId, userId]
        );

        if (check.length === 0) return reply.code(404).send({ message: 'Order tidak ditemukan' });

        // Update status jadi Paid & Processing
        await fastify.db.execute(`
            UPDATE orders 
            SET payment_status = 'paid', status = 'processing' 
            WHERE id = ?
        `, [orderId]);

        return { message: 'Pembayaran Order Berhasil!', status: 'processing' };
    });

    // 3. UPGRADE MEMBERSHIP
    fastify.post('/upgrade-membership', { onRequest: [fastify.authenticate] }, async (req, reply) => {
        const { id_membership } = req.body; // ID membership tujuan (1, 2, atau 3)
        const userId = req.user.id;

        // Validasi membership ada
        const [mem] = await fastify.db.execute('SELECT * FROM memberships WHERE id = ?', [id_membership]);
        if (mem.length === 0) return reply.code(404).send({ message: 'Membership tidak valid' });

        // Update user
        await fastify.db.execute(
            'UPDATE users SET id_membership = ? WHERE id = ?', 
            [id_membership, userId]
        );

        return { message: `Selamat! Anda sekarang member ${mem[0].name}` };
    });
}
