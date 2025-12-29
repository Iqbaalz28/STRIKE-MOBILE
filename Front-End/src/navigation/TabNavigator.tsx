import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Home, MapPin, ShoppingBag, Users, User } from "lucide-react-native";
import { Platform } from "react-native";

// --- IMPORT SCREENS UTAMA ---
import HomeScreen from "@/features/home/HomeScreen";
import ShopScreen from "@/features/shop/ShopScreen";
import CommunityScreen from "@/features/community/CommunityScreen";
import ProfileScreen from "@/features/profile/ProfileScreen";

// --- IMPORT SCREENS BOOKING FLOW ---
import LocationListScreen from "@/features/booking/LocationListScreen";
import LocationDetailScreen from "@/features/booking/LocationDetailScreen";
import BookingScreen from "@/features/booking/BookingScreen";

// --- IMPORT TIPE DATA ---
import { MainTabParamList, BookingStackParamList } from "./types";

const Tab = createBottomTabNavigator<MainTabParamList>();
const BookingStack = createNativeStackNavigator<BookingStackParamList>();

// --- STACK NAVIGATOR KHUSUS BOOKING ---
function BookingStackNavigator() {
  return (
    <BookingStack.Navigator
      initialRouteName="LocationList"
      screenOptions={{ headerShown: false }}
    >
      <BookingStack.Screen name="LocationList" component={LocationListScreen} />
      <BookingStack.Screen
        name="LocationDetail"
        component={LocationDetailScreen}
      />
      <BookingStack.Screen name="BookingForm" component={BookingScreen} />
    </BookingStack.Navigator>
  );
}

// --- MAIN TAB NAVIGATOR ---
const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          height: Platform.OS === "ios" ? 88 : 65,
          paddingTop: 10,
          paddingBottom: Platform.OS === "ios" ? 28 : 10,
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
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />

      {/* 2. BOOKING TAB (Stack) */}
      <Tab.Screen
        name="BookingStack"
        component={BookingStackNavigator}
        options={{
          tabBarLabel: "Lokasi",
          tabBarIcon: ({ color, size }) => <MapPin size={size} color={color} />,
        }}
      />

      {/* 3. SHOP TAB */}
      <Tab.Screen
        name="ShopStack"
        component={ShopScreen} // File ShopScreen.tsx Anda yang benar
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
          tabBarIcon: ({ color, size }) => <Users size={size} color={color} />,
        }}
      />

      {/* 5. PROFILE TAB */}
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: "Akun",
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
};

export default TabNavigator;
