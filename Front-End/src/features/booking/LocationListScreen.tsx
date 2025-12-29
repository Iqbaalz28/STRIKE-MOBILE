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

// Helper URL Gambar
const getImageUrl = (path: string) => {
	if (!path)
		return "https://placehold.co/400x300/e2e8f0/1e293b?text=No+Image";
	if (path.startsWith("http")) return path;
	return `http://10.0.2.2:3000/uploads/${
		path.startsWith("/") ? path.substring(1) : path
	}`;
};

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
			loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			loc.city?.toLowerCase().includes(searchQuery.toLowerCase()),
	);

	const renderItem = ({ item }: { item: any }) => (
		<TouchableOpacity
			onPress={() =>
				navigation.navigate("LocationDetail", { id: item.id })
			}
			className="bg-white rounded-2xl mb-4 shadow-sm border border-gray-100 overflow-hidden"
		>
			<Image
				source={{ uri: getImageUrl(item.image || item.img) }}
				className="w-full h-48 bg-gray-200"
				resizeMode="cover"
			/>
			<div className="p-4">
				<View className="flex-row justify-between items-start mb-1">
					<Text className="text-lg font-bold text-gray-900 flex-1 mr-2 font-[Outfit_700Bold]">
						{item.name}
					</Text>
					<View className="flex-row items-center bg-yellow-50 px-2 py-1 rounded-lg">
						<Star size={14} fill="#FBBF24" color="#FBBF24" />
						<Text className="ml-1 text-xs font-bold text-yellow-700">
							4.8
						</Text>
					</View>
				</View>

				<View className="flex-row items-center mb-3">
					<MapPin size={14} color="#6B7280" />
					<Text
						className="text-gray-500 text-sm ml-1"
						numberOfLines={1}
					>
						{item.address || item.city || "Lokasi tidak tersedia"}
					</Text>
				</View>

				<View className="flex-row justify-between items-center border-t border-gray-50 pt-3">
					<Text className="text-gray-400 text-xs">Mulai dari</Text>
					<Text className="text-blue-600 font-bold text-base">
						Rp {Number(item.price || 50000).toLocaleString("id-ID")}
						<Text className="text-xs font-normal text-gray-500">
							{" "}
							/orang
						</Text>
					</Text>
				</View>
			</div>
		</TouchableOpacity>
	);

	return (
		<View className="flex-1 bg-gray-50 pt-12 px-5">
			{/* Header */}
			<Text className="text-2xl font-bold text-gray-900 mb-4 font-[Outfit_700Bold]">
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
