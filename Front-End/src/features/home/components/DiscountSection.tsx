import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Ticket, Copy } from "lucide-react-native";
import api from "@/services/api";

const DiscountSection = () => {
  const [discounts, setDiscounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.getDiscounts();
        setDiscounts(res.data);
      } catch (error) {
        console.log("Error fetching discounts", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading)
    return <ActivityIndicator size="small" color="#2563EB" className="my-4" />;
  if (discounts.length === 0) return null;

  return (
    <View className="py-8 bg-blue-50">
      <View className="px-4 mb-4 flex-row items-center justify-between">
        <View>
          <Text className="text-xl font-bold text-gray-900 font-[Outfit_700Bold]">
            Promo Spesial
          </Text>
          <Text className="text-gray-500 text-sm font-[Outfit_400Regular]">
            Hemat budget mancingmu hari ini!
          </Text>
        </View>
        <Ticket size={24} color="#2563EB" />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 16 }}
      >
        {discounts.map((item, index) => (
          <View
            key={item.id || index}
            className="w-72 bg-white rounded-2xl p-4 shadow-sm border border-blue-100 flex-row items-center"
          >
            {/* Bagian Kiri (Icon/Persen) */}
            <View className="w-16 h-16 bg-blue-100 rounded-xl items-center justify-center mr-4 border-dashed border-2 border-blue-300">
              <Text className="text-blue-700 font-bold text-lg">
                {item.percentage || 10}%
              </Text>
              <Text className="text-blue-700 text-[10px] uppercase">OFF</Text>
            </View>

            {/* Bagian Kanan (Info) */}
            <View className="flex-1">
              <Text
                className="font-bold text-gray-800 text-base mb-1"
                numberOfLines={1}
              >
                {item.name || "Diskon Spesial"}
              </Text>
              <Text className="text-gray-500 text-xs mb-2" numberOfLines={2}>
                {item.description || "Gunakan kode ini saat checkout."}
              </Text>

              <TouchableOpacity className="bg-blue-600 py-1.5 px-3 rounded-lg self-start flex-row items-center">
                <Text className="text-white text-xs font-bold mr-1">
                  {item.code || "HEMAT10"}
                </Text>
                <Copy size={10} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default DiscountSection;
