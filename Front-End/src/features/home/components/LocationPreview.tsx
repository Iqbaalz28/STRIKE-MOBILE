import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { ChevronLeft, ChevronRight, MapPin } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import api from "@/services/api";

const LocationPreview = () => {
  const navigation = useNavigation<any>();

  // State
  const [locations, setLocations] = useState<any[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch Data
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const res = await api.getLocations();
        setLocations(res.data);
      } catch (error) {
        console.error("Gagal mengambil lokasi:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLocations();
  }, []);

  // Logic Select Location
  const selectedLocation = locations[selectedIndex];

  // Helper: Fix Image URL
  const getImageUrl = (img: string) => {
    if (!img) return "https://placehold.co/800x400/9CA3AF/FFFFFF?text=No+Image";
    if (img.startsWith("http")) return img;
    // Android Emulator butuh IP 10.0.2.2, API Service sudah handle BASE_URL
    // Kita anggap img hanya path filename
    const cleanPath = img.startsWith("/") ? img.substring(1) : img;
    return `http://10.0.2.2:3000/uploads/${cleanPath}`;
  };

  const handleNext = () => {
    if (locations.length > 0) {
      setSelectedIndex((prev) => (prev + 1) % locations.length);
    }
  };

  const handlePrev = () => {
    if (locations.length > 0) {
      setSelectedIndex(
        (prev) => (prev - 1 + locations.length) % locations.length
      );
    }
  };

  if (loading) {
    return (
      <View className="p-10">
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  if (locations.length === 0) {
    return null; // Atau tampilkan pesan kosong
  }

  return (
    <View className="py-12 bg-white">
      {/* Header Text */}
      <View className="px-4 mb-8">
        <Text className="text-3xl font-bold text-gray-900 mb-3 font-[Outfit_700Bold]">
          Lokasi Populer
        </Text>
        <Text className="text-gray-500 text-base leading-relaxed font-[Outfit_400Regular]">
          Jelajahi destinasi pemancingan terbaik di sekitar Anda.
        </Text>
      </View>

      {/* Filter Buttons (Horizontal Scroll) */}
      <View className="mb-8">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 10 }}
        >
          {/* Tombol Panah Kiri (Hanya muncul jika item banyak) */}
          <TouchableOpacity
            onPress={handlePrev}
            className="w-10 h-10 rounded-full border border-gray-200 bg-gray-50 items-center justify-center mr-2"
          >
            <ChevronLeft size={20} color="#4B5563" />
          </TouchableOpacity>

          {locations.map((loc, index) => (
            <TouchableOpacity
              key={loc.id || index}
              onPress={() => setSelectedIndex(index)}
              className={`px-5 h-10 rounded-full justify-center items-center border ${
                selectedIndex === index
                  ? "bg-blue-600 border-blue-600 shadow-lg shadow-blue-200"
                  : "bg-white border-gray-300"
              }`}
            >
              <Text
                className={`font-medium ${
                  selectedIndex === index ? "text-white" : "text-gray-700"
                }`}
              >
                {loc.city}
              </Text>
            </TouchableOpacity>
          ))}

          {/* Tombol Panah Kanan */}
          <TouchableOpacity
            onPress={handleNext}
            className="w-10 h-10 rounded-full border border-gray-200 bg-gray-50 items-center justify-center ml-2"
          >
            <ChevronRight size={20} color="#4B5563" />
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Main Card Display */}
      <View className="px-4 items-center">
        <View className="w-full bg-white rounded-2xl shadow-xl shadow-gray-200 overflow-hidden">
          <Image
            source={{ uri: getImageUrl(selectedLocation?.img) }}
            className="w-full h-64 object-cover"
            resizeMode="cover"
          />

          <View className="p-5">
            <View className="flex-row items-center mb-2">
              <MapPin size={18} color="#2563EB" />
              <Text className="ml-2 text-lg font-bold text-gray-800 font-[Outfit_700Bold]">
                {selectedLocation?.name}
              </Text>
            </View>
            <Text className="text-gray-500 mb-4">{selectedLocation?.city}</Text>

            <TouchableOpacity
              onPress={() => navigation.navigate("Main", { screen: "Booking" })}
              className="w-full py-4 bg-blue-600 rounded-xl items-center active:bg-blue-700"
            >
              <Text className="text-white font-bold uppercase tracking-wider font-[Outfit_700Bold]">
                Booking Sekarang
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

export default LocationPreview;
