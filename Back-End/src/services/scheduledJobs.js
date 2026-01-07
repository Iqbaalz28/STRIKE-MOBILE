import cron from 'node-cron';
import { sendPushNotification, NotificationType } from './pushService.js';

/**
 * Setup scheduled jobs for notifications
 * @param {Object} db - Database connection pool
 */
export function setupScheduledJobs(db) {
    console.log('📅 Setting up scheduled notification jobs...');

    // --- BOOKING REMINDER: Run every hour at minute 0 ---
    // Checks for bookings starting in the next 24 hours
    cron.schedule('0 * * * *', async () => {
        console.log('⏰ Running booking reminder job...');
        try {
            // Find bookings starting in the next 3-24 hours that haven't been reminded
            const [bookings] = await db.query(`
        SELECT 
          b.id, b.id_user, b.booking_start, b.spot_number,
          l.name as location_name
        FROM bookings b
        JOIN locations l ON b.id_location = l.id
        WHERE b.status = 'pending'
          AND b.booking_start BETWEEN NOW() + INTERVAL 3 HOUR AND NOW() + INTERVAL 24 HOUR
          AND b.reminded IS NULL OR b.reminded = 0
      `);

            console.log(`Found ${bookings.length} bookings to remind`);

            for (const booking of bookings) {
                try {
                    // Get user's push tokens
                    const [tokens] = await db.query(
                        `SELECT push_token FROM user_push_tokens WHERE id_user = ?`,
                        [booking.id_user]
                    );

                    // Format time
                    const bookingTime = new Date(booking.booking_start).toLocaleTimeString('id-ID', {
                        hour: '2-digit',
                        minute: '2-digit'
                    });

                    // Send notification to each device
                    for (const { push_token } of tokens) {
                        await sendPushNotification(push_token, {
                            title: 'Pengingat Booking ⏰',
                            body: `Booking Anda di ${booking.location_name} dimulai besok pukul ${bookingTime}. Jangan sampai telat!`,
                            data: { type: NotificationType.BOOKING_REMINDER, refId: booking.id }
                        });
                    }

                    // Save notification to database
                    await db.query(
                        `INSERT INTO notifications (id_user, title, body, type, ref_id)
             VALUES (?, ?, ?, ?, ?)`,
                        [
                            booking.id_user,
                            'Pengingat Booking ⏰',
                            `Booking Anda di ${booking.location_name} dimulai besok pukul ${bookingTime}`,
                            'booking_reminder',
                            booking.id
                        ]
                    );

                    // Mark as reminded (add column if needed)
                    try {
                        await db.query(
                            `UPDATE bookings SET reminded = 1 WHERE id = ?`,
                            [booking.id]
                        );
                    } catch (e) {
                        // Column might not exist, that's okay
                    }

                    console.log(`✅ Reminded user ${booking.id_user} for booking ${booking.id}`);
                } catch (err) {
                    console.error(`Failed to remind booking ${booking.id}:`, err);
                }
            }
        } catch (error) {
            console.error('Booking reminder job failed:', error);
        }
    });

    console.log('✅ Scheduled jobs initialized');
}

/**
 * Send broadcast notification to all users (for new discounts)
 */
export async function sendDiscountBroadcast(db, { title, body, discountId }) {
    try {
        // Get all active push tokens
        const [tokens] = await db.query(
            `SELECT DISTINCT upt.id_user, upt.push_token 
       FROM user_push_tokens upt
       JOIN users u ON upt.id_user = u.id`
        );

        console.log(`Sending discount broadcast to ${tokens.length} devices`);

        for (const { id_user, push_token } of tokens) {
            try {
                // Send push notification
                await sendPushNotification(push_token, {
                    title,
                    body,
                    data: { type: NotificationType.DISCOUNT, refId: discountId }
                });

                // Save to database
                await db.query(
                    `INSERT INTO notifications (id_user, title, body, type, ref_id)
           VALUES (?, ?, ?, 'discount', ?)`,
                    [id_user, title, body, discountId]
                );
            } catch (err) {
                console.error(`Failed to notify user ${id_user}:`, err);
            }
        }

        return { sent: tokens.length };
    } catch (error) {
        console.error('Discount broadcast failed:', error);
        throw error;
    }
}
