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
import { Calendar, MapPin, ArrowLeft } from "lucide-react-native";
import api from "@/services/api";

// Helper URL
const getImageUrl = (path: string) => {
	if (!path) return "https://placehold.co/600x400/e2e8f0/1e293b?text=Event";
	if (path.startsWith("http")) return path;
	return `http://10.0.2.2:3000/uploads/${
		path.startsWith("/") ? path.substring(1) : path
	}`;
};

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

	const renderItem = ({ item }: { item: any }) => (
		<View className="bg-white rounded-2xl mb-6 border border-gray-100 shadow-sm overflow-hidden">
			<Image
				source={{ uri: getImageUrl(item.image || item.img) }}
				className="w-full h-48 bg-gray-200"
				resizeMode="cover"
			/>
			<div className="p-4">
				<View className="absolute -top-8 right-4 bg-white px-3 py-1 rounded-lg shadow-sm items-center">
					<Text className="text-xs font-bold text-red-500 uppercase">
						{new Date(item.date).toLocaleString("default", {
							month: "short",
						})}
					</Text>
					<Text className="text-xl font-bold text-gray-900">
						{new Date(item.date).getDate()}
					</Text>
				</View>

				<Text className="text-blue-600 text-xs font-bold uppercase mb-1">
					{item.status || "Open Registration"}
				</Text>
				<Text className="text-xl font-bold text-gray-900 mb-2 font-[Outfit_700Bold]">
					{item.name}
				</Text>

				<View className="flex-row items-center mb-2">
					<MapPin size={16} color="#6B7280" />
					<Text className="text-gray-500 ml-2 text-sm">
						{item.location || "Kolam Utama"}
					</Text>
				</View>

				<Text
					className="text-gray-600 text-sm leading-relaxed mb-4"
					numberOfLines={2}
				>
					{item.description}
				</Text>

				<TouchableOpacity className="w-full py-3 bg-blue-600 rounded-xl items-center">
					<Text className="text-white font-bold">
						Daftar Sekarang
					</Text>
				</TouchableOpacity>
			</div>
		</View>
	);

	return (
		<View className="flex-1 bg-gray-50">
			<View className="pt-12 pb-4 px-5 bg-white border-b border-gray-100 flex-row items-center gap-3">
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
					contentContainerStyle={{ padding: 20 }}
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
