import React from "react";
import { View, Text } from "react-native";

const PlaceholderSection = ({ title }: { title: string }) => {
	return (
		<View className="py-10 px-4 items-center justify-center border-t border-gray-100 bg-white">
			<Text className="text-gray-400 font-bold text-lg mb-2">
				{title}
			</Text>
			<Text className="text-gray-300 text-center text-sm">
				Konten belum tersedia (Menunggu kode Vue)
			</Text>
		</View>
	);
};

export default PlaceholderSection;
