import React, { useState, useEffect } from "react";
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
import { ArrowLeft, MapPin, Tag, Check, X } from "lucide-react-native";
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

	// Shipping Form State
	const [street, setStreet] = useState("");
	const [city, setCity] = useState("");
	const [province, setProvince] = useState("");
	const [postcode, setPostcode] = useState("");
	const [notes, setNotes] = useState("");

	// Voucher State
	const [voucherCode, setVoucherCode] = useState("");
	const [discountAmount, setDiscountAmount] = useState(0);
	const [isVoucherApplied, setIsVoucherApplied] = useState(false);
	const [applyingVoucher, setApplyingVoucher] = useState(false);

	// Calculate totals
	const shippingCost = 20000;
	const grandTotal = Math.max(0, total + shippingCost - discountAmount);

	const applyVoucher = async () => {
		if (!voucherCode.trim()) {
			return Alert.alert("Kode Kosong", "Masukkan kode voucher terlebih dahulu.");
		}

		setApplyingVoucher(true);
		try {
			const res = await api.checkVoucher(voucherCode);

			if (res.data.valid) {
				const valStr = res.data.discount_value;
				let discount = 0;

				if (valStr.includes("%")) {
					const percent = parseInt(valStr.replace("%", ""));
					discount = total * (percent / 100);
				} else {
					discount = parseInt(valStr);
				}

				setDiscountAmount(discount);
				setIsVoucherApplied(true);
				Alert.alert("Berhasil!", `Voucher berhasil! Hemat ${formatRupiah(discount)}`);
			}
		} catch (error: any) {
			setDiscountAmount(0);
			setIsVoucherApplied(false);
			Alert.alert("Gagal", error.response?.data?.message || "Kode voucher tidak valid.");
		} finally {
			setApplyingVoucher(false);
		}
	};

	const removeVoucher = () => {
		setVoucherCode("");
		setDiscountAmount(0);
		setIsVoucherApplied(false);
	};

	const handlePay = async () => {
		if (!selectedPayment) {
			return Alert.alert(
				"Pilih Pembayaran",
				"Silakan pilih metode pembayaran terlebih dahulu.",
			);
		}

		if (!street.trim() || !city.trim()) {
			return Alert.alert("Alamat Belum Lengkap", "Mohon isi alamat jalan dan kota.");
		}

		setProcessing(true);
		try {
			// Combine address parts
			const fullAddress = [street, city, province, postcode]
				.filter(Boolean)
				.join(", ");

			const payload = {
				shipping_address: fullAddress,
				payment_method: selectedPayment.id,
				notes: notes,
				shipping_cost: shippingCost,
				tax_amount: 0,
				discount_amount: discountAmount,
				voucher_code: isVoucherApplied ? voucherCode : null,
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
				<View className="bg-white p-4 rounded-xl border border-gray-200 mb-4">
					<View className="flex-row items-center mb-3">
						<MapPin size={18} color="#2563EB" />
						<Text className="font-bold ml-2 text-gray-800">
							Detail Lokasi
						</Text>
					</View>

					{/* Street Address */}
					<Text className="text-gray-600 text-xs mb-1">
						Alamat Jalan <Text className="text-red-500">*</Text>
					</Text>
					<TextInput
						value={street}
						onChangeText={setStreet}
						placeholder="Nama Jalan, No Rumah, RT/RW"
						className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-gray-800 mb-3"
					/>

					<View className="flex-row gap-3 mb-3">
						{/* City */}
						<View className="flex-1">
							<Text className="text-gray-600 text-xs mb-1">
								Kota <Text className="text-red-500">*</Text>
							</Text>
							<TextInput
								value={city}
								onChangeText={setCity}
								placeholder="Nama Kota"
								className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-gray-800"
							/>
						</View>

						{/* Province */}
						<View className="flex-1">
							<Text className="text-gray-600 text-xs mb-1">Provinsi</Text>
							<TextInput
								value={province}
								onChangeText={setProvince}
								placeholder="Provinsi"
								className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-gray-800"
							/>
						</View>
					</View>

					{/* Postcode */}
					<Text className="text-gray-600 text-xs mb-1">Kode Pos</Text>
					<TextInput
						value={postcode}
						onChangeText={setPostcode}
						placeholder="Kode Pos"
						keyboardType="number-pad"
						className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-gray-800 mb-3"
					/>

					{/* Notes */}
					<Text className="text-gray-600 text-xs mb-1">Catatan Tambahan</Text>
					<TextInput
						value={notes}
						onChangeText={setNotes}
						placeholder="Catatan untuk kurir (opsional)"
						multiline
						numberOfLines={2}
						className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-gray-800"
						style={{ textAlignVertical: "top", minHeight: 60 }}
					/>
				</View>

				{/* Voucher Section */}
				<Text className="font-bold text-gray-900 mb-3 font-[Outfit_700Bold]">
					Kode Voucher
				</Text>
				<View className="bg-white p-4 rounded-xl border border-gray-200 mb-4">
					<View className="flex-row items-center gap-2">
						<View className="flex-1">
							<TextInput
								value={voucherCode}
								onChangeText={setVoucherCode}
								placeholder="Masukkan kode voucher"
								editable={!isVoucherApplied}
								autoCapitalize="characters"
								className={`bg-gray-50 p-3 rounded-lg border border-gray-200 text-gray-800 uppercase ${isVoucherApplied ? "bg-green-50" : ""
									}`}
							/>
						</View>
						{isVoucherApplied ? (
							<TouchableOpacity
								onPress={removeVoucher}
								className="bg-red-100 p-3 rounded-lg"
							>
								<X size={20} color="#EF4444" />
							</TouchableOpacity>
						) : (
							<TouchableOpacity
								onPress={applyVoucher}
								disabled={applyingVoucher}
								className="bg-blue-600 px-4 py-3 rounded-lg"
							>
								{applyingVoucher ? (
									<ActivityIndicator size="small" color="white" />
								) : (
									<Text className="text-white font-bold">Pakai</Text>
								)}
							</TouchableOpacity>
						)}
					</View>
					{isVoucherApplied && (
						<View className="flex-row items-center mt-2 bg-green-50 p-2 rounded-lg">
							<Check size={16} color="#16A34A" />
							<Text className="text-green-600 ml-2 text-sm">
								Diskon {formatRupiah(discountAmount)} berhasil diterapkan!
							</Text>
						</View>
					)}
				</View>

				{/* Ringkasan Item */}
				<Text className="font-bold text-gray-900 mb-3 font-[Outfit_700Bold]">
					Ringkasan Pesanan
				</Text>
				<View className="bg-white p-4 rounded-xl border border-gray-200 mb-4">
					{items.map((item: any) => {
						const pName = item.product?.name || item.name || "Produk";
						const rawPrice = item.product?.price_sale || item.price || 0;
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

					<View className="flex-row justify-between mb-1">
						<Text className="text-gray-500 text-sm">Subtotal</Text>
						<Text className="text-gray-700">{formatRupiah(total)}</Text>
					</View>
					<View className="flex-row justify-between mb-1">
						<Text className="text-gray-500 text-sm">Pengiriman</Text>
						<Text className="text-gray-700">{formatRupiah(shippingCost)}</Text>
					</View>
					{discountAmount > 0 && (
						<View className="flex-row justify-between mb-1">
							<Text className="text-green-600 text-sm">Diskon Voucher</Text>
							<Text className="text-green-600">- {formatRupiah(discountAmount)}</Text>
						</View>
					)}
					<View className="h-[1px] bg-gray-200 my-2" />
					<View className="flex-row justify-between">
						<Text className="font-bold text-gray-900">Total Tagihan</Text>
						<Text className="font-bold text-blue-600 text-lg">
							{formatRupiah(grandTotal)}
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
					className={`py-4 rounded-xl items-center shadow-lg ${processing
						? "bg-blue-400"
						: "bg-blue-600 shadow-blue-200"
						}`}
				>
					{processing ? (
						<ActivityIndicator color="white" />
					) : (
						<Text className="text-white font-bold text-lg font-[Outfit_700Bold]">
							Bayar {formatRupiah(grandTotal)}
						</Text>
					)}
				</TouchableOpacity>
			</View>
		</View>
	);
};

export default CheckoutScreen;
