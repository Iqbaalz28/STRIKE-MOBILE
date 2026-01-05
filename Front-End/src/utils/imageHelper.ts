import { BASE_URL } from "@/services/api";

/**
 * Mengubah path gambar (relative) menjadi Full URL.
 * Menggunakan BASE_URL dari api.ts agar sinkron dengan Ngrok.
 */
export const getImageUrl = (path: string | null | undefined): string => {
	// 1. Jika null/undefined, kembalikan placeholder default
	if (!path) {
		return "https://placehold.co/400x300/e2e8f0/1e293b?text=No+Image";
	}

	// 2. Jika path sudah berupa URL lengkap (http/https), kembalikan langsung
	if (path.startsWith("http")) {
		return path;
	}

	// 3. Bersihkan slash di depan jika ada
	const cleanPath = path.startsWith("/") ? path.substring(1) : path;

	// --- LOGIC BARU: PENGECUALIAN FOLDER ---

	// A. Jika path adalah 'locationimg', JANGAN tambah 'uploads/'
	// (Sesuai konfirmasi Anda bahwa folder ini tidak di dalam uploads)
	if (cleanPath.startsWith("locationimg")) {
		return `${BASE_URL}/${cleanPath}`;
	}

	// B. Jika path adalah 'alatimg' (Produk), biarkan pakai 'uploads/'
	// (Karena di log sebelumnya alatimg sukses dengan 200 OK di dalam uploads)

	// C. Default: Tambahkan 'uploads/' untuk folder lain (misal avatar user)
	// Logic: Jika path belum ada 'uploads', tambahkan.
	const finalPath = cleanPath.startsWith("uploads")
		? cleanPath
		: `uploads/${cleanPath}`;

	return `${BASE_URL}/${finalPath}`;
};

// Helper untuk kompatibilitas
export const getBaseUrl = (): string => {
	return BASE_URL;
};
