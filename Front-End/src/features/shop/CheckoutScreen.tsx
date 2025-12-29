import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import api from "@/services/api";
import { ShopStackParamList } from "@/navigation/types";
import PaymentMethod from "../booking/components/PaymentMethod";

const CheckoutScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<ShopStackParamList>>();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);

  // Form Data
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    postcode: "",
    notes: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // 1. Cek Cart
      const cartRes = await api.getCart();
      if (cartRes.data.length === 0) {
        Alert.alert("Kosong", "Keranjang belanja kosong.");
        navigation.goBack();
        return;
      }
      setCartItems(cartRes.data);

      // 2. Auto-fill Profile
      const profileRes = await api.getMyProfile();
      const user = profileRes.data;
      setForm((prev) => ({
        ...prev,
        fullName: user.name || "",
        phone: user.phone || "", // Jika ada field phone
        address: user.address || "", // Jika ada field address
        city: user.city || "",
      }));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async () => {
    if (!form.fullName || !form.address || !form.phone) {
      Alert.alert("Data Kurang", "Mohon lengkapi Nama, Nomor HP, dan Alamat.");
      return;
    }
    if (!selectedPayment) {
      Alert.alert("Pilih Pembayaran", "Mohon pilih metode pembayaran.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        billingDetails: form,
        payment_method: selectedPayment.id,
        items: cartItems, // Opsional, tergantung backend perlu ini atau ambil dari session
      };

      const res = await api.createOrder(payload);

      Alert.alert(
        "Berhasil!",
        `Pesanan dibuat. Invoice: ${res.data.invoice}`,
        [{ text: "OK", onPress: () => navigation.navigate("ShopHome") }] // Atau navigate ke History
      );
    } catch (error: any) {
      Alert.alert(
        "Gagal",
        error.response?.data?.message || "Terjadi kesalahan saat checkout."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Helper Total
  const grandTotal = cartItems.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0
  );

  if (loading)
    return (
      <View className="flex-1 justify-center">
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );

  return (
    <View className="flex-1 bg-white">
      <ScrollView
        className="flex-1 px-5 pt-4"
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* 1. Form Pengiriman */}
        <View className="mb-6">
          <Text className="text-lg font-bold text-gray-900 mb-4 font-[Outfit_700Bold]">
            Alamat Pengiriman
          </Text>

          <View className="space-y-3">
            <View>
              <Text className="text-gray-600 text-xs mb-1">Nama Penerima</Text>
              <TextInput
                value={form.fullName}
                onChangeText={(t) => setForm({ ...form, fullName: t })}
                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800"
                placeholder="Nama Lengkap"
              />
            </View>
            <View>
              <Text className="text-gray-600 text-xs mb-1">
                Nomor HP / WhatsApp
              </Text>
              <TextInput
                value={form.phone}
                onChangeText={(t) => setForm({ ...form, phone: t })}
                keyboardType="phone-pad"
                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800"
                placeholder="08xxxxxxxx"
              />
            </View>
            <View>
              <Text className="text-gray-600 text-xs mb-1">Alamat Lengkap</Text>
              <TextInput
                value={form.address}
                onChangeText={(t) => setForm({ ...form, address: t })}
                multiline
                numberOfLines={3}
                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800"
                placeholder="Jl. Contoh No. 123..."
                style={{ textAlignVertical: "top" }}
              />
            </View>
            <View className="flex-row gap-3">
              <TextInput
                value={form.city}
                onChangeText={(t) => setForm({ ...form, city: t })}
                className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800"
                placeholder="Kota"
              />
              <TextInput
                value={form.postcode}
                onChangeText={(t) => setForm({ ...form, postcode: t })}
                keyboardType="number-pad"
                className="w-24 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800"
                placeholder="Kode Pos"
              />
            </View>
            <View>
              <Text className="text-gray-600 text-xs mb-1">
                Catatan (Opsional)
              </Text>
              <TextInput
                value={form.notes}
                onChangeText={(t) => setForm({ ...form, notes: t })}
                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800"
                placeholder="Pagar warna hitam, titip satpam..."
              />
            </View>
          </View>
        </View>

        {/* 2. Ringkasan Pesanan */}
        <View className="mb-6">
          <Text className="text-lg font-bold text-gray-900 mb-3 font-[Outfit_700Bold]">
            Ringkasan Pesanan
          </Text>
          <View className="bg-gray-50 p-4 rounded-xl border border-gray-100">
            {cartItems.map((item, idx) => (
              <View key={idx} className="flex-row justify-between mb-2">
                <Text className="text-gray-600 flex-1 mr-2" numberOfLines={1}>
                  {item.name} <Text className="text-xs">x{item.quantity}</Text>
                </Text>
                <Text className="font-medium text-gray-900">
                  Rp{" "}
                  {(Number(item.price) * item.quantity).toLocaleString("id-ID")}
                </Text>
              </View>
            ))}
            <View className="border-t border-gray-200 my-2 pt-2 flex-row justify-between">
              <Text className="font-bold text-gray-900">Total Tagihan</Text>
              <Text className="font-bold text-blue-600 text-lg">
                Rp {grandTotal.toLocaleString("id-ID")}
              </Text>
            </View>
          </View>
        </View>

        {/* 3. Metode Pembayaran */}
        <View className="mb-6">
          <PaymentMethod onSelect={(method) => setSelectedPayment(method)} />
        </View>
      </ScrollView>

      {/* Bottom Button */}
      <View className="absolute bottom-0 w-full bg-white p-5 border-t border-gray-100 shadow-2xl">
        <TouchableOpacity
          onPress={handleCheckout}
          disabled={submitting}
          className={`w-full py-4 rounded-xl flex-row justify-center items-center shadow-lg ${
            submitting ? "bg-gray-400" : "bg-green-600 shadow-green-200"
          }`}
        >
          {submitting ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-bold text-lg font-[Outfit_700Bold]">
              BAYAR SEKARANG
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default CheckoutScreen;
