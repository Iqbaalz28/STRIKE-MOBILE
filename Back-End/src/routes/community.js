// src/routes/community.js

export default async function (fastify, options) {

    // 1. GET ALL POSTS (Feed)
    fastify.get('/posts', async (request, reply) => {
        try {
            // Join dengan users untuk dapat nama & avatar author
            const [rows] = await fastify.db.query(`
                SELECT 
                    p.id, p.title, p.body, p.category, p.created_at,
                    p.views_count, p.likes_count, p.reply_count,
                    u.name as author_name, u.avatar_img as author_avatar
                FROM community_posts p
                JOIN users u ON p.id_user = u.id
                ORDER BY p.created_at DESC
            `);
            return rows;
        } catch (error) {
            request.log.error(error);
            return reply.code(500).send({ message: 'Gagal memuat postingan' });
        }
    });

    // 2. GET SINGLE POST (Detail)
    fastify.get('/posts/:id', async (request, reply) => {
        try {
            const { id } = request.params;
            
            // Update view count +1 setiap kali detail dibuka
            await fastify.db.query('UPDATE community_posts SET views_count = views_count + 1 WHERE id = ?', [id]);

            const [rows] = await fastify.db.query(`
                SELECT 
                    p.id, p.title, p.body, p.category, p.created_at,
                    p.views_count, p.likes_count, p.reply_count,
                    u.name as author_name, u.avatar_img as author_avatar
                FROM community_posts p
                JOIN users u ON p.id_user = u.id
                WHERE p.id = ?
            `, [id]);

            if (rows.length === 0) return reply.code(404).send({ message: 'Postingan tidak ditemukan' });
            return rows[0];
        } catch (error) {
            request.log.error(error);
            return reply.code(500).send({ message: 'Error server' });
        }
    });

    // 3. CREATE POST
    fastify.post('/posts', { onRequest: [fastify.authenticate] }, async (request, reply) => {
        try {
            const userId = request.user.id;
            const { title, body, category } = request.body;

            if (!title || !body || !category) {
                return reply.code(400).send({ message: 'Semua field wajib diisi' });
            }

            await fastify.db.query(`
                INSERT INTO community_posts (id_user, title, body, category, created_at)
                VALUES (?, ?, ?, ?, NOW())
            `, [userId, title, body, category]);

            return { message: 'Postingan berhasil dibuat' };
        } catch (error) {
            request.log.error(error);
            return reply.code(500).send({ message: 'Gagal membuat postingan' });
        }
    });

    // 4. GET COMMENTS
    fastify.get('/posts/:id/comments', async (request, reply) => {
        try {
            const { id } = request.params;
            const [rows] = await fastify.db.query(`
                SELECT 
                    c.id, c.content, c.created_at,
                    u.name as author_name, u.avatar_img as author_avatar
                FROM post_comments c
                JOIN users u ON c.id_user = u.id
                WHERE c.id_post = ?
                ORDER BY c.created_at ASC
            `, [id]);
            return rows;
        } catch (error) {
            return reply.code(500).send({ message: 'Gagal memuat komentar' });
        }
    });

    // 5. CREATE COMMENT
    fastify.post('/posts/:id/comments', { onRequest: [fastify.authenticate] }, async (request, reply) => {
        try {
            const userId = request.user.id;
            const postId = request.params.id;
            const { content } = request.body;

            if (!content) return reply.code(400).send({ message: 'Komentar tidak boleh kosong' });

            // Insert Comment
            await fastify.db.query(`
                INSERT INTO post_comments (id_post, id_user, content, created_at)
                VALUES (?, ?, ?, NOW())
            `, [postId, userId, content]);

            // Update Reply Count di tabel Post
            await fastify.db.query(`
                UPDATE community_posts SET reply_count = reply_count + 1 WHERE id = ?
            `, [postId]);

            return { message: 'Komentar terkirim' };
        } catch (error) {
            request.log.error(error);
            return reply.code(500).send({ message: 'Gagal mengirim komentar' });
        }
    });
    fastify.post('/posts/:id/like', { onRequest: [fastify.authenticate] }, async (request, reply) => {
        try {
            const userId = request.user.id;
            const postId = request.params.id;

            // Cek apakah user sudah like
            const [check] = await fastify.db.query(
                'SELECT id FROM post_likes WHERE id_post = ? AND id_user = ?',
                [postId, userId]
            );

            if (check.length > 0) {
                // UNLIKE
                await fastify.db.query('DELETE FROM post_likes WHERE id_post = ? AND id_user = ?', [postId, userId]);
                await fastify.db.query('UPDATE community_posts SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = ?', [postId]);
                return { liked: false };
            } else {
                // LIKE
                await fastify.db.query('INSERT INTO post_likes (id_post, id_user, created_at) VALUES (?, ?, NOW())', [postId, userId]);
                await fastify.db.query('UPDATE community_posts SET likes_count = likes_count + 1 WHERE id = ?', [postId]);
                return { liked: true };
            }
        } catch (error) {
            request.log.error(error);
            return reply.code(500).send({ message: 'Gagal like postingan' });
        }
    });
}
