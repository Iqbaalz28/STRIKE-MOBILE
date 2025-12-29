import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Image } from "react-native";
import { Calendar, MapPin, ArrowRight } from "lucide-react-native";
import api from "@/services/api";

const EventSection = () => {
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

	// Helper tanggal sederhana
	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleDateString("id-ID", {
			day: "numeric",
			month: "short",
		});
	};

	return (
		<View className="py-8 bg-white">
			<View className="px-4 mb-6 flex-row items-center justify-between">
				<Text className="text-xl font-bold text-gray-900 font-[Outfit_700Bold]">
					Event Komunitas
				</Text>
				<TouchableOpacity className="flex-row items-center">
					<Text className="text-blue-600 text-sm font-bold mr-1">
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
				{events.map((event, index) => (
					<TouchableOpacity
						key={event.id || index}
						className="w-64 bg-white rounded-2xl shadow-md shadow-gray-200 border border-gray-100 overflow-hidden"
					>
						{/* Gambar Event (Placeholder jika null) */}
						<Image
							source={{
								uri:
									event.image ||
									"https://placehold.co/600x400/1e293b/FFF?text=Event",
							}}
							className="w-full h-32 object-cover"
						/>

						<View className="p-4">
							{/* Badge Tanggal */}
							<View className="absolute top-[-20px] right-4 bg-white shadow-sm p-2 rounded-xl items-center min-w-[50px]">
								<Text className="text-xs text-gray-500 font-bold uppercase">
									{new Date(event.date).toLocaleDateString(
										"id-ID",
										{
											month: "short",
										},
									)}
								</Text>
								<Text className="text-lg font-bold text-blue-600">
									{new Date(event.date).getDate()}
								</Text>
							</View>

							<Text
								className="text-lg font-bold text-gray-900 mb-1 mt-1 font-[Outfit_700Bold]"
								numberOfLines={1}
							>
								{event.title}
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
								<Text className="text-green-600 font-bold text-sm">
									{event.price === 0
										? "GRATIS"
										: `Rp ${event.price?.toLocaleString("id-ID")}`}
								</Text>
								<View className="bg-blue-50 px-3 py-1 rounded-full">
									<Text className="text-blue-600 text-xs font-bold">
										Gabung
									</Text>
								</View>
							</View>
						</View>
					</TouchableOpacity>
				))}
			</ScrollView>
		</View>
	);
};

export default EventSection;
