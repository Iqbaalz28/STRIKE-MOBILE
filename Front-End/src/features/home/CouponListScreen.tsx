import React, { useEffect, useState } from "react";
import {
	View,
	Text,
	FlatList,
	TouchableOpacity,
	ActivityIndicator,
	Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import * as Clipboard from "expo-clipboard";
import { ArrowLeft, Copy } from "lucide-react-native";
import api from "@/services/api";

const CouponListScreen = () => {
	const navigation = useNavigation();
	const [discounts, setDiscounts] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);

	const handleCopyCode = async (code: string) => {
		await Clipboard.setStringAsync(code);
		Alert.alert("Berhasil", "Kode kupon berhasil disalin!");
	};

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

	const renderItem = ({ item, index }: { item: any; index: number }) => {
		const usedCount = item.used_count || 0;
		const maxUsage = item.max_usage || 1;
		const usagePercent = Math.min((usedCount / maxUsage) * 100, 100);
		const isAlmostFull = usagePercent >= 80;

		return (
			<TouchableOpacity
				className="bg-blue-600 rounded-2xl p-4 mb-4 overflow-hidden shadow-sm mx-5"
				activeOpacity={0.8}
				onPress={() => handleCopyCode(item.code)}
			>
				{/* Decorative Circle */}
				<View className="absolute -right-6 -bottom-6 w-24 h-24 bg-blue-500 rounded-full opacity-40" />

				<View className="flex-row items-center justify-between">
					<View className="flex-1">
						<Text className="text-blue-100 text-xs mb-1 font-[Outfit_400Regular]">
							Voucher Spesial
						</Text>
						{/* Discount Value */}
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

						{/* Usage Progress */}
						<View className="mt-3">
							<View className="flex-row justify-between mb-1">
								<Text className={`text-xs ${isAlmostFull ? "text-yellow-300" : "text-blue-200"}`}>
									{usedCount} dari {maxUsage} terpakai
								</Text>
								<Text className={`text-xs font-bold ${isAlmostFull ? "text-yellow-300" : "text-blue-200"}`}>
									{Math.round(usagePercent)}%
								</Text>
							</View>
							<View className="h-1.5 bg-blue-800/50 rounded-full overflow-hidden">
								<View
									className={`h-full rounded-full ${isAlmostFull ? "bg-yellow-400" : "bg-blue-300"}`}
									style={{ width: `${usagePercent}%` }}
								/>
							</View>
						</View>
					</View>

					<View className="bg-white/20 h-10 w-10 rounded-full items-center justify-center ml-3">
						<Copy size={20} color="white" />
					</View>
				</View>
			</TouchableOpacity>
		);
	};

	if (loading) {
		return (
			<View className="flex-1 justify-center items-center bg-white">
				<ActivityIndicator size="large" color="#2563EB" />
			</View>
		);
	}

	return (
		<SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
			{/* Header */}
			<View className="flex-row items-center px-4 py-3 bg-white border-b border-gray-100 mb-2">
				<TouchableOpacity
					onPress={() => navigation.goBack()}
					className="p-2 mr-2"
				>
					<ArrowLeft size={24} color="#1F2937" />
				</TouchableOpacity>
				<Text className="text-xl font-bold text-gray-900 font-[Outfit_700Bold]">
					Semua Kupon
				</Text>
			</View>

			<FlatList
				data={discounts}
				keyExtractor={(item, index) => item.id?.toString() || index.toString()}
				renderItem={renderItem}
				contentContainerStyle={{ paddingVertical: 10 }}
				ListEmptyComponent={
					<View className="items-center justify-center py-10">
						<Text className="text-gray-500 font-[Outfit_400Regular]">
							Tidak ada kupon tersedia saat ini.
						</Text>
					</View>
				}
			/>
		</SafeAreaView>
	);
};

export default CouponListScreen;
