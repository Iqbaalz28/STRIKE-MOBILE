import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  AlertCircle,
} from "lucide-react-native";
import * as Linking from "expo-linking"; // Untuk buka browser (Google Login)
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
      // Panggil API
      const response = await api.login(email, password);
      const { token, user } = response.data;

      // Simpan ke Storage HP
      await AsyncStorage.setItem("token", token);
      await AsyncStorage.setItem("user", JSON.stringify(user));

      // Redirect ke Home
      // Reset history agar tidak bisa 'Back' ke login
      navigation.reset({
        index: 0,
        routes: [{ name: "MainTabs" }], // Asumsi nama route utama nanti 'MainTabs'
      });
    } catch (error: any) {
      console.error("Login Error:", error);
      if (error.response && error.response.data) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage("Gagal terhubung ke server.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Logic: Google Login (Membuka Browser HP)
  const loginWithGoogle = () => {
    // Di Mobile, kita buka browser default user
    Linking.openURL("http://10.0.2.2:3000/auth/google");
    // Catatan: Untuk handle callback token dari Google di Mobile,
    // nanti kita butuh setup 'Deep Linking', tapi ini cukup untuk tahap awal.
  };

  return (
    // KeyboardAvoidingView: Agar form naik saat keyboard muncul
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-[#f5f5f5]"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
      >
        <View className="px-4 w-full items-center">
          {/* Card Container */}
          <View className="w-full max-w-sm bg-white rounded-3xl shadow-xl p-8 relative">
            {/* Tombol Kembali (Beranda) */}
            <TouchableOpacity
              onPress={() => navigation.navigate("HomePublic")} // Asumsi ada halaman public
              className="absolute top-6 left-6 flex-row items-center space-x-1"
            >
              <ArrowLeft size={20} color="#9CA3AF" />
              <Text className="text-gray-400 text-sm font-medium font-medium">
                Beranda
              </Text>
            </TouchableOpacity>

            {/* Header Text */}
            <View className="mb-8 mt-8">
              <Text className="text-3xl font-bold text-gray-800 font-bold mb-2">
                Selamat Datang
              </Text>
              <Text className="text-gray-500 font-sans">
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

            {/* Button Google */}
            <TouchableOpacity
              onPress={loginWithGoogle}
              className="mb-6 flex-row w-full items-center justify-center space-x-3 rounded-xl border-2 border-gray-100 bg-white py-3 active:bg-gray-50"
            >
              {/* Kita pakai Image untuk logo Google karena Lucide tidak punya logo brand */}
              <Image
                source={{
                  uri: "https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg",
                }}
                style={{ width: 20, height: 20 }}
                resizeMode="contain"
              />
              <Text className="font-medium text-gray-700 font-sans">
                Masuk dengan Google
              </Text>
            </TouchableOpacity>

            {/* Divider */}
            <View className="relative mb-6 flex-row items-center justify-center">
              <View className="h-px flex-1 bg-gray-200" />
              <Text className="mx-2 text-xs text-gray-400 uppercase tracking-wider font-medium">
                atau dengan email
              </Text>
              <View className="h-px flex-1 bg-gray-200" />
            </View>

            {/* Form */}
            <View className="space-y-5">
              {/* Input Email */}
              <View>
                <Text className="mb-1 text-sm font-medium text-gray-700 font-medium">
                  Email
                </Text>
                <View className="relative">
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    placeholder="nama@email.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    className="w-full rounded-xl border border-gray-300 p-3 pl-10 text-gray-900 font-sans"
                  />
                  <View className="absolute left-3 top-3.5">
                    <Mail size={20} color="#9CA3AF" />
                  </View>
                </View>
              </View>

              {/* Input Password */}
              <View>
                <Text className="mb-1 text-sm font-medium text-gray-700 font-medium">
                  Password
                </Text>
                <View className="relative">
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    placeholder="••••••••"
                    secureTextEntry={!showPassword}
                    className="w-full rounded-xl border border-gray-300 p-3 pl-10 pr-10 text-gray-900 font-sans"
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

              {/* Submit Button */}
              <TouchableOpacity
                onPress={handleLogin}
                disabled={isLoading}
                className={`w-full rounded-xl px-4 py-3 flex-row justify-center items-center space-x-2 ${
                  isLoading ? "bg-blue-400" : "bg-blue-600"
                }`}
              >
                {isLoading && <ActivityIndicator size="small" color="white" />}
                <Text className="text-base font-bold text-white font-bold">
                  {isLoading ? "Memproses..." : "Masuk"}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Link Register */}
            <View className="mt-8 flex-row justify-center">
              <Text className="text-sm text-gray-600 font-sans">
                Belum punya akun?{" "}
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate("Register")}>
                <Text className="text-sm font-bold text-blue-600 font-bold">
                  Daftar Sekarang
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;
