import React, { useEffect, useState } from "react";
import {
	View,
	Text,
	Image,
	TouchableOpacity,
	ScrollView,
	ActivityIndicator,
	Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import api from "@/services/api";

const LocationPreview = () => {
	const navigation = useNavigation<any>();

	// State
	const [locations, setLocations] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);

	// Fetch Data
	useEffect(() => {
		const fetchLocations = async () => {
			try {
				const res = await api.getLocations();
				setLocations(res.data);
			} catch (error) {
				console.error("Gagal mengambil lokasi:", error);
			} finally {
				setLoading(false);
			}
		};
		fetchLocations();
	}, []);

	// Helper: Fix Image URL
	const getImageUrl = (img: string) => {
		if (!img)
			return "https://placehold.co/800x400/9CA3AF/FFFFFF?text=No+Image";
		if (img.startsWith("http")) return img;
		// Android Emulator butuh IP 10.0.2.2, API Service sudah handle BASE_URL
		// Kita anggap img hanya path filename
		const cleanPath = img.startsWith("/") ? img.substring(1) : img;
		return `http://10.0.2.2:3000/uploads/${cleanPath}`;
	};

	if (loading) {
		return (
			<View className="p-10">
				<ActivityIndicator size="large" color="#2563EB" />
			</View>
		);
	}

	if (locations.length === 0) {
		return null; // Atau tampilkan pesan kosong
	}

	return (
		<View className="mb-6">
			{/* Header Text */}
			<View className="px-5 mb-4 flex-row items-center justify-between">
				<Text className="text-xl font-bold text-gray-900 font-[Outfit_700Bold]">
					Semua Lokasi
				</Text>
				<TouchableOpacity
					onPress={() =>
						navigation.navigate("MainTab", {
							screen: "Booking",
						})
					}
				>
					<Text className="text-blue-600 text-sm font-bold">
						Lihat Semua &gt;
					</Text>
				</TouchableOpacity>
			</View>

			{/* Horizontal Scroll Cards */}
			<ScrollView
				horizontal
				showsHorizontalScrollIndicator={false}
				contentContainerStyle={{ paddingHorizontal: 20, gap: 16 }}
			>
				{locations.map((location, index) => (
					<TouchableOpacity
						key={location.id || index}
						onPress={() =>
							navigation.navigate("MainTab", {
								screen: "Booking",
							})
						}
						className="w-40"
					>
						<View className="bg-white rounded-2xl shadow-md overflow-hidden">
							<Image
								source={{
									uri: getImageUrl(location?.img),
								}}
								className="w-full h-32"
								resizeMode="cover"
							/>
							<View className="p-3">
								<Text
									className="font-bold text-gray-900 text-base mb-1 font-[Outfit_700Bold]"
									numberOfLines={1}
								>
									{location?.city}
								</Text>
								<Text
									className="text-gray-500 text-xs"
									numberOfLines={1}
								>
									{location?.name}
								</Text>
							</View>
						</View>
					</TouchableOpacity>
				))}
			</ScrollView>
		</View>
	);
};

export default LocationPreview;
