import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { ShoppingCart } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { MainTabParamList } from "@/navigation/types";

// Helper untuk URL gambar (Bisa dipisah ke utils/url.ts nanti)
const getImageUrl = (path: string) => {
  if (!path) return "https://placehold.co/400x400/e2e8f0/1e293b?text=No+Image";
  if (path.startsWith("http")) return path;
  // Ganti IP ini sesuai IP komputer (misal: 192.168.1.x) jika di HP fisik
  return `http://10.0.2.2:3000/uploads/${
    path.startsWith("/") ? path.substring(1) : path
  }`;
};

const ProductCard = ({ product }: { product: any }) => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  // Cek apakah produk sewa atau beli untuk badge
  const isRent = product.price_rent > 0;
  const isSale = product.price_sale > 0;

  return (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate("ShopStack", {
          screen: "ProductDetail",
          params: { id: product.id },
        })
      }
      className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 m-1 overflow-hidden"
    >
      {/* Gambar Produk */}
      <View className="relative">
        <Image
          source={{ uri: getImageUrl(product.img) }}
          className="w-full h-40 bg-gray-100"
          resizeMode="cover"
        />
        {/* Badge Status */}
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
          className="text-sm font-bold text-gray-800 mb-1"
          numberOfLines={2}
        >
          {product.name}
        </Text>

        {/* Harga */}
        <View className="mt-1">
          {isSale && (
            <Text className="text-sm font-bold text-gray-900">
              Rp {parseInt(product.price_sale).toLocaleString("id-ID")}
            </Text>
          )}
          {isRent && (
            <Text className="text-xs text-blue-600">
              Sewa: Rp {parseInt(product.price_rent).toLocaleString("id-ID")}{" "}
              /jam
            </Text>
          )}
        </View>

        {/* Tombol Add to Cart Kecil */}
        <View className="mt-3 flex-row justify-between items-center">
          <Text className="text-xs text-gray-500">
            {product.category || "Alat"}
          </Text>
          <TouchableOpacity className="bg-blue-50 p-1.5 rounded-lg">
            <ShoppingCart size={16} color="#2563EB" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default ProductCard;
