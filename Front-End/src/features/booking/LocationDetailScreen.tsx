import React, { useEffect, useState } from "react";
import {
	View,
	Text,
	Image,
	ScrollView,
	TouchableOpacity,
	ActivityIndicator,
	Dimensions,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { ArrowLeft, MapPin, CheckCircle, Star } from "lucide-react-native";
import api from "@/services/api";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import ReviewList from "./components/ReviewList";
import LocationMapCard from "./components/LocationMapCard";
import { getImageUrl } from "@/utils/imageHelper";

const { width } = Dimensions.get("window");

const LocationDetailScreen = () => {
	const route = useRoute<any>();
	const navigation = useNavigation<NativeStackNavigationProp<any>>();
	const { id } = route.params;

	const [location, setLocation] = useState<any>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		fetchDetail();
	}, [id]);

	const fetchDetail = async () => {
		try {
			const res = await api.getLocationDetail(id);
			setLocation(res.data);
		} catch (error) {
			console.log("Error load detail lokasi:", error);
		} finally {
			setLoading(false);
		}
	};

	if (loading || !location)
		return (
			<View className="flex-1 justify-center">
				<ActivityIndicator size="large" color="#2563EB" />
			</View>
		);

	return (
		<View className="flex-1 bg-white">
			<ScrollView
				showsVerticalScrollIndicator={false}
				contentContainerStyle={{ paddingBottom: 100 }}
			>
				{/* Image Header */}
				<View className="relative">
					<Image
						source={{
							uri: getImageUrl(location.image || location.img),
						}}
						style={{ width: width, height: 300 }}
						resizeMode="cover"
					/>
					<TouchableOpacity
						onPress={() => navigation.goBack()}
						className="absolute top-12 left-5 bg-white/80 p-2 rounded-full"
					>
						<ArrowLeft size={24} color="black" />
					</TouchableOpacity>
				</View>

				{/* Content */}
				<View className="px-5 py-6 -mt-6 bg-white rounded-t-3xl">
					<View className="flex-row justify-between items-start mb-2">
						<Text className="text-2xl font-bold text-gray-900 flex-1 font-[Outfit_700Bold]">
							{location.name}
						</Text>
						<View className="flex-row items-center bg-yellow-50 px-2 py-1 rounded-lg">
							<Star size={16} fill="#FBBF24" color="#FBBF24" />
							<Text className="ml-1 font-bold text-yellow-700">
								4.8
							</Text>
						</View>
					</View>

					<View className="flex-row items-center mb-6">
						<MapPin size={16} color="#6B7280" />
						<Text className="text-gray-500 ml-2">
							{location.address}, {location.city}
						</Text>
					</View>

					<View className="h-[1px] bg-gray-100 mb-6" />

					{/* Description */}
					<Text className="font-bold text-lg text-gray-900 mb-2">
						Deskripsi
					</Text>
					<Text className="text-gray-600 leading-relaxed mb-6">
						{location.description ||
							"Nikmati pengalaman memancing yang menenangkan di lokasi kami dengan fasilitas lengkap dan pemandangan asri."}
					</Text>

					{/* Fasilitas */}
					<Text className="font-bold text-lg text-gray-900 mb-3">
						Fasilitas
					</Text>
					<View className="flex-row flex-wrap gap-3 mb-6">
						{[
							"Toilet",
							"Kantin",
							"Parkir Luas",
							"Mushola",
							"Sewa Alat",
						].map((f, i) => (
							<View
								key={i}
								className="flex-row items-center bg-gray-50 px-3 py-2 rounded-lg border border-gray-100"
							>
								<CheckCircle size={14} color="#2563EB" />
								<Text className="ml-2 text-gray-600 text-sm">
									{f}
								</Text>
							</View>
						))}
					</View>

					<View className="h-[1px] bg-gray-100 mb-6" />

					{/* 1. Map Card */}
					<LocationMapCard
						address={location.address}
						city={location.city}
					/>

					{/* 2. Review List */}
					<ReviewList reviews={location.reviews} />

					{/* Spacer agar tidak tertutup tombol bawah */}
					<View className="h-24" />
				</View>
			</ScrollView>

			{/* Bottom Bar */}
			<View className="absolute bottom-0 w-full bg-white p-5 border-t border-gray-100 shadow-2xl pb-8">
				<View className="flex-row items-center justify-between">
					<View>
						<Text className="text-gray-500 text-xs">
							Harga Tiket
						</Text>
						<Text className="text-2xl font-bold text-blue-600 font-[Outfit_700Bold]">
							Rp{" "}
							{Number(location.price || 50000).toLocaleString(
								"id-ID",
							)}
						</Text>
					</View>
					<TouchableOpacity
						onPress={() =>
							navigation.navigate("BookingForm", {
								locationId: location.id,
								locationName: location.name,
								price: location.price,
							})
						}
						className="bg-blue-600 px-8 py-3.5 rounded-xl shadow-lg shadow-blue-200"
					>
						<Text className="text-white font-bold text-lg">
							Booking Sekarang
						</Text>
					</TouchableOpacity>
				</View>
			</View>
		</View>
	);
};

export default LocationDetailScreen;
