// src/utils/assets.ts

// 1. Import semua gambar secara manual
const images: { [key: string]: any } = {
	// --- General & Home ---
	"mancing.png": require("@/assets/images/mancing.png"),
	"mancing2.png": require("@/assets/images/mancing2.png"),
	"wave1.png": require("@/assets/images/wave1.png"),
	"strikeit_logo.png": require("@/assets/images/strikeit_logo.png"),
	"logo_hitam.png": require("@/assets/images/logo_hitam.png"),

	// --- Icons & UI ---
	"left-arrow.png": require("@/assets/images/left-arrow.png"),
	"right-arrow.png": require("@/assets/images/right-arrow.png"),
	"user.png": require("@/assets/images/user.png"),
	"person.png": require("@/assets/images/person.png"),

	// --- Placeholders & Content ---
	"placeholdermap.png": require("@/assets/images/placeholdermap.png"),
	"preview.png": require("@/assets/images/preview.png"),
	"preview.webp": require("@/assets/images/preview.webp"),
	"saskeh.jpg": require("@/assets/images/saskeh.jpg"),
	"Tuna.png": require("@/assets/images/Tuna.png"),
	"Union.png": require("@/assets/images/Union.png"),
	"maman.png": require("@/assets/images/maman.png"),

	// --- Payment Methods ---
	"visa.png": require("@/assets/images/paymentimg/visa.png"),
	"mastercard.png": require("@/assets/images/paymentimg/mastercard.png"),
	// Catatan: SVG butuh library khusus (react-native-svg),
	// jadi untuk sekarang kita skip atau gunakan PNG-nya saja jika ada.
};

// 2. Buat Helper Function Pintar
export const getImageSource = (path?: string) => {
	if (!path) return images["preview.png"]; // Default placeholder

	// A. Jika path adalah URL lengkap (http...), pakai URI
	if (path.startsWith("http")) {
		return { uri: path };
	}

	// B. Bersihkan path dari backend (misal: "uploads/mancing.png" -> "mancing.png")
	// Kita ambil nama filenya saja
	const filename = path.split("/").pop() || "";

	// C. Cek apakah ada di aset lokal?
	if (images[filename]) {
		return images[filename]; // Return require(...)
	}

	// D. Jika tidak ada di lokal, asumsikan itu file di server backend lokal
	// Ganti IP sesuai emulator (10.0.2.2 untuk Android)
	return { uri: `http://10.0.2.2:3000/uploads/${path}` };
};

export default images;
