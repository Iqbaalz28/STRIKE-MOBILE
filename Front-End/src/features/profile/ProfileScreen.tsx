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
} from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "@/services/api";

const ProfileScreen = () => {
	const navigation = useNavigation<any>();
	const [user, setUser] = useState<any>(null);
	const [loading, setLoading] = useState(true);

	// Ganti useEffect dengan useFocusEffect agar data refresh tiap kali tab dibuka
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
				// Jika ada data di storage, pakai itu dulu biar cepat
				setUser(JSON.parse(userData));

				// (Opsional) Refresh data dari API di background
				fetchProfileFromAPI();
			} else {
				// Jika tidak ada token, berarti Guest
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
			const res = await api.getMyProfile();
			setUser(res.data);
			// Update data terbaru ke storage
			await AsyncStorage.setItem("user", JSON.stringify(res.data));
		} catch (error) {
			// Token mungkin expired, biarkan user tetap login dengan data lama atau logout paksa
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
						await AsyncStorage.multiRemove(["token", "user"]);
						setUser(null);

						// Reset navigasi ke Auth Stack
						navigation.dispatch(
							CommonActions.reset({
								index: 0,
								routes: [{ name: "Auth" }],
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
		// Ganti IP sesuai environment (10.0.2.2 untuk emulator Android)
		return `http://10.0.2.2:3000/uploads/${path}`;
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
						// Reset ke Auth Stack agar bisa login/register
						navigation.dispatch(
							CommonActions.reset({
								index: 0,
								routes: [{ name: "Auth" }],
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
		<View className="flex-1 bg-gray-50">
			<ScrollView showsVerticalScrollIndicator={false}>
				{/* Header Profile */}
				<View className="bg-white p-6 items-center border-b border-gray-100 pt-16 rounded-b-[40px] shadow-sm mb-6">
					<Image
						source={{ uri: getAvatar(user?.avatar) }}
						className="w-24 h-24 rounded-full border-4 border-blue-50 mb-3"
					/>
					<Text className="text-2xl font-bold text-gray-900 font-[Outfit_700Bold] mb-1">
						{user?.name}
					</Text>
					<Text className="text-gray-500 font-[Outfit_400Regular]">
						{user?.email}
					</Text>

					<TouchableOpacity className="mt-4 px-6 py-2 bg-blue-100 rounded-full">
						<Text className="text-blue-700 font-bold text-xs uppercase tracking-wide">
							{user?.membership_name || "Free Member"}
						</Text>
					</TouchableOpacity>
				</View>

				{/* Menu Options */}
				<View className="px-5 pb-10">
					<Text className="text-gray-500 font-bold mb-3 ml-1 uppercase text-xs tracking-wider">
						Akun Saya
					</Text>

					<MenuItem
						icon={<User size={20} color="#4B5563" />}
						label="Edit Profil"
						onPress={() =>
							// Pastikan route 'EditProfile' ada di RootNavigator
							navigation.navigate("EditProfile")
						}
					/>

					<MenuItem
						icon={<Clock size={20} color="#4B5563" />}
						label="Riwayat Pesanan"
						onPress={() => navigation.navigate("History")}
					/>

					<Text className="text-gray-500 font-bold mb-3 ml-1 mt-6 uppercase text-xs tracking-wider">
						Lainnya
					</Text>

					<MenuItem
						icon={<Info size={20} color="#4B5563" />}
						label="Tentang Aplikasi"
						onPress={() => navigation.navigate("About")}
					/>

					<MenuItem
						icon={<Settings size={20} color="#4B5563" />}
						label="Pengaturan"
						onPress={() =>
							Alert.alert("Info", "Versi 1.0.0 (Beta)")
						}
					/>

					<MenuItem
						icon={<HelpCircle size={20} color="#4B5563" />}
						label="Bantuan & Dukungan"
						onPress={() => {}}
					/>

					<TouchableOpacity
						onPress={handleLogout}
						className="flex-row items-center bg-white p-4 rounded-2xl border border-red-100 mt-6 active:bg-red-50"
					>
						<View className="bg-red-50 p-2 rounded-lg mr-4">
							<LogOut size={20} color="#DC2626" />
						</View>
						<Text className="flex-1 text-base font-bold text-red-600">
							Keluar
						</Text>
					</TouchableOpacity>
				</View>
			</ScrollView>
		</View>
	);
};

// Komponen Kecil untuk Menu Item
const MenuItem = ({ icon, label, onPress }: any) => (
	<TouchableOpacity
		onPress={onPress}
		className="flex-row items-center bg-white p-4 rounded-2xl border border-gray-100 mb-3 shadow-sm active:bg-gray-50"
	>
		<View className="bg-gray-50 p-2 rounded-lg mr-4">{icon}</View>
		<Text className="flex-1 text-base font-medium text-gray-800 font-[Outfit_500Medium]">
			{label}
		</Text>
		<ChevronRight size={20} color="#D1D5DB" />
	</TouchableOpacity>
);

export default ProfileScreen;
