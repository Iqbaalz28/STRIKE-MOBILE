import React, { useState, useCallback } from "react";
import {
	ScrollView,
	StatusBar,
	View,
	RefreshControl,
	Text,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import api from "../../services/api";

// Components
import MembershipCard from "./components/MembershipCard";
import MenuGrid from "./components/MenuGrid";
import LocationPreview from "./components/LocationPreview";
import DiscountSection from "./components/DiscountSection";
import EventSection from "./components/EventSection";

const HomeScreen = () => {
	const [refreshing, setRefreshing] = useState(false);
	const [userData, setUserData] = useState({
		name: "",
		membership_name: "Standard",
		points: 0,
		booking_count: 0,
		level: 1,
	});

	const fetchUserData = async () => {
		try {
			const response = await api.getMyProfile();
			setUserData(response.data);
		} catch (error) {
			console.error("Error fetching user data:", error);
		}
	};

	useFocusEffect(
		useCallback(() => {
			fetchUserData();
		}, [])
	);

	const onRefresh = useCallback(() => {
		setRefreshing(true);
		fetchUserData().finally(() => setRefreshing(false));
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
					{userData.name || "Pengguna"}
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
				<MembershipCard userData={userData} />

				{/* 2. Menu Grid (Navigasi Utama) */}
				<MenuGrid />

				{/* 3. Kupon Diskon */}
				<View className="mt-2">
					<DiscountSection />
				</View>

				{/* 4. Rekomendasi Spot */}
				<View className="mt-2">
					<LocationPreview />
				</View>

				{/* 5. Event Komunitas (DITAMBAHKAN) */}
				<View className="mt-2">
					<EventSection />
				</View>
			</ScrollView>
		</SafeAreaView>
	);
};

export default HomeScreen;
