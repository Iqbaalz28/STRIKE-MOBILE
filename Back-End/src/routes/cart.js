export default async function (fastify, options) {

    // 1. GET Cart Items
    fastify.get('/', { onRequest: [fastify.authenticate] }, async (request, reply) => {
        try {
            const userId = request.user.id;
            
            const [rows] = await fastify.db.query(`
                SELECT 
                    sc.id, 
                    sc.quantity, 
                    sc.created_at,
                    p.id as product_id, 
                    p.name, 
                    p.img,
                    
                    COALESCE(p.price_sale, p.price_rent, 0) as price
                    
                FROM shopping_cart sc
                JOIN products p ON sc.id_product = p.id
                WHERE sc.id_user = ?
                ORDER BY sc.created_at DESC
            `, [userId]);
            
            return rows;
        } catch (error) {
            request.log.error(error);
            return reply.code(500).send({ message: 'Gagal memuat keranjang' });
        }
    });

    // 2. ADD to Cart
    fastify.post('/', { onRequest: [fastify.authenticate] }, async (request, reply) => {
        try {
            const userId = request.user.id;
            const { id_product, quantity } = request.body;
            
            if (!id_product) return reply.code(400).send({ message: 'ID Produk wajib diisi' });

            const qty = quantity || 1;

            // Cek apakah produk sudah ada di keranjang user ini?
            const [existing] = await fastify.db.query(
                'SELECT id FROM shopping_cart WHERE id_user = ? AND id_product = ?',
                [userId, id_product]
            );

            if (existing.length > 0) {
                // Kalau sudah ada, update quantity-nya aja
                await fastify.db.query(
                    'UPDATE shopping_cart SET quantity = quantity + ? WHERE id = ?',
                    [qty, existing[0].id]
                );
            } else {
                // Kalau belum ada, insert baru (Default tipe 'beli')
                await fastify.db.query(
                    'INSERT INTO shopping_cart (id_user, id_product, quantity, transaction_type) VALUES (?, ?, ?, ?)',
                    [userId, id_product, qty, 'beli'] 
                );
            }
            
            return { message: 'Produk masuk keranjang' };

        } catch (error) {
            request.log.error(error); // Cek terminal kalau masih error
            return reply.code(500).send({ message: 'Gagal menambah ke keranjang' });
        }
    });

    // 3. DELETE Item
    fastify.delete('/:id', { onRequest: [fastify.authenticate] }, async (request, reply) => {
        try {
            const userId = request.user.id;
            await fastify.db.query(
                'DELETE FROM shopping_cart WHERE id = ? AND id_user = ?',
                [request.params.id, userId]
            );
            return { message: 'Item dihapus' };
        } catch (error) {
            return reply.code(500).send({ message: 'Gagal menghapus item' });
        }
    });
}
