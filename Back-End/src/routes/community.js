// src/routes/community.js

export default async function (fastify, options) {
  // 1. GET ALL POSTS (Feed)
  fastify.get("/posts", async (request, reply) => {
    try {
      // Join dengan users untuk dapat nama & avatar author
      const [rows] = await fastify.db.query(`
                SELECT 
                    p.id, p.title, p.body, p.category, p.created_at, p.img,
                    p.views_count, p.likes_count, p.reply_count,
                    u.name as author_name, u.avatar_img as author_avatar
                FROM community_posts p
                JOIN users u ON p.id_user = u.id
                ORDER BY p.created_at DESC
            `);
      return rows;
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ message: "Gagal memuat postingan" });
    }
  });

  // 2. GET SINGLE POST (Detail)
  fastify.get("/posts/:id", async (request, reply) => {
    try {
      const { id } = request.params;

      // Update view count +1 setiap kali detail dibuka
      await fastify.db.query(
        "UPDATE community_posts SET views_count = views_count + 1 WHERE id = ?",
        [id],
      );

      const [rows] = await fastify.db.query(
        `
                SELECT 
                    p.id, p.title, p.body, p.category, p.created_at, p.img,
                    p.views_count, p.likes_count, p.reply_count,
                    u.name as author_name, u.avatar_img as author_avatar
                FROM community_posts p
                JOIN users u ON p.id_user = u.id
                WHERE p.id = ?
            `,
        [id],
      );

      if (rows.length === 0)
        return reply.code(404).send({ message: "Postingan tidak ditemukan" });
      return rows[0];
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ message: "Error server" });
    }
  });

  // 3. CREATE POST
  fastify.post(
    "/posts",
    { onRequest: [fastify.authenticate] },
    async (request, reply) => {
      try {
        const userId = request.user.id;
        const { title, body, category, img } = request.body;

        if (!title || !body || !category) {
          return reply.code(400).send({ message: "Semua field wajib diisi" });
        }

        await fastify.db.query(
          `
                INSERT INTO community_posts (id_user, title, body, category, img, created_at)
                VALUES (?, ?, ?, ?, ?, NOW())
            `,
          [userId, title, body, category, img || null],
        );

        return { message: "Postingan berhasil dibuat" };
      } catch (error) {
        request.log.error(error);
        return reply.code(500).send({ message: "Gagal membuat postingan" });
      }
    },
  );

  // 4. GET COMMENTS (with nested reply support)
  // NOTE: parent_id requires migration. Run GET /community/migrate-add-parent-id first
  fastify.get("/posts/:id/comments", async (request, reply) => {
    try {
      const { id } = request.params;
      let rows;

      // Try with parent_id first
      try {
        [rows] = await fastify.db.query(
          `SELECT 
              c.id, c.content, c.created_at, c.parent_id,
              u.name as author_name, u.avatar_img as author_avatar
          FROM post_comments c
          JOIN users u ON c.id_user = u.id
          WHERE c.id_post = ?
          ORDER BY c.created_at ASC`,
          [id],
        );
      } catch (colErr) {
        // Fallback if parent_id column doesn't exist
        if (colErr.code === 'ER_BAD_FIELD_ERROR') {
          [rows] = await fastify.db.query(
            `SELECT 
                c.id, c.content, c.created_at,
                u.name as author_name, u.avatar_img as author_avatar
            FROM post_comments c
            JOIN users u ON c.id_user = u.id
            WHERE c.id_post = ?
            ORDER BY c.created_at ASC`,
            [id],
          );
        } else {
          throw colErr;
        }
      }
      return rows;
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ message: "Gagal memuat komentar" });
    }
  });

  // 5. CREATE COMMENT (with optional reply support)
  fastify.post(
    "/posts/:id/comments",
    { onRequest: [fastify.authenticate] },
    async (request, reply) => {
      try {
        const userId = request.user.id;
        const postId = request.params.id;
        const { content, parent_id } = request.body;

        if (!content)
          return reply
            .code(400)
            .send({ message: "Komentar tidak boleh kosong" });

        // Get commenter name for notification
        const [userData] = await fastify.db.query(
          `SELECT name FROM users WHERE id = ?`,
          [userId]
        );
        const commenterName = userData[0]?.name || "Seseorang";

        // Try with parent_id first, fallback to without if column doesn't exist
        try {
          await fastify.db.query(
            `INSERT INTO post_comments (id_post, id_user, content, created_at, parent_id)
             VALUES (?, ?, ?, NOW(), ?)`,
            [postId, userId, content, parent_id || null],
          );
        } catch (colErr) {
          // Fallback: insert without parent_id if column doesn't exist
          if (colErr.code === 'ER_BAD_FIELD_ERROR') {
            await fastify.db.query(
              `INSERT INTO post_comments (id_post, id_user, content, created_at)
               VALUES (?, ?, ?, NOW())`,
              [postId, userId, content],
            );
          } else {
            throw colErr;
          }
        }

        // Update Reply Count di tabel Post
        await fastify.db.query(
          `UPDATE community_posts SET reply_count = reply_count + 1 WHERE id = ?`,
          [postId],
        );

        // --- SEND NOTIFICATION ---
        try {
          // Get post owner
          const [postData] = await fastify.db.query(
            `SELECT id_user, title FROM community_posts WHERE id = ?`,
            [postId]
          );

          if (postData.length > 0) {
            const postOwnerId = postData[0].id_user;
            const postTitle = postData[0].title?.substring(0, 30) || "postingan";

            // Don't notify if commenting on own post
            if (postOwnerId !== userId && fastify.sendNotification) {
              await fastify.sendNotification(postOwnerId, {
                title: "Komentar Baru 💬",
                body: `${commenterName} mengomentari "${postTitle}..."`,
                type: "community",
                refId: postId,
              });
            }
          }
        } catch (notifErr) {
          // Don't fail the request if notification fails
          request.log.error("Failed to send notification:", notifErr);
        }

        return { message: "Komentar terkirim" };
      } catch (error) {
        request.log.error(error);
        return reply.code(500).send({ message: "Gagal mengirim komentar" });
      }
    },
  );

  // --- MIGRATION ROUTE (TEMPORARY) ---
  // Call this once: GET /community/migrate-add-parent-id
  fastify.get("/migrate-add-parent-id", async (req, reply) => {
    try {
      await fastify.db.query(
        "ALTER TABLE post_comments ADD COLUMN parent_id INT DEFAULT NULL"
      );
      return { message: "Kolom parent_id berhasil ditambahkan ke post_comments" };
    } catch (error) {
      return { message: "Kolom parent_id mungkin sudah ada", error: error.message };
    }
  });
  fastify.post(
    "/posts/:id/like",
    { onRequest: [fastify.authenticate] },
    async (request, reply) => {
      try {
        const userId = request.user.id;
        const postId = request.params.id;

        // Cek apakah user sudah like
        const [check] = await fastify.db.query(
          "SELECT id FROM post_likes WHERE id_post = ? AND id_user = ?",
          [postId, userId],
        );

        if (check.length > 0) {
          // UNLIKE
          await fastify.db.query(
            "DELETE FROM post_likes WHERE id_post = ? AND id_user = ?",
            [postId, userId],
          );
          await fastify.db.query(
            "UPDATE community_posts SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = ?",
            [postId],
          );
          return { liked: false };
        } else {
          // LIKE
          await fastify.db.query(
            "INSERT INTO post_likes (id_post, id_user, created_at) VALUES (?, ?, NOW())",
            [postId, userId],
          );
          await fastify.db.query(
            "UPDATE community_posts SET likes_count = likes_count + 1 WHERE id = ?",
            [postId],
          );
          return { liked: true };
        }
      } catch (error) {
        request.log.error(error);
        return reply.code(500).send({ message: "Gagal like postingan" });
      }
    },
  );

  // --- MIGRATION ROUTE (TEMPORARY) ---
  // Gunakan ini untuk menambah kolom img jika belum ada
  fastify.get("/migrate-add-image", async (req, reply) => {
    try {
      await fastify.db.query(
        "ALTER TABLE community_posts ADD COLUMN img VARCHAR(255) DEFAULT NULL"
      );
      return { message: "Kolom img berhasil ditambahkan ke community_posts" };
    } catch (error) {
      // Ignore error jika kolom sudah ada
      return { message: "Kolom img mungkin sudah ada", error: error.message };
    }
  });
}
