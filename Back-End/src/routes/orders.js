export default async function (fastify, options) {

    // POST /orders (Checkout dari Cart)
    fastify.post('/', { onRequest: [fastify.authenticate] }, async (request, reply) => {
        const connection = await fastify.db.getConnection();
        try {
            const userId = request.user.id;
            const { 
                shipping_address, 
                payment_method, // <--- Pastikan ini diterima dari Frontend
                notes, 
                shipping_cost = 0, tax_amount = 0, discount_amount = 0 
            } = request.body;

            await connection.beginTransaction();

            // 1. Ambil semua item di keranjang user
            const [cartItems] = await connection.query(`
                SELECT sc.*, p.price_sale, p.price_rent 
                FROM shopping_cart sc
                JOIN products p ON sc.id_product = p.id
                WHERE sc.id_user = ?
            `, [userId]);

            if (cartItems.length === 0) {
                throw new Error('Keranjang kosong');
            }

            // 2. Hitung Total
            let totalAmount = 0;
            const orderItemsData = [];

            for (const item of cartItems) {
                const price = item.transaction_type === 'sewa' ? item.price_rent : item.price_sale;
                const subtotal = price * item.quantity;
                totalAmount += subtotal;

                orderItemsData.push({
                    id_product: item.id_product,
                    quantity: item.quantity,
                    unit_price: price,
                    subtotal: subtotal,
                    transaction_type: item.transaction_type 
                });
            }

            // 3. Buat Order Utama (UPDATE: Insert payment_method)
            const orderNumber = `ORD-${Date.now()}`;
            const [orderResult] = await connection.query(`
                INSERT INTO orders 
                (id_user, order_number, total_amount, shipping_cost, shipping_address, payment_method, status, payment_status, created_at, tax_amount, discount_amount, notes)
                VALUES (?, ?, ?, ?, ?, ?, 'pending', 'unpaid', NOW(), ?, ?, ?)
            `, [userId, orderNumber, totalAmount, shipping_cost, shipping_address, payment_method, tax_amount, discount_amount, notes]);

            const orderId = orderResult.insertId;

            // 4. Pindahkan Item Keranjang ke Order Items
            for (const item of orderItemsData) {
                await connection.query(`
                    INSERT INTO order_items (id_order, id_product, quantity, unit_price, subtotal, transaction_type)
                    VALUES (?, ?, ?, ?, ?, ?)
                `, [orderId, item.id_product, item.quantity, item.unit_price, item.subtotal, item.transaction_type]);
            }

            // 5. Kosongkan Keranjang
            await connection.query('DELETE FROM shopping_cart WHERE id_user = ?', [userId]);

            await connection.commit();
            connection.release();

            return { message: 'Pesanan berhasil dibuat', order_number: orderNumber };

        } catch (error) {
            await connection.rollback();
            connection.release();
            request.log.error(error);
            return reply.code(500).send({ message: error.message || 'Gagal membuat pesanan' });
        }
    });

    // GET /orders/my-orders (Riwayat Pesanan)
    fastify.get('/my-orders', { onRequest: [fastify.authenticate] }, async (request, reply) => {
        try {
            const userId = request.user.id;
            
            // UPDATE QUERY: 
            // Tambahkan join ke payment_methods untuk ambil namanya
            const [rows] = await fastify.db.query(`
                SELECT 
                    o.id, 
                    o.order_number, 
                    o.total_amount, 
                    o.status, 
                    o.payment_status, 
                    o.created_at,
                    pm.name as payment_method_name, -- Info metode bayar
                    (SELECT COUNT(*) FROM order_items WHERE id_order = o.id) as total_items,
                    (
                        SELECT p.name 
                        FROM order_items oi 
                        JOIN products p ON oi.id_product = p.id 
                        WHERE oi.id_order = o.id 
                        LIMIT 1
                    ) as first_product_name,
                    (
                        SELECT p.id 
                        FROM order_items oi 
                        JOIN products p ON oi.id_product = p.id 
                        WHERE oi.id_order = o.id 
                        LIMIT 1
                    ) as first_product_id,
                    (
                        SELECT COUNT(*) 
                        FROM product_reviews pr 
                        JOIN order_items oi ON pr.id_order_item = oi.id
                        WHERE oi.id_order = o.id
                    ) as review_count
                FROM orders o
                LEFT JOIN payment_methods pm ON o.payment_method = pm.id
                WHERE o.id_user = ?
                ORDER BY o.created_at DESC
            `, [userId]);
            
            return rows;
        } catch (error) {
            request.log.error(error);
            return reply.code(500).send({ message: 'Gagal mengambil riwayat pesanan' });
        }
    });
}
