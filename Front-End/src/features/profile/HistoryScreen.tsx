import React, { useEffect, useState, useCallback } from "react";
import {
	View,
	Text,
	FlatList,
	ActivityIndicator,
	TouchableOpacity,
	RefreshControl,
} from "react-native";
import { ArrowLeft } from "lucide-react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import api from "@/services/api";
import HistoryCard from "./components/HistoryCard";

const HistoryScreen = () => {
	const navigation = useNavigation();
	const [historyData, setHistoryData] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);
	const [filter, setFilter] = useState("all"); // all, booking, shop

	const formatDateSafe = (dateString: string) => {
		if (!dateString) return "-";
		// Fix for Safari/Android: replace space with T for ISO format if needed
		// MySQL datetime: "2025-11-20 13:44:27" -> "2025-11-20T13:44:27"
		const isoString = dateString.replace(" ", "T");
		try {
			const date = new Date(isoString);
			// Check if date is valid
			if (isNaN(date.getTime())) return dateString;

			return date.toLocaleDateString("id-ID", {
				day: 'numeric', month: 'long', year: 'numeric'
			});
		} catch (e) {
			return dateString;
		}
	};

	// --- FETCH DATA ---
	const fetchData = async () => {
		try {
			// Kita ambil data Booking dan Order secara paralel
			const [bookingsRes, ordersRes] = await Promise.all([
				api.getMyBookings().catch(() => ({ data: [] })),
				api.getMyOrders().catch(() => ({ data: [] })),
			]);

			// Format Data Booking with review data
			const bookings = bookingsRes.data.map((b: any) => ({
				id: b.id,
				originalId: b.id,
				title: b.location_name || "Lokasi Pemancingan",
				date: formatDateSafe(b.booking_start),
				price: b.total_price,
				status: b.status,
				type: "booking" as const,
				targetId: b.id_location, // Location ID for review
				hasReviewed: Boolean(b.is_reviewed), // From backend
			}));

			// Format Data Shop Order with review data
			const orders = ordersRes.data.map((o: any) => ({
				id: o.id,
				originalId: o.id,
				title: o.first_product_name
					? `${o.first_product_name}${o.total_items > 1 ? ` (+${o.total_items - 1} lainnya)` : ""}`
					: `Order #${o.order_number || o.id}`,
				date: formatDateSafe(o.created_at),
				price: o.total_amount,
				status: o.status,
				type: "shop" as const,
				targetId: o.first_product_id, // Product ID for review
				hasReviewed: o.review_count > 0, // From backend
			}));

			// Gabungkan dan Sortir berdasarkan tanggal (terbaru diatas)
			const combined = [...bookings, ...orders].sort(
				(a, b) => b.id - a.id,
			);
			setHistoryData(combined);
		} catch (error) {
			console.error("Gagal load history", error);
		} finally {
			setLoading(false);
			setRefreshing(false);
		}
	};

	// Auto refresh saat layar dibuka
	useFocusEffect(
		useCallback(() => {
			fetchData();
		}, []),
	);

	const onRefresh = () => {
		setRefreshing(true);
		fetchData();
	};

	// Filter Logic
	const filteredData = historyData.filter((item) => {
		if (filter === "all") return true;
		return item.type === filter;
	});

	return (
		<View className="flex-1 bg-gray-50">
			{/* Header */}
			<View className="bg-white px-5 py-4 flex-row items-center border-b border-gray-100 pt-12">
				<TouchableOpacity
					onPress={() => navigation.goBack()}
					className="mr-3"
				>
					<ArrowLeft size={24} color="#1F2937" />
				</TouchableOpacity>
				<Text className="text-xl font-bold text-gray-900 font-[Outfit_700Bold]">
					Riwayat Pesanan
				</Text>
			</View>

			{/* Filter Tabs */}
			<View className="flex-row px-5 py-4 gap-3">
				{["all", "booking", "shop"].map((f) => (
					<TouchableOpacity
						key={f}
						onPress={() => setFilter(f)}
						className={`px-4 py-2 rounded-full border ${filter === f
							? "bg-blue-600 border-blue-600"
							: "bg-white border-gray-300"
							}`}
					>
						<Text
							className={`capitalize font-bold ${filter === f ? "text-white" : "text-gray-600"
								}`}
						>
							{f === "all" ? "Semua" : f}
						</Text>
					</TouchableOpacity>
				))}
			</View>

			{/* List Content */}
			{loading ? (
				<ActivityIndicator
					size="large"
					color="#2563EB"
					className="mt-10"
				/>
			) : (
				<FlatList
					data={filteredData}
					keyExtractor={(item, index) =>
						`${item.type}-${item.id}-${index}`
					}
					contentContainerStyle={{ padding: 20 }}
					renderItem={({ item }) => (
						<HistoryCard
							item={item}
							onReviewSubmitted={fetchData}
						/>
					)}
					refreshControl={
						<RefreshControl
							refreshing={refreshing}
							onRefresh={onRefresh}
						/>
					}
					ListEmptyComponent={
						<View className="items-center justify-center mt-20">
							<Text className="text-gray-400">
								Belum ada riwayat transaksi.
							</Text>
						</View>
					}
				/>
			)}
		</View>
	);
};

export default HistoryScreen;
