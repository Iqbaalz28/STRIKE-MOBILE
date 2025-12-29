import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Home, MapPin, ShoppingBag, Users, User } from "lucide-react-native";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// --- IMPORT SCREENS UTAMA ---
import HomeScreen from "@/features/home/HomeScreen";
// import ShopScreen dari sini dihapus karena akan dipanggil di dalam Stack
import CommunityScreen from "@/features/community/CommunityScreen";
import ProfileScreen from "@/features/profile/ProfileScreen";

// --- IMPORT SCREENS BOOKING FLOW ---
import LocationListScreen from "@/features/booking/LocationListScreen";
import LocationDetailScreen from "@/features/booking/LocationDetailScreen";
import BookingScreen from "@/features/booking/BookingScreen";

// --- IMPORT SCREENS SHOP FLOW (BARU) ---
import ShopScreen from "@/features/shop/ShopScreen";
import ProductDetailScreen from "@/features/shop/ProductDetailScreen"; // Pastikan file ini ada
import CartScreen from "@/features/shop/CartScreen";
import CheckoutScreen from "@/features/shop/CheckoutScreen";

// --- IMPORT TIPE DATA ---
import {
	MainTabParamList,
	BookingStackParamList,
	ShopStackParamList,
} from "./types";

const Tab = createBottomTabNavigator<MainTabParamList>();
const BookingStack = createNativeStackNavigator<BookingStackParamList>();
const ShopStack = createNativeStackNavigator<ShopStackParamList>(); // <--- Stack Baru

// --- STACK NAVIGATOR KHUSUS BOOKING ---
function BookingStackNavigator() {
	return (
		<BookingStack.Navigator
			initialRouteName="LocationList"
			screenOptions={{ headerShown: false }}
		>
			<BookingStack.Screen
				name="LocationList"
				component={LocationListScreen}
			/>
			<BookingStack.Screen
				name="LocationDetail"
				component={LocationDetailScreen}
			/>
			<BookingStack.Screen name="BookingForm" component={BookingScreen} />
		</BookingStack.Navigator>
	);
}

// --- STACK NAVIGATOR KHUSUS SHOP (BARU) ---
function ShopStackNavigator() {
	return (
		<ShopStack.Navigator
			initialRouteName="Shop"
			screenOptions={{ headerShown: false }}
		>
			<ShopStack.Screen name="Shop" component={ShopScreen} />
			<ShopStack.Screen
				name="ProductDetail"
				component={ProductDetailScreen}
			/>
			<ShopStack.Screen name="Cart" component={CartScreen} />
			<ShopStack.Screen name="Checkout" component={CheckoutScreen} />
		</ShopStack.Navigator>
	);
}

// --- MAIN TAB NAVIGATOR ---
const TabNavigator = () => {
	const insets = useSafeAreaInsets();

	return (
		<Tab.Navigator
			screenOptions={{
				headerShown: false,
				tabBarStyle: {
					height: Platform.OS === "ios" ? 88 : 65 + insets.bottom,
					paddingTop: 10,
					paddingBottom: Platform.OS === "ios" ? 28 : 10 + insets.bottom,
					backgroundColor: "#ffffff",
					borderTopWidth: 1,
					borderTopColor: "#f3f4f6",
					elevation: 10,
				},
				tabBarActiveTintColor: "#2563EB",
				tabBarInactiveTintColor: "#9CA3AF",
				tabBarLabelStyle: {
					fontFamily: "Outfit_500Medium",
					fontSize: 11,
					marginTop: 2,
				},
			}}
		>
			{/* 1. HOME TAB */}
			<Tab.Screen
				name="Home"
				component={HomeScreen}
				options={{
					tabBarLabel: "Beranda",
					tabBarIcon: ({ color, size }) => (
						<Home size={size} color={color} />
					),
				}}
			/>

			{/* 2. BOOKING TAB (Stack) */}
			<Tab.Screen
				name="BookingStack"
				component={BookingStackNavigator}
				options={{
					tabBarLabel: "Lokasi",
					tabBarIcon: ({ color, size }) => (
						<MapPin size={size} color={color} />
					),
				}}
			/>

			{/* 3. SHOP TAB (Stack) */}
			<Tab.Screen
				name="ShopStack"
				component={ShopStackNavigator} // <--- GANTI JADI STACK INI
				options={{
					tabBarLabel: "Toko",
					tabBarIcon: ({ color, size }) => (
						<ShoppingBag size={size} color={color} />
					),
				}}
			/>

			{/* 4. COMMUNITY TAB */}
			<Tab.Screen
				name="Community"
				component={CommunityScreen}
				options={{
					tabBarLabel: "Komunitas",
					tabBarIcon: ({ color, size }) => (
						<Users size={size} color={color} />
					),
				}}
			/>

			{/* 5. PROFILE TAB */}
			<Tab.Screen
				name="Profile"
				component={ProfileScreen}
				options={{
					tabBarLabel: "Akun",
					tabBarIcon: ({ color, size }) => (
						<User size={size} color={color} />
					),
				}}
			/>
		</Tab.Navigator>
	);
};

export default TabNavigator;
