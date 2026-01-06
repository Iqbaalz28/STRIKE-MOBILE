export default async function (fastify, options) {
  // POST /orders (Checkout dari Cart)
  fastify.post(
    "/",
    { onRequest: [fastify.authenticate] },
    async (request, reply) => {
      const connection = await fastify.db.getConnection();
      try {
        const userId = request.user.id;
        const {
          shipping_address,
          payment_method, // <--- Pastikan ini diterima dari Frontend
          notes,
          shipping_cost = 0,
          tax_amount = 0,
          discount_amount = 0,
          voucher_code, // Tambahan: Terima kode voucher
        } = request.body;

        await connection.beginTransaction();

        // 0. Validasi & Hitung Diskon Server-Side
        let finalDiscount = 0;

        if (voucher_code) {
          const [discounts] = await connection.query(
            "SELECT id, discount_value, used_count, max_usage FROM discounts WHERE code = ? FOR UPDATE",
            [voucher_code]
          );

          if (discounts.length > 0) {
            const disc = discounts[0];
            if (disc.used_count < disc.max_usage) {
              // Update Used Count
              await connection.query(
                "UPDATE discounts SET used_count = used_count + 1 WHERE id = ?",
                [disc.id]
              );

              // Simpan info untuk perhitungan nanti
              // Kita hitung discount amount SETELAH subtotal item diketahui
              if (disc.discount_value.includes("%")) {
                finalDiscount = parseFloat(disc.discount_value.replace("%", "")) / 100; // Store as percentage 0.15
              } else {
                finalDiscount = parseFloat(disc.discount_value); // Store as fixed value 10000
              }

            }
          }
        }

        // 1. Ambil item di keranjang user (hanya yang dipilih jika cart_item_ids disediakan)
        const cart_item_ids = request.body.cart_item_ids; // Array of cart item IDs
        
        let cartQuery = `
              SELECT sc.*, p.price_sale, p.price_rent 
              FROM shopping_cart sc
              JOIN products p ON sc.id_product = p.id
              WHERE sc.id_user = ?
          `;
        let cartParams = [userId];
        
        // Jika cart_item_ids disediakan, filter hanya item yang dipilih
        if (cart_item_ids && Array.isArray(cart_item_ids) && cart_item_ids.length > 0) {
          cartQuery += ` AND sc.id IN (${cart_item_ids.map(() => '?').join(',')})`;
          cartParams = [...cartParams, ...cart_item_ids];
        }
        
        const [cartItems] = await connection.query(cartQuery, cartParams);

        if (cartItems.length === 0) {
          throw new Error("Keranjang kosong atau tidak ada item yang dipilih");
        }

        // 2. Hitung Total Item
        let itemsSubtotal = 0;
        const orderItemsData = [];

        for (const item of cartItems) {
          const price =
            item.transaction_type === "sewa"
              ? item.price_rent
              : item.price_sale;
          const subtotal = price * item.quantity;
          itemsSubtotal += subtotal;

          orderItemsData.push({
            id_product: item.id_product,
            quantity: item.quantity,
            unit_price: price,
            subtotal: subtotal,
            transaction_type: item.transaction_type,
          });
        }

        // 3. Hitung Final Total (Item + Tax + Shipping - Discount)
        // Hitung nominal diskon jika persen
        let validDiscountAmount = 0;
        if (finalDiscount > 0 && finalDiscount < 1) { // Persentase (e.g. 0.15)
          validDiscountAmount = itemsSubtotal * finalDiscount;
        } else {
          validDiscountAmount = finalDiscount;
        }

        // Pajak (misal 0 jika belum ada aturan baku, atau terima dari param tapi validasi)
        // Disini kita percayakan tax_amount dari body dulu, atau set 0
        const validTax = parseFloat(tax_amount) || 0;
        const validShipping = parseFloat(shipping_cost) || 0;

        const grandTotal = Math.max(0, itemsSubtotal + validTax + validShipping - validDiscountAmount);

        // 4. Buat Order Utama
        const orderNumber = `ORD-${Date.now()}`;
        const [orderResult] = await connection.query(
          `
                INSERT INTO orders 
                (id_user, order_number, total_amount, shipping_cost, shipping_address, payment_method, status, payment_status, created_at, tax_amount, discount_amount, notes)
                VALUES (?, ?, ?, ?, ?, ?, 'pending', 'unpaid', NOW(), ?, ?, ?)
            `,
          [
            userId,
            orderNumber,
            grandTotal, // <--- Ganti totalAmount dengan grandTotal
            validShipping,
            shipping_address,
            payment_method,
            validTax,
            validDiscountAmount,
            notes,
          ],
        );

        const orderId = orderResult.insertId;

        // 4. Pindahkan Item Keranjang ke Order Items
        for (const item of orderItemsData) {
          await connection.query(
            `
                    INSERT INTO order_items (id_order, id_product, quantity, unit_price, subtotal, transaction_type)
                    VALUES (?, ?, ?, ?, ?, ?)
                `,
            [
              orderId,
              item.id_product,
              item.quantity,
              item.unit_price,
              item.subtotal,
              item.transaction_type,
            ],
          );
        }

        // 5. Hapus hanya item yang dipilih dari Keranjang
        if (cart_item_ids && Array.isArray(cart_item_ids) && cart_item_ids.length > 0) {
          // Hapus hanya item yang dipilih
          await connection.query(
            `DELETE FROM shopping_cart WHERE id_user = ? AND id IN (${cart_item_ids.map(() => '?').join(',')})`,
            [userId, ...cart_item_ids]
          );
        } else {
          // Fallback: hapus semua (backward compatibility)
          await connection.query("DELETE FROM shopping_cart WHERE id_user = ?", [userId]);
        }

        await connection.commit();
        connection.release();

        return {
          message: "Pesanan berhasil dibuat",
          order_number: orderNumber,
        };
      } catch (error) {
        await connection.rollback();
        connection.release();
        request.log.error(error);
        return reply
          .code(500)
          .send({ message: error.message || "Gagal membuat pesanan" });
      }
    },
  );

  // GET /orders/my-orders (Riwayat Pesanan)
  fastify.get(
    "/my-orders",
    { onRequest: [fastify.authenticate] },
    async (request, reply) => {
      try {
        const userId = request.user.id;

        // UPDATE QUERY:
        // Tambahkan join ke payment_methods untuk ambil namanya
        const [rows] = await fastify.db.query(
          `
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
            `,
          [userId],
        );

        return rows;
      } catch (error) {
        request.log.error(error);
        return reply
          .code(500)
          .send({ message: "Gagal mengambil riwayat pesanan" });
      }
    },
  );

  // GET /orders/:id (Detail Order)
  fastify.get(
    "/:id",
    { onRequest: [fastify.authenticate] },
    async (request, reply) => {
      try {
        const userId = request.user.id;
        const orderId = request.params.id;

        // Get order header
        const [orders] = await fastify.db.query(
          `
          SELECT 
            o.*,
            pm.name as payment_method_name
          FROM orders o
          LEFT JOIN payment_methods pm ON o.payment_method = pm.id
          WHERE o.id = ? AND o.id_user = ?
          `,
          [orderId, userId]
        );

        if (orders.length === 0) {
          return reply.code(404).send({ message: "Pesanan tidak ditemukan" });
        }

        const order = orders[0];

        // Get order items with product details
        const [items] = await fastify.db.query(
          `
          SELECT 
            oi.id,
            oi.quantity,
            oi.unit_price,
            oi.subtotal,
            oi.transaction_type,
            p.name,
            p.img
          FROM order_items oi
          JOIN products p ON oi.id_product = p.id
          WHERE oi.id_order = ?
          `,
          [orderId]
        );

        return {
          ...order,
          items: items,
        };
      } catch (error) {
        request.log.error(error);
        return reply
          .code(500)
          .send({ message: "Gagal mengambil detail pesanan" });
      }
    }
  );
}
