import Constants from "expo-constants";
import { Platform } from "react-native";

/**
 * Mendapatkan Base URL API secara dinamis.
 * - Jika di HP Fisik/LAN: Mengambil IP dari Metro Bundler
 * - Jika di Emulator Android: Menggunakan 10.0.2.2
 * - Jika di iOS Simulator: Menggunakan localhost
 */
export const getBaseUrl = (): string => {
	// Coba ambil IP dari Metro Bundler (Debugger)
	// Ini berguna jika Anda menjalankan App di HP Fisik via scan QR Code
	const debuggerHost = Constants.expoConfig?.hostUri;

	if (debuggerHost) {
		const host = debuggerHost.split(":")[0];
		return `http://${host}:3000`;
	}

	// Fallback jika tidak terdeteksi (biasanya di Emulator/Simulator)
	return Platform.OS === "android"
		? "http://10.0.2.2:3000"
		: "http://localhost:3000";
};

/**
 * Mengubah path gambar (relative) menjadi Full URL.
 * Menangani kasus localhost di Android & path ganda.
 */
export const getImageUrl = (path: string | null | undefined): string => {
	// 1. Jika null/undefined, kembalikan placeholder
	if (!path) {
		return "https://placehold.co/400x300/e2e8f0/1e293b?text=No+Image";
	}

	// 2. Jika sudah Full URL (http/https)
	if (path.startsWith("http")) {
		// [FIX ANDROID] Jika URL dari DB berisi 'localhost' tapi dibuka di Android Emulator/HP
		if (Platform.OS === "android" && path.includes("localhost")) {
			return path.replace("localhost", "10.0.2.2");
		}
		return path;
	}

	// 3. Bersihkan slash di depan
	const cleanPath = path.startsWith("/") ? path.substring(1) : path;

	// 4. Cek apakah path sudah mengandung kata 'uploads' atau belum
	// Logic: Jika path dari DB cuma 'gambar.jpg', kita tambah 'uploads/'.
	// Jika path dari DB sudah 'uploads/gambar.jpg', jangan tambah lagi.
	const finalPath = cleanPath.startsWith("uploads")
		? cleanPath
		: `uploads/${cleanPath}`;

	// Return URL dinamis
	return `${getBaseUrl()}/${finalPath}`;
};
