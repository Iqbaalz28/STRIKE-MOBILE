// src/navigation/navigationRef.ts
import { createNavigationContainerRef } from "@react-navigation/native";

// 1. Buat Reference Global
export const navigationRef = createNavigationContainerRef<any>();

// 2. Fungsi Navigate Biasa
export function navigate(name: string, params?: any) {
	if (navigationRef.isReady()) {
		navigationRef.navigate(name, params);
	}
}

// 3. Fungsi Reset (Khusus Logout)
// Ini penting agar user tidak bisa tekan tombol "Back" setelah logout
export function resetToLogin() {
	if (navigationRef.isReady()) {
		navigationRef.reset({
			index: 0,
			routes: [{ name: "Login" }],
		});
	}
}
