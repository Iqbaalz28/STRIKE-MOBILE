// App.tsx
import "./global.css"; // Import wajib NativeWind
import React from "react";
import { View, ActivityIndicator } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import {
	useFonts,
	Outfit_400Regular,
	Outfit_500Medium,
	Outfit_700Bold,
} from "@expo-google-fonts/outfit";

// Import RootNavigator (yang di dalamnya sudah ada NavigationContainer + Ref)
import RootNavigator from "@/navigation/RootNavigator";

export default function App() {
	// 1. Load Fonts
	let [fontsLoaded] = useFonts({
		Outfit_400Regular,
		Outfit_500Medium,
		Outfit_700Bold,
	});

	// 2. Tampilkan Loading Spinner saat Font belum siap
	if (!fontsLoaded) {
		return (
			// Menggunakan Tailwind (className) agar konsisten
			<View className="flex-1 justify-center items-center bg-white">
				<ActivityIndicator size="large" color="#2563EB" />
			</View>
		);
	}

	// 3. Render Aplikasi Utama
	return (
		<SafeAreaProvider>
			{/* Mengatur Status Bar otomatis (Dark/Light mode) */}
			<StatusBar style="auto" />

			{/* RootNavigator dipanggil di sini. 
         Di dalam RootNavigator.tsx itulah <NavigationContainer ref={navigationRef}> berada.
      */}
			<RootNavigator />
		</SafeAreaProvider>
	);
}
