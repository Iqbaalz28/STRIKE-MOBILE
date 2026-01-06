import React, { useEffect, useState } from "react";
import {
	View,
	Text,
	ScrollView,
	TouchableOpacity,
	ActivityIndicator,
	Alert,
	StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, CheckCircle2, ShieldCheck } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import api from "../../services/api";
import { formatRupiah } from "../../utils/format";

interface Membership {
	id: number;
	name: string;
	description: string;
	price_per_month: number;
	benefits: string;
    is_popular?: boolean;
}

const MembershipScreen = () => {
	const navigation = useNavigation();
	const [memberships, setMemberships] = useState<Membership[]>([]);
	const [loading, setLoading] = useState(true);
	const [processingId, setProcessingId] = useState<number | null>(null);

	useEffect(() => {
		fetchMemberships();
	}, []);

	const fetchMemberships = async () => {
		try {
			const res = await api.getMemberships();
			setMemberships(res.data);
		} catch (error) {
			console.error("Gagal memuat membership", error);
			Alert.alert("Error", "Gagal memuat data membership");
		} finally {
			setLoading(false);
		}
	};

	const handleUpgrade = async (membership: Membership) => {
		Alert.alert(
			"Konfirmasi Upgrade",
			`Apakah Anda yakin ingin upgrade ke ${membership.name} seharga ${formatRupiah(membership.price_per_month)}?`,
			[
				{ text: "Batal", style: "cancel" },
				{
					text: "Ya, Upgrade",
					onPress: async () => {
						setProcessingId(membership.id);
						try {
							await api.upgradeMembership(membership.id);
							Alert.alert("Berhasil", `Selamat! Anda sekarang adalah member ${membership.name}.`);
							navigation.goBack();
						} catch (error: any) {
							console.error("Upgrade gagal", error);
							const msg = error.response?.data?.message || "Terjadi kesalahan saat upgrade.";
							Alert.alert("Gagal", msg);
						} finally {
							setProcessingId(null);
						}
					},
				},
			]
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
			<StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

			{/* Header */}
			<View className="flex-row items-center px-5 py-4 bg-white border-b border-gray-100">
				<TouchableOpacity onPress={() => navigation.goBack()} className="mr-3">
					<ArrowLeft size={24} color="#374151" />
				</TouchableOpacity>
				<Text className="text-xl font-bold text-gray-900">Pilih Membership</Text>
			</View>

			<ScrollView contentContainerStyle={{ padding: 20 }}>
				<Text className="text-center text-gray-500 mb-6">
					Nikmati fitur eksklusif dan potongan harga dengan upgrade membership Anda.
				</Text>

				{memberships.map((item) => {
					// Parse benefits (assuming newline separated or just text)
					// If DB returns a string with newlines, we can split it.
                    // Based on SQL dump: benefits is text.
					const benefitList = item.benefits 
                        ? item.benefits.split('\n').filter(b => b.trim() !== '')
                        : [];

					return (
						<View
							key={item.id}
							className={`bg-white rounded-2xl p-5 mb-5 shadow-sm border ${
								item.is_popular ? "border-blue-500 border-2" : "border-gray-200"
							}`}
						>
                            {!!item.is_popular && (
                                <View className="absolute top-0 right-0 bg-blue-600 px-3 py-1 rounded-bl-xl rounded-tr-lg">
                                    <Text className="text-white text-xs font-bold">Terpopuler</Text>
                                </View>
                            )}

							<View className="mb-4">
								<Text className="text-xl font-bold text-gray-900 mb-1">{item.name}</Text>
								<Text className="text-gray-500 text-sm">{item.description}</Text>
							</View>

							<View className="mb-6 flex-row items-baseline">
								<Text className="text-2xl font-bold text-blue-600">
									{formatRupiah(item.price_per_month)}
								</Text>
								<Text className="text-gray-400 text-sm ml-1">/bulan</Text>
							</View>

                            <View className="w-full h-px bg-gray-100 mb-4" />

							<View className="mb-6">
								{benefitList.map((benefit, idx) => (
									<View key={idx} className="flex-row items-center mb-2">
										<CheckCircle2 size={16} color="#16A34A" className="mr-2" />
										<Text className="text-gray-600 flex-1 text-sm">{benefit}</Text>
									</View>
								))}
							</View>

							<TouchableOpacity
								onPress={() => handleUpgrade(item)}
								disabled={processingId === item.id}
								className={`${
									item.is_popular ? "bg-blue-600" : "bg-gray-900"
								} py-3 rounded-xl items-center flex-row justify-center`}
							>
								{processingId === item.id ? (
									<ActivityIndicator color="white" size="small" />
								) : (
									<View className="flex-row items-center">
										<ShieldCheck size={18} color="white" style={{ marginRight: 8 }} />
										<Text className="text-white font-bold">Pilih Paket ini</Text>
									</View>
								)}
							</TouchableOpacity>
						</View>
					);
				})}
			</ScrollView>
		</SafeAreaView>
	);
};

export default MembershipScreen;
