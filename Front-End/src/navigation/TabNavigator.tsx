import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Home, MapPin, ShoppingBag, Users, User } from "lucide-react-native";
import { Text, Platform } from "react-native";

// Import Screens yang tadi dibuat
import HomeScreen from "@/features/home/HomeScreen";
import BookingScreen from "@/features/booking/BookingScreen";
import ShopScreen from "@/features/shop/ShopScreen";
import CommunityScreen from "@/features/community/CommunityScreen";
import ProfileScreen from "@/features/profile/ProfileScreen";

import { MainTabParamList } from "./types";

const Tab = createBottomTabNavigator<MainTabParamList>();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false, // Kita sembunyikan header bawaan
        tabBarStyle: {
          height: Platform.OS === "ios" ? 88 : 65, // Tinggi navbar
          paddingTop: 10,
          paddingBottom: Platform.OS === "ios" ? 28 : 10,
          backgroundColor: "#ffffff",
          borderTopWidth: 1,
          borderTopColor: "#f3f4f6",
          elevation: 10, // Shadow di Android
        },
        tabBarActiveTintColor: "#2563EB", // Warna biru (primary) saat aktif
        tabBarInactiveTintColor: "#9CA3AF", // Warna abu saat tidak aktif
        tabBarLabelStyle: {
          fontFamily: "Outfit_500Medium",
          fontSize: 11,
          marginTop: 2,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: "Beranda",
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Booking"
        component={BookingScreen}
        options={{
          tabBarLabel: "Lokasi",
          tabBarIcon: ({ color, size }) => <MapPin size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Shop"
        component={ShopScreen}
        options={{
          tabBarLabel: "Toko",
          tabBarIcon: ({ color, size }) => (
            <ShoppingBag size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Community"
        component={CommunityScreen}
        options={{
          tabBarLabel: "Komunitas",
          tabBarIcon: ({ color, size }) => <Users size={size} color={color} />,
        }}
      />
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
