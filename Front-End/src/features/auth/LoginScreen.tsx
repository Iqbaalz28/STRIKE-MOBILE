import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useNavigation, CommonActions } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  AlertCircle,
  User, // Icon baru untuk tamu
} from "lucide-react-native";
import * as Linking from "expo-linking";
import api from "@/services/api";

const LoginScreen = () => {
  const navigation = useNavigation<any>();

  // State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Logic: Login Manual
  const handleLogin = async () => {
    setErrorMessage("");
    setIsLoading(true);

    try {
      // 1. Panggil API
      // const response = await api.login(email, password); // Uncomment jika API sudah ada
      // const { token, user } = response.data;

      // 2. Dummy Data (Sementara Backend belum ada)
      const token = "dummy-token-123";
      const user = { name: "User Demo", email: email };

      // 3. Simpan ke Storage HP
      await AsyncStorage.setItem("token", token);
      await AsyncStorage.setItem("user", JSON.stringify(user));

      // 4. Redirect ke Home (Reset agar tidak bisa back ke login)
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: "MainTab" }],
        })
      );
    } catch (error: any) {
      console.error("Login Error:", error);
      setErrorMessage("Gagal login. Cek email/password.");
    } finally {
      setIsLoading(false);
    }
  };

  // Logic: Login Google
  const loginWithGoogle = () => {
    Linking.openURL("http://10.0.2.2:3000/auth/google");
  };

  // --- BARU: Logic Masuk Sebagai Tamu ---
  const handleGuestLogin = async () => {
    // Kita hapus token lama (jika ada) untuk memastikan statusnya benar-benar tamu
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("user");

    // Langsung lempar ke MainTab
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: "MainTab" }],
      })
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-[#f5f5f5]"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
      >
        <View className="px-4 w-full items-center">
          <View className="w-full max-w-sm bg-white rounded-3xl shadow-xl p-8 relative">
            {/* Header Text */}
            <View className="mb-8 mt-4">
              <Text className="text-3xl font-bold text-gray-800 mb-2 font-[Outfit_700Bold]">
                Selamat Datang
              </Text>
              <Text className="text-gray-500 font-[Outfit_400Regular]">
                Masuk ke akun Strike It Anda
              </Text>
            </View>

            {/* Error Message */}
            {errorMessage ? (
              <View className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex-row items-center space-x-2">
                <AlertCircle size={20} color="#DC2626" />
                <Text className="text-red-600 text-sm flex-1 font-medium">
                  {errorMessage}
                </Text>
              </View>
            ) : null}

            {/* Form Inputs (Email & Password) - SAMA SEPERTI SEBELUMNYA */}
            <View className="space-y-5">
              <View>
                <Text className="mb-1 text-sm font-medium text-gray-700">
                  Email
                </Text>
                <View className="relative">
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    placeholder="nama@email.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    className="w-full rounded-xl border border-gray-300 p-3 pl-10 text-gray-900"
                  />
                  <View className="absolute left-3 top-3.5">
                    <Mail size={20} color="#9CA3AF" />
                  </View>
                </View>
              </View>

              <View>
                <Text className="mb-1 text-sm font-medium text-gray-700">
                  Password
                </Text>
                <View className="relative">
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    placeholder="••••••••"
                    secureTextEntry={!showPassword}
                    className="w-full rounded-xl border border-gray-300 p-3 pl-10 pr-10 text-gray-900"
                  />
                  <View className="absolute left-3 top-3.5">
                    <Lock size={20} color="#9CA3AF" />
                  </View>
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3.5"
                  >
                    {showPassword ? (
                      <Eye size={20} color="#9CA3AF" />
                    ) : (
                      <EyeOff size={20} color="#9CA3AF" />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              {/* Login Button */}
              <TouchableOpacity
                onPress={handleLogin}
                disabled={isLoading}
                className={`w-full rounded-xl px-4 py-3 flex-row justify-center items-center space-x-2 ${
                  isLoading ? "bg-blue-400" : "bg-blue-600"
                }`}
              >
                {isLoading && <ActivityIndicator size="small" color="white" />}
                <Text className="text-base font-bold text-white font-[Outfit_700Bold]">
                  {isLoading ? "Memproses..." : "Masuk"}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Google Login */}
            <View className="mt-6">
              <TouchableOpacity
                onPress={loginWithGoogle}
                className="flex-row w-full items-center justify-center space-x-3 rounded-xl border-2 border-gray-100 bg-white py-3 active:bg-gray-50"
              >
                <Image
                  source={{
                    uri: "https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg",
                  }}
                  style={{ width: 20, height: 20 }}
                  resizeMode="contain"
                />
                <Text className="font-medium text-gray-700">
                  Masuk dengan Google
                </Text>
              </TouchableOpacity>
            </View>

            {/* Register Link */}
            <View className="mt-6 flex-row justify-center">
              <Text className="text-sm text-gray-600">Belum punya akun? </Text>
              <TouchableOpacity onPress={() => navigation.navigate("Register")}>
                <Text className="text-sm font-bold text-blue-600">
                  Daftar Sekarang
                </Text>
              </TouchableOpacity>
            </View>

            {/* --- BAGIAN BARU: GUEST MODE --- */}
            <View className="mt-6 pt-6 border-t border-gray-100 items-center">
              <TouchableOpacity
                onPress={handleGuestLogin}
                className="flex-row items-center py-2 px-4 rounded-full bg-gray-50"
              >
                <Text className="text-gray-500 font-medium mr-2">
                  Lewati login dulu
                </Text>
                <ArrowLeft
                  size={16}
                  color="#6B7280"
                  style={{ transform: [{ rotate: "180deg" }] }}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;
