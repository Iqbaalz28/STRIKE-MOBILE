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
import { MapPin, Star } from "lucide-react-native"; // Opsional: Tambah icon biar cantik
import api from "@/services/api";
import { getImageUrl } from "@/utils/imageHelper";
import { formatRupiah } from "@/utils/format";

const LocationPreview = () => {
	const navigation = useNavigation<any>();

	// State
	const [locations, setLocations] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);

	// Fetch Data
	useEffect(() => {
		const fetchLocations = async () => {
			try {
				// console.log("📍 [LocationPreview] Fetching locations...");
				const res = await api.getLocations();

				if (Array.isArray(res.data)) {
					setLocations(res.data);
				} else {
					console.error(
						"📍 [LocationPreview] Data bukan array!",
						res.data,
					);
					setLocations([]);
				}
			} catch (error: any) {
				console.error("❌ [LocationPreview] Error:", error?.message);
				// Tidak perlu Alert di sini agar Home tidak berisik jika gagal load widget
			} finally {
				setLoading(false);
			}
		};
		fetchLocations();
	}, []);

	// Helper Navigasi ke Detail
	const handlePress = (id: number) => {
		navigation.navigate("MainTab", {
			screen: "BookingStack", // Masuk ke Tab Booking
			params: {
				screen: "LocationDetail", // Masuk ke Screen Detail
				params: { id: id }, // Bawa ID Lokasi
			},
		});
	};

	if (loading) {
		return (
			<View className="p-10 justify-center items-center">
				<ActivityIndicator size="small" color="#2563EB" />
			</View>
		);
	}

	if (locations.length === 0) {
		return null;
	}

	return (
		<View className="mb-8">
			{/* Header Text */}
			<View className="px-5 mb-4 flex-row items-center justify-between">
				<Text className="text-xl font-bold text-gray-900 font-[Outfit_700Bold]">
					Rekomendasi Spot
				</Text>
				<TouchableOpacity
					onPress={() =>
						navigation.navigate("MainTab", {
							screen: "BookingStack", // Perbaikan nama screen
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
				{locations.slice(0, 5).map(
					(
						location,
						index, // Batasi max 5 item di Home
					) => (
						<TouchableOpacity
							key={location.id || index}
							onPress={() => handlePress(location.id)} // Gunakan fungsi navigasi baru
							className="w-48" // Lebar kartu sedikit diperbesar
							activeOpacity={0.8}
						>
							<View className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-56">
								{/* Gambar */}
								<Image
									source={{
										uri: getImageUrl(location?.img),
									}}
									className="w-full h-32 bg-gray-200"
									resizeMode="cover"
								/>

								{/* Info */}
								<View className="p-3 flex-1 justify-between">
									<View>
										{/* Judul: Nama Lokasi (Diperbaiki urutannya) */}
										<Text
											className="font-bold text-gray-900 text-sm mb-1 font-[Outfit_700Bold]"
											numberOfLines={1}
										>
											{location?.name}
										</Text>

										{/* Subjudul: Kota + Icon */}
										<View className="flex-row items-center">
											<MapPin size={12} color="#9CA3AF" />
											<Text
												className="text-gray-500 text-xs ml-1"
												numberOfLines={1}
											>
												{location?.city}
											</Text>
										</View>
									</View>

									{/* Harga (Opsional, agar user langsung tahu range harga) */}
									<Text className="text-blue-600 font-bold text-xs mt-2">
										{formatRupiah(location?.price_per_hour || 0)}
										<Text className="text-gray-400 font-normal">
											{" "}
											/jam
										</Text>
									</Text>
								</View>
							</View>
						</TouchableOpacity>
					),
				)}
			</ScrollView>
		</View>
	);
};

export default LocationPreview;
