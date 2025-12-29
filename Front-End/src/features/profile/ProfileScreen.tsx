import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  Settings,
  LogOut,
  Clock,
  User,
  ChevronRight,
  HelpCircle,
} from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "@/services/api";

const ProfileScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.getMyProfile();
      setUser(res.data);
    } catch (error) {
      console.log("Gagal load profile", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      "Konfirmasi Keluar",
      "Apakah Anda yakin ingin keluar dari aplikasi?",
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Keluar",
          style: "destructive",
          onPress: async () => {
            await AsyncStorage.removeItem("token");
            await AsyncStorage.removeItem("user");
            // Reset navigasi ke Login
            navigation.reset({
              index: 0,
              routes: [{ name: "Auth" }],
            });
          },
        },
      ]
    );
  };

  // Helper Avatar
  const getAvatar = (path: string) => {
    if (!path)
      return `https://ui-avatars.com/api/?name=${
        user?.name || "User"
      }&background=0D8ABC&color=fff`;
    if (path.startsWith("http")) return path;
    return `http://10.0.2.2:3000/uploads/${path}`;
  };

  if (loading)
    return (
      <View className="flex-1 justify-center">
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView>
        {/* Header Profile */}
        <View className="bg-white p-6 items-center border-b border-gray-100 pt-16 rounded-b-3xl shadow-sm">
          <Image
            source={{ uri: getAvatar(user?.avatar) }}
            className="w-24 h-24 rounded-full border-4 border-blue-50 mb-3"
          />
          <Text className="text-2xl font-bold text-gray-900 font-[Outfit_700Bold]">
            {user?.name}
          </Text>
          <Text className="text-gray-500">{user?.email}</Text>

          <TouchableOpacity className="mt-4 px-6 py-2 bg-blue-100 rounded-full">
            <Text className="text-blue-700 font-bold text-xs uppercase tracking-wide">
              {user?.membership_name || "Free Member"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Menu Options */}
        <View className="p-5 space-y-4">
          <Text className="text-gray-500 font-bold mb-2 ml-1">Akun Saya</Text>

          <MenuItem
            icon={<User size={20} color="#4B5563" />}
            label="Edit Profil"
            onPress={() =>
              Alert.alert("Coming Soon", "Fitur edit profil akan segera hadir.")
            }
          />

          <MenuItem
            icon={<Clock size={20} color="#4B5563" />}
            label="Riwayat Pesanan"
            onPress={() => navigation.navigate("History")}
          />

          <Text className="text-gray-500 font-bold mb-2 ml-1 mt-4">
            Lainnya
          </Text>

          <MenuItem
            icon={<Settings size={20} color="#4B5563" />}
            label="Pengaturan"
            onPress={() => {}}
          />

          <MenuItem
            icon={<HelpCircle size={20} color="#4B5563" />}
            label="Bantuan & Dukungan"
            onPress={() => {}}
          />

          <TouchableOpacity
            onPress={handleLogout}
            className="flex-row items-center bg-white p-4 rounded-2xl border border-red-100 mt-4"
          >
            <View className="bg-red-50 p-2 rounded-lg mr-4">
              <LogOut size={20} color="#DC2626" />
            </View>
            <Text className="flex-1 text-base font-bold text-red-600">
              Keluar
            </Text>
          </TouchableOpacity>
        </View>

        <View className="h-20" />
      </ScrollView>
    </View>
  );
};

// Komponen Kecil untuk Menu Item
const MenuItem = ({ icon, label, onPress }: any) => (
  <TouchableOpacity
    onPress={onPress}
    className="flex-row items-center bg-white p-4 rounded-2xl border border-gray-100 mb-3 shadow-sm"
  >
    <View className="bg-gray-50 p-2 rounded-lg mr-4">{icon}</View>
    <Text className="flex-1 text-base font-medium text-gray-800">{label}</Text>
    <ChevronRight size={20} color="#D1D5DB" />
  </TouchableOpacity>
);

export default ProfileScreen;
