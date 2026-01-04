import React, { useEffect, useState } from "react";
import { View, ActivityIndicator, Text } from "react-native"; // <--- PASTIKAN Text ADA DI SINI
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { navigationRef } from "./navigationRef";

// Import Stacks & Screens
import TabNavigator from "./TabNavigator";
import LoginScreen from "@/features/auth/LoginScreen";
import RegisterScreen from "@/features/auth/RegisterScreen";

// Import Screen Tambahan
import EventListScreen from "@/features/home/EventListScreen";
import EditProfileScreen from "@/features/profile/EditProfileScreen";
import AboutScreen from "@/features/profile/AboutScreen";
import HistoryScreen from "@/features/profile/HistoryScreen";
import CreatePostScreen from "@/features/community/CreatePostScreen";
import PostDetailScreen from "@/features/community/PostDetailScreen";

const Stack = createNativeStackNavigator();

// --- 1. SPLASH SCREEN COMPONENT ---
const SplashScreen = ({
	onFinish,
}: {
	onFinish: (isLoggedIn: boolean) => void;
}) => {
	useEffect(() => {
		const checkToken = async () => {
			// Cek apakah ada token tersimpan
			const token = await AsyncStorage.getItem("token");
			// Simulasi delay biar logo tampil sebentar (optional)
			setTimeout(() => {
				onFinish(!!token); // true jika token ada, false jika tidak
			}, 1500);
		};
		checkToken();
	}, []);

	return (
		<View className="flex-1 justify-center items-center bg-blue-600">
			{/* Text ini yang bikin error kalau tidak diimport */}
			<Text className="text-4xl font-bold text-white mb-4 font-[Outfit_700Bold]">
				Strike It
			</Text>
			<ActivityIndicator size="large" color="white" />
		</View>
	);
};

// Sub-stack untuk Login/Register
const AuthStack = () => (
	<Stack.Navigator screenOptions={{ headerShown: false }}>
		<Stack.Screen name="Login" component={LoginScreen} />
		<Stack.Screen name="Register" component={RegisterScreen} />
	</Stack.Navigator>
);

// --- 2. ROOT NAVIGATOR ---
const RootNavigator = () => {
	const [isLoading, setIsLoading] = useState(true);
	const [initialRoute, setInitialRoute] = useState("Auth");

	// Handle hasil dari Splash Screen
	const handleSplashFinish = (isLoggedIn: boolean) => {
		setInitialRoute(isLoggedIn ? "MainTab" : "Auth");
		setIsLoading(false);
	};

	if (isLoading) {
		return <SplashScreen onFinish={handleSplashFinish} />;
	}

	return (
		<NavigationContainer ref={navigationRef}>
			<Stack.Navigator
				initialRouteName={initialRoute}
				screenOptions={{ headerShown: false }}
			>
				{/* Grup Auth */}
				<Stack.Group>
					<Stack.Screen name="Auth" component={AuthStack} />
				</Stack.Group>

				{/* Grup Aplikasi Utama */}
				<Stack.Group>
					<Stack.Screen name="MainTab" component={TabNavigator} />

					{/* Screen Tambahan Global (Bisa diakses dari mana saja) */}
					<Stack.Screen
						name="EventList"
						component={EventListScreen}
					/>
					<Stack.Screen
						name="EditProfile"
						component={EditProfileScreen}
					/>
					<Stack.Screen
						name="About"
						component={AboutScreen}
					/>
					<Stack.Screen
						name="History"
						component={HistoryScreen}
					/>
					
					{/* Community Screens */}
					<Stack.Screen
						name="CreatePost"
						component={CreatePostScreen}
					/>
					<Stack.Screen
						name="PostDetail"
						component={PostDetailScreen}
					/>
				</Stack.Group>
			</Stack.Navigator>
		</NavigationContainer>
	);
};

export default RootNavigator;
