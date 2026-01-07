import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api';

// Configure notification behavior
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

/**
 * Register for push notifications and get the token
 */
export async function registerForPushNotifications() {
    console.log('📱 [PUSH] Starting push notification registration...');
    let token;

    // Must be on physical device
    if (!Device.isDevice) {
        console.log('📱 [PUSH] Not a physical device, skipping');
        return null;
    }
    console.log('📱 [PUSH] Running on physical device: ', Device.modelName);

    // Check existing permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    // Request permission if not granted
    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }

    if (finalStatus !== 'granted') {
        console.log('Failed to get push token - permission not granted');
        return null;
    }

    // Get project ID for Expo
    const projectId = Constants.expoConfig?.extra?.eas?.projectId ||
        Constants.easConfig?.projectId;

    try {
        token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
        console.log('Push token:', token);
    } catch (error) {
        console.error('Error getting push token:', error);
        return null;
    }

    // Android specific channel setup
    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#0066FF',
        });
    }

    return token;
}

/**
 * Register token with backend
 */
export async function registerTokenWithBackend(token: string) {
    try {
        const authToken = await AsyncStorage.getItem('token');
        if (!authToken) {
            console.log('No auth token, skipping push token registration');
            return false;
        }

        await api.registerPushToken(token, Platform.OS);

        console.log('Push token registered with backend');
        return true;
    } catch (error) {
        console.error('Failed to register push token:', error);
        return false;
    }
}

/**
 * Setup notification listeners
 * Returns cleanup function
 */
export function setupNotificationListeners(
    onNotificationReceived?: (notification: Notifications.Notification) => void,
    onNotificationResponse?: (response: Notifications.NotificationResponse) => void
) {
    // Listener for notifications received while app is in foreground
    const notificationListener = Notifications.addNotificationReceivedListener(
        (notification) => {
            console.log('Notification received:', notification);
            onNotificationReceived?.(notification);
        }
    );

    // Listener for when user taps on notification
    const responseListener = Notifications.addNotificationResponseReceivedListener(
        (response) => {
            console.log('Notification tapped:', response);
            onNotificationResponse?.(response);
        }
    );

    // Return cleanup function
    return () => {
        notificationListener.remove();
        responseListener.remove();
    };
}

/**
 * Initialize push notifications (call on app start/login)
 */
export async function initializePushNotifications() {
    const token = await registerForPushNotifications();
    if (token) {
        await registerTokenWithBackend(token);
    }
    return token;
}
