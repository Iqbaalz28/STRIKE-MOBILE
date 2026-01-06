import React, { useState, useCallback } from "react";
import {
	View,
	Text,
	Image,
	TouchableOpacity,
	ScrollView,
	Alert,
	ActivityIndicator,
} from "react-native";
import {
	useNavigation,
	useFocusEffect,
	CommonActions,
} from "@react-navigation/native";
import {
	Settings,
	LogOut,
	Clock,
	User,
	ChevronRight,
	HelpCircle,
	Info,
	LogIn,
	Check,
	CreditCard,
	Plus,
    X,
    Camera,
    Calendar,
	Edit,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "@/services/api";
import { getImageUrl } from "@/utils/imageHelper";
import { formatDate, formatRupiah } from "@/utils/format";

const ProfileScreen = () => {
	const navigation = useNavigation<any>();
	const [user, setUser] = useState<any>(null);
	const [bookings, setBookings] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);

	// Refresh data setiap kali tab dibuka
	useFocusEffect(
		useCallback(() => {
			checkUserSession();
		}, []),
	);

	const checkUserSession = async () => {
		setLoading(true);
		try {
			// 1. Cek dulu di Local Storage
			const userData = await AsyncStorage.getItem("user");
			const token = await AsyncStorage.getItem("token");

			if (userData && token) {
				setUser(JSON.parse(userData));
				// Refresh data dari API di background
				fetchProfileFromAPI();
			} else {
				setUser(null); // Guest
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
			setBookings(resBookings.data);

			await AsyncStorage.setItem("user", JSON.stringify(resUser.data));
		} catch (error) {
			console.log("Gagal refresh profile", error);
		}
	};

	const handleLogout = async () => {
		Alert.alert(
			"Konfirmasi Keluar",
			"Apakah Anda yakin ingin keluar dari aplikasi?",
			[
				{ text: "Batal", style: "cancel" },
				{
					text: "Keluar",
					style: "destructive",
					onPress: async () => {
						// 1. Hapus Data
						await AsyncStorage.multiRemove(["token", "user"]);
						setUser(null);

						// 2. Reset Navigasi ke 'Login' (BUKAN 'Auth')
						navigation.dispatch(
							CommonActions.reset({
								index: 0,
								routes: [{ name: "Login" }], // <--- Perbaikan Disini
							}),
						);
					},
				},
			],
		);
	};

	// Helper Avatar
	const getAvatar = (path: string) => {
		if (!path)
			return `https://ui-avatars.com/api/?name=${
				user?.name || "User"
			}&background=0D8ABC&color=fff`;
		if (path.startsWith("http")) return path;
		return getImageUrl(path); // Menggunakan helper global Anda
	};

	if (loading)
		return (
			<View className="flex-1 justify-center items-center bg-gray-50">
				<ActivityIndicator size="large" color="#2563EB" />
			</View>
		);

	// --- TAMPILAN GUEST MODE (Belum Login) ---
	if (!user) {
		return (
			<View className="flex-1 bg-white justify-center items-center p-6">
				<View className="bg-blue-50 p-6 rounded-full mb-6">
					<User size={64} color="#2563EB" />
				</View>
				<Text className="text-2xl font-bold text-gray-900 mb-2 font-[Outfit_700Bold]">
					Anda Belum Login
				</Text>
				<Text className="text-gray-500 text-center mb-8 font-[Outfit_400Regular] leading-relaxed">
					Masuk sekarang untuk mengakses riwayat pesanan, mengelola
					profil, dan menikmati fitur lengkap lainnya.
				</Text>

				<TouchableOpacity
					onPress={() => {
						// Reset ke Login screen agar user tidak bisa back ke halaman ini tanpa login
						navigation.dispatch(
							CommonActions.reset({
								index: 0,
								routes: [{ name: "Login" }], // <--- Perbaikan Disini (Sebelumnya "Auth")
							}),
						);
					}}
					className="w-full bg-blue-600 py-4 rounded-xl flex-row justify-center items-center shadow-lg shadow-blue-200"
				>
					<LogIn size={20} color="white" className="mr-2" />
					<Text className="text-white font-bold text-lg font-[Outfit_700Bold]">
						Masuk / Daftar
					</Text>
				</TouchableOpacity>

				{/* Menu Bantuan Tetap Ada untuk Tamu */}
				<TouchableOpacity
					onPress={() => navigation.navigate("About")}
					className="mt-6 flex-row items-center"
				>
					<Info size={16} color="#6B7280" />
					<Text className="text-gray-500 ml-2 font-medium">
						Tentang Aplikasi
					</Text>
				</TouchableOpacity>
			</View>
		);
	}

	// --- TAMPILAN USER LOGIN ---
	return (
		<View className="flex-1 bg-white">
			<ScrollView showsVerticalScrollIndicator={false}>
				{/* Header */}
				<View className="flex-row justify-between items-center px-6 pt-12 pb-4 bg-white">
					<Text className="text-2xl font-bold text-gray-900 font-[Outfit_700Bold]">
						Profile
					</Text>
				</View>

				{/* Profile Card */}
				<LinearGradient
					colors={["#2563EB", "#9333EA"]} // Blue to Purple
					className="mx-5 mb-6 rounded-[30px] p-6 pt-10"
				>
					{/* Avatar & Upload */}
					<View className="items-center mb-8">
						<View className="items-center justify-center mb-4">
							{user?.avatar_img ? (
								<Image
									source={{ uri: getAvatar(user.avatar_img) }}
									className="w-24 h-24 rounded-full border-2 border-white/30"
								/>
							) : (
								<View className="w-24 h-24 rounded-full bg-white/10 border-2 border-white/30 items-center justify-center">
									<User size={40} color="white" />
								</View>
							)}
						</View>
						<TouchableOpacity 
							onPress={() => navigation.navigate("EditProfile")}
							className="bg-white/20 px-4 py-2 rounded-full flex-row items-center backdrop-blur-md"
						>
							<Edit size={16} color="white" className="mr-2" />
							<Text className="text-white font-[Outfit_500Medium]">
								Edit Profil
							</Text>
						</TouchableOpacity>
					</View>

					{/* Fields */}
					<View className="space-y-4">
						<ProfileField
							label="Nama"
							value={user?.name || "Nama Pengguna"}
						/>
						<ProfileField
							label="Tanggal Lahir"
							value={
								user?.date_birth
									? formatDate(user.date_birth)
									: "-"
							}
						/>
						<ProfileField
							label="Alamat"
							value={user?.address || user?.city || "-"}
						/>
						<ProfileField
							label="Bio"
							value={
								user?.bio || "Halo semua, saya pemancing handal"
							}
							isLast
						/>
					</View>
				</LinearGradient>

				{/* Detail Langganan Card */}
				<View className="mx-5 mb-6 bg-slate-50 border border-slate-200 shadow-sm rounded-3xl overflow-hidden p-5">
					<Text className="text-gray-900 text-lg font-bold mb-4 font-[Outfit_700Bold]">
						Detail Langganan
					</Text>

					<LinearGradient
						colors={["#F97316", "#EF4444"]}
						start={{ x: 0, y: 0 }}
						end={{ x: 1, y: 0 }}
						className="rounded-2xl p-4 flex-row justify-between items-center mb-6"
					>
						<Text className="text-white text-xl font-bold font-[Outfit_700Bold]">
							{user?.membership_name || "Free Member"}
						</Text>
						<View className="bg-white/20 px-3 py-1 rounded-lg">
							<Text className="text-white text-xs font-bold">
								{user?.id_membership
									? "Langganan Aktif"
									: "Dasar"}
							</Text>
						</View>
					</LinearGradient>

					<View className="space-y-4">
						{user?.membership_benefits ? (
							String(user.membership_benefits)
								.split("\n")
								.map((item: string, index: number) => (
									<View
										key={index}
										className="flex-row items-start mb-3"
									>
										<View className="bg-green-100 rounded-full p-1 mr-3 mt-1">
											<Check size={12} color="#16A34A" />
										</View>
										<Text className="text-gray-600 flex-1 leading-5 font-[Outfit_400Regular]">
											{item.trim()}
										</Text>
									</View>
								))
						) : (
							<Text className="text-gray-500 font-[Outfit_400Regular]">
								Belum ada keuntungan member. Upgrade sekarang!
							</Text>
						)}
					</View>
				</View>

				{/* Akun Pembayaran Card */}
				<View className="mx-5 mb-6 bg-slate-50 border border-slate-200 shadow-sm rounded-3xl p-5">
					<Text className="text-gray-900 text-lg font-bold mb-4 font-[Outfit_700Bold]">
						Akun Pembayaran
					</Text>

					<View className="bg-gray-50 border border-gray-200 rounded-2xl p-4 flex-row items-center mb-4">
						<CreditCard size={24} color="#4B5563" className="mr-4" />
						<View className="flex-1">
							<Text className="text-gray-900 font-bold font-[Outfit_700Bold]">
								{user?.payment_method_name || "Belum dipilih"}
							</Text>
							<Text className="text-gray-500 text-xs">
								{user?.id_payment_method ? "Utama" : "-"}
							</Text>
						</View>
						{user?.id_payment_method && (
							<View className="bg-green-100 px-3 py-1 rounded-full">
								<Text className="text-green-800 text-xs font-bold">
									Tersimpan
								</Text>
							</View>
						)}
					</View>

					<TouchableOpacity className="bg-gray-50 border border-gray-200 rounded-2xl p-4 flex-row justify-center items-center">
						<Plus size={20} color="#4B5563" className="mr-2" />
						<Text className="text-gray-900 font-bold font-[Outfit_700Bold]">
							Ganti Metode Pembayaran
						</Text>
					</TouchableOpacity>
				</View>

				{/* Tagihan Card (Unpaid Bookings) */}
				<View className="mx-5 mb-6 bg-slate-50 border border-slate-200 shadow-sm rounded-3xl p-5">
					<View className="flex-row justify-between items-center mb-4">
						<Text className="text-gray-900 text-lg font-bold font-[Outfit_700Bold]">
							Tagihan Anda
						</Text>
					</View>

					{bookings.filter((b: any) => b.payment_status === "unpaid")
						.length > 0 ? (
						bookings
							.filter((b: any) => b.payment_status === "unpaid")
							.map((item: any, index: number) => (
								<View
									key={index}
									className="bg-gray-50 border border-gray-200 rounded-2xl p-4 mb-3"
								>
									<View className="flex-row justify-between items-start mb-2">
										<View>
											<Text className="text-gray-900 font-[Outfit_500Medium] text-base">
												Booking: {item.location_name}
											</Text>
											<Text className="text-gray-500 text-xs font-[Outfit_400Regular]">
												{formatDate(item.booking_start)}
											</Text>
										</View>
										<View className="bg-yellow-100 px-3 py-1 rounded-full">
											<Text className="text-yellow-800 text-xs font-bold">
												Belum Bayar
											</Text>
										</View>
									</View>
									<Text className="text-gray-900 text-lg font-[Outfit_700Bold] mt-2">
										{formatRupiah(item.total_price)}
									</Text>
								</View>
							))
					) : (
						<View className="bg-gray-50 border border-gray-200 rounded-2xl p-4">
							<Text className="text-gray-500 text-center font-[Outfit_400Regular]">
								Tidak ada tagihan aktif
							</Text>
						</View>
					)}
				</View>

				{/* Riwayat Pesanan Card */}
				<View className="mx-5 mb-8 bg-slate-50 border border-slate-200 shadow-sm rounded-3xl p-5">
					<View className="flex-row justify-between items-center mb-4">
						<Text className="text-gray-900 text-lg font-bold font-[Outfit_700Bold]">
							Riwayat Pesanan
						</Text>
						<TouchableOpacity
							onPress={() => navigation.navigate("History")}
						>
							<Text className="text-blue-600 text-xs font-bold uppercase">
								LIHAT SEMUA &gt;
							</Text>
						</TouchableOpacity>
					</View>

					{bookings && bookings.length > 0 ? (
						bookings.slice(0, 3).map((item: any, index: number) => (
							<View
								key={index}
								className="bg-gray-50 border border-gray-200 rounded-2xl p-4 mb-3 last:mb-0"
							>
								<Text className="text-gray-900 font-[Outfit_500Medium] text-base mb-2">
									{item.location_name} (Spot No.{" "}
									{item.spot_number})
								</Text>

								<View className="flex-row items-center mb-1">
									<Calendar
										size={14}
										color="#6B7280"
										className="mr-2"
									/>
									<Text className="text-gray-500 text-xs font-[Outfit_400Regular]">
										{formatDate(item.booking_start)}
									</Text>
								</View>

								<View className="flex-row justify-between items-center mt-3">
									<Text className="text-gray-900 text-base font-[Outfit_700Bold]">
										{formatRupiah(item.total_price)}
									</Text>
									<View className="flex-row space-x-2">
										<View
											className={`px-3 py-1.5 rounded-full ${
												item.status === "confirmed" ||
												item.status === "completed"
													? "bg-green-100"
													: item.status === "cancelled"
													? "bg-red-100"
													: "bg-yellow-100"
											}`}
										>
											<Text
												className={`text-xs font-bold ${
													item.status === "confirmed" ||
													item.status === "completed"
														? "text-green-800"
														: item.status ===
														  "cancelled"
														? "text-red-800"
														: "text-yellow-800"
												}`}
											>
												{item.status}
											</Text>
										</View>
										{(item.status === "confirmed" ||
											item.status === "completed") &&
											!item.is_reviewed && (
												<TouchableOpacity className="bg-blue-600 px-3 py-1.5 rounded-full">
													<Text className="text-white text-xs font-bold">
														Beri rating
													</Text>
												</TouchableOpacity>
											)}
									</View>
								</View>
							</View>
						))
					) : (
						<Text className="text-gray-500 font-[Outfit_400Regular]">
							Belum ada riwayat pesanan
						</Text>
					)}
				</View>

				<TouchableOpacity
					onPress={handleLogout}
					className="flex-row items-center justify-center p-4 mb-6"
				>
					<LogOut size={20} color="#DC2626" className="mr-2" />
					<Text className="text-red-600 font-bold">
						Keluar Aplikasi
					</Text>
				</TouchableOpacity>
			</ScrollView>
		</View>
	);
};

// Komponen Kecil untuk Profile Field
const ProfileField = ({ label, value, isLast }: any) => (
	<View className={`border-b border-white/20 pb-3 ${!isLast ? "mb-3" : ""}`}>
		<Text className="text-white/80 text-xs mb-1 font-[Outfit_400Regular]">
			{label}
		</Text>
		<View className="flex-row justify-between items-center">
			<Text className="text-white text-base font-[Outfit_500Medium]">
				{value}
			</Text>
			<Check size={16} color="white" />
		</View>
	</View>
);

export default ProfileScreen;
