import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { ArrowLeft, MapPin } from "lucide-react-native";
// Reuse komponen PaymentMethod dari Booking
import PaymentMethod from "@/features/booking/components/PaymentMethod";

// Helper
const formatRupiah = (num: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(num);

const CheckoutScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { items, total } = route.params || { items: [], total: 0 };

  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [processing, setProcessing] = useState(false);

  const handlePay = () => {
    if (!selectedPayment)
      return Alert.alert(
        "Pilih Pembayaran",
        "Silakan pilih metode pembayaran."
      );

    setProcessing(true);
    // Simulasi API Call
    setTimeout(() => {
      setProcessing(false);
      Alert.alert("Sukses!", "Pembayaran berhasil dikonfirmasi.", [
        { text: "OK", onPress: () => navigation.navigate("Shop") }, // Balik ke Shop atau History
      ]);
    }, 2000);
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="pt-12 px-4 pb-4 bg-white border-b border-gray-100 flex-row items-center gap-3">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-xl font-bold font-[Outfit_700Bold]">
          Checkout
        </Text>
      </View>

      <ScrollView className="flex-1 p-5">
        {/* Alamat Pengiriman */}
        <Text className="font-bold text-gray-900 mb-3">Alamat Pengiriman</Text>
        <View className="bg-white p-4 rounded-xl border border-gray-200 mb-6">
          <View className="flex-row items-center mb-2">
            <MapPin size={18} color="#2563EB" />
            <Text className="font-bold ml-2 text-gray-800">Rumah Utama</Text>
          </View>
          <Text className="text-gray-600 leading-relaxed text-sm">
            Jl. Setiabudi No. 193, Gegerkalong, Sukasari, Kota Bandung, Jawa
            Barat 40153
          </Text>
        </View>

        {/* Ringkasan Item */}
        <Text className="font-bold text-gray-900 mb-3">Ringkasan Pesanan</Text>
        <View className="bg-white p-4 rounded-xl border border-gray-200 mb-6">
          {items.map((item: any) => (
            <View key={item.id} className="flex-row justify-between mb-2">
              <Text className="text-gray-600 flex-1">
                {item.name} x{item.qty}
              </Text>
              <Text className="font-medium text-gray-900">
                {formatRupiah(item.price * item.qty)}
              </Text>
            </View>
          ))}
          <View className="h-[1px] bg-gray-100 my-3" />
          <View className="flex-row justify-between">
            <Text className="font-bold text-gray-900">Total</Text>
            <Text className="font-bold text-blue-600 text-lg">
              {formatRupiah(total)}
            </Text>
          </View>
        </View>

        {/* Metode Pembayaran */}
        <Text className="font-bold text-gray-900 mb-3">Metode Pembayaran</Text>
        <PaymentMethod onSelect={(method) => setSelectedPayment(method)} />

        <View className="h-24" />
      </ScrollView>

      {/* Button Pay */}
      <View className="absolute bottom-0 w-full bg-white p-5 border-t border-gray-100 shadow-2xl pb-8">
        <TouchableOpacity
          onPress={handlePay}
          disabled={processing}
          className="bg-blue-600 py-4 rounded-xl items-center shadow-lg shadow-blue-200"
        >
          {processing ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-bold text-lg">Bayar Sekarang</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default CheckoutScreen;
