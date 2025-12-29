import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Calendar, ShoppingBag, MapPin } from "lucide-react-native";

interface HistoryItem {
  id: number;
  title: string; // Nama Lokasi atau Nama Produk
  date: string;
  price: number;
  status: "terbayar" | "belum_dibayar" | "dibatalkan" | string;
  type: "booking" | "shop"; // Pembeda antara Booking dan Belanja
}

const HistoryCard = ({ item }: { item: HistoryItem }) => {
  // Helper Warna Status
  const getStatusStyle = (status: string) => {
    switch (status) {
      case "terbayar":
        return {
          bg: "bg-green-100",
          text: "text-green-700",
          label: "Berhasil",
        };
      case "belum_dibayar":
        return {
          bg: "bg-yellow-100",
          text: "text-yellow-700",
          label: "Menunggu Bayar",
        };
      case "dibatalkan":
        return { bg: "bg-red-100", text: "text-red-700", label: "Dibatalkan" };
      default:
        return { bg: "bg-gray-100", text: "text-gray-700", label: status };
    }
  };

  const statusStyle = getStatusStyle(item.status);

  return (
    <View className="bg-white rounded-xl p-4 mb-4 border border-gray-100 shadow-sm">
      <View className="flex-row justify-between items-start mb-2">
        <View className="flex-row items-center gap-2">
          <View
            className={`p-2 rounded-full ${
              item.type === "booking" ? "bg-blue-50" : "bg-orange-50"
            }`}
          >
            {item.type === "booking" ? (
              <MapPin size={18} color="#2563EB" />
            ) : (
              <ShoppingBag size={18} color="#EA580C" />
            )}
          </View>
          <View>
            <Text
              className="font-bold text-gray-800 text-base"
              numberOfLines={1}
            >
              {item.title}
            </Text>
            <Text className="text-xs text-gray-500 capitalize">
              {item.type === "booking" ? "Booking Tempat" : "Belanja Toko"}
            </Text>
          </View>
        </View>

        {/* Badge Status */}
        <View className={`px-2 py-1 rounded-md ${statusStyle.bg}`}>
          <Text
            className={`text-[10px] font-bold ${statusStyle.text} uppercase`}
          >
            {statusStyle.label}
          </Text>
        </View>
      </View>

      <View className="my-2 border-t border-gray-100" />

      <View className="flex-row justify-between items-center">
        <View className="flex-row items-center">
          <Calendar size={14} color="#6B7280" />
          <Text className="text-gray-500 text-xs ml-1">{item.date}</Text>
        </View>
        <Text className="font-bold text-blue-600 text-base">
          Rp {item.price.toLocaleString("id-ID")}
        </Text>
      </View>
    </View>
  );
};

export default HistoryCard;
