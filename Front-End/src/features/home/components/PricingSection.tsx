import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Check, Crown } from "lucide-react-native";
import api from "@/services/api";

const PricingSection = () => {
  const [memberships, setMemberships] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMemberships();
  }, []);

  const fetchMemberships = async () => {
    try {
      const res = await api.getMemberships();
      setMemberships(res.data);
    } catch (error) {
      console.log("Gagal load membership:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <ActivityIndicator size="small" color="#2563EB" />;

  return (
    <View className="mb-8">
      <View className="px-5 mb-4">
        <Text className="text-xl font-bold text-gray-900 font-[Outfit_700Bold]">
          Pilih Paket Member
        </Text>
        <Text className="text-gray-500 text-sm">
          Dapatkan akses eksklusif dan diskon spesial
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingRight: 10 }}
      >
        {memberships.map((plan: any) => (
          <View
            key={plan.id}
            className={`w-72 p-5 rounded-3xl mr-4 border ${
              plan.name.toLowerCase().includes("premium") || plan.price > 0
                ? "bg-blue-600 border-blue-600"
                : "bg-white border-gray-200"
            }`}
          >
            {/* Header Card */}
            <View className="flex-row justify-between items-start mb-4">
              <View>
                <Text
                  className={`font-bold text-lg ${
                    plan.price > 0 ? "text-white" : "text-gray-900"
                  }`}
                >
                  {plan.name}
                </Text>
                <Text
                  className={`text-xs ${
                    plan.price > 0 ? "text-blue-100" : "text-gray-500"
                  }`}
                >
                  {plan.duration_days} Hari
                </Text>
              </View>
              {plan.price > 0 && (
                <View className="bg-yellow-400 p-2 rounded-full">
                  <Crown size={20} color="white" fill="white" />
                </View>
              )}
            </View>

            {/* Price */}
            <Text
              className={`text-3xl font-bold mb-6 font-[Outfit_700Bold] ${
                plan.price > 0 ? "text-white" : "text-gray-900"
              }`}
            >
              {plan.price === 0
                ? "Gratis"
                : `Rp ${Number(plan.price).toLocaleString("id-ID")}`}
              <Text
                className={`text-sm font-normal ${
                  plan.price > 0 ? "text-blue-100" : "text-gray-500"
                }`}
              >
                {" "}
                /bulan
              </Text>
            </Text>

            {/* Benefits List */}
            <View className="space-y-3 mb-6">
              {(
                plan.benefits || ["Akses Lokasi", "Support 24/7", "Diskon Toko"]
              ).map((benefit: string, idx: number) => (
                <View key={idx} className="flex-row items-center">
                  <View
                    className={`p-1 rounded-full mr-3 ${
                      plan.price > 0 ? "bg-blue-500" : "bg-green-100"
                    }`}
                  >
                    <Check
                      size={12}
                      color={plan.price > 0 ? "white" : "green"}
                    />
                  </View>
                  <Text
                    className={
                      plan.price > 0 ? "text-blue-50" : "text-gray-600"
                    }
                  >
                    {benefit}
                  </Text>
                </View>
              ))}
            </View>

            {/* Button */}
            <TouchableOpacity
              className={`py-3 rounded-xl items-center ${
                plan.price > 0 ? "bg-white" : "bg-gray-900"
              }`}
            >
              <Text
                className={`font-bold ${
                  plan.price > 0 ? "text-blue-600" : "text-white"
                }`}
              >
                Pilih Paket
              </Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default PricingSection;
