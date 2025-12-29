import React from "react";
import { View, Text, Image } from "react-native";
import { Star } from "lucide-react-native";

const ReviewList = ({ reviews = [] }: { reviews?: any[] }) => {
	// Dummy data fallback jika reviews kosong
	const data =
		reviews && reviews.length > 0
			? reviews
			: [
					{
						id: 1,
						name: "Ahmad Dani",
						comment: "Tempatnya asik, ikannya banyak!",
						rating: 5,
						date: "2 Hari lalu",
					},
					{
						id: 2,
						name: "Siti Aminah",
						comment: "Toilet bersih, tapi kantin agak mahal.",
						rating: 4,
						date: "1 Minggu lalu",
					},
				];

	return (
		<View className="mb-6">
			<Text className="font-bold text-lg text-gray-900 mb-3 font-[Outfit_700Bold]">
				Ulasan Pengunjung
			</Text>

			{data.map((item: any) => (
				<View
					key={item.id}
					className="bg-white p-4 rounded-xl border border-gray-100 mb-3 shadow-sm"
				>
					<View className="flex-row justify-between items-start mb-2">
						<View className="flex-row items-center">
							<Image
								source={{
									uri: `https://ui-avatars.com/api/?name=${item.name}`,
								}}
								className="w-8 h-8 rounded-full bg-gray-200 mr-2"
							/>
							<View>
								<Text className="font-bold text-gray-800 text-sm">
									{item.name}
								</Text>
								<Text className="text-xs text-gray-400">
									{item.date}
								</Text>
							</View>
						</View>
						<View className="flex-row bg-yellow-50 px-2 py-1 rounded-lg">
							<Star size={12} fill="#FBBF24" color="#FBBF24" />
							<Text className="text-xs font-bold text-yellow-700 ml-1">
								{item.rating}
							</Text>
						</View>
					</View>
					<Text className="text-gray-600 text-sm leading-relaxed">
						"{item.comment}"
					</Text>
				</View>
			))}
		</View>
	);
};

export default ReviewList;
