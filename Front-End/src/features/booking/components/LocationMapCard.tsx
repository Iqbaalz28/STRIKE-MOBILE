import React from "react";
import {
	View,
	Text,
	Image,
	TouchableOpacity,
	Linking,
	Platform,
} from "react-native";
import { MapPin, ExternalLink } from "lucide-react-native";

const LocationMapCard = ({
	address,
	city,
}: {
	address: string;
	city: string;
}) => {
	const openMaps = () => {
		const query = `${address}, ${city}`;
		const url = Platform.select({
			ios: `maps:0,0?q=${query}`,
			android: `geo:0,0?q=${query}`,
		});
		Linking.openURL(url || "");
	};

	return (
		<View className="mb-6">
			<Text className="font-outfit-bold text-lg text-gray-900 mb-3 font-outfit-bold">
				Lokasi
			</Text>
			<View className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
				{/* Placeholder Map Image */}
				<Image
					source={{
						uri: "https://placehold.co/600x300/png?text=Map+Preview",
					}}
					className="w-full h-40 bg-gray-200"
					resizeMode="cover"
				/>
				<View className="p-4">
					<View className="flex-row items-center mb-2">
						<MapPin size={16} color="#4B5563" />
						<Text className="ml-2 text-gray-700 font-outfit-medium">
							{address}, {city}
						</Text>
					</View>
					<TouchableOpacity
						onPress={openMaps}
						className="mt-2 flex-row items-center justify-center border border-blue-600 py-2 rounded-lg"
					>
						<Text className="text-blue-600 font-outfit-bold mr-2">
							Buka di Google Maps
						</Text>
						<ExternalLink size={16} color="#2563EB" />
					</TouchableOpacity>
				</View>
			</View>
		</View>
	);
};

export default LocationMapCard;
