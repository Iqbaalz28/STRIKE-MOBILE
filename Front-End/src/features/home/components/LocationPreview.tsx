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
import { getImageUrl } from "@/utils/imageHelper";

const LocationPreview = () => {
	const navigation = useNavigation<any>();

	// State
	const [locations, setLocations] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);

	// Fetch Data
	useEffect(() => {
		const fetchLocations = async () => {
			try {
				console.log("📍 [LocationPreview] Fetching locations...");
				const res = await api.getLocations();
				console.log("📍 [LocationPreview] Response:", res);
				console.log("📍 [LocationPreview] Response.data:", res.data);
				console.log("📍 [LocationPreview] Data type:", typeof res.data);
				console.log("📍 [LocationPreview] Is Array:", Array.isArray(res.data));
				
				if (Array.isArray(res.data)) {
					console.log("📍 [LocationPreview] Data length:", res.data.length);
					setLocations(res.data);
				} else {
					console.error("📍 [LocationPreview] Data bukan array!");
					setLocations([]);
				}
			} catch (error: any) {
				console.error("❌ [LocationPreview] Error:", error);
				console.error("❌ [LocationPreview] Error message:", error?.message);
				console.error("❌ [LocationPreview] Error response:", error?.response?.data);
				Alert.alert("Error", `Gagal mengambil lokasi: ${error?.message || "Unknown error"}`);
			} finally {
				setLoading(false);
			}
		};
		fetchLocations();
	}, []);

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
