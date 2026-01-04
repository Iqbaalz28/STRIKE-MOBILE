import React, { useState, useEffect } from "react";
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
import { useNavigation } from "@react-navigation/native";
import api from "@/services/api";
import { getImageUrl } from "@/utils/imageHelper";

// Helper
const formatRupiah = (num: number) =>
	new Intl.NumberFormat("id-ID", {
		style: "currency",
		currency: "IDR",
		minimumFractionDigits: 0,
	}).format(num);

const CartScreen = () => {
	const navigation = useNavigation<any>();
	const [cartItems, setCartItems] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		fetchCart();
	}, []);

	const fetchCart = async () => {
		try {
			// Simulasi ambil data keranjang (Nanti ganti dengan api.getCart())
			// Kita mock dulu datanya biar UI tampil
			const mockCart = [
				{
					id: 1,
					name: "Joran Carbon X",
					price: 500000,
					qty: 1,
					image: "mancing.png",
				},
				{
					id: 2,
					name: "Umpan Ikan Mas",
					price: 25000,
					qty: 3,
					image: "mancing2.png",
				},
			];
			setCartItems(mockCart);
		} catch (error) {
			console.log(error);
		} finally {
			setLoading(false);
		}
	};

	const updateQty = (id: number, type: "plus" | "minus") => {
		setCartItems((prev) =>
			prev.map((item) => {
				if (item.id === id) {
					const newQty =
						type === "plus" ? item.qty + 1 : item.qty - 1;
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
				onPress: () =>
					setCartItems((prev) =>
						prev.filter((item) => item.id !== id),
					),
			},
		]);
	};

	const totalPrice = cartItems.reduce(
		(sum, item) => sum + item.price * item.qty,
		0,
	);

	if (loading)
		return (
			<View className="flex-1 justify-center">
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
				contentContainerStyle={{ padding: 20 }}
				ListEmptyComponent={
					<Text className="text-center text-gray-400 mt-10">
						Keranjang kosong.
					</Text>
				}
				renderItem={({ item }) => (
					<View className="flex-row bg-white mb-4 p-3 rounded-xl border border-gray-100 shadow-sm">
						<Image
							source={{ uri: getImageUrl(item.image) }}
							className="w-20 h-20 rounded-lg bg-gray-100"
						/>
						<View className="flex-1 ml-3 justify-between">
							<View>
								<Text
									className="font-bold text-gray-900 font-[Outfit_500Medium]"
									numberOfLines={1}
								>
									{item.name}
								</Text>
								<Text className="text-blue-600 font-bold mt-1">
									{formatRupiah(item.price)}
								</Text>
							</View>

							<View className="flex-row justify-between items-center">
								<View className="flex-row items-center bg-gray-50 rounded-lg">
									<TouchableOpacity
										onPress={() =>
											updateQty(item.id, "minus")
										}
										className="p-1"
									>
										<Minus size={16} color="black" />
									</TouchableOpacity>
									<Text className="mx-3 font-bold">
										{item.qty}
									</Text>
									<TouchableOpacity
										onPress={() =>
											updateQty(item.id, "plus")
										}
										className="p-1"
									>
										<Plus size={16} color="black" />
									</TouchableOpacity>
								</View>
								<TouchableOpacity
									onPress={() => removeItem(item.id)}
								>
									<Trash2 size={18} color="#EF4444" />
								</TouchableOpacity>
							</View>
						</View>
					</View>
				)}
			/>

			{/* Bottom Bar */}
			<View className="p-5 border-t border-gray-100 bg-white shadow-2xl pb-8">
				<View className="flex-row justify-between mb-4">
					<Text className="text-gray-500">Total Pembayaran</Text>
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
					disabled={cartItems.length === 0}
					className={`py-4 rounded-xl items-center ${
						cartItems.length === 0
							? "bg-gray-300"
							: "bg-blue-600 shadow-lg shadow-blue-200"
					}`}
				>
					<Text className="text-white font-bold text-lg">
						Lanjut ke Pembayaran
					</Text>
				</TouchableOpacity>
			</View>
		</View>
	);
};

export default CartScreen;
