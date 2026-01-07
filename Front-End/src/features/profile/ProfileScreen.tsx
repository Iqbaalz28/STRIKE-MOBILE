import React, { useState, useCallback } from "react";
import {
	View,
	Text,
	Image,
	TouchableOpacity,
	ScrollView,
	Alert,
	ActivityIndicator,
	Switch,
} from "react-native";
import {
	useNavigation,
	useFocusEffect,
	CommonActions,
} from "@react-navigation/native";
import {
	User,
	ChevronRight,
	Info,
	LogIn,
	CreditCard,
	LogOut,
	Crown,
	MapPin,
	Settings,
	Shield,
	Bell,
	Wallet,
	History,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "@/services/api";
import { getImageUrl } from "@/utils/imageHelper";

const ProfileScreen = () => {
	const navigation = useNavigation<any>();
	const [user, setUser] = useState<any>(null);
	const [loading, setLoading] = useState(true);

	// Stats untuk badge notifikasi
	const [stats, setStats] = useState({
		unpaid: 0,
		active: 0
	});

	useFocusEffect(
		useCallback(() => {
			checkUserSession();
		}, []),
	);

	const checkUserSession = async () => {
		setLoading(true);
		try {
			const userData = await AsyncStorage.getItem("user");
			const token = await AsyncStorage.getItem("token");

			if (userData && token) {
				setUser(JSON.parse(userData));
				fetchProfileFromAPI();
			} else {
				setUser(null);
			}
		} catch (error) {
			console.log("Error checking session", error);
		} finally {
			setLoading(false);
		}
	};

	const fetchProfileFromAPI = async () => {
		try {
			const [resUser, resBookings] = await Promise.all([
				api.getMyProfile(),
				api.getMyBookings(),
			]);
			setUser(resUser.data);
			await AsyncStorage.setItem("user", JSON.stringify(resUser.data));

			// Hitung stats
			if (resBookings.data) {
				const unpaid = resBookings.data.filter((b: any) => b.payment_status === 'unpaid').length;
				const active = resBookings.data.filter((b: any) => ['pending', 'confirmed', 'paid'].includes(b.status)).length;
				setStats({ unpaid, active });
			}

		} catch (error) {
			console.log("Gagal refresh profile", error);
		}
	};

	const handleLogout = async () => {
		Alert.alert(
			"Keluar Akun",
			"Apakah Anda yakin ingin keluar?",
			[
				{ text: "Batal", style: "cancel" },
				{
					text: "Keluar",
					style: "destructive",
					onPress: async () => {
						await AsyncStorage.multiRemove(["token", "user"]);
						setUser(null);
						navigation.dispatch(
							CommonActions.reset({
								index: 0,
								routes: [{ name: "Login" }],
							}),
						);
					},
				},
			],
		);
	};

	const getAvatar = (path: string) => {
		if (!path)
			return `https://ui-avatars.com/api/?name=${user?.name || "User"
				}&background=0D8ABC&color=fff`;
		if (path.startsWith("http")) return path;
		return getImageUrl(path);
	};

	if (loading)
		return (
			<View className="flex-1 justify-center items-center bg-white">
				<ActivityIndicator size="large" color="#2563EB" />
			</View>
		);

	if (!user) {
		return (
			// Tampilan Guest yang lebih rapi
			<View className="flex-1 bg-white px-6 justify-center items-center">
				<View className="w-24 h-24 bg-blue-50 rounded-full items-center justify-center mb-6">
					<User size={40} color="#2563EB" />
				</View>
				<Text className="text-2xl font-outfit-bold text-gray-900 mb-2">Belum Login</Text>
				<Text className="text-gray-500 text-center mb-8 px-4">
					Silakan masuk untuk mengakses profil Anda dan melihat riwayat pemesanan.
				</Text>
				<TouchableOpacity
					onPress={() => navigation.navigate("Login")}
					className="w-full bg-blue-600 py-4 rounded-xl shadow-lg shadow-blue-200"
				>
					<Text className="text-white text-center font-outfit-bold text-lg">Masuk / Daftar</Text>
				</TouchableOpacity>
			</View>
		);
	}

	const version = "1.0.5"; // Dummy version

	return (
		<View className="flex-1 bg-gray-50">
			<ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
				{/* Top Header Background */}
				<View className="bg-white pb-6 pt-12 px-6 rounded-b-[30px] shadow-sm mb-6">
					<View className="items-center">
						<View className="relative mb-4">
							<Image
								source={{ uri: getAvatar(user?.avatar_img) }}
								className="w-24 h-24 rounded-full border-4 border-white shadow-sm"
							/>
							<TouchableOpacity
								onPress={() => navigation.navigate("EditProfile")}
								className="absolute bottom-0 right-0 bg-blue-600 p-2 rounded-full border-2 border-white"
							>
								<Settings size={14} color="white" />
							</TouchableOpacity>
						</View>

						<Text className="text-xl font-outfit-bold text-gray-900 mb-1">{user?.name}</Text>
						<Text className="text-gray-500 text-sm mb-4">{user?.email}</Text>

						{/* Membership Badge */}
						<View className="bg-blue-50 px-4 py-2 rounded-full flex-row items-center border border-blue-100">
							<Crown size={14} color="#2563EB" fill="#2563EB" />
							<Text className="text-blue-700 font-outfit-bold text-xs ml-2 uppercase tracking-wider">
								{user?.membership_name || "Free Member"}
							</Text>
						</View>
					</View>

					{/* Stats Row */}
					{/* <View className="flex-row justify-center mt-6 divide-x divide-gray-100">
						<View className="items-center px-6">
							<Text className="text-gray-900 font-outfit-bold text-lg">{stats.active}</Text>
							<Text className="text-gray-400 text-xs mt-1">Booking Aktif</Text>
						</View>
						<View className="items-center px-6">
							<Text className="text-gray-900 font-outfit-bold text-lg">0</Text>
							<Text className="text-gray-400 text-xs mt-1">Voucher</Text>
						</View>
						<View className="items-center px-6">
							<Text className="text-gray-900 font-outfit-bold text-lg">0</Text>
							<Text className="text-gray-400 text-xs mt-1">Poin</Text>
						</View>
					</View> */}
				</View>

				{/* Unpaid Alert */}
				{stats.unpaid > 0 && (
					<TouchableOpacity
						onPress={() => navigation.navigate("History")}
						className="mx-6 mb-6 bg-red-50 border border-red-100 p-4 rounded-xl flex-row items-center justify-between"
					>
						<View className="flex-row items-center">
							<Shield size={20} color="#DC2626" />
							<Text className="text-red-700 font-outfit-medium ml-3">
								Ada {stats.unpaid} tagihan belum dibayar
							</Text>
						</View>
						<ChevronRight size={16} color="#DC2626" />
					</TouchableOpacity>
				)}

				{/* Menu Groups */}
				<View className="px-6">

					{/* Account Group */}
					<Text className="text-gray-900 font-outfit-bold text-base mb-3 ml-1">Akun</Text>
					<View className="bg-white rounded-2xl overflow-hidden shadow-sm mb-6">
						<MenuItem
							icon={User}
							color="#3B82F6"
							label="Edit Profil"
							onPress={() => navigation.navigate("EditProfile")}
						/>
						<Divider />
						<MenuItem
							icon={CreditCard}
							color="#10B981"
							label="Metode Pembayaran"
							value={user?.payment_method_name}
							onPress={() => navigation.navigate("PaymentMethods")}
						/>
						<Divider />
						<MenuItem
							icon={MapPin}
							color="#F59E0B"
							label="Alamat Tersimpan"
							onPress={() => navigation.navigate("SavedAddresses")}
						/>
					</View>

					{/* Activity Group */}
					<Text className="text-gray-900 font-outfit-bold text-base mb-3 ml-1">Aktivitas</Text>
					<View className="bg-white rounded-2xl overflow-hidden shadow-sm mb-6">
						<MenuItem
							icon={History}
							color="#8B5CF6"
							label="Riwayat Pesanan"
							onPress={() => navigation.navigate("History")}
						/>
						<Divider />
						<MenuItem
							icon={Crown}
							color="#F97316"
							label="Membership"
							value="Upgrade"
							onPress={() => navigation.navigate("Membership")}
						/>
					</View>

					{/* General Group */}
					<Text className="text-gray-900 font-outfit-bold text-base mb-3 ml-1">Lainnya</Text>
					<View className="bg-white rounded-2xl overflow-hidden shadow-sm mb-8">
						<MenuItem
							icon={Bell}
							color="#3B82F6"
							label="Notifikasi"
							onPress={() => navigation.navigate("Notifications")}
						/>
						<Divider />
						<MenuItem
							icon={Info}
							color="#6B7280"
							label="Tentang Aplikasi"
							value={`v${version}`}
							onPress={() => navigation.navigate("About")}
						/>
						<Divider />
						<MenuItem
							icon={LogOut}
							color="#EF4444"
							label="Keluar"
							isDestructive
							onPress={handleLogout}
						/>
					</View>

					{/* Footer */}
					<Text className="text-gray-400 text-xs text-center">
						Strike Mobile App • 2024
					</Text>
				</View>
			</ScrollView>
		</View>
	);
};

// Helper Components
const MenuItem = ({ icon: Icon, color, label, value, onPress, isDestructive, rightElement }: any) => (
	<TouchableOpacity
		onPress={onPress}
		disabled={!onPress}
		className={`flex-row items-center p-4 active:bg-gray-50`}
	>
		<View className={`w-8 h-8 rounded-full items-center justify-center mr-3`} style={{ backgroundColor: `${color}15` }}>
			<Icon size={18} color={color} />
		</View>

		<Text className={`flex-1 text-base font-outfit-medium ${isDestructive ? 'text-red-600' : 'text-gray-900'}`}>
			{label}
		</Text>

		{rightElement ? (
			rightElement
		) : (
			<View className="flex-row items-center">
				{value && <Text className="text-gray-400 text-sm mr-2">{value}</Text>}
				{onPress && <ChevronRight size={18} color="#D1D5DB" />}
			</View>
		)}
	</TouchableOpacity>
);

const Divider = () => (
	<View className="h-[1px] bg-gray-100 ml-14" />
);

export default ProfileScreen;
