import React, { useEffect, useState } from "react";
import {
	View,
	Text,
	FlatList,
	Image,
	TouchableOpacity,
	ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { MapPin, ArrowLeft } from "lucide-react-native";
import api from "@/services/api";
import { getImageUrl } from "@/utils/imageHelper";

const EventListScreen = () => {
	const navigation = useNavigation();
	const [events, setEvents] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		fetchEvents();
	}, []);

	const fetchEvents = async () => {
		try {
			const res = await api.getEvents();
			setEvents(res.data);
		} catch (error) {
			console.log("Gagal load events:", error);
		} finally {
			setLoading(false);
		}
	};

	// --- HELPER DATE SAFE (Solusi Error NaN) ---
	const parseDate = (dateString: string) => {
		if (!dateString) return new Date();
		// Ubah spasi menjadi T (YYYY-MM-DD HH:mm:ss -> YYYY-MM-DDTHH:mm:ss)
		const safeDate = dateString.replace(" ", "T");
		const date = new Date(safeDate);
		return isNaN(date.getTime()) ? new Date() : date;
	};

	const renderItem = ({ item }: { item: any }) => {
		const eventDate = parseDate(item.date);
		const price = Number(item.price || 0);

		return (
			<View className="bg-white rounded-2xl mb-6 border border-gray-100 shadow-sm overflow-hidden">
				<Image
					source={{ uri: getImageUrl(item.image || item.img) }}
					className="w-full h-48 bg-gray-200"
					resizeMode="cover"
				/>
				<View className="p-4">
					{/* Badge Tanggal */}
					<View className="absolute -top-8 right-4 bg-white px-3 py-1 rounded-lg shadow-sm items-center">
						<Text className="text-xs font-bold text-red-500 uppercase">
							{eventDate.toLocaleString("id-ID", {
								month: "short",
							})}
						</Text>
						<Text className="text-xl font-bold text-gray-900">
							{eventDate.getDate()}
						</Text>
					</View>

					<Text className="text-blue-600 text-xs font-bold uppercase mb-1">
						{item.status || "Open Registration"}
					</Text>
					<Text className="text-xl font-bold text-gray-900 mb-2 font-[Outfit_700Bold]">
						{item.name || item.title}
					</Text>

					<View className="flex-row items-center mb-2">
						<MapPin size={16} color="#6B7280" />
						<Text className="text-gray-500 ml-2 text-sm">
							{item.location || "Lokasi belum ditentukan"}
						</Text>
					</View>

					<Text
						className="text-gray-600 text-sm leading-relaxed mb-4"
						numberOfLines={2}
					>
						{item.description}
					</Text>

					{/* Harga (Solusi Error undefined) */}
					<Text className="text-lg font-bold text-blue-600 mb-3 font-[Outfit_700Bold]">
						{price === 0
							? "GRATIS"
							: `Rp ${price.toLocaleString("id-ID")}`}
					</Text>

					<TouchableOpacity className="w-full py-3 bg-blue-600 rounded-xl items-center">
						<Text className="text-white font-bold">
							Daftar Sekarang
						</Text>
					</TouchableOpacity>
				</View>
			</View>
		);
	};

	return (
		<View className="flex-1 bg-gray-50">
			{/* Header */}
			<View className="pt-12 pb-4 px-5 bg-white border-b border-gray-100 flex-row items-center gap-3">
				{/* Tombol Back opsional jika di Tab, tapi kita biarkan saja */}
				<TouchableOpacity onPress={() => navigation.goBack()}>
					<ArrowLeft size={24} color="black" />
				</TouchableOpacity>
				<Text className="text-xl font-bold text-gray-900 font-[Outfit_700Bold]">
					Event Kompetisi
				</Text>
			</View>

			{loading ? (
				<ActivityIndicator
					size="large"
					color="#2563EB"
					className="mt-10"
				/>
			) : (
				<FlatList
					data={events}
					keyExtractor={(item: any) => item.id.toString()}
					renderItem={renderItem}
					contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
					ListEmptyComponent={
						<Text className="text-center text-gray-400 mt-10">
							Belum ada event mendatang.
						</Text>
					}
				/>
			)}
		</View>
	);
};

export default EventListScreen;
