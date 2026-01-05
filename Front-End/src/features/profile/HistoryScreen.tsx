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
			// (Asumsi API getMyBookings ada, jika belum ada di api.ts nanti kita tambahkan)
			// [BENAR] - Panggil method service yang sudah didefinisikan
			const [bookingsRes, ordersRes] = await Promise.all([
				api
					.getMyBookings()
					.catch(() => ({ data: [] })), // Gunakan getMyBookings()
				api.getMyOrders().catch(() => ({ data: [] })),
			]);

			// Format Data Booking
			const bookings = bookingsRes.data.map((b: any) => ({
				id: b.id,
				title: b.location_name || "Lokasi Pemancingan",
				date: formatDateSafe(b.booking_start), // Use booking_start instead of booking_date
				price: b.total_price,
				status: b.status, // terbayar, pending, dll
				type: "booking",
			}));

			// Format Data Shop Order
			const orders = ordersRes.data.map((o: any) => ({
				id: o.id,
				title: `Order #${o.order_number || o.id}`, // Use order_number if available
				date: formatDateSafe(o.created_at),
				price: o.total_amount,
				status: o.status,
				type: "shop",
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
						className={`px-4 py-2 rounded-full border ${
							filter === f
								? "bg-blue-600 border-blue-600"
								: "bg-white border-gray-300"
						}`}
					>
						<Text
							className={`capitalize font-bold ${
								filter === f ? "text-white" : "text-gray-600"
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
					renderItem={({ item }) => <HistoryCard item={item} />}
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
