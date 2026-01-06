import React, { useEffect, useState } from "react";
import {
	View,
	Text,
	Image,
	ScrollView,
	TouchableOpacity,
	ActivityIndicator,
	Alert,
	Dimensions,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
	ShoppingCart,
	Check,
	Star,
	ChevronLeft,
	Minus,
	Plus,
} from "lucide-react-native";
import api from "@/services/api";
import { ShopStackParamList } from "@/navigation/types";
import { getImageUrl } from "@/utils/imageHelper";

const { width } = Dimensions.get("window");

const ProductDetailScreen = () => {
	const route = useRoute<any>();
	const navigation =
		useNavigation<NativeStackNavigationProp<ShopStackParamList>>();
	const { id } = route.params;

	// --- State ---
	const [product, setProduct] = useState<any>(null);
	const [reviews, setReviews] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [activeTab, setActiveTab] = useState<"desc" | "review">("desc");
	const [qty, setQty] = useState(1);
	const [isAdded, setIsAdded] = useState(false);
	const [submitting, setSubmitting] = useState(false);

	// --- Fetch Data ---
	useEffect(() => {
		fetchDetail();
		fetchReviews();
	}, [id]);

	const fetchDetail = async () => {
		try {
			const res = await api.getProductDetail(id);
			setProduct(res.data);
			checkCartStatus(res.data.id);
		} catch (error) {
			console.error("Gagal load produk:", error);
		} finally {
			setLoading(false);
		}
	};

	const fetchReviews = async () => {
		try {
			const res = await api.getProductReviews(id);
			setReviews(res.data);
		} catch (error) {
			console.log("Belum ada review atau error:", error);
		}
	};

	// Cek apakah produk sudah ada di keranjang (agar tombol berubah status)
	const checkCartStatus = async (productId: number) => {
		try {
			const res = await api.getCart();
			const exists = res.data.find(
				(item: any) => item.product_id === productId,
			);
			if (exists) setIsAdded(true);
		} catch (error) {
			// Silent error (misal user belum login)
		}
	};

	// --- Logic Transaksi ---
	const handleAddToCart = async () => {
		if (isAdded) return; // Sudah di keranjang
		setSubmitting(true);
		try {
			await api.addToCart({
				id_product: product.id,
				quantity: qty,
				transaction_type: "beli", // Default beli
			});
			setIsAdded(true);
			Alert.alert("Berhasil", "Produk masuk keranjang!");
		} catch (error: any) {
			Alert.alert(
				"Gagal",
				error.response?.data?.message || "Terjadi kesalahan",
			);
		} finally {
			setSubmitting(false);
		}
	};

	if (loading || !product) {
		return (
			<View className="flex-1 justify-center items-center bg-white">
				<ActivityIndicator size="large" color="#2563EB" />
			</View>
		);
	}

	const isRentOnly = product.price_rent > 0 && !product.price_sale;
	const isRent = product.price_rent > 0;
	const isSale = product.price_sale > 0;

	return (
		<View className="flex-1 bg-white">
			{/* Tombol Back Floating */}
			<TouchableOpacity
				onPress={() => navigation.goBack()}
				className="absolute top-12 left-4 z-50 bg-white/80 p-2 rounded-full shadow-sm"
			>
				<ChevronLeft size={24} color="black" />
			</TouchableOpacity>

			<ScrollView showsVerticalScrollIndicator={false}>
				{/* 1. Gambar Utama */}
				<Image
					source={{
						uri: getImageUrl(product?.image || product?.img),
					}}
					className="w-full h-80 bg-gray-100"
					resizeMode="cover"
				/>

				{/* 2. Header Info */}
				<View className="px-5 pt-6 pb-2">
					<View className="flex-row justify-between items-start mb-2">
						<View className="flex-1 mr-4">
							<Text className="text-2xl font-outfit-bold text-gray-900 font-outfit-bold leading-tight">
								{product.name}
							</Text>
							<Text className="text-gray-500 mt-1">
								{product.category}
							</Text>
						</View>
						{/* Rating Rata-rata */}
						<View className="flex-row items-center bg-yellow-50 px-2 py-1 rounded-lg">
							<Star size={16} fill="#FBBF24" color="#FBBF24" />
							<Text className="ml-1 font-outfit-bold text-yellow-700">
								{Number(product.rating_average || 0).toFixed(1)}
							</Text>
							<Text className="ml-1 text-xs text-gray-500">
								({product.total_reviews || 0})
							</Text>
						</View>
					</View>

					{/* Harga */}
					<View className="mt-2">
						{isSale && (
							<Text className="text-3xl font-outfit-bold text-blue-600 font-outfit-bold">
								Rp{" "}
								{parseInt(product.price_sale).toLocaleString(
									"id-ID",
								)}
							</Text>
						)}
						{isRentOnly ? (
							/* Tampilan khusus untuk rental-only */
							<View>
								<Text className="text-3xl font-outfit-bold text-amber-600 font-outfit-bold">
									Rp{" "}
									{parseInt(product.price_rent).toLocaleString(
										"id-ID",
									)}
									<Text className="text-lg text-amber-500">/jam</Text>
								</Text>
								<View className="bg-amber-50 border border-amber-200 rounded-xl p-3 mt-3">
									<Text className="text-amber-700 font-outfit-bold text-sm">🏪 Sewa Langsung di Tempat</Text>
									<Text className="text-amber-600 text-xs mt-1">
										Barang ini hanya tersedia untuk disewa langsung di lokasi pemancingan. Silakan datang ke tempat untuk menyewa.
									</Text>
								</View>
							</View>
						) : isRent && isSale ? (
							/* Produk bisa beli dan sewa */
							<Text className="text-sm text-gray-500 mt-1">
								(Sewa: Rp{" "}
								{parseInt(product.price_rent).toLocaleString(
									"id-ID",
								)}
								/jam - langsung di tempat)
							</Text>
						) : null}
					</View>
				</View>

				{/* 3. Tabs (Deskripsi / Review) */}
				<View className="flex-row px-5 mt-4 border-b border-gray-100">
					<TouchableOpacity
						onPress={() => setActiveTab("desc")}
						className={`mr-6 pb-3 ${activeTab === "desc"
							? "border-b-2 border-blue-600"
							: ""
							}`}
					>
						<Text
							className={`font-outfit-bold ${activeTab === "desc"
								? "text-blue-600"
								: "text-gray-400"
								}`}
						>
							Deskripsi
						</Text>
					</TouchableOpacity>
					<TouchableOpacity
						onPress={() => setActiveTab("review")}
						className={`pb-3 ${activeTab === "review"
							? "border-b-2 border-blue-600"
							: ""
							}`}
					>
						<Text
							className={`font-outfit-bold ${activeTab === "review"
								? "text-blue-600"
								: "text-gray-400"
								}`}
						>
							Ulasan ({reviews.length})
						</Text>
					</TouchableOpacity>
				</View>

				{/* 4. Tab Content */}
				<View className="p-5 min-h-[200px] bg-gray-50">
					{activeTab === "desc" ? (
						<Text className="text-gray-700 leading-relaxed text-justify font-outfit">
							{product.description ||
								"Tidak ada deskripsi produk."}
						</Text>
					) : (
						<View>
							{reviews.length === 0 ? (
								<Text className="text-gray-400 italic">
									Belum ada ulasan untuk produk ini.
								</Text>
							) : (
								reviews.map((rev: any, index: number) => (
									<View
										key={rev.id || index}
										className="mb-4 bg-white p-4 rounded-xl shadow-sm"
									>
										<View className="flex-row justify-between mb-2">
											<Text className="font-outfit-bold text-gray-800">
												{rev.username}
											</Text>
											<View className="flex-row">
												{[1, 2, 3, 4, 5].map((n) => (
													<Star
														key={n}
														size={12}
														fill={
															n <= rev.rating
																? "#FBBF24"
																: "#E5E7EB"
														}
														color="transparent"
													/>
												))}
											</View>
										</View>
										<Text className="text-gray-600 text-sm">
											{rev.comment}
										</Text>
									</View>
								))
							)}
						</View>
					)}
				</View>

				{/* Padding Bawah */}
				<View className="h-28" />
			</ScrollView>

			{/* 5. Sticky Bottom Bar - Hanya tampil jika bukan rental-only */}
			{isRentOnly ? (
				/* Bottom bar untuk rental-only */
				<View className="absolute bottom-0 w-full bg-amber-500 p-4 border-t border-amber-400 shadow-2xl rounded-t-3xl">
					<View className="flex-row items-center justify-center">
						<Text className="text-white font-outfit-bold text-center font-outfit-bold">
							🏠 Sewa Langsung di Lokasi Pemancingan
						</Text>
					</View>
				</View>
			) : (
				/* Bottom bar normal untuk produk yang bisa dibeli */
				<View className="absolute bottom-0 w-full bg-white p-4 border-t border-gray-100 shadow-2xl rounded-t-3xl">
					<View className="flex-row items-center gap-4">
						{/* Qty Selector */}
						<View className="flex-row items-center bg-gray-100 rounded-xl px-3 py-2">
							<TouchableOpacity
								onPress={() => setQty(Math.max(1, qty - 1))}
							>
								<Minus size={20} color="#4B5563" />
							</TouchableOpacity>
							<Text className="mx-4 font-outfit-bold text-lg">{qty}</Text>
							<TouchableOpacity onPress={() => setQty(qty + 1)}>
								<Plus size={20} color="#4B5563" />
							</TouchableOpacity>
						</View>

						{/* Action Button */}
						<TouchableOpacity
							onPress={handleAddToCart}
							disabled={product.stock <= 0 || isAdded}
							className={`flex-1 py-3.5 rounded-xl flex-row justify-center items-center ${isAdded
								? "bg-green-600"
								: product.stock <= 0
									? "bg-gray-300"
									: "bg-blue-600 shadow-lg shadow-blue-200"
								}`}
						>
							{isAdded ? (
								<View className="flex-row items-center">
									<Check
										size={20}
										color="white"
										className="mr-2"
									/>
									<Text className="text-white font-outfit-bold font-outfit-bold">
										Sudah di Keranjang
									</Text>
								</View>
							) : (
								<View className="flex-row items-center">
									<ShoppingCart
										size={20}
										color="white"
										className="mr-2"
									/>
									<Text className="text-white font-outfit-bold font-outfit-bold">
										{product.stock <= 0
											? "Stok Habis"
											: "Tambah ke Keranjang"}
									</Text>
								</View>
							)}
						</TouchableOpacity>
					</View>
				</View>
			)}
		</View>
	);
};

export default ProductDetailScreen;
