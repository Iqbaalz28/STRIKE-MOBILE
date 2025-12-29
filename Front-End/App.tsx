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
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  // 3. Render Aplikasi Utama
  return (
    <SafeAreaProvider>
      {/* Mengatur Status Bar (ikon baterai/sinyal) agar otomatis menyesuaikan (gelap/terang) */}
      <StatusBar style="auto" />

      {/* Panggil RootNavigator sebagai pintu gerbang utama */}
      <RootNavigator />
    </SafeAreaProvider>
  );
}
