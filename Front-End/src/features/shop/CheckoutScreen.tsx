import React, { useState } from "react";
import {
	View,
	Text,
	ScrollView,
	TouchableOpacity,
	Alert,
	ActivityIndicator,
	TextInput,
} from "react-native";
import {
	useNavigation,
	useRoute,
	CommonActions,
} from "@react-navigation/native";
import { ArrowLeft, MapPin } from "lucide-react-native";
import api from "@/services/api";
import PaymentMethod from "@/features/booking/components/PaymentMethod";

// Helper Format Rupiah Aman
const formatRupiah = (num: any) => {
	const n = Number(num);
	return new Intl.NumberFormat("id-ID", {
		style: "currency",
		currency: "IDR",
		minimumFractionDigits: 0,
	}).format(isNaN(n) ? 0 : n);
};

const CheckoutScreen = () => {
	const navigation = useNavigation<any>();
	const route = useRoute<any>();

	// Ambil params dengan fallback aman
	const { items = [], total = 0 } = route.params || {};

	const [selectedPayment, setSelectedPayment] = useState<any>(null);
	const [processing, setProcessing] = useState(false);
	const [address, setAddress] = useState(
		"Jl. Setiabudi No. 193, Gegerkalong, Sukasari, Kota Bandung, Jawa Barat 40153",
	);

	const handlePay = async () => {
		if (!selectedPayment) {
			return Alert.alert(
				"Pilih Pembayaran",
				"Silakan pilih metode pembayaran terlebih dahulu.",
			);
		}

		if (!address.trim()) {
			return Alert.alert("Alamat Kosong", "Mohon isi alamat pengiriman.");
		}

		setProcessing(true);
		try {
			// Validasi item sebelum kirim
			const validItems = items.map((item: any) => {
				const price = parseFloat(
					item.product?.price_sale || item.price || 0,
				);
				return {
					product_id: item.product_id || item.id,
					qty: item.qty,
					price: isNaN(price) ? 0 : price,
				};
			});

			const payload = {
				items: validItems,
				total_amount: isNaN(Number(total)) ? 0 : Number(total),
				payment_method_id: selectedPayment.id,
				shipping_address: address,
				transaction_type: "shop",
			};

			await api.createOrder(payload);

			Alert.alert("Sukses!", "Pesanan berhasil dibuat.", [
				{
					text: "OK",
					onPress: () => {
						navigation.dispatch(
							CommonActions.reset({
								index: 0,
								routes: [{ name: "MainTab" }],
							}),
						);
					},
				},
			]);
		} catch (error: any) {
			console.error("Checkout Error:", error);
			Alert.alert(
				"Gagal",
				error.response?.data?.message || "Gagal memproses pesanan.",
			);
		} finally {
			setProcessing(false);
		}
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

			<ScrollView
				className="flex-1 p-5"
				showsVerticalScrollIndicator={false}
			>
				{/* Alamat Pengiriman */}
				<Text className="font-bold text-gray-900 mb-3 font-[Outfit_700Bold]">
					Alamat Pengiriman
				</Text>
				<View className="bg-white p-4 rounded-xl border border-gray-200 mb-6">
					<View className="flex-row items-center mb-2">
						<MapPin size={18} color="#2563EB" />
						<Text className="font-bold ml-2 text-gray-800">
							Lokasi Pengiriman
						</Text>
					</View>
					<TextInput
						value={address}
						onChangeText={setAddress}
						multiline
						className="text-gray-600 leading-relaxed text-sm bg-gray-50 p-2 rounded-lg border border-gray-100"
						style={{ minHeight: 60, textAlignVertical: "top" }}
					/>
				</View>

				{/* Ringkasan Item */}
				<Text className="font-bold text-gray-900 mb-3 font-[Outfit_700Bold]">
					Ringkasan Pesanan
				</Text>
				<View className="bg-white p-4 rounded-xl border border-gray-200 mb-6">
					{items.map((item: any) => {
						const pName =
							item.product?.name || item.name || "Produk";
						const rawPrice =
							item.product?.price_sale || item.price || 0;
						const pPrice = parseFloat(String(rawPrice));
						const subtotal = pPrice * (item.qty || 1);

						return (
							<View
								key={item.id}
								className="flex-row justify-between mb-2"
							>
								<Text
									className="text-gray-600 flex-1 mr-2"
									numberOfLines={1}
								>
									{pName}{" "}
									<Text className="font-bold text-gray-800">
										x{item.qty}
									</Text>
								</Text>
								<Text className="font-medium text-gray-900">
									{formatRupiah(subtotal)}
								</Text>
							</View>
						);
					})}
					<View className="h-[1px] bg-gray-100 my-3" />
					<View className="flex-row justify-between">
						<Text className="font-bold text-gray-900">
							Total Tagihan
						</Text>
						<Text className="font-bold text-blue-600 text-lg">
							{formatRupiah(total)}
						</Text>
					</View>
				</View>

				{/* Metode Pembayaran */}
				<Text className="font-bold text-gray-900 mb-3 font-[Outfit_700Bold]">
					Metode Pembayaran
				</Text>
				<PaymentMethod
					onSelect={(method) => setSelectedPayment(method)}
				/>

				<View className="h-24" />
			</ScrollView>

			{/* Button Pay */}
			<View className="absolute bottom-0 w-full bg-white p-5 border-t border-gray-100 shadow-2xl pb-8">
				<TouchableOpacity
					onPress={handlePay}
					disabled={processing}
					className={`py-4 rounded-xl items-center shadow-lg ${
						processing
							? "bg-blue-400"
							: "bg-blue-600 shadow-blue-200"
					}`}
				>
					{processing ? (
						<ActivityIndicator color="white" />
					) : (
						<Text className="text-white font-bold text-lg font-[Outfit_700Bold]">
							Bayar Sekarang
						</Text>
					)}
				</TouchableOpacity>
			</View>
		</View>
	);
};

export default CheckoutScreen;
