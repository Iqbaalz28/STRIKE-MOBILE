import React, { useEffect, useState } from "react";
import {
	View,
	Text,
	FlatList,
	TextInput,
	Image,
	TouchableOpacity,
	ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Search, MapPin, Star } from "lucide-react-native";
import api from "@/services/api";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { getImageUrl } from "@/utils/imageHelper";

const LocationListScreen = () => {
	const navigation = useNavigation<NativeStackNavigationProp<any>>();
	const [locations, setLocations] = useState([]);
	const [loading, setLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState("");

	useEffect(() => {
		fetchLocations();
	}, []);

	const fetchLocations = async () => {
		try {
			const res = await api.getLocations();

			setLocations(res.data);
		} catch (error) {
			console.log("Gagal load lokasi:", error);
		} finally {
			setLoading(false);
		}
	};

	const filteredLocations = locations.filter(
		(loc: any) =>
			(loc.name || "")
				.toLowerCase()
				.includes(searchQuery.toLowerCase()) ||
			(loc.city || "").toLowerCase().includes(searchQuery.toLowerCase()),
	);

	const renderItem = ({ item }: { item: any }) => {
		// LOGIC PENENTUAN GAMBAR YANG LEBIH KUAT
		// Kita cek semua kemungkinan nama field yang umum
		const imgPath =
			item.image ||
			item.img ||
			item.location_img ||
			item.photo ||
			item.picture ||
			"";

		return (
			<TouchableOpacity
				onPress={() =>
					navigation.navigate("LocationDetail", { id: item.id })
				}
				className="bg-white rounded-2xl mb-4 shadow-sm border border-gray-100 overflow-hidden"
			>
				<Image
					source={{ uri: getImageUrl(imgPath) }}
					className="w-full h-48 bg-gray-200"
					resizeMode="cover"
				/>
				<View className="p-4">
					<View className="flex-row justify-between items-start mb-1">
						<Text className="text-lg font-outfit-bold text-gray-900 flex-1 mr-2 font-outfit-bold">
							{item.name}
						</Text>
						<View className="flex-row items-center bg-yellow-50 px-2 py-1 rounded-lg">
							<Star size={14} fill="#FBBF24" color="#FBBF24" />
							<Text className="ml-1 text-xs font-outfit-bold text-yellow-700">
								{Number(item.rating_average || 0).toFixed(1)}
							</Text>
							<Text className="ml-1 text-xs text-gray-500">
								({item.total_reviews || 0})
							</Text>
						</View>
					</View>

					<View className="flex-row items-center mb-3">
						<MapPin size={14} color="#6B7280" />
						<Text
							className="text-gray-500 text-sm ml-1"
							numberOfLines={1}
						>
							{item.address ||
								item.city ||
								"Lokasi tidak tersedia"}
						</Text>
					</View>

					<View className="flex-row justify-between items-center border-t border-gray-50 pt-3">
						<Text className="text-gray-400 text-xs">
							Mulai dari
						</Text>
						<Text className="text-blue-600 font-outfit-bold text-base">
							Rp{" "}
							{Number(item.price_per_hour || 0).toLocaleString(
								"id-ID",
							)}
							<Text className="text-xs font-normal text-gray-500">
								{" "}
								/jam
							</Text>
						</Text>
					</View>
				</View>
			</TouchableOpacity>
		);
	};

	return (
		<View className="flex-1 bg-gray-50 pt-12 px-5">
			{/* Header */}
			<Text className="text-2xl font-outfit-bold text-gray-900 mb-4 font-outfit-bold">
				Cari Spot Mancing
			</Text>

			{/* Search Bar */}
			<View className="flex-row items-center bg-white border border-gray-200 rounded-xl px-4 py-3 mb-6 shadow-sm">
				<Search size={20} color="#9CA3AF" />
				<TextInput
					placeholder="Cari nama kolam atau kota..."
					className="flex-1 ml-2 text-gray-800"
					value={searchQuery}
					onChangeText={setSearchQuery}
				/>
			</View>

			{/* List */}
			{loading ? (
				<ActivityIndicator size="large" color="#2563EB" />
			) : (
				<FlatList
					data={filteredLocations}
					keyExtractor={(item: any) => item.id.toString()}
					renderItem={renderItem}
					showsVerticalScrollIndicator={false}
					contentContainerStyle={{ paddingBottom: 100 }}
					ListEmptyComponent={
						<Text className="text-center text-gray-400 mt-10">
							Lokasi tidak ditemukan.
						</Text>
					}
				/>
			)}
		</View>
	);
};

export default LocationListScreen;
