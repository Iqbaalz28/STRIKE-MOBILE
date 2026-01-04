export default async function (fastify, options) {
  // 1. GET Cart Items
  // Memilih harga sesuai tipe transaksi
  fastify.get(
    "/",
    { onRequest: [fastify.authenticate] },
    async (request, reply) => {
      try {
        const userId = request.user.id;

        const [rows] = await fastify.db.query(
          `
            SELECT 
                sc.id, 
                sc.quantity, 
                sc.created_at,
                sc.transaction_type, -- Ambil tipe transaksi
                p.id as product_id, 
                p.name, 
                p.img,
                -- Logika pemilihan harga dinamis
                CASE 
                    WHEN sc.transaction_type = 'sewa' THEN p.price_rent
                    ELSE p.price_sale 
                END as price
            FROM shopping_cart sc
            JOIN products p ON sc.id_product = p.id
            WHERE sc.id_user = ?
            ORDER BY sc.created_at DESC
        `,
          [userId],
        );

        return rows;
      } catch (error) {
        request.log.error(error);
        return reply.code(500).send({ message: "Gagal memuat keranjang" });
      }
    },
  );

  // 2. ADD to Cart (Terima input 'sewa' atau 'beli')
  fastify.post(
    "/",
    { onRequest: [fastify.authenticate] },
    async (request, reply) => {
      try {
        const userId = request.user.id;
        const { id_product, quantity, transaction_type } = request.body;

        // Validasi tipe (Default ke 'beli' jika kosong)
        const transType = transaction_type === "sewa" ? "sewa" : "beli";
        const qty = quantity || 1;

        // Cek existing item dengan tipe transaksi yang SAMA
        const [existing] = await fastify.db.query(
          "SELECT id FROM shopping_cart WHERE id_user = ? AND id_product = ? AND transaction_type = ?",
          [userId, id_product, transType],
        );

        if (existing.length > 0) {
          await fastify.db.query(
            "UPDATE shopping_cart SET quantity = quantity + ? WHERE id = ?",
            [qty, existing[0].id],
          );
        } else {
          // Gunakan transType yang sudah divalidasi
          await fastify.db.query(
            "INSERT INTO shopping_cart (id_user, id_product, quantity, transaction_type) VALUES (?, ?, ?, ?)",
            [userId, id_product, qty, transType],
          );
        }
        return { message: "Produk masuk keranjang" };
      } catch (error) {
        request.log.error(error); // Cek terminal kalau masih error
        return reply.code(500).send({ message: "Gagal menambah ke keranjang" });
      }
    },
  );

  // 3. DELETE Item
  fastify.delete(
    "/:id",
    { onRequest: [fastify.authenticate] },
    async (request, reply) => {
      try {
        const userId = request.user.id;
        await fastify.db.query(
          "DELETE FROM shopping_cart WHERE id = ? AND id_user = ?",
          [request.params.id, userId],
        );
        return { message: "Item dihapus" };
      } catch (error) {
        return reply.code(500).send({ message: "Gagal menghapus item" });
      }
    },
  );
}
