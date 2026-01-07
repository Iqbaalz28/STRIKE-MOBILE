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
import { Minus, Plus, Trash2, ArrowLeft, Check } from "lucide-react-native";
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
	const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());

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
			// Default: select all items
			setSelectedItems(new Set(rawData.map((item: any) => item.id)));
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
						// Remove from selected items too
						setSelectedItems((prev) => {
							const newSet = new Set(prev);
							newSet.delete(id);
							return newSet;
						});
					} catch (error) {
						Alert.alert("Gagal", "Tidak bisa menghapus item.");
					}
				},
			},
		]);
	};

	// Toggle individual item selection
	const toggleItemSelection = (id: number) => {
		setSelectedItems((prev) => {
			const newSet = new Set(prev);
			if (newSet.has(id)) {
				newSet.delete(id);
			} else {
				newSet.add(id);
			}
			return newSet;
		});
	};

	// Toggle select all
	const toggleSelectAll = () => {
		if (selectedItems.size === cartItems.length) {
			// Deselect all
			setSelectedItems(new Set());
		} else {
			// Select all
			setSelectedItems(new Set(cartItems.map((item) => item.id)));
		}
	};

	const isAllSelected = cartItems.length > 0 && selectedItems.size === cartItems.length;

	// Get selected cart items
	const selectedCartItems = cartItems.filter((item) => selectedItems.has(item.id));

	// Hitung Total Harga (only selected items)
	const totalPrice = selectedCartItems.reduce((sum, item) => {
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
				<Text className="text-xl font-outfit-bold font-outfit-bold">
					Keranjang Saya
				</Text>
			</View>

			{/* Select All Header */}
			{cartItems.length > 0 && (
				<TouchableOpacity
					onPress={toggleSelectAll}
					className="flex-row items-center px-5 py-3 bg-gray-50 border-b border-gray-100"
				>
					<View className={`w-5 h-5 rounded border-2 mr-3 items-center justify-center ${isAllSelected ? 'border-blue-600 bg-white' : 'border-gray-300 bg-white'}`}>
						{isAllSelected && <Check size={14} color="#2563EB" strokeWidth={3} />}
					</View>
					<Text className="text-gray-700 font-outfit-medium">
						Pilih Semua ({selectedItems.size}/{cartItems.length})
					</Text>
				</TouchableOpacity>
			)}

			{/* Cart List */}
			<FlatList
				data={cartItems}
				keyExtractor={(item) => item.id.toString()}
				contentContainerStyle={{ padding: 20, paddingBottom: 180 }}
				ListEmptyComponent={
					<View className="items-center justify-center mt-20">
						<Text className="text-center text-gray-400 font-outfit-medium">
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

					const isSelected = selectedItems.has(item.id);

					return (
						<View className={`flex-row bg-white mb-4 p-3 rounded-xl border ${isSelected ? 'border-blue-500' : 'border-gray-100'} shadow-sm`}>
							{/* Checkbox */}
							<TouchableOpacity
								onPress={() => toggleItemSelection(item.id)}
								className="justify-center mr-3"
							>
								<View className={`w-5 h-5 rounded border-2 items-center justify-center ${isSelected ? 'border-blue-600 bg-white' : 'border-gray-300 bg-white'}`}>
									{isSelected && <Check size={14} color="#2563EB" strokeWidth={3} />}
								</View>
							</TouchableOpacity>

							<Image
								source={{ uri: finalImageUrl }}
								className="w-20 h-20 rounded-lg bg-gray-50"
								resizeMode="cover"
							/>
							<View className="flex-1 ml-3 justify-between py-1">
								<View>
									<Text
										className="font-outfit-bold text-gray-900 font-outfit-medium text-sm"
										numberOfLines={2}
									>
										{productName}
									</Text>
									<Text className="text-blue-600 font-outfit-bold mt-1 text-base">
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
										<Text className="mx-3 font-outfit-bold text-gray-800">
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
					<View>
						<Text className="text-gray-500 font-outfit-medium text-sm">
							Total Pembayaran
						</Text>
						<Text className="text-gray-400 text-xs">
							{selectedItems.size} item dipilih
						</Text>
					</View>
					<Text className="text-xl font-outfit-bold text-blue-600 font-outfit-bold">
						{formatRupiah(totalPrice)}
					</Text>
				</View>
				<TouchableOpacity
					onPress={() =>
						navigation.navigate("Checkout", {
							items: selectedCartItems,
							total: totalPrice,
						})
					}
					disabled={selectedItems.size === 0 || totalPrice === 0}
					className={`py-4 rounded-xl items-center ${selectedItems.size === 0
						? "bg-gray-300"
						: "bg-blue-600 shadow-lg shadow-blue-200"
						}`}
				>
					<Text className="text-white font-outfit-bold text-lg font-outfit-bold">
						Lanjut ke Pembayaran
					</Text>
				</TouchableOpacity>
			</View>
		</View>
	);
};

export default CartScreen;
