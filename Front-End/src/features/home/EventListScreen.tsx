import React, { useEffect, useState } from "react";
import {
	View,
	Text,
	FlatList,
	Image,
	TouchableOpacity,
	ActivityIndicator,
	Linking,
	Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Calendar, MapPin, ArrowLeft } from "lucide-react-native";
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

	const handlePressEvent = async (link_url: string) => {
		if (link_url) {
			try {
				const supported = await Linking.canOpenURL(link_url);
				if (supported) {
					await Linking.openURL(link_url);
				} else {
					Alert.alert("Error", "Tidak dapat membuka link event ini.");
				}
			} catch (error) {
				Alert.alert("Error", "Terjadi kesalahan saat membuka link.");
			}
		} else {
			Alert.alert("Info", "Link event belum tersedia.");
		}
	};

	const renderItem = ({ item }: { item: any }) => (
		<TouchableOpacity
			onPress={() => handlePressEvent(item.link_url)}
			className="bg-white rounded-2xl mb-6 shadow-sm overflow-hidden active:opacity-90"
		>
			<Image
				source={{ uri: getImageUrl(item.image || item.img) }}
				className="w-full h-[500px] bg-gray-200"
				resizeMode="cover"
			/>
		</TouchableOpacity>
	);

	return (
		<View className="flex-1 bg-gray-50">
			<View className="pt-12 pb-4 px-5 bg-white border-b border-gray-100 flex-row items-center gap-3">
				<TouchableOpacity onPress={() => navigation.goBack()}>
					<ArrowLeft size={24} color="black" />
				</TouchableOpacity>
				<Text className="text-xl font-outfit-bold text-gray-900 font-outfit-bold">
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
