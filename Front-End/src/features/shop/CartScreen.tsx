import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Trash2, ShoppingBag, ArrowRight } from "lucide-react-native";
import api from "@/services/api";
import { ShopStackParamList } from "@/navigation/types";

// Helper URL Gambar
const getImageUrl = (path: string) => {
  if (!path) return "https://placehold.co/100x100?text=No+Img";
  if (path.startsWith("http")) return path;
  return `http://10.0.2.2:3000/uploads/${
    path.startsWith("/") ? path.substring(1) : path
  }`;
};

const CartScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<ShopStackParamList>>();
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Load data setiap kali layar dibuka
  useFocusEffect(
    useCallback(() => {
      fetchCart();
    }, [])
  );

  const fetchCart = async () => {
    setLoading(true);
    try {
      const res = await api.getCart();
      setCartItems(res.data);
    } catch (error) {
      console.log("Gagal load cart:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveItem = async (id: number) => {
    setDeletingId(id);
    try {
      await api.removeFromCart(id);
      fetchCart(); // Refresh list
    } catch (error) {
      Alert.alert("Error", "Gagal menghapus item.");
    } finally {
      setDeletingId(null);
    }
  };

  // Hitung Total
  const grandTotal = cartItems.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0
  );

  if (loading && cartItems.length === 0) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="px-5 py-4 border-b border-gray-100 flex-row items-center justify-between">
        <Text className="text-xl font-bold text-gray-900 font-[Outfit_700Bold]">
          Keranjang Saya
        </Text>
        <Text className="text-gray-500">{cartItems.length} Item</Text>
      </View>

      {/* List Item */}
      <FlatList
        data={cartItems}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        ListEmptyComponent={
          <View className="items-center justify-center mt-20">
            <ShoppingBag size={64} color="#E5E7EB" />
            <Text className="text-gray-400 mt-4 text-lg">
              Keranjang Anda kosong
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate("ShopHome")}
              className="mt-4"
            >
              <Text className="text-blue-600 font-bold">Mulai Belanja</Text>
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item }) => (
          <View className="flex-row bg-white p-3 mb-4 rounded-xl border border-gray-100 shadow-sm items-center">
            <Image
              source={{ uri: getImageUrl(item.img) }}
              className="w-20 h-20 rounded-lg bg-gray-100"
              resizeMode="cover"
            />

            <View className="flex-1 ml-4">
              <Text
                className="font-bold text-gray-800 text-base mb-1"
                numberOfLines={1}
              >
                {item.name}
              </Text>
              <Text className="text-xs text-gray-500 mb-2">
                {item.category} •{" "}
                {item.transaction_type === "sewa" ? "Sewa" : "Beli"}
              </Text>

              <View className="flex-row justify-between items-center">
                <Text className="text-blue-600 font-bold">
                  Rp {Number(item.price).toLocaleString("id-ID")} x{" "}
                  {item.quantity}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => handleRemoveItem(item.id)}
              disabled={deletingId === item.id}
              className="p-2 bg-red-50 rounded-lg ml-2"
            >
              {deletingId === item.id ? (
                <ActivityIndicator size="small" color="#EF4444" />
              ) : (
                <Trash2 size={18} color="#EF4444" />
              )}
            </TouchableOpacity>
          </View>
        )}
      />

      {/* Bottom Action */}
      {cartItems.length > 0 && (
        <View className="absolute bottom-0 w-full bg-white p-5 border-t border-gray-100 shadow-2xl rounded-t-3xl">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-gray-500">Total Pembayaran</Text>
            <Text className="text-xl font-bold text-gray-900 font-[Outfit_700Bold]">
              Rp {grandTotal.toLocaleString("id-ID")}
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => navigation.navigate("Checkout")}
            className="w-full bg-blue-600 py-4 rounded-xl shadow-lg shadow-blue-200 flex-row justify-center items-center"
          >
            <Text className="text-white font-bold text-lg mr-2 font-[Outfit_700Bold]">
              Checkout
            </Text>
            <ArrowRight size={20} color="white" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default CartScreen;
