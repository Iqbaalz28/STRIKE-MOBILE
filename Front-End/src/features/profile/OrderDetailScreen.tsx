import React, { useState, useEffect } from "react";
import {
	View,
	Text,
	ScrollView,
	Image,
	TouchableOpacity,
	ActivityIndicator,
} from "react-native";
import { ArrowLeft, MapPin, Calendar, Clock, Package, CreditCard, Truck, ShoppingBag } from "lucide-react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import api from "@/services/api";
import { getImageUrl } from "@/utils/imageHelper";

const formatRupiah = (num: any) => {
	const n = Number(num);
	return new Intl.NumberFormat("id-ID", {
		style: "currency",
		currency: "IDR",
		minimumFractionDigits: 0,
	}).format(isNaN(n) ? 0 : n);
};

const formatDate = (dateString: string) => {
	if (!dateString) return "-";
	const isoString = dateString.replace(" ", "T");
	try {
		const date = new Date(isoString);
		if (isNaN(date.getTime())) return dateString;
		return date.toLocaleDateString("id-ID", {
			day: "numeric",
			month: "long",
			year: "numeric",
		});
	} catch (e) {
		return dateString;
	}
};

const getStatusStyle = (status: string) => {
	switch (status?.toLowerCase()) {
		case "confirmed":
		case "completed":
		case "delivered":
		case "paid":
			return { bg: "bg-green-100", text: "text-green-700", label: "Selesai" };
		case "pending":
		case "unpaid":
			return { bg: "bg-yellow-100", text: "text-yellow-700", label: "Menunggu Bayar" };
		case "processing":
		case "shipped":
			return { bg: "bg-blue-100", text: "text-blue-700", label: "Diproses" };
		case "cancelled":
			return { bg: "bg-red-100", text: "text-red-700", label: "Dibatalkan" };
		default:
			return { bg: "bg-gray-100", text: "text-gray-700", label: status };
	}
};

const OrderDetailScreen = () => {
	const navigation = useNavigation<any>();
	const route = useRoute<any>();
	const { orderId, type } = route.params || {};

	const [loading, setLoading] = useState(true);
	const [detail, setDetail] = useState<any>(null);

	useEffect(() => {
		fetchDetail();
	}, [orderId, type]);

	const fetchDetail = async () => {
		setLoading(true);
		try {
			if (type === "shop") {
				const res = await api.getOrderDetail(orderId);
				setDetail(res.data);
			} else if (type === "booking") {
				const res = await api.getBookingDetail(orderId);
				setDetail(res.data);
			}
		} catch (error) {
			console.error("Error fetching detail:", error);
		} finally {
			setLoading(false);
		}
	};

	if (loading) {
		return (
			<View className="flex-1 justify-center items-center bg-white">
				<ActivityIndicator size="large" color="#2563EB" />
			</View>
		);
	}

	if (!detail) {
		return (
			<View className="flex-1 justify-center items-center bg-white">
				<Text className="text-gray-500">Data tidak ditemukan</Text>
			</View>
		);
	}

	const statusStyle = getStatusStyle(detail.status);

	// Render for Shop Order
	if (type === "shop") {
		return (
			<View className="flex-1 bg-gray-50">
				{/* Header */}
				<View className="pt-12 px-4 pb-4 bg-white border-b border-gray-100 flex-row items-center gap-3">
					<TouchableOpacity onPress={() => navigation.goBack()}>
						<ArrowLeft size={24} color="black" />
					</TouchableOpacity>
					<Text className="text-xl font-outfit-bold">Detail Pesanan</Text>
				</View>

				<ScrollView className="flex-1 p-5" showsVerticalScrollIndicator={false}>
					{/* Order Info Card */}
					<View className="bg-white rounded-xl p-4 border border-gray-100 mb-4">
						<View className="flex-row justify-between items-center mb-3">
							<View className="flex-row items-center">
								<ShoppingBag size={20} color="#EA580C" />
								<Text className="font-outfit-bold text-gray-800 ml-2">
									{detail.order_number}
								</Text>
							</View>
							<View className={`px-3 py-1 rounded-full ${statusStyle.bg}`}>
								<Text className={`text-xs font-outfit-bold ${statusStyle.text}`}>
									{statusStyle.label}
								</Text>
							</View>
						</View>
						<View className="flex-row items-center">
							<Calendar size={14} color="#6B7280" />
							<Text className="text-gray-500 text-sm ml-2">
								{formatDate(detail.created_at)}
							</Text>
						</View>
					</View>

					{/* Items List */}
					<Text className="font-outfit-bold text-gray-800 mb-3">Daftar Barang</Text>
					<View className="bg-white rounded-xl border border-gray-100 mb-4">
						{detail.items?.map((item: any, index: number) => (
							<View
								key={item.id || index}
								className={`flex-row p-3 ${index > 0 ? "border-t border-gray-100" : ""}`}
							>
								<Image
									source={{ uri: getImageUrl(item.img) }}
									className="w-16 h-16 rounded-lg bg-gray-100"
									resizeMode="cover"
								/>
								<View className="flex-1 ml-3 justify-center">
									<Text className="font-outfit-medium text-gray-800" numberOfLines={2}>
										{item.name}
									</Text>
									<View className="flex-row justify-between items-center mt-1">
										<Text className="text-gray-500 text-sm">
											{item.quantity}x {formatRupiah(item.unit_price)}
										</Text>
										<Text className="font-outfit-bold text-blue-600">
											{formatRupiah(item.subtotal)}
										</Text>
									</View>
								</View>
							</View>
						))}
					</View>

					{/* Shipping Address */}
					{detail.shipping_address && (
						<>
							<Text className="font-outfit-bold text-gray-800 mb-3">Alamat Pengiriman</Text>
							<View className="bg-white rounded-xl p-4 border border-gray-100 mb-4">
								<View className="flex-row items-start">
									<MapPin size={18} color="#2563EB" />
									<Text className="text-gray-600 ml-2 flex-1">
										{detail.shipping_address}
									</Text>
								</View>
							</View>
						</>
					)}

					{/* Payment Summary */}
					<Text className="font-outfit-bold text-gray-800 mb-3">Ringkasan Pembayaran</Text>
					<View className="bg-white rounded-xl p-4 border border-gray-100 mb-4">
						<View className="flex-row justify-between mb-2">
							<Text className="text-gray-500">Subtotal</Text>
							<Text className="text-gray-700">
								{formatRupiah(detail.total_amount - (detail.shipping_cost || 0) + (detail.discount_amount || 0))}
							</Text>
						</View>
						{detail.shipping_cost > 0 && (
							<View className="flex-row justify-between mb-2">
								<Text className="text-gray-500">Ongkir</Text>
								<Text className="text-gray-700">{formatRupiah(detail.shipping_cost)}</Text>
							</View>
						)}
						{detail.discount_amount > 0 && (
							<View className="flex-row justify-between mb-2">
								<Text className="text-green-600">Diskon</Text>
								<Text className="text-green-600">-{formatRupiah(detail.discount_amount)}</Text>
							</View>
						)}
						<View className="h-[1px] bg-gray-200 my-2" />
						<View className="flex-row justify-between">
							<Text className="font-outfit-bold text-gray-800">Total</Text>
							<Text className="font-outfit-bold text-blue-600 text-lg">
								{formatRupiah(detail.total_amount)}
							</Text>
						</View>
					</View>

					{/* Payment Method */}
					{detail.payment_method_name && (
						<View className="bg-white rounded-xl p-4 border border-gray-100 mb-4">
							<View className="flex-row items-center">
								<CreditCard size={18} color="#6B7280" />
								<Text className="text-gray-600 ml-2">
									Metode: <Text className="font-outfit-medium text-gray-800">{detail.payment_method_name}</Text>
								</Text>
							</View>
						</View>
					)}

					<View className="h-10" />
				</ScrollView>
			</View>
		);
	}

	// Render for Booking
	return (
		<View className="flex-1 bg-gray-50">
			{/* Header */}
			<View className="pt-12 px-4 pb-4 bg-white border-b border-gray-100 flex-row items-center gap-3">
				<TouchableOpacity onPress={() => navigation.goBack()}>
					<ArrowLeft size={24} color="black" />
				</TouchableOpacity>
				<Text className="text-xl font-outfit-bold">Detail Booking</Text>
			</View>

			<ScrollView className="flex-1 p-5" showsVerticalScrollIndicator={false}>
				{/* Booking Info Card */}
				<View className="bg-white rounded-xl p-4 border border-gray-100 mb-4">
					<View className="flex-row justify-between items-center mb-3">
						<View className="flex-row items-center">
							<MapPin size={20} color="#2563EB" />
							<Text className="font-outfit-bold text-gray-800 ml-2">
								{detail.location_name || "Lokasi Pemancingan"}
							</Text>
						</View>
						<View className={`px-3 py-1 rounded-full ${statusStyle.bg}`}>
							<Text className={`text-xs font-outfit-bold ${statusStyle.text}`}>
								{statusStyle.label}
							</Text>
						</View>
					</View>
					{detail.address && (
						<Text className="text-gray-500 text-sm mb-2">{detail.address}</Text>
					)}
				</View>

				{/* Booking Details */}
				<Text className="font-outfit-bold text-gray-800 mb-3">Detail Booking</Text>
				<View className="bg-white rounded-xl p-4 border border-gray-100 mb-4">
					<View className="flex-row items-center mb-3">
						<Calendar size={16} color="#6B7280" />
						<Text className="text-gray-600 ml-2">
							Tanggal: <Text className="font-outfit-medium text-gray-800">{formatDate(detail.booking_date)}</Text>
						</Text>
					</View>
					<View className="flex-row items-center mb-3">
						<Clock size={16} color="#6B7280" />
						<Text className="text-gray-600 ml-2">
							Durasi: <Text className="font-outfit-medium text-gray-800">{detail.duration} jam</Text>
						</Text>
					</View>
					{detail.spot_number && (
						<View className="flex-row items-center mb-3">
							<Package size={16} color="#6B7280" />
							<Text className="text-gray-600 ml-2">
								Spot: <Text className="font-outfit-medium text-gray-800">{detail.spot_number}</Text>
							</Text>
						</View>
					)}
					{detail.invoice_number && (
						<View className="flex-row items-center">
							<Truck size={16} color="#6B7280" />
							<Text className="text-gray-600 ml-2">
								Invoice: <Text className="font-outfit-medium text-gray-800">{detail.invoice_number}</Text>
							</Text>
						</View>
					)}
				</View>

				{/* Payment Summary */}
				<Text className="font-outfit-bold text-gray-800 mb-3">Ringkasan Pembayaran</Text>
				<View className="bg-white rounded-xl p-4 border border-gray-100 mb-4">
					<View className="flex-row justify-between mb-2">
						<Text className="text-gray-500">Harga per Jam</Text>
						<Text className="text-gray-700">{formatRupiah(detail.price_per_hour)}</Text>
					</View>
					<View className="flex-row justify-between mb-2">
						<Text className="text-gray-500">Durasi</Text>
						<Text className="text-gray-700">{detail.duration} jam</Text>
					</View>
					<View className="h-[1px] bg-gray-200 my-2" />
					<View className="flex-row justify-between">
						<Text className="font-outfit-bold text-gray-800">Total</Text>
						<Text className="font-outfit-bold text-blue-600 text-lg">
							{formatRupiah(detail.total_price)}
						</Text>
					</View>
				</View>

				<View className="h-10" />
			</ScrollView>
		</View>
	);
};

export default OrderDetailScreen;
