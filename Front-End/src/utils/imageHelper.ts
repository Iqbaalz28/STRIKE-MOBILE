// src/utils/imageHelper.ts
import { Platform } from "react-native";

// PENTING: Import BASE_URL dari api.ts
// Ini menjaga konsistensi. Jika API pakai Ngrok, gambar juga ambil dari Ngrok.
import { BASE_URL } from "@/services/api";

/**
 * Mengubah path gambar (relative) menjadi Full URL.
 * Contoh Input: "avatar.jpg" atau "uploads/avatar.jpg"
 * Contoh Output: "https://xxxx.ngrok-free.dev/uploads/avatar.jpg"
 */
export const getImageUrl = (path: string | null | undefined): string => {
	// 1. Jika null/undefined/kosong, kembalikan placeholder default
	if (!path) {
		return "https://placehold.co/400x300/e2e8f0/1e293b?text=No+Image";
	}

	// 2. Jika path sudah berupa URL lengkap (http/https)
	// Contoh: Foto profil dari Google (https://lh3.googleusercontent.com/...)
	if (path.startsWith("http")) {
		return path;
	}

	// 3. Bersihkan slash di depan jika ada (misal "/uploads/..." jadi "uploads/...")
	const cleanPath = path.startsWith("/") ? path.substring(1) : path;

	// 4. Pastikan prefix 'uploads/' ada
	// Backend menyimpan file fisik di folder 'uploads', tapi terkadang database
	// hanya menyimpan nama file saja (misal: "foto123.jpg").
	// Logic ini memastikan pathnya valid menjadi "uploads/foto123.jpg".
	const finalPath = cleanPath.startsWith("uploads")
		? cleanPath
		: `uploads/${cleanPath}`;

	// 5. Gabungkan dengan BASE_URL global
	// Hasil akhirnya akan mengikuti konfigurasi di api.ts (bisa localhost, bisa Ngrok)
	return `${BASE_URL}/${finalPath}`;
};
