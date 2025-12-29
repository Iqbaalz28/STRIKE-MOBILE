import React, { useEffect, useState } from "react";
import {
	View,
	Text,
	TouchableOpacity,
	ActivityIndicator,
} from "react-native";
import api from "@/services/api";

const DiscountSection = () => {
	const [discounts, setDiscounts] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const res = await api.getDiscounts();
				setDiscounts(res.data);
			} catch (error) {
				console.log("Error fetching discounts", error);
			} finally {
				setLoading(false);
			}
		};
		fetchData();
	}, []);

	if (loading)
		return (
			<ActivityIndicator size="small" color="#2563EB" className="my-4" />
		);
	if (discounts.length === 0) return null;

	return (
		<View className="mb-6">
			<View className="px-5 mb-4 flex-row items-center justify-between">
				<Text className="text-xl font-bold text-gray-900 font-[Outfit_700Bold]">
					Kupon Aktif
				</Text>
				<TouchableOpacity>
					<Text className="text-blue-600 text-sm font-bold">
						Lihat Semua &gt;
					</Text>
				</TouchableOpacity>
			</View>

			<View className="px-5">
				{discounts.slice(0, 2).map((item, index) => (
					<TouchableOpacity
						key={item.id || index}
						className="bg-blue-600 rounded-2xl p-5 mb-3 flex-row items-center justify-between"
					>
						<View>
							<Text className="text-blue-100 text-xs mb-1">
								Diskon
							</Text>
							<Text className="text-white text-3xl font-bold font-[Outfit_700Bold]">
								{item.percentage || 10}%
							</Text>
						</View>
						<View className="bg-white/20 p-2 rounded-full">
							<Text className="text-white font-bold">→</Text>
						</View>
					</TouchableOpacity>
				))}
			</View>
		</View>
	);
};

export default DiscountSection;
