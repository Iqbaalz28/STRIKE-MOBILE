import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { ShoppingCart, Plus } from "lucide-react-native";
// Jika Anda sudah setup utils assets, import di sini:
// import { getImageSource } from "@/utils/assets";

// 1. Definisikan Interface Props agar TypeScript tidak error
interface ProductCardProps {
  product: any;
  onPress: () => void;
}

const ProductCard = ({ product, onPress }: ProductCardProps) => {
  // Helper Format Rupiah
  const formatRupiah = (number: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(number);
  };

  // Helper URL Gambar
  const getImageUrl = (path: string) => {
    if (!path)
      return "https://placehold.co/400x400/e2e8f0/1e293b?text=No+Image";
    // Jika path URL lengkap (http...), pakai langsung
    if (path.startsWith("http")) return path;

    // Jika path lokal backend, arahkan ke localhost emulator
    // (Jika sudah pakai assets.ts, ganti baris ini dengan getImageSource(path))
    return `http://10.0.2.2:3000/uploads/${
      path.startsWith("/") ? path.substring(1) : path
    }`;
  };

  // Logic: Cek apakah produk sewa atau beli (dari kode lama Anda)
  const isRent = product.price_rent > 0;
  const isSale = product.price_sale > 0;

  // Logic: Menentukan harga utama yang ditampilkan
  // Prioritas: Sale > Rent > Standard Price (dari Mock Data)
  const displayPrice = isSale
    ? product.price_sale
    : isRent
    ? product.price_rent
    : product.price;

  return (
    <TouchableOpacity
      onPress={onPress} // <--- Gunakan props onPress dari parent
      className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 m-1 overflow-hidden mb-4"
      activeOpacity={0.7}
    >
      {/* Gambar Produk */}
      <View className="relative">
        <Image
          source={{ uri: getImageUrl(product.image || product.img) }}
          className="w-full h-40 bg-gray-100"
          resizeMode="cover"
        />

        {/* Badge Status (Dipertahankan dari kode lama) */}
        <View className="absolute top-2 right-2 flex-row gap-1">
          {isRent && (
            <View className="bg-blue-600 px-2 py-1 rounded-md">
              <Text className="text-[10px] text-white font-bold">SEWA</Text>
            </View>
          )}
          {isSale && (
            <View className="bg-green-600 px-2 py-1 rounded-md">
              <Text className="text-[10px] text-white font-bold">BELI</Text>
            </View>
          )}
        </View>
      </View>

      {/* Info Produk */}
      <View className="p-3">
        <Text
          className="text-sm font-bold text-gray-800 mb-1 h-10 font-[Outfit_500Medium]"
          numberOfLines={2}
        >
          {product.name}
        </Text>

        {/* Tampilan Harga */}
        <View className="mt-1">
          <Text className="text-sm font-bold text-blue-600 font-[Outfit_700Bold]">
            {isRent ? "Sewa: " : ""}
            {formatRupiah(displayPrice)}
            {isRent ? " /jam" : ""}
          </Text>
        </View>

        {/* Footer Card: Kategori & Tombol Cart */}
        <View className="mt-3 flex-row justify-between items-center">
          <Text className="text-xs text-gray-500 capitalize">
            {product.category || "Alat"}
          </Text>
          <View className="bg-blue-50 p-1.5 rounded-lg">
            <ShoppingCart size={16} color="#2563EB" />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default ProductCard;
