import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Search, Filter, ShoppingBag } from "lucide-react-native";
import api from "@/services/api";
import ProductCard from "./components/ProductCard";

const categories = [
  { id: "all", name: "Semua" },
  { id: "joran", name: "Joran" },
  { id: "umpan", name: "Umpan" },
  { id: "kail", name: "Kail" },
  { id: "reel", name: "Reel" },
];

const ShopScreen = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Fetch Data
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      // API mendukung filter via query params, tapi untuk simpel kita fetch semua dulu
      // lalu filter di client-side (seperti logic ShopView.vue)
      const res = await api.getProducts({});
      setProducts(res.data);
    } catch (error) {
      console.error("Gagal memuat produk:", error);
    } finally {
      setLoading(false);
    }
  };

  // Logic Filtering (Client Side)
  const filteredProducts = products.filter((p: any) => {
    const matchSearch = p.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchCategory =
      selectedCategory === "all" ||
      p.category?.toLowerCase() === selectedCategory;
    return matchSearch && matchCategory;
  });

  return (
    <View className="flex-1 bg-white pt-12">
      {/* Header & Search */}
      <View className="px-4 mb-4">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-2xl font-bold text-gray-900 font-[Outfit_700Bold]">
            Toko Alat
          </Text>
          <TouchableOpacity className="relative p-2">
            <ShoppingBag size={24} color="#1F2937" />
            <View className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-white" />
          </TouchableOpacity>
        </View>

        <View className="flex-row items-center gap-3">
          <View className="flex-1 flex-row items-center bg-gray-100 rounded-xl px-4 py-2.5 border border-gray-200">
            <Search size={20} color="#9CA3AF" />
            <TextInput
              placeholder="Cari joran, umpan..."
              className="flex-1 ml-2 text-gray-800 font-[Outfit_400Regular]"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <TouchableOpacity className="p-3 bg-blue-600 rounded-xl">
            <Filter size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Filter Kategori */}
      <View className="mb-4">
        <FlatList
          horizontal
          data={categories}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 10 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setSelectedCategory(item.id)}
              className={`px-5 py-2 rounded-full border ${
                selectedCategory === item.id
                  ? "bg-blue-600 border-blue-600"
                  : "bg-white border-gray-300"
              }`}
            >
              <Text
                className={`font-medium ${
                  selectedCategory === item.id ? "text-white" : "text-gray-600"
                }`}
              >
                {item.name}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Product Grid */}
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={(item: any) => item.id.toString()}
          numColumns={2}
          contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 100 }}
          columnWrapperStyle={{ justifyContent: "space-between" }}
          renderItem={({ item }) => <ProductCard product={item} />}
          ListEmptyComponent={
            <View className="items-center py-20">
              <Text className="text-gray-400">Produk tidak ditemukan</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

export default ShopScreen;
