import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { ArrowLeft } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
// Jika sudah ada assets.ts: import { getImageSource } from '@/utils/assets';

const AboutScreen = () => {
  const navigation = useNavigation();

  return (
    <View className="flex-1 bg-white">
      <View className="pt-12 px-4 pb-4 border-b border-gray-100 flex-row items-center gap-3">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-xl font-bold font-[Outfit_700Bold]">
          Tentang Kami
        </Text>
      </View>

      <View className="flex-1 justify-center items-center p-8">
        {/* Ganti dengan getImageSource('strikeit_logo.png') jika sudah ada */}
        <Image
          source={{ uri: "https://placehold.co/200x200?text=Logo" }}
          className="w-32 h-32 mb-6"
          resizeMode="contain"
        />
        <Text className="text-2xl font-bold text-blue-600 font-[Outfit_700Bold] mb-2">
          Strike It
        </Text>
        <Text className="text-gray-500 text-center leading-relaxed">
          Aplikasi pemesanan kolam pancing dan toko perlengkapan pancing
          terlengkap di Indonesia. Kami menghubungkan pemancing dengan
          pengalaman terbaik.
        </Text>

        <View className="mt-10 items-center">
          <Text className="text-gray-400 text-sm">Versi Aplikasi</Text>
          <Text className="text-gray-800 font-bold">v1.0.0 (Beta)</Text>
        </View>
      </View>
    </View>
  );
};

export default AboutScreen;
