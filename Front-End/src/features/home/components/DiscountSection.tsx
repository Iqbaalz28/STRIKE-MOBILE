import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
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
				{discounts.slice(0, 3).map((item, index) => (
					<TouchableOpacity
						key={item.id || index}
						className="bg-blue-600 rounded-2xl p-4 mb-3 overflow-hidden shadow-sm"
						activeOpacity={0.8}
					>
                        {/* Decorative Circle */}
                        <View className="absolute -right-6 -bottom-6 w-24 h-24 bg-blue-500 rounded-full opacity-40" />

						<View className="flex-row items-center justify-between">
							<View>
								<Text className="text-blue-100 text-xs mb-1 font-[Outfit_400Regular]">
									Voucher Spesial
								</Text>
                                {/* Discount Value (Nama Kupon) */}
								<Text className="text-white text-3xl font-bold font-[Outfit_700Bold]">
									{item.discount_value} OFF
								</Text>
                                
                                {/* Coupon Code */}
								<View className="flex-row items-center mt-2 bg-blue-800/40 px-3 py-1.5 rounded-lg self-start border border-blue-400/30">
									<Text className="text-blue-200 text-[10px] mr-2">KODE:</Text>
									<Text className="text-white font-bold tracking-widest text-sm font-mono">
										{item.code}
									</Text>
								</View>
							</View>
							
							<View className="bg-white/20 h-10 w-10 rounded-full items-center justify-center">
								<Text className="text-white font-bold text-lg">→</Text>
							</View>
						</View>
					</TouchableOpacity>
				))}
			</View>
		</View>
	);
};

export default DiscountSection;
