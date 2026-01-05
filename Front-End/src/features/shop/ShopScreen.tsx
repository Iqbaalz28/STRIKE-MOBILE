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
import { useNavigation } from "@react-navigation/native";
import api from "@/services/api";
import ProductCard from "./components/ProductCard";
import FilterModal from "./components/FilterModal";

const categories = [
	{ id: "all", name: "Semua" },
	{ id: "joran", name: "Joran" },
	{ id: "reel", name: "Reel" },
	{ id: "umpan", name: "Umpan" },
	{ id: "kail", name: "Kail" },
];

const ShopScreen = () => {
	const navigation = useNavigation<any>();

	const [products, setProducts] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);

	// State Filter Dasar
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedCategory, setSelectedCategory] = useState("all");

	// State Filter Lanjutan (Modal)
	const [isFilterVisible, setFilterVisible] = useState(false);
	const [priceFilter, setPriceFilter] = useState({ min: 0, max: 999999999 });

	useEffect(() => {
		fetchProducts();
	}, []);

	const fetchProducts = async () => {
		setLoading(true);
		try {
			const res = await api.getProducts({});

			// LOGIKA ADAPTIF (Menangani format response backend)
			let productData: any[] = [];
			if (Array.isArray(res.data)) {
				productData = res.data;
			} else if (res.data && Array.isArray(res.data.data)) {
				productData = res.data.data;
			} else if (res.data?.products && Array.isArray(res.data.products)) {
				productData = res.data.products;
			}

			console.log(`✅ Produk dimuat: ${productData.length} item`);
			setProducts(productData);
		} catch (error) {
			console.error("❌ Gagal memuat produk:", error);
		} finally {
			setLoading(false);
		}
	};

	// --- LOGIC FILTER UTAMA ---
	const filteredProducts = products.filter((p: any) => {
		// 1. Mapping Kategori (String Frontend -> ID Backend)
		// Berdasarkan Log: 1=Joran, 2=Reel, 3=Umpan, 4=Kail, 5=Senar
		const categoryMap: Record<string, number> = {
			joran: 1,
			reel: 2,
			umpan: 3,
			kail: 4,
			// "senar": 5 // Jika ingin menambahkan filter senar nanti
		};

		// 2. Normalisasi Data
		const pName = (p.name || p.product_name || "").toLowerCase();

		// Cek harga (convert ke number)
		const rawPrice = p.price || p.price_sale || p.price_rent || 0;
		const pPrice = Number(rawPrice);

		// 3. Filter Pencarian Nama
		const matchSearch = pName.includes(searchQuery.toLowerCase());

		// 4. Filter Kategori (Gunakan Mapping ID)
		let matchCategory = true;
		if (selectedCategory !== "all") {
			// Ambil target ID dari map (misal "joran" -> 1)
			const targetId = categoryMap[selectedCategory];

			// Bandingkan dengan id_category dari database
			if (targetId) {
				matchCategory = p.id_category === targetId;
			} else {
				// Fallback jika mapping tidak ada, coba cocokkan string manual (jaga-jaga)
				const pCatName = (p.category || "").toLowerCase();
				matchCategory = pCatName === selectedCategory;
			}
		}

		// 5. Filter Harga
		const matchPrice =
			pPrice >= priceFilter.min && pPrice <= priceFilter.max;

		return matchSearch && matchCategory && matchPrice;
	});

	const handleApplyFilter = (filters: any) => {
		setPriceFilter({ min: filters.minPrice, max: filters.maxPrice });
		if (filters.category) {
			setSelectedCategory(filters.category.toLowerCase());
		}
	};

	return (
		<View className="flex-1 bg-white pt-12">
			{/* Header & Search */}
			<View className="px-4 mb-4">
				<View className="flex-row items-center justify-between mb-4">
					<Text className="text-2xl font-bold text-gray-900 font-[Outfit_700Bold]">
						Toko Alat
					</Text>
					<TouchableOpacity
						onPress={() => navigation.navigate("Cart")}
						className="relative p-2"
					>
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
					<TouchableOpacity
						onPress={() => setFilterVisible(true)}
						className="p-3 bg-blue-600 rounded-xl"
					>
						<Filter size={20} color="white" />
					</TouchableOpacity>
				</View>
			</View>

			{/* Filter Kategori (Horizontal Scroll) */}
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
									selectedCategory === item.id
										? "text-white"
										: "text-gray-600"
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
					contentContainerStyle={{
						paddingHorizontal: 12,
						paddingBottom: 100,
					}}
					columnWrapperStyle={{ justifyContent: "space-between" }}
					renderItem={({ item }) => (
						<ProductCard
							product={item}
							onPress={() =>
								navigation.navigate("ProductDetail", {
									id: item.id,
								})
							}
						/>
					)}
					ListEmptyComponent={
						<View className="items-center py-20">
							<Text className="text-gray-400">
								Produk tidak ditemukan
							</Text>
							<Text className="text-gray-400 text-xs mt-2 text-center px-10">
								Coba ubah kata kunci atau reset filter kategori.
							</Text>
						</View>
					}
				/>
			)}

			{/* Modal Filter */}
			<FilterModal
				visible={isFilterVisible}
				onClose={() => setFilterVisible(false)}
				onApply={handleApplyFilter}
			/>
		</View>
	);
};

export default ShopScreen;
