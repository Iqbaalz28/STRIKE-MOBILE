import { Expo } from 'expo-server-sdk';

// Create a new Expo SDK client
const expo = new Expo();

/**
 * Send push notification to a single user
 */
export async function sendPushNotification(pushToken, { title, body, data = {} }) {
    console.log('📤 [PUSH SERVICE] Attempting to send notification to:', pushToken);

    // Check that the push token is valid
    if (!Expo.isExpoPushToken(pushToken)) {
        console.error(`❌ Push token ${pushToken} is not a valid Expo push token`);
        return null;
    }

    const message = {
        to: pushToken,
        sound: 'default',
        title,
        body,
        data,
    };

    console.log('📤 [PUSH SERVICE] Message:', JSON.stringify(message));

    try {
        const tickets = await expo.sendPushNotificationsAsync([message]);
        console.log('✅ [PUSH SERVICE] Tickets received:', JSON.stringify(tickets));
        return tickets;
    } catch (error) {
        console.error('❌ [PUSH SERVICE] Error sending push notification:', error);
        return null;
    }
}

/**
 * Send push notification to multiple users
 */
export async function sendPushNotifications(pushTokens, { title, body, data = {} }) {
    const messages = [];

    for (const pushToken of pushTokens) {
        if (!Expo.isExpoPushToken(pushToken)) {
            console.error(`Push token ${pushToken} is not a valid Expo push token`);
            continue;
        }

        messages.push({
            to: pushToken,
            sound: 'default',
            title,
            body,
            data,
        });
    }

    // Batch send (Expo recommends batching)
    const chunks = expo.chunkPushNotifications(messages);
    const tickets = [];

    for (const chunk of chunks) {
        try {
            const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
            tickets.push(...ticketChunk);
        } catch (error) {
            console.error('Error sending push notifications:', error);
        }
    }

    return tickets;
}

/**
 * Notification types
 */
/**
 * Notification types
 */
export const NotificationType = {
    BOOKING_REMINDER: 'booking_reminder',
    DISCOUNT: 'discount',
    COMMUNITY: 'community',
};

/**
 * Helper: Send notification to a specific user (handles DB lookup and saving)
 * @param {Object} db - Fastify database connection
 * @param {number} userId - ID of the user
 * @param {Object} content - { title, body, type, refId }
 */
export async function sendNotificationToUser(db, userId, { title, body, type, refId = null }) {
    try {
        console.log(`🔔 Sending notification to User ${userId}: ${title}`);

        // 1. Save to database
        await db.query(
            `INSERT INTO notifications (id_user, title, body, type, ref_id)
             VALUES (?, ?, ?, ?, ?)`,
            [userId, title, body, type, refId]
        );

        // 2. Get user's push tokens
        const [tokens] = await db.query(
            `SELECT push_token FROM user_push_tokens WHERE id_user = ?`,
            [userId]
        );

        if (tokens.length === 0) {
            console.log(`⚠️ User ${userId} has no push tokens.`);
            return false;
        }

        // 3. Send to all tokens
        for (const { push_token } of tokens) {
            await sendPushNotification(push_token, {
                title,
                body,
                data: { type, refId },
            });
        }

        return true;
    } catch (error) {
        console.error('❌ Failed to send notification to user:', error);
        return false;
    }
}
