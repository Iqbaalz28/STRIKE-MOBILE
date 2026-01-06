import React, { useEffect, useState } from "react";
import { View, ActivityIndicator, Text } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { navigationRef } from "@/navigation/navigationRef"; // Pastikan path ini benar

// --- IMPORTS SCREEN ---

// 1. Auth & Tab
import TabNavigator from "./TabNavigator";
import LoginScreen from "@/features/auth/LoginScreen";
import RegisterScreen from "@/features/auth/RegisterScreen";

// 2. Home & General
import EventListScreen from "@/features/home/EventListScreen";
import CouponListScreen from "@/features/home/CouponListScreen";

// 3. Profile
import EditProfileScreen from "@/features/profile/EditProfileScreen";
import AboutScreen from "@/features/profile/AboutScreen";
import HistoryScreen from "@/features/profile/HistoryScreen";
import MembershipScreen from "@/features/profile/MembershipScreen";
import OrderDetailScreen from "@/features/profile/OrderDetailScreen";
import SavedAddressesScreen from "@/features/profile/SavedAddressesScreen";
import AddEditAddressScreen from "@/features/profile/AddEditAddressScreen";

// 4. Community
import CreatePostScreen from "@/features/community/CreatePostScreen";
import PostDetailScreen from "@/features/community/PostDetailScreen";

// 5. Shop (Tambahan penting agar Toko jalan)
import ProductDetailScreen from "@/features/shop/ProductDetailScreen";
// import CartScreen from "@/features/cart/CartScreen"; // Uncomment jika sudah ada filenya

const Stack = createNativeStackNavigator();

// --- SPLASH SCREEN COMPONENT ---
const SplashScreen = ({
	onFinish,
}: {
	onFinish: (isLoggedIn: boolean) => void;
}) => {
	useEffect(() => {
		const checkToken = async () => {
			try {
				const token = await AsyncStorage.getItem("token");
				// Delay estetika
				setTimeout(() => {
					onFinish(!!token);
				}, 1500);
			} catch (e) {
				onFinish(false);
			}
		};
		checkToken();
	}, []);

	return (
		<View className="flex-1 justify-center items-center bg-blue-600">
			<Text className="text-4xl font-outfit-bold text-white mb-4 font-outfit-bold">
				Strike It
			</Text>
			<ActivityIndicator size="large" color="white" />
		</View>
	);
};

// --- ROOT NAVIGATOR ---
const RootNavigator = () => {
	const [isLoading, setIsLoading] = useState(true);
	const [initialRoute, setInitialRoute] = useState("Login");

	const handleSplashFinish = (isLoggedIn: boolean) => {
		// Jika login, langsung ke MainTab. Jika tidak, ke Login.
		setInitialRoute(isLoggedIn ? "MainTab" : "Login");
		setIsLoading(false);
	};

	if (isLoading) {
		return <SplashScreen onFinish={handleSplashFinish} />;
	}

	return (
		// PENTING: ref={navigationRef} dipasang di sini
		<NavigationContainer ref={navigationRef}>
			<Stack.Navigator
				initialRouteName={initialRoute}
				screenOptions={{ headerShown: false }}
			>
				{/* --- GROUP AUTHENTICATION --- */}
				{/* Disimpan langsung di root agar mudah diakses oleh resetToLogin() */}
				<Stack.Group>
					<Stack.Screen name="Login" component={LoginScreen} />
					<Stack.Screen name="Register" component={RegisterScreen} />
				</Stack.Group>

				{/* --- GROUP MAIN APP --- */}
				<Stack.Group>
					<Stack.Screen name="MainTab" component={TabNavigator} />
				</Stack.Group>

				{/* --- GROUP SCREENS LAINNYA --- */}
				<Stack.Group>
					{/* Home & Events */}
					<Stack.Screen
						name="EventList"
						component={EventListScreen}
					/>
					<Stack.Screen
						name="CouponList"
						component={CouponListScreen}
					/>

					{/* Profile */}
					<Stack.Screen
						name="EditProfile"
						component={EditProfileScreen}
					/>
					<Stack.Screen name="About" component={AboutScreen} />
					<Stack.Screen name="History" component={HistoryScreen} />
					<Stack.Screen name="OrderDetail" component={OrderDetailScreen} />
					<Stack.Screen name="Membership" component={MembershipScreen} />
					<Stack.Screen name="SavedAddresses" component={SavedAddressesScreen} />
					<Stack.Screen name="AddEditAddress" component={AddEditAddressScreen} />

					{/* Community */}
					<Stack.Screen
						name="CreatePost"
						component={CreatePostScreen}
					/>
					<Stack.Screen
						name="PostDetail"
						component={PostDetailScreen}
					/>

					{/* Shop */}
					<Stack.Screen
						name="ProductDetail"
						component={ProductDetailScreen}
					/>
					{/* <Stack.Screen name="Cart" component={CartScreen} /> */}
				</Stack.Group>
			</Stack.Navigator>
		</NavigationContainer>
	);
};

export default RootNavigator;
