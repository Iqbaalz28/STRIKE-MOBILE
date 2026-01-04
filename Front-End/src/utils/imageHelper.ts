import Constants from 'expo-constants';
import { Platform } from 'react-native';

/**
 * Get dynamic base URL for API
 */
export const getBaseUrl = (): string => {
	const debuggerHost = Constants.expoConfig?.hostUri;
	if (debuggerHost) {
		const host = debuggerHost.split(':')[0];
		return `http://${host}:3000`;
	}
	// Fallback
	return Platform.OS === "android"
		? "http://10.0.2.2:3000"
		: "http://localhost:3000";
};

/**
 * Convert image path to full URL
 */
export const getImageUrl = (path: string | null | undefined): string => {
	if (!path) {
		return "https://placehold.co/400x300/e2e8f0/1e293b?text=No+Image";
	}
	
	// Jika sudah full URL (http/https)
	if (path.startsWith("http")) {
		return path;
	}
	
	// Remove leading slash if exists
	const cleanPath = path.startsWith("/") ? path.substring(1) : path;
	
	// Return dynamic URL
	return `${getBaseUrl()}/uploads/${cleanPath}`;
};
