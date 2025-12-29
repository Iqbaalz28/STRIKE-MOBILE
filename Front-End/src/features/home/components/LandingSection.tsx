import React from "react";
import { View, Text, Image, TouchableOpacity, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/types";

// Import Assets
// Jika belum ada, ganti dengan dummy URI sementara
const wave1 = require("@/assets/images/wave1.png");
const mancing = require("@/assets/images/mancing.png");

const { width, height } = Dimensions.get("window");

const LandingSection = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <View className="relative w-full h-[600px] overflow-hidden">
      {/* Background Gradient */}
      <LinearGradient
        colors={["#003bb3", "#ffffff"]}
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          height: "100%",
        }}
      />

      {/* Konten Teks */}
      <View className="absolute top-20 left-0 w-full px-6 z-40 items-center">
        <Text className="font-bold text-5xl text-white text-center mb-4 font-[Outfit_700Bold]">
          Strike It!
        </Text>

        <Text className="text-gray-100 text-center text-sm leading-relaxed font-[Outfit_400Regular] mb-6">
          Komunitas pemancing yang berdedikasi menciptakan pengalaman tak
          terlupakan. Perjalanan Anda dimulai di sini.
        </Text>

        {/* Buttons */}
        <View className="flex-row space-x-3">
          <TouchableOpacity
            onPress={() => navigation.navigate("Main", { screen: "Booking" })}
            className="bg-white/20 border border-white/30 px-6 py-3 rounded-xl backdrop-blur-md"
          >
            <Text className="text-white font-bold font-[Outfit_500Medium]">
              Book Sekarang
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate("Main", { screen: "Shop" })}
            className="bg-white/20 border border-white/30 px-6 py-3 rounded-xl backdrop-blur-md"
          >
            <Text className="text-white font-bold font-[Outfit_500Medium]">
              Sewa Alat
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Gambar Pemancing (Hero Image) */}
      <View className="absolute bottom-0 right-[-20px] z-20">
        <Image
          source={mancing}
          style={{ width: width * 0.9, height: height * 0.5 }}
          resizeMode="contain"
        />
      </View>

      {/* Gambar Ombak (Wave) */}
      <Image
        source={wave1}
        className="absolute bottom-0 w-full h-[150px] z-30 opacity-90"
        resizeMode="stretch"
      />
    </View>
  );
};

export default LandingSection;
