// 1. Format Rupiah
export const formatRupiah = (number: number) => {
	return new Intl.NumberFormat("id-ID", {
		style: "currency",
		currency: "IDR",
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	}).format(number);
};

// 2. Format Tanggal (Contoh: 20 Januari 2025)
export const formatDate = (dateString: string) => {
	const date = new Date(dateString);
	return date.toLocaleDateString("id-ID", {
		day: "numeric",
		month: "long",
		year: "numeric",
	});
};

// 3. Format Tanggal Relative (Time Ago) - Bekas PostCard.tsx
export const timeAgo = (dateString: string) => {
	const date = new Date(dateString);
	const now = new Date();
	const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

	let interval = seconds / 31536000;
	if (interval > 1) return Math.floor(interval) + " tahun lalu";

	interval = seconds / 2592000;
	if (interval > 1) return Math.floor(interval) + " bulan lalu";

	interval = seconds / 86400;
	if (interval > 1) return Math.floor(interval) + " hari lalu";

	interval = seconds / 3600;
	if (interval > 1) return Math.floor(interval) + " jam lalu";

	interval = seconds / 60;
	if (interval > 1) return Math.floor(interval) + " menit lalu";

	return "Baru saja";
};

// 4. Format Image URL (Helper untuk Android Emulator & iOS)
export const getImageUrl = (path: string, defaultPlaceholder?: string) => {
	if (!path)
		return (
			defaultPlaceholder ||
			"https://placehold.co/600x400/e2e8f0/1e293b?text=No+Image"
		);
	if (path.startsWith("http")) return path;

	// Android Emulator butuh 10.0.2.2, iOS simulator bisa pakai localhost
	const baseURL = "http://10.0.2.2:3000/uploads/";
	return `${baseURL}${path.startsWith("/") ? path.substring(1) : path}`;
};
