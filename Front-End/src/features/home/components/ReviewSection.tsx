import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, Image } from "react-native";
import { Star, Quote } from "lucide-react-native";
import api from "@/services/api";

const ReviewSection = () => {
	const [reviews, setReviews] = useState([]);

	useEffect(() => {
		fetchReviews();
	}, []);

	const fetchReviews = async () => {
		try {
			const res = await api.getPublicReviews();
			setReviews(res.data);
		} catch (error) {
			// Dummy data jika API kosong
			setReviews([
				{
					id: 1,
					name: "Budi Santoso",
					comment: "Tempat mancing terbaik di Bandung!",
					rating: 5,
				},
				{
					id: 2,
					name: "Asep Surasep",
					comment: "Fasilitas lengkap, toilet bersih.",
					rating: 4.5,
				},
				{
					id: 3,
					name: "Deni Cagur",
					comment: "Ikan mas-nya besar-besar mantap.",
					rating: 5,
				},
			] as any);
		}
	};

	return (
		<View className="mb-8">
			<View className="px-5 mb-4">
				<Text className="text-xl font-bold text-gray-900 font-[Outfit_700Bold]">
					Kata Mereka
				</Text>
				<Text className="text-gray-500 text-sm">
					Pengalaman seru dari komunitas Strike It
				</Text>
			</View>

			<ScrollView
				horizontal
				showsHorizontalScrollIndicator={false}
				contentContainerStyle={{
					paddingHorizontal: 20,
					paddingRight: 10,
				}}
			>
				{reviews.map((item: any) => (
					<View
						key={item.id}
						className="w-72 bg-white p-5 rounded-2xl mr-4 border border-gray-100 shadow-sm"
					>
						<Quote
							size={24}
							color="#DBEAFE"
							className="absolute top-4 right-4"
						/>

						<View className="flex-row items-center mb-3">
							<Image
								source={{
									uri: `https://ui-avatars.com/api/?name=${item.name}&background=random`,
								}}
								className="w-10 h-10 rounded-full bg-gray-200"
							/>
							<View className="ml-3">
								<Text className="font-bold text-gray-900">
									{item.name}
								</Text>
								<View className="flex-row">
									{[...Array(5)].map((_, i) => (
										<Star
											key={i}
											size={12}
											fill={
												i < Math.floor(item.rating)
													? "#FBBF24"
													: "#E5E7EB"
											}
											color={
												i < Math.floor(item.rating)
													? "#FBBF24"
													: "transparent"
											}
										/>
									))}
								</View>
							</View>
						</View>

						<Text
							className="text-gray-600 leading-relaxed italic"
							numberOfLines={3}
						>
							"{item.comment}"
						</Text>
					</View>
				))}
			</ScrollView>
		</View>
	);
};

export default ReviewSection;
