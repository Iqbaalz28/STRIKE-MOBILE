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

	// State Pagination
	const [page, setPage] = useState(1);
	const [hasMore, setHasMore] = useState(true);
	const [refreshing, setRefreshing] = useState(false);
	const [loadingMore, setLoadingMore] = useState(false);

	// State Filter Dasar
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedCategory, setSelectedCategory] = useState("all");

	// State Filter Lanjutan (Modal)
	const [isFilterVisible, setFilterVisible] = useState(false);
	const [priceFilter, setPriceFilter] = useState({ min: 0, max: 999999999 });

	useEffect(() => {
		fetchProducts(1, true); // Initial Load
	}, []);

	// Reset page ketika filter berubah
	useEffect(() => {
		fetchProducts(1, true);
	}, [searchQuery, selectedCategory, priceFilter]);

	const fetchProducts = async (pageToLoad: number, isRefresh: boolean = false) => {
		if (pageToLoad === 1) setLoading(true);

		try {
			// Construct Params
			const params: any = {
				page: pageToLoad,
				limit: 10,
				search: searchQuery,
			};

			// Add Category Filter
			// (Note: logic mapping category ada di local filter sebelumnya, 
			// skr kita pindah ke query param jika backend support, 
			// TAPI: Backend products.js hanya support filter nama kategori string.
			// Jadi kita kirim nama kategori jika != all)
			if (selectedCategory !== "all") {
				// Mapping ID -> Name untuk backend
				const cat = categories.find(c => c.id === selectedCategory);
				if (cat) params.category = cat.name.toLowerCase();
			}

			// Add Price Filter
			if (priceFilter.min > 0) params.minPrice = priceFilter.min;
			if (priceFilter.max < 999999999) params.maxPrice = priceFilter.max;

			const res = await api.getProducts(params);

			// LOGIKA ADAPTIF (Menangani format response backend)
			let newProducts: any[] = [];

			// Backend Pagination return { data: [], page: 1, limit: 10 }
			if (res.data?.data) {
				newProducts = res.data.data;
			} else if (Array.isArray(res.data)) {
				// Fallback jika backend belum restart / format lama
				newProducts = res.data;
			}

			if (isRefresh) {
				setProducts(newProducts);
			} else {
				setProducts(prev => [...prev, ...newProducts]);
			}

			// Cek apakah masih ada data
			setHasMore(newProducts.length >= 10);
			setPage(pageToLoad);

		} catch (error) {
			console.error("❌ Gagal memuat produk:", error);
		} finally {
			setLoading(false);
			setLoadingMore(false);
			setRefreshing(false);
		}
	};

	const handleLoadMore = () => {
		if (!hasMore || loadingMore || loading) return;
		setLoadingMore(true);
		fetchProducts(page + 1, false);
	};

	const handleRefresh = () => {
		setRefreshing(true);
		fetchProducts(1, true);
	};

	// Logic Filter dihapus karena sudah handled di backend via params
	// Kita gunakan products langsung dari state
	const filteredProducts = products;

	const handleApplyFilter = (filters: any) => {
		setPriceFilter({ min: filters.minPrice, max: filters.maxPrice });
		// Jika category kosong str (dari reset), set ke "all"
		if (filters.category === "" || !filters.category) {
			setSelectedCategory("all");
		} else {
			setSelectedCategory(filters.category.toLowerCase());
		}
	};

	return (
		<View className="flex-1 bg-white pt-12">
			{/* Header & Search */}
			<View className="px-4 mb-4">
				<View className="flex-row items-center justify-between mb-4">
					<Text className="text-2xl font-outfit-bold text-gray-900 font-outfit-bold">
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
							className="flex-1 ml-2 text-gray-800 font-outfit"
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
							className={`px-5 py-2 rounded-full border ${selectedCategory === item.id
								? "bg-blue-600 border-blue-600"
								: "bg-white border-gray-300"
								}`}
						>
							<Text
								className={`font-outfit-medium ${selectedCategory === item.id
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
					onEndReached={handleLoadMore}
					onEndReachedThreshold={0.5}
					refreshing={refreshing}
					onRefresh={handleRefresh}
					ListFooterComponent={
						loadingMore ? (
							<View className="py-4">
								<ActivityIndicator size="small" color="#2563EB" />
							</View>
						) : null
					}
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
				initialFilters={{
					minPrice: priceFilter.min,
					maxPrice: priceFilter.max,
					category:
						selectedCategory === "all" ? "" : selectedCategory,
				}}
			/>
		</View>
	);
};

export default ShopScreen;
