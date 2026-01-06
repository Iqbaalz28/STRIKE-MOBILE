import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as Clipboard from "expo-clipboard";
import { Copy } from "lucide-react-native";
import { RootStackParamList } from "@/navigation/types";
import api from "@/services/api";

const DiscountSection = () => {
	const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
	const [discounts, setDiscounts] = useState<any[]>([]);

	const handleCopyCode = async (code: string) => {
		await Clipboard.setStringAsync(code);
		Alert.alert("Berhasil", "Kode kupon berhasil disalin!");
	};
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
				<Text className="text-xl font-outfit-bold text-gray-900 font-outfit-bold">
					Kupon Aktif
				</Text>
				<TouchableOpacity onPress={() => navigation.navigate("CouponList")}>
					<Text className="text-blue-600 text-sm font-outfit-bold">
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
						onPress={() => handleCopyCode(item.code)}
					>
						{/* Decorative Circle */}
						<View className="absolute -right-6 -bottom-6 w-24 h-24 bg-blue-500 rounded-full opacity-40" />

						<View className="flex-row items-center justify-between">
							<View>
								<Text className="text-blue-100 text-xs mb-1 font-outfit">
									Voucher Spesial
								</Text>
								{/* Discount Value (Nama Kupon) */}
								<Text className="text-white text-3xl font-outfit-bold font-outfit-bold">
									{item.discount_value} OFF
								</Text>

								{/* Coupon Code */}
								<View className="flex-row items-center mt-2 bg-blue-800/40 px-3 py-1.5 rounded-lg self-start border border-blue-400/30">
									<Text className="text-blue-200 text-[10px] mr-2">KODE:</Text>
									<Text className="text-white font-outfit-bold tracking-widest text-sm font-mono">
										{item.code}
									</Text>
								</View>
							</View>

							<View className="bg-white/20 h-10 w-10 rounded-full items-center justify-center">
								<Copy size={20} color="white" />
							</View>
						</View>
					</TouchableOpacity>
				))}
			</View>
		</View>
	);
};

export default DiscountSection;
