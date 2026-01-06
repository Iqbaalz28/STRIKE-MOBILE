import React, { useEffect, useState, useCallback } from "react";
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
import { ArrowLeft, CheckCircle2, ShieldCheck, XCircle, Crown } from "lucide-react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
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
	const [currentMembership, setCurrentMembership] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);
	const [processingId, setProcessingId] = useState<number | null>(null);
	const [cancelling, setCancelling] = useState(false);

	useFocusEffect(
		useCallback(() => {
			fetchData();
		}, [])
	);

	const fetchData = async () => {
		try {
			const [membershipRes, profileRes] = await Promise.all([
				api.getMemberships(),
				api.getMyProfile().catch(() => ({ data: {} })),
			]);
			setMemberships(membershipRes.data);
			setCurrentMembership(profileRes.data?.membership_name || "Standard");
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
							setCurrentMembership(membership.name);
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

	const handleCancelMembership = () => {
		if (currentMembership === "Standard") {
			Alert.alert("Info", "Anda sudah menggunakan paket Standard (gratis).");
			return;
		}

		Alert.alert(
			"Batalkan Langganan",
			`Apakah Anda yakin ingin membatalkan langganan ${currentMembership}? Anda akan kembali ke paket Standard.`,
			[
				{ text: "Tidak", style: "cancel" },
				{
					text: "Ya, Batalkan",
					style: "destructive",
					onPress: async () => {
						setCancelling(true);
						try {
							await api.cancelMembership();
							Alert.alert("Berhasil", "Langganan Anda telah dibatalkan. Anda sekarang menggunakan paket Standard.");
							setCurrentMembership("Standard");
						} catch (error: any) {
							console.error("Cancel gagal", error);
							const msg = error.response?.data?.message || "Terjadi kesalahan saat membatalkan langganan.";
							Alert.alert("Gagal", msg);
						} finally {
							setCancelling(false);
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
				<Text className="text-xl font-outfit-bold text-gray-900">Membership</Text>
			</View>

			<ScrollView contentContainerStyle={{ padding: 20 }}>
				{/* Current Membership Card */}
				<View className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-5 mb-6" style={{ backgroundColor: "#2563EB" }}>
					<View className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-white/10" />

					<View className="flex-row items-center mb-3">
						<Crown size={24} color="#FCD34D" />
						<Text className="text-blue-100 ml-2 text-sm">Langganan Aktif</Text>
					</View>

					<Text className="text-white text-2xl font-outfit-bold mb-4">
						{currentMembership || "Standard"}
					</Text>

					{currentMembership && currentMembership !== "Standard" && (
						<TouchableOpacity
							onPress={handleCancelMembership}
							disabled={cancelling}
							className="bg-white/20 py-3 px-4 rounded-xl flex-row items-center justify-center"
						>
							{cancelling ? (
								<ActivityIndicator size="small" color="white" />
							) : (
								<View className="flex-row items-center">
									<XCircle size={18} color="white" />
									<Text className="text-white font-outfit-medium ml-2">Batalkan Langganan</Text>
								</View>
							)}
						</TouchableOpacity>
					)}

					{currentMembership === "Standard" && (
						<Text className="text-blue-200 text-sm">
							Upgrade ke paket Premium untuk fitur eksklusif!
						</Text>
					)}
				</View>

				<Text className="text-center text-gray-500 mb-6">
					Nikmati fitur eksklusif dan potongan harga dengan upgrade membership Anda.
				</Text>

				{memberships.map((item) => {
					const benefitList = item.benefits
						? item.benefits.split('\n').filter(b => b.trim() !== '')
						: [];
					const isCurrentPlan = currentMembership === item.name;

					return (
						<View
							key={item.id}
							className={`bg-white rounded-2xl p-5 mb-5 shadow-sm border ${isCurrentPlan
								? "border-green-500 border-2"
								: item.is_popular
									? "border-blue-500 border-2"
									: "border-gray-200"
								}`}
						>
							{isCurrentPlan && (
								<View className="absolute top-0 right-0 bg-green-500 px-3 py-1 rounded-bl-xl rounded-tr-lg">
									<Text className="text-white text-xs font-outfit-bold">Aktif</Text>
								</View>
							)}
							{!isCurrentPlan && !!item.is_popular && (
								<View className="absolute top-0 right-0 bg-blue-600 px-3 py-1 rounded-bl-xl rounded-tr-lg">
									<Text className="text-white text-xs font-outfit-bold">Terpopuler</Text>
								</View>
							)}

							<View className="mb-4">
								<Text className="text-xl font-outfit-bold text-gray-900 mb-1">{item.name}</Text>
								<Text className="text-gray-500 text-sm">{item.description}</Text>
							</View>

							<View className="mb-6 flex-row items-baseline">
								<Text className="text-2xl font-outfit-bold text-blue-600">
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

							{isCurrentPlan ? (
								<View className="bg-green-100 py-3 rounded-xl items-center flex-row justify-center">
									<CheckCircle2 size={18} color="#16A34A" />
									<Text className="text-green-700 font-outfit-bold ml-2">Paket Aktif</Text>
								</View>
							) : (
								<TouchableOpacity
									onPress={() => handleUpgrade(item)}
									disabled={processingId === item.id}
									className={`${item.is_popular ? "bg-blue-600" : "bg-blue-800"
										} py-3 rounded-xl items-center flex-row justify-center`}
								>
									{processingId === item.id ? (
										<ActivityIndicator color="white" size="small" />
									) : (
										<View className="flex-row items-center">
											<ShieldCheck size={18} color="white" style={{ marginRight: 8 }} />
											<Text className="text-white font-outfit-bold">Pilih Paket ini</Text>
										</View>
									)}
								</TouchableOpacity>
							)}
						</View>
					);
				})}
			</ScrollView>
		</SafeAreaView>
	);
};

export default MembershipScreen;
