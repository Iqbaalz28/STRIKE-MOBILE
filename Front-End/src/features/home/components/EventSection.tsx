import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Image } from "react-native";
import { MapPin, ArrowRight } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import api from "@/services/api";
import { getImageUrl } from "@/utils/imageHelper";

const EventSection = () => {
	const navigation = useNavigation<any>();
	const [events, setEvents] = useState<any[]>([]);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const res = await api.getEvents();
				setEvents(res.data);
			} catch (error) {
				console.log("Error fetching events", error);
			}
		};
		fetchData();
	}, []);

	if (events.length === 0) return null;

	// Helper Date Safe
	const parseDate = (dateString: string) => {
		if (!dateString) return new Date();
		const safeDate = dateString.replace(" ", "T");
		const date = new Date(safeDate);
		return isNaN(date.getTime()) ? new Date() : date;
	};

	// Fungsi Navigasi ke Tab Event
	const goToEventTab = () => {
		navigation.navigate("MainTab", { screen: "Event" });
	};

	return (
		<View className="py-8 bg-white">
			<View className="px-4 mb-6 flex-row items-center justify-between">
				<Text className="text-xl font-outfit-bold text-gray-900 font-outfit-bold">
					Event Komunitas
				</Text>
				<TouchableOpacity
					onPress={goToEventTab}
					className="flex-row items-center"
				>
					<Text className="text-blue-600 text-sm font-outfit-bold mr-1">
						Lihat Semua
					</Text>
					<ArrowRight size={16} color="#2563EB" />
				</TouchableOpacity>
			</View>

			<ScrollView
				horizontal
				showsHorizontalScrollIndicator={false}
				contentContainerStyle={{ paddingHorizontal: 16, gap: 16 }}
			>
				{events.map((event, index) => {
					const eventDate = parseDate(event.date);
					const price = Number(event.price || 0);

					return (
						<TouchableOpacity
							key={event.id || index}
							onPress={goToEventTab}
							className="w-64 bg-white rounded-2xl shadow-md shadow-gray-200 border border-gray-100 overflow-hidden"
						>
							<Image
								source={{
									uri: getImageUrl(event.image || event.img),
								}}
								className="w-full h-32 object-cover bg-gray-200"
							/>

							<View className="p-4">
								<View className="absolute top-[-20px] right-4 bg-white shadow-sm p-2 rounded-xl items-center min-w-[50px]">
									<Text className="text-xs text-gray-500 font-outfit-bold uppercase">
										{eventDate.toLocaleDateString("id-ID", {
											month: "short",
										})}
									</Text>
									<Text className="text-lg font-outfit-bold text-blue-600">
										{eventDate.getDate()}
									</Text>
								</View>

								<Text
									className="text-lg font-outfit-bold text-gray-900 mb-1 mt-1 font-outfit-bold"
									numberOfLines={1}
								>
									{event.name || event.title}
								</Text>

								<View className="flex-row items-center mb-3">
									<MapPin size={14} color="#9CA3AF" />
									<Text
										className="text-gray-500 text-xs ml-1"
										numberOfLines={1}
									>
										{event.location ||
											"Lokasi belum ditentukan"}
									</Text>
								</View>

								<View className="flex-row items-center justify-between mt-2">
									<Text className="text-green-600 font-outfit-bold text-sm">
										{price === 0
											? "GRATIS"
											: `Rp ${price.toLocaleString("id-ID")}`}
									</Text>
									<View className="bg-blue-50 px-3 py-1 rounded-full">
										<Text className="text-blue-600 text-xs font-outfit-bold">
											Gabung
										</Text>
									</View>
								</View>
							</View>
						</TouchableOpacity>
					);
				})}
			</ScrollView>
		</View>
	);
};

export default EventSection;
