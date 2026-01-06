import React, { useState, useCallback, useEffect } from "react";
import {
	ScrollView,
	StatusBar,
	View,
	Text,
	TouchableOpacity,
	Image,
	RefreshControl,
	Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import {
	User,
	MapPin,
	ShoppingBag,
	Users,
	Calendar,
	ChevronRight,
	Star,
	Ticket,
	Bell,
} from "lucide-react-native";
import api, { BASE_URL } from "../../services/api";

const { width } = Dimensions.get("window");

const HomeScreen = () => {
	const navigation = useNavigation<any>();
	const [refreshing, setRefreshing] = useState(false);
	const [userData, setUserData] = useState<any>({
		name: "",
		membership_name: "Standard",
		avatar_img: null,
	});
	const [locations, setLocations] = useState<any[]>([]);
	const [discounts, setDiscounts] = useState<any[]>([]);
	const [activities, setActivities] = useState<any[]>([]);

	const fetchData = async () => {
		try {
			const [userRes, locRes, discRes, bookingRes] = await Promise.all([
				api.getMyProfile().catch(() => ({ data: {} })),
				api.getLocations().catch(() => ({ data: [] })),
				api.getDiscounts().catch((e) => { console.log("Discount fetch error:", e); return { data: [] }; }),
				api.getMyBookings().catch(() => ({ data: [] })),
			]);
			setUserData(userRes.data);
			setLocations(Array.isArray(locRes.data) ? locRes.data.slice(0, 3) : []);
			setDiscounts(Array.isArray(discRes.data) ? discRes.data.slice(0, 2) : []);

			// Ambil 3 booking terbaru sebagai aktivitas
			const recentBookings = Array.isArray(bookingRes.data)
				? bookingRes.data.slice(0, 3)
				: [];
			setActivities(recentBookings);

		} catch (error) {
			console.error("Error fetching data:", error);
		}
	};

	useFocusEffect(
		useCallback(() => {
			fetchData();
		}, [])
	);

	const onRefresh = useCallback(() => {
		setRefreshing(true);
		fetchData().finally(() => setRefreshing(false));
	}, []);

	const getAvatarUrl = () => {
		if (!userData.avatar_img) return null;
		if (userData.avatar_img.startsWith("http")) return userData.avatar_img;
		return `${BASE_URL}/uploads/${userData.avatar_img}`;
	};

	const getImageUrl = (path: string) => {
		if (!path) return "https://placehold.co/400x300";
		if (path.startsWith("http")) return path;
		return `${BASE_URL}/${path}`;
	};

	// Quick Actions Menu
	const quickActions = [
		{ icon: MapPin, label: "Booking", color: "#3B82F6", bg: "#dae4f2ff", route: "BookingStack" },
		{ icon: ShoppingBag, label: "Shop", color: "#F59E0B", bg: "#FEF3C7", route: "ShopStack" },
		{ icon: Users, label: "Komunitas", color: "#10B981", bg: "#D1FAE5", route: "Community" },
		{ icon: Calendar, label: "Riwayat", color: "#8B5CF6", bg: "#e5e1f9ff", route: "History" },
	];

	return (
		<SafeAreaView className="flex-1 bg-slate-50" edges={["top"]}>
			<StatusBar backgroundColor="#F8FAFC" barStyle="dark-content" />

			<ScrollView
				showsVerticalScrollIndicator={false}
				contentContainerStyle={{ paddingBottom: 100 }}
				refreshControl={
					<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#3B82F6"]} />
				}
			>
				{/* Header */}
				<View className="px-6 pt-4 pb-6 bg-slate-50">
					<View className="flex-row justify-between items-center">
						<View className="flex-1">
							<Text className="text-slate-400 text-sm">Selamat datang,</Text>
							<Text className="text-slate-900 text-2xl font-bold mt-0.5">
								{userData.name || "Pengguna"}
							</Text>
						</View>

						<TouchableOpacity
							onPress={() => navigation.navigate("Profile")}
							className="w-14 h-14 rounded-2xl overflow-hidden bg-white shadow-sm items-center justify-center"
							style={{ shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8 }}
						>
							{getAvatarUrl() ? (
								<Image source={{ uri: getAvatarUrl() }} className="w-full h-full" resizeMode="cover" />
							) : (
								<User size={24} color="#64748B" />
							)}
						</TouchableOpacity>
					</View>
				</View>

				{/* Hero Card - Membership */}
				<View className="px-6 mb-6">
					<TouchableOpacity
						onPress={() => navigation.navigate("Membership")}
						className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-3xl p-6 overflow-hidden"
						style={{ backgroundColor: "#2563EB" }}
					>
						<View className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/10" />
						<View className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full bg-white/5" />

						<View className="flex-row justify-between items-start">
							<View>
								<Text className="text-blue-100 text-sm">Membership</Text>
								<Text className="text-white text-2xl font-bold mt-1">
									{userData.membership_name || "Standard"}
								</Text>
							</View>
							<View className="bg-white/20 px-4 py-2 rounded-full flex-row items-center">
								<Star size={14} color="#FCD34D" fill="#FCD34D" />
								<Text className="text-white font-bold ml-1.5">Premium</Text>
							</View>
						</View>

						<View className="flex-row mt-6 gap-6">
							<View>
								<Text className="text-blue-200 text-xs">Total Booking</Text>
								<Text className="text-white text-xl font-bold">12</Text>
							</View>
							<View>
								<Text className="text-blue-200 text-xs">Total Shopping</Text>
								<Text className="text-white text-xl font-bold">Rp 1.2jt</Text>
							</View>
						</View>
					</TouchableOpacity>
				</View>

				{/* Quick Actions */}
				<View className="px-6 mb-8">
					<View className="flex-row justify-between">
						{quickActions.map((action, index) => (
							<TouchableOpacity
								key={index}
								onPress={() => navigation.navigate(action.route)}
								className="items-center"
								style={{ width: (width - 48) / 4 - 8 }}
							>
								<View
									className="w-14 h-14 rounded-2xl items-center justify-center mb-2"
									style={{ backgroundColor: action.bg }}
								>
									<action.icon size={24} color={action.color} />
								</View>
								<Text className="text-slate-600 text-xs font-medium">{action.label}</Text>
							</TouchableOpacity>
						))}
					</View>
				</View>

				{/* Promo Banner - Always visible */}
				<View className="px-6 mb-8">
					<TouchableOpacity
						onPress={() => navigation.navigate("CouponList")}
						className="bg-amber-50 rounded-2xl p-4 flex-row items-center border border-amber-100"
					>
						<View className="w-12 h-12 rounded-xl bg-amber-400 items-center justify-center">
							<Ticket size={24} color="#FFFFFF" />
						</View>
						<View className="flex-1 ml-4">
							<Text className="text-amber-800 font-bold text-base">
								{discounts[0]?.discount_value || "10%"} OFF
							</Text>
							<Text className="text-amber-600 text-sm">
								{discounts.length > 0
									? `Gunakan kode: ${discounts[0]?.code}`
									: "Lihat promo menarik lainnya"}
							</Text>
						</View>
						<ChevronRight size={20} color="#D97706" />
					</TouchableOpacity>
				</View>

				{/* Popular Spots */}
				<View className="mb-8">
					<View className="flex-row justify-between items-center px-6 mb-4">
						<Text className="text-slate-900 text-lg font-bold">Lokasi Populer</Text>
						<TouchableOpacity onPress={() => navigation.navigate("BookingStack", { screen: "LocationList" })}>
							<Text className="text-blue-600 text-sm font-medium">Lihat Semua</Text>
						</TouchableOpacity>
					</View>

					<ScrollView
						horizontal
						showsHorizontalScrollIndicator={false}
						contentContainerStyle={{ paddingHorizontal: 24 }}
					>
						{locations.map((loc, index) => (
							<TouchableOpacity
								key={loc.id || index}
								onPress={() => navigation.navigate("BookingStack", {
									screen: "LocationDetail",
									params: { locationId: loc.id }
								})}
								className="mr-4 bg-white rounded-2xl overflow-hidden shadow-sm"
								style={{
									width: 200,
									shadowColor: "#000",
									shadowOffset: { width: 0, height: 2 },
									shadowOpacity: 0.05,
									shadowRadius: 8
								}}
							>
								<Image
									source={{ uri: getImageUrl(loc.img) }}
									className="w-full h-28"
									resizeMode="cover"
								/>
								<View className="p-3">
									<Text className="text-slate-900 font-bold text-sm" numberOfLines={1}>
										{loc.name}
									</Text>
									<Text className="text-slate-400 text-xs mt-0.5" numberOfLines={1}>
										{loc.address}
									</Text>
									<View className="flex-row items-center mt-2">
										<Star size={12} color="#F59E0B" fill="#F59E0B" />
										<Text className="text-slate-600 text-xs ml-1">4.8</Text>
										<Text className="text-blue-600 font-bold text-sm ml-auto">
											Rp {Number(loc.price_per_hour || 0).toLocaleString("id-ID")}/jam
										</Text>
									</View>
								</View>
							</TouchableOpacity>
						))}
					</ScrollView>
				</View>

				{/* Activity Section */}
				<View className="px-6">
					<View className="flex-row justify-between items-center mb-4">
						<Text className="text-slate-900 text-lg font-bold">Aktivitas Terbaru</Text>
						<TouchableOpacity onPress={() => navigation.navigate("History")}>
							<Text className="text-blue-600 text-sm font-medium">Lihat Semua</Text>
						</TouchableOpacity>
					</View>

					{activities.length > 0 ? (
						activities.map((item, index) => (
							<View key={index} className="bg-white rounded-2xl p-4 shadow-sm mb-3" style={{ shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8 }}>
								<View className="flex-row items-center">
									<View className="w-12 h-12 bg-green-100 rounded-xl items-center justify-center">
										<MapPin size={24} color="#10B981" />
									</View>
									<View className="flex-1 ml-4">
										<Text className="text-slate-900 font-medium">Booking {item.status === 'completed' ? 'Selesai' : 'Berhasil'}</Text>
										<Text className="text-slate-400 text-sm" numberOfLines={1}>
											{item.location_name || "Lokasi"} • Spot {item.spot_number}
										</Text>
									</View>
									<Text className="text-slate-400 text-xs">
										{(() => {
											const dateStr = item.booking_start || item.booking_date || item.created_at;
											if (!dateStr) return "-";
											try {
												// Handle SQL date format "YYYY-MM-DD HH:mm:ss" -> "YYYY-MM-DDTHH:mm:ss"
												const safeDate = new Date(dateStr.toString().replace(" ", "T"));
												return safeDate.toLocaleDateString("id-ID", { day: 'numeric', month: 'short' });
											} catch (e) {
												return "-";
											}
										})()}
									</Text>
								</View>
							</View>
						))
					) : (
						<View className="bg-white rounded-2xl p-6 items-center border border-dashed border-gray-300">
							<Text className="text-gray-400">Belum ada aktivitas</Text>
						</View>
					)}
				</View>

			</ScrollView>
		</SafeAreaView>
	);
};

export default HomeScreen;
