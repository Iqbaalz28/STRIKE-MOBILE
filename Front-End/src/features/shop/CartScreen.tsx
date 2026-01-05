import React, { useState, useCallback } from "react";
import {
	View,
	Text,
	FlatList,
	Image,
	TouchableOpacity,
	Alert,
	ActivityIndicator,
} from "react-native";
import { Minus, Plus, Trash2, ArrowLeft } from "lucide-react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import api from "@/services/api";
import { getImageUrl } from "@/utils/imageHelper";

// Helper Format Rupiah
const formatRupiah = (num: any) => {
	const n = Number(num);
	return new Intl.NumberFormat("id-ID", {
		style: "currency",
		currency: "IDR",
		minimumFractionDigits: 0,
	}).format(isNaN(n) ? 0 : n);
};

const CartScreen = () => {
	const navigation = useNavigation<any>();
	const [cartItems, setCartItems] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);

	useFocusEffect(
		useCallback(() => {
			fetchCart();
		}, []),
	);

	const fetchCart = async () => {
		setLoading(true);
		try {
			const res = await api.getCart();
			// Ambil data array, handle jika dibungkus { data: [...] }
			const rawData = Array.isArray(res.data)
				? res.data
				: res.data.data || [];
			setCartItems(rawData);
		} catch (error) {
			console.log("Gagal load keranjang:", error);
		} finally {
			setLoading(false);
		}
	};

	const updateQty = (id: number, type: "plus" | "minus") => {
		setCartItems((prev) =>
			prev.map((item) => {
				if (item.id === id) {
					// Fallback: gunakan item.quantity (dari DB) atau item.qty (local state)
					const currentQty = item.qty || item.quantity || 1;
					const newQty =
						type === "plus" ? currentQty + 1 : currentQty - 1;
					return { ...item, qty: newQty < 1 ? 1 : newQty };
				}
				return item;
			}),
		);
	};

	const removeItem = (id: number) => {
		Alert.alert("Hapus Item", "Yakin ingin menghapus item ini?", [
			{ text: "Batal", style: "cancel" },
			{
				text: "Hapus",
				style: "destructive",
				onPress: async () => {
					try {
						await api.removeFromCart(id);
						setCartItems((prev) =>
							prev.filter((item) => item.id !== id),
						);
					} catch (error) {
						Alert.alert("Gagal", "Tidak bisa menghapus item.");
					}
				},
			},
		]);
	};

	// Hitung Total Harga
	const totalPrice = cartItems.reduce((sum, item) => {
		// 1. Ambil harga (Priority: root price -> product price)
		const rawPrice = item.price || item.product?.price_sale || "0";

		// 2. Ambil quantity (Priority: local qty -> db quantity)
		const rawQty = item.qty !== undefined ? item.qty : item.quantity;

		// 3. Konversi ke Angka
		const price = parseFloat(String(rawPrice));
		const qty = parseInt(String(rawQty || 1));

		if (isNaN(price) || isNaN(qty)) return sum;
		return sum + price * qty;
	}, 0);

	if (loading)
		return (
			<View className="flex-1 justify-center items-center bg-white">
				<ActivityIndicator size="large" color="#2563EB" />
			</View>
		);

	return (
		<View className="flex-1 bg-white">
			{/* Header */}
			<View className="pt-12 px-4 pb-4 border-b border-gray-100 flex-row items-center gap-3">
				<TouchableOpacity onPress={() => navigation.goBack()}>
					<ArrowLeft size={24} color="black" />
				</TouchableOpacity>
				<Text className="text-xl font-bold font-[Outfit_700Bold]">
					Keranjang Saya
				</Text>
			</View>

			{/* Cart List */}
			<FlatList
				data={cartItems}
				keyExtractor={(item) => item.id.toString()}
				contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
				ListEmptyComponent={
					<View className="items-center justify-center mt-20">
						<Text className="text-center text-gray-400 font-medium">
							Keranjang masih kosong.
						</Text>
					</View>
				}
				renderItem={({ item }) => {
					// 1. Ambil Data Sesuai Log (Flat Structure)
					const productName =
						item.name || item.product?.name || "Produk";
					const rawPrice =
						item.price || item.product?.price_sale || 0;
					const productPrice = parseFloat(String(rawPrice));

					// 2. Ambil Gambar (Priority: item.img -> item.image -> product.img)
					// Log Anda menunjukkan 'img' ada di root object
					const imgPath =
						item.img ||
						item.image ||
						item.product?.img ||
						item.product?.image ||
						"";

					const finalImageUrl = getImageUrl(imgPath);

					// 3. Ambil Quantity untuk tampilan
					const displayQty =
						item.qty !== undefined ? item.qty : item.quantity;

					return (
						<View className="flex-row bg-white mb-4 p-3 rounded-xl border border-gray-100 shadow-sm">
							<Image
								source={{ uri: finalImageUrl }}
								className="w-24 h-24 rounded-lg bg-gray-50"
								resizeMode="cover"
							/>
							<View className="flex-1 ml-3 justify-between py-1">
								<View>
									<Text
										className="font-bold text-gray-900 font-[Outfit_500Medium] text-sm"
										numberOfLines={2}
									>
										{productName}
									</Text>
									<Text className="text-blue-600 font-bold mt-1 text-base">
										{formatRupiah(productPrice)}
									</Text>
								</View>

								<View className="flex-row justify-between items-center mt-2">
									<View className="flex-row items-center bg-gray-50 rounded-lg border border-gray-200">
										<TouchableOpacity
											onPress={() =>
												updateQty(item.id, "minus")
											}
											className="p-1.5"
										>
											<Minus size={14} color="black" />
										</TouchableOpacity>
										<Text className="mx-3 font-bold text-gray-800">
											{displayQty}
										</Text>
										<TouchableOpacity
											onPress={() =>
												updateQty(item.id, "plus")
											}
											className="p-1.5"
										>
											<Plus size={14} color="black" />
										</TouchableOpacity>
									</View>
									<TouchableOpacity
										onPress={() => removeItem(item.id)}
										className="p-2"
									>
										<Trash2 size={18} color="#EF4444" />
									</TouchableOpacity>
								</View>
							</View>
						</View>
					);
				}}
			/>

			{/* Bottom Bar */}
			<View className="absolute bottom-0 w-full p-5 border-t border-gray-100 bg-white shadow-2xl pb-8">
				<View className="flex-row justify-between mb-4">
					<Text className="text-gray-500 font-medium">
						Total Pembayaran
					</Text>
					<Text className="text-xl font-bold text-blue-600 font-[Outfit_700Bold]">
						{formatRupiah(totalPrice)}
					</Text>
				</View>
				<TouchableOpacity
					onPress={() =>
						navigation.navigate("Checkout", {
							items: cartItems,
							total: totalPrice,
						})
					}
					disabled={cartItems.length === 0 || totalPrice === 0}
					className={`py-4 rounded-xl items-center ${
						cartItems.length === 0
							? "bg-gray-300"
							: "bg-blue-600 shadow-lg shadow-blue-200"
					}`}
				>
					<Text className="text-white font-bold text-lg font-[Outfit_700Bold]">
						Lanjut ke Pembayaran
					</Text>
				</TouchableOpacity>
			</View>
		</View>
	);
};

export default CartScreen;
