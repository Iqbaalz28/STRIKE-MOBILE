import { sendPushNotification, NotificationType } from '../services/pushService.js';

export default async function (fastify, opts) {

    // --- MIGRATION: Create tables ---
    fastify.get("/migrate-notifications", async (req, reply) => {
        try {
            // Create user_push_tokens table
            await fastify.db.query(`
        CREATE TABLE IF NOT EXISTS user_push_tokens (
          id INT AUTO_INCREMENT PRIMARY KEY,
          id_user INT NOT NULL,
          push_token VARCHAR(255) NOT NULL,
          device_type ENUM('ios', 'android') DEFAULT 'android',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          UNIQUE KEY unique_token (push_token),
          KEY idx_user (id_user)
        )
      `);

            // Create notifications table
            await fastify.db.query(`
        CREATE TABLE IF NOT EXISTS notifications (
          id INT AUTO_INCREMENT PRIMARY KEY,
          id_user INT NOT NULL,
          title VARCHAR(255) NOT NULL,
          body TEXT NOT NULL,
          type ENUM('booking_reminder', 'discount', 'community') NOT NULL,
          ref_id INT DEFAULT NULL,
          is_read BOOLEAN DEFAULT FALSE,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          KEY idx_user (id_user),
          KEY idx_type (type)
        )
      `);

            return { message: "Tables created successfully" };
        } catch (error) {
            return { message: "Error creating tables", error: error.message };
        }
    });

    // --- 1. REGISTER PUSH TOKEN ---
    fastify.post(
        "/register-token",
        { onRequest: [fastify.authenticate] },
        async (request, reply) => {
            try {
                const userId = request.user.id;
                const { push_token, device_type = 'android' } = request.body;

                if (!push_token) {
                    return reply.code(400).send({ message: "Push token required" });
                }

                // Upsert: Insert or update if exists
                await fastify.db.query(
                    `INSERT INTO user_push_tokens (id_user, push_token, device_type)
           VALUES (?, ?, ?)
           ON DUPLICATE KEY UPDATE id_user = ?, device_type = ?, updated_at = NOW()`,
                    [userId, push_token, device_type, userId, device_type]
                );

                return { message: "Token registered successfully" };
            } catch (error) {
                request.log.error(error);
                return reply.code(500).send({ message: "Failed to register token" });
            }
        }
    );

    // --- 2. GET USER NOTIFICATIONS ---
    fastify.get(
        "/",
        { onRequest: [fastify.authenticate] },
        async (request, reply) => {
            try {
                const userId = request.user.id;
                const [rows] = await fastify.db.query(
                    `SELECT * FROM notifications 
           WHERE id_user = ? 
           ORDER BY created_at DESC 
           LIMIT 50`,
                    [userId]
                );
                return rows;
            } catch (error) {
                request.log.error(error);
                return reply.code(500).send({ message: "Failed to fetch notifications" });
            }
        }
    );

    // --- 3. MARK AS READ ---
    fastify.put(
        "/:id/read",
        { onRequest: [fastify.authenticate] },
        async (request, reply) => {
            try {
                const userId = request.user.id;
                const notifId = request.params.id;

                await fastify.db.query(
                    `UPDATE notifications SET is_read = TRUE 
           WHERE id = ? AND id_user = ?`,
                    [notifId, userId]
                );

                return { message: "Marked as read" };
            } catch (error) {
                request.log.error(error);
                return reply.code(500).send({ message: "Failed to mark as read" });
            }
        }
    );

    // --- 4. MARK ALL AS READ ---
    fastify.put(
        "/read-all",
        { onRequest: [fastify.authenticate] },
        async (request, reply) => {
            try {
                const userId = request.user.id;

                await fastify.db.query(
                    `UPDATE notifications SET is_read = TRUE WHERE id_user = ?`,
                    [userId]
                );

                return { message: "All marked as read" };
            } catch (error) {
                request.log.error(error);
                return reply.code(500).send({ message: "Failed to mark all as read" });
            }
        }
    );

    // --- 5. GET UNREAD COUNT ---
    fastify.get(
        "/unread-count",
        { onRequest: [fastify.authenticate] },
        async (request, reply) => {
            try {
                const userId = request.user.id;
                const [rows] = await fastify.db.query(
                    `SELECT COUNT(*) as count FROM notifications 
           WHERE id_user = ? AND is_read = FALSE`,
                    [userId]
                );
                return { count: rows[0].count };
            } catch (error) {
                request.log.error(error);
                return reply.code(500).send({ message: "Failed to get count" });
            }
        }
    );

    // --- 6. BROADCAST DISCOUNT (Admin/Manual) ---
    // Use this to notify all users about new discounts
    fastify.post(
        "/broadcast-discount",
        // NOTE: In production, add admin authentication here
        async (request, reply) => {
            try {
                const { title, body, discount_id } = request.body;

                if (!title || !body) {
                    return reply.code(400).send({ message: "Title and body required" });
                }

                // Get all users with push tokens
                const [users] = await fastify.db.query(
                    `SELECT DISTINCT id_user, push_token FROM user_push_tokens`
                );

                let sentCount = 0;
                for (const { id_user, push_token } of users) {
                    try {
                        // Save to database
                        await fastify.db.query(
                            `INSERT INTO notifications (id_user, title, body, type, ref_id)
                             VALUES (?, ?, ?, 'discount', ?)`,
                            [id_user, title, body, discount_id || null]
                        );

                        // Send push notification
                        await sendPushNotification(push_token, {
                            title,
                            body,
                            data: { type: 'discount', refId: discount_id }
                        });

                        sentCount++;
                    } catch (err) {
                        console.error(`Failed to notify user ${id_user}:`, err);
                    }
                }

                return { message: `Broadcast sent to ${sentCount} users` };
            } catch (error) {
                request.log.error(error);
                return reply.code(500).send({ message: "Failed to send broadcast" });
            }
        }
    );

    // --- HELPER: Send notification to user ---
    fastify.decorate('sendNotification', async (userId, { title, body, type, refId = null }) => {
        try {
            // Save to database
            await fastify.db.query(
                `INSERT INTO notifications (id_user, title, body, type, ref_id)
         VALUES (?, ?, ?, ?, ?)`,
                [userId, title, body, type, refId]
            );

            // Get user's push tokens
            const [tokens] = await fastify.db.query(
                `SELECT push_token FROM user_push_tokens WHERE id_user = ?`,
                [userId]
            );

            // Send push notification
            for (const { push_token } of tokens) {
                await sendPushNotification(push_token, {
                    title,
                    body,
                    data: { type, refId },
                });
            }

            return true;
        } catch (error) {
            console.error('Failed to send notification:', error);
            return false;
        }
    });
}

