import React, { useState, useCallback } from "react";
import { ScrollView, StatusBar, View, RefreshControl, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Components Baru
import MembershipCard from "./components/MembershipCard";
import MenuGrid from "./components/MenuGrid";
import LocationPreview from "./components/LocationPreview";
import DiscountSection from "./components/DiscountSection";

const HomeScreen = () => {
	const [refreshing, setRefreshing] = useState(false);

	// Logic simulasi refresh (tarik layar ke bawah)
	const onRefresh = useCallback(() => {
		setRefreshing(true);
		// Di sini nanti bisa dipanggil fungsi reload data API
		setTimeout(() => {
			setRefreshing(false);
		}, 2000);
	}, []);

	return (
		<SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
			<StatusBar
				translucent={false}
				backgroundColor="#FFFFFF"
				barStyle="dark-content"
			/>

			{/* Header */}
			<View className="bg-white px-5 py-3 border-b border-gray-100">
				<Text className="text-gray-500 text-sm font-[Outfit_400Regular]">
					Halo,
				</Text>
				<Text className="text-gray-900 text-2xl font-bold font-[Outfit_700Bold]">
					Strike it!
				</Text>
			</View>

			<ScrollView
				showsVerticalScrollIndicator={false}
				className="bg-gray-50"
				contentContainerStyle={{ paddingBottom: 100 }}
				refreshControl={
					<RefreshControl
						refreshing={refreshing}
						onRefresh={onRefresh}
						colors={["#2563EB"]}
					/>
				}
			>
				{/* 1. Membership Card */}
				<MembershipCard />

				{/* 2. Menu Grid */}
				<MenuGrid />

				{/* 3. Semua Lokasi */}
				<View className="mt-2">
					<LocationPreview />
				</View>

				{/* 4. Kupon Aktif */}
				<View className="mt-2">
					<DiscountSection />
				</View>
			</ScrollView>
		</SafeAreaView>
	);
};

export default HomeScreen;
