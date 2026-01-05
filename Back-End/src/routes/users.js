// src/routes/users.js

export default async function (fastify, options) {
  // --- 1. GET ALL USERS ---
  fastify.get("/users", async (req, reply) => {
    const [rows] = await fastify.db.execute(
      "SELECT id, name, email, bio, avatar_img FROM users",
    );
    return rows;
  });

  // --- 2. GET MY PROFILE (PROFILE DATA) ---
  // URL: GET /users/me
  // Penting: Taruh ini SEBELUM route /users/:id
  fastify.get(
    "/users/me",
    { onRequest: [fastify.authenticate] },
    async (request, reply) => {
      try {
        const userId = request.user.id;

        // Kita JOIN ke table memberships dan payment_methods
        // agar frontend dapat nama paket & nama payment, bukan cuma ID-nya.
        const [rows] = await fastify.db.query(
          `
                SELECT 
                    u.id, 
                    u.name, 
                    u.email, 
                    u.bio, 
                    u.avatar_img, 
                    u.date_birth,
                    u.id_payment_method,
                    u.id_membership,
                    pm.name as payment_method_name,
                    m.name as membership_name, 
                    m.description as membership_desc,
                    m.benefits as membership_benefits
                FROM users u
                LEFT JOIN payment_methods pm ON u.id_payment_method = pm.id
                LEFT JOIN memberships m ON u.id_membership = m.id
                WHERE u.id = ?
            `,
          [userId],
        );

        if (rows.length === 0) {
          return reply.code(404).send({ message: "User tidak ditemukan" });
        }

        return rows[0];
      } catch (error) {
        request.log.error(error);
        return reply.code(500).send({ message: "Gagal mengambil profil" });
      }
    },
  );

  // --- 3. UPDATE PROFILE (PUT) ---
  // URL: PUT /users/me
  fastify.put(
    "/users/me",
    { onRequest: [fastify.authenticate] },
    async (request, reply) => {
      try {
        const userId = request.user.id;
        // Ambil semua kemungkinan field yang dikirim frontend
        const { name, bio, date_birth, avatar_img, id_payment_method } =
          request.body;

        // Validasi tanggal kosong jadi null
        const validDate = date_birth === "" ? null : date_birth;

        // Gunakan COALESCE agar jika field tidak dikirim, data lama tetap tersimpan
        await fastify.db.query(
          `
                UPDATE users 
                SET 
                    name = COALESCE(?, name), 
                    bio = COALESCE(?, bio), 
                    date_birth = COALESCE(?, date_birth),
                    avatar_img = COALESCE(?, avatar_img),
                    id_payment_method = COALESCE(?, id_payment_method)
                WHERE id = ?
            `,
          [name, bio, validDate, avatar_img, id_payment_method, userId],
        );

        return { message: "Profil berhasil diperbarui" };
      } catch (err) {
        fastify.log.error(err);
        return reply
          .code(500)
          .send({ error: err.message || "Gagal update profil" });
      }
    },
  );

  // --- 4. GET USER BY ID ---
  // URL: GET /users/:id
  fastify.get("/users/:id", async (req, reply) => {
    const [rows] = await fastify.db.execute(
      "SELECT id, name, email, bio, avatar_img FROM users WHERE id = ?",
      [req.params.id],
    );
    if (rows.length === 0) {
      return reply.code(404).send({ error: "User not found" });
    }
    return rows[0];
  });
}
