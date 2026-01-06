export default async function (fastify, options) {
  // 1. GET ALL PRODUCTS (List)
  // Rating dan total_reviews dihitung dinamis dari tabel product_reviews
  fastify.get("/", async (request, reply) => {
    try {
      const { category, search, minPrice, maxPrice, type, page = 1, limit = 10 } = request.query;

      const pageNum = parseInt(page) || 1;
      const limitNum = parseInt(limit) || 10;
      const offset = (pageNum - 1) * limitNum;

      // Base query dengan rating dinamis
      let baseSelect = `
        SELECT 
          p.*,
          COALESCE(AVG(pr.rating), 0) as rating_average,
          COUNT(pr.id) as total_reviews
        FROM products p
        LEFT JOIN product_reviews pr ON p.id = pr.id_product
      `;

      let whereClause = "WHERE 1=1";
      const params = [];

      // 1. Filter Kategori
      if (category) {
        baseSelect = `
          SELECT 
            p.*,
            COALESCE(AVG(pr.rating), 0) as rating_average,
            COUNT(pr.id) as total_reviews
          FROM products p 
          JOIN category_products c ON p.id_category = c.id 
          LEFT JOIN product_reviews pr ON p.id = pr.id_product
        `;
        whereClause = "WHERE (c.name LIKE ? OR p.name LIKE ?)";
        params.push(`%${category}%`, `%${category}%`);
      }

      // 2. Filter Search
      if (search) {
        whereClause += " AND p.name LIKE ?";
        params.push(`%${search}%`);
      }

      // 3. Filter Status (Sewa / Beli)
      if (type) {
        if (type.toLowerCase() === "sewa") {
          whereClause += " AND p.price_rent > 0";
        } else if (type.toLowerCase() === "beli") {
          whereClause += " AND p.price_sale > 0";
        }
      }

      // 4. Filter Harga
      if (minPrice) {
        whereClause += " AND (COALESCE(p.price_sale, 0) >= ? OR COALESCE(p.price_rent, 0) >= ?)";
        params.push(minPrice, minPrice);
      }
      if (maxPrice) {
        whereClause += " AND (COALESCE(p.price_sale, 0) <= ? OR COALESCE(p.price_rent, 0) <= ?)";
        params.push(maxPrice, maxPrice);
      }

      // Build final query dengan GROUP BY dan pagination
      const query = `${baseSelect} ${whereClause} GROUP BY p.id ORDER BY p.id LIMIT ? OFFSET ?`;
      params.push(limitNum, offset);

      const [rows] = await fastify.db.query(query, params);

      return {
        data: rows,
        page: pageNum,
        limit: limitNum
      };
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ message: "Gagal mengambil data produk" });
    }
  });

  // ... (Route detail dan review tetap sama, tidak perlu diubah) ...
  // 2. GET PRODUCT DETAIL
  // Rating dan total_reviews dihitung dinamis dari tabel product_reviews
  fastify.get("/:id", async (request, reply) => {
    try {
      const { id } = request.params;

      // Ambil produk dengan rating dinamis
      const [prods] = await fastify.db.query(
        `SELECT 
          p.*,
          COALESCE(AVG(pr.rating), 0) as rating_average,
          COUNT(pr.id) as total_reviews
        FROM products p
        LEFT JOIN product_reviews pr ON p.id = pr.id_product
        WHERE p.id = ?
        GROUP BY p.id`,
        [id],
      );
      if (prods.length === 0)
        return reply.code(404).send({ message: "Produk tidak ditemukan" });
      const product = prods[0];

      const [images] = await fastify.db.query(
        "SELECT img_path, img_type FROM product_images WHERE id_product = ?",
        [id],
      );
      product.images = images;
      return product;
    } catch (error) {
      return reply.code(500).send({ message: "Error server" });
    }
  });

  // 3. GET REVIEWS
  fastify.get("/:id/reviews", async (request, reply) => {
    try {
      const { id } = request.params;
      const [rows] = await fastify.db.query(
        `
                SELECT pr.*, u.name as username 
                FROM product_reviews pr
                JOIN users u ON pr.id_user = u.id
                WHERE pr.id_product = ? ORDER BY pr.created_at DESC
            `,
        [id],
      );
      return rows;
    } catch (error) {
      return reply.code(500).send({ message: "Gagal ambil review" });
    }
  });

  // 4. POST PRODUCT REVIEW (BARU)
  fastify.post(
    "/:id/reviews",
    { onRequest: [fastify.authenticate] },
    async (request, reply) => {
      try {
        const userId = request.user.id;
        const productId = request.params.id;
        const { rating, comment } = request.body;

        // 1. Validasi Input
        if (!rating)
          return reply.code(400).send({ message: "Rating wajib diisi" });

        // 2. Cek Apakah User Pernah Membeli Produk Ini? (Validasi Verified Buyer)
        // Kita cari order_item milik user ini yang status ordernya sudah 'delivered' atau 'completed'
        // (Untuk testing, kita bisa skip status check atau anggap semua order 'paid' boleh review)
        const [purchaseCheck] = await fastify.db.query(
          `
                SELECT oi.id 
                FROM order_items oi
                JOIN orders o ON oi.id_order = o.id
                WHERE o.id_user = ? AND oi.id_product = ?
                LIMIT 1
            `,
          [userId, productId],
        );

        // Uncomment baris bawah ini jika ingin membatasi review hanya untuk pembeli asli
        // if (purchaseCheck.length === 0) {
        //    return reply.code(403).send({ message: 'Anda harus membeli produk ini sebelum memberi ulasan.' });
        // }

        const orderItemId =
          purchaseCheck.length > 0 ? purchaseCheck[0].id : null;

        // 3. Insert Review
        await fastify.db.query(
          `
                INSERT INTO product_reviews (id_user, id_product, id_order_item, rating, comment, created_at)
                VALUES (?, ?, ?, ?, ?, NOW())
            `,
          [userId, productId, orderItemId, rating, comment],
        );

        return { message: "Ulasan produk berhasil dikirim" };
      } catch (error) {
        request.log.error(error);
        return reply.code(500).send({ message: "Gagal mengirim ulasan" });
      }
    },
  );
}
