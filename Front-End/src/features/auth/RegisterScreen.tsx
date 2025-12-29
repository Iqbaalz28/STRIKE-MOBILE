import React, { useState } from "react";
import {
	View,
	Text,
	TextInput,
	TouchableOpacity,
	ActivityIndicator,
	KeyboardAvoidingView,
	Platform,
	ScrollView,
	StatusBar,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
	User,
	Mail,
	Lock,
	ArrowLeft,
	CheckCircle,
	AlertCircle,
	Eye,
	EyeOff,
} from "lucide-react-native";
import api from "@/services/api";
import { AuthStackParamList } from "@/navigation/types";

// Definisikan tipe navigasi agar auto-complete jalan
type RegisterScreenProp = NativeStackNavigationProp<
	AuthStackParamList,
	"Register"
>;

const RegisterScreen = () => {
	const navigation = useNavigation<RegisterScreenProp>();

	// State Form
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");

	// State UI
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");
	const [successMessage, setSuccessMessage] = useState("");

	const handleRegister = async () => {
		// 1. Reset State
		setErrorMessage("");
		setSuccessMessage("");

		// 2. Validasi Lokal
		if (!name || !email || !password || !confirmPassword) {
			setErrorMessage("Semua kolom harus diisi.");
			return;
		}

		if (password !== confirmPassword) {
			setErrorMessage("Konfirmasi password tidak cocok.");
			return;
		}

		if (password.length < 6) {
			setErrorMessage("Password minimal 6 karakter.");
			return;
		}

		// 3. Proses API
		setIsLoading(true);
		try {
			// Payload sesuai backend
			await api.register({
				name,
				email,
				password,
			});

			setSuccessMessage("Registrasi berhasil! Mengalihkan...");

			// Tunggu 2 detik lalu pindah ke Login
			setTimeout(() => {
				navigation.navigate("Login");
			}, 2000);
		} catch (error: any) {
			console.error("Register Error:", error);
			if (error.response && error.response.data) {
				setErrorMessage(error.response.data.message);
			} else {
				setErrorMessage("Gagal mendaftar. Silakan coba lagi.");
			}
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<KeyboardAvoidingView
			behavior={Platform.OS === "ios" ? "padding" : "height"}
			className="flex-1 bg-zinc-100"
		>
			<StatusBar barStyle="dark-content" backgroundColor="#f4f4f5" />

			<ScrollView
				contentContainerStyle={{
					flexGrow: 1,
					justifyContent: "center",
				}}
				showsVerticalScrollIndicator={false}
			>
				<View className="px-4 py-8 w-full items-center">
					{/* Card Container */}
					<View className="w-full max-w-md bg-white rounded-3xl shadow-xl p-6 md:p-10 relative">
						{/* Header */}
						<View className="items-center mb-8">
							<Text className="text-3xl font-medium text-[#1e2f42] text-center mb-2 font-bold">
								Buat Akun Baru
							</Text>
							<Text className="text-gray-600 text-center font-sans">
								Daftar untuk mulai memancing!
							</Text>
						</View>

						{/* Notification Messages */}
						{errorMessage ? (
							<View className="mb-6 p-3 bg-red-50 border border-red-200 rounded-xl flex-row items-center space-x-2">
								<AlertCircle size={20} color="#DC2626" />
								<Text className="text-red-600 text-sm flex-1 font-medium">
									{errorMessage}
								</Text>
							</View>
						) : null}

						{successMessage ? (
							<View className="mb-6 p-3 bg-green-50 border border-green-200 rounded-xl flex-row items-center space-x-2">
								<CheckCircle size={20} color="#16A34A" />
								<Text className="text-green-600 text-sm flex-1 font-medium">
									{successMessage}
								</Text>
							</View>
						) : null}

						{/* Form Fields */}
						<View className="space-y-5">
							{/* Nama Lengkap */}
							<View>
								<Text className="mb-1 text-sm font-medium text-gray-700 font-medium">
									Nama Lengkap
								</Text>
								<View className="relative">
									<TextInput
										value={name}
										onChangeText={setName}
										placeholder="Nama Lengkap Anda"
										className="w-full rounded-xl border border-gray-300 p-3 pl-10 text-gray-900 font-sans bg-white"
									/>
									<View className="absolute left-3 top-3.5">
										<User size={20} color="#9CA3AF" />
									</View>
								</View>
							</View>

							{/* Email */}
							<View>
								<Text className="mb-1 text-sm font-medium text-gray-700 font-medium">
									Email
								</Text>
								<View className="relative">
									<TextInput
										value={email}
										onChangeText={setEmail}
										placeholder="email@anda.com"
										keyboardType="email-address"
										autoCapitalize="none"
										className="w-full rounded-xl border border-gray-300 p-3 pl-10 text-gray-900 font-sans bg-white"
									/>
									<View className="absolute left-3 top-3.5">
										<Mail size={20} color="#9CA3AF" />
									</View>
								</View>
							</View>

							{/* Password */}
							<View>
								<Text className="mb-1 text-sm font-medium text-gray-700 font-medium">
									Password
								</Text>
								<View className="relative">
									<TextInput
										value={password}
										onChangeText={setPassword}
										placeholder="Buat Password"
										secureTextEntry={!showPassword}
										className="w-full rounded-xl border border-gray-300 p-3 pl-10 pr-10 text-gray-900 font-sans bg-white"
									/>
									<View className="absolute left-3 top-3.5">
										<Lock size={20} color="#9CA3AF" />
									</View>
									<TouchableOpacity
										onPress={() =>
											setShowPassword(!showPassword)
										}
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

							{/* Confirm Password */}
							<View>
								<Text className="mb-1 text-sm font-medium text-gray-700 font-medium">
									Konfirmasi Password
								</Text>
								<View className="relative">
									<TextInput
										value={confirmPassword}
										onChangeText={setConfirmPassword}
										placeholder="Ulangi Password"
										secureTextEntry={!showConfirmPassword}
										className="w-full rounded-xl border border-gray-300 p-3 pl-10 pr-10 text-gray-900 font-sans bg-white"
									/>
									<View className="absolute left-3 top-3.5">
										<Lock size={20} color="#9CA3AF" />
									</View>
									<TouchableOpacity
										onPress={() =>
											setShowConfirmPassword(
												!showConfirmPassword,
											)
										}
										className="absolute right-3 top-3.5"
									>
										{showConfirmPassword ? (
											<Eye size={20} color="#9CA3AF" />
										) : (
											<EyeOff size={20} color="#9CA3AF" />
										)}
									</TouchableOpacity>
								</View>
							</View>

							{/* Submit Button */}
							<TouchableOpacity
								onPress={handleRegister}
								disabled={isLoading}
								className={`w-full rounded-xl px-4 py-3 flex-row justify-center items-center shadow-lg ${
									isLoading
										? "bg-blue-400"
										: "bg-blue-600 shadow-blue-200"
								}`}
							>
								{isLoading && (
									<ActivityIndicator
										size="small"
										color="white"
										className="mr-2"
									/>
								)}
								<Text className="text-base font-bold text-white font-bold">
									{isLoading ? "Memproses..." : "Daftar"}
								</Text>
							</TouchableOpacity>
						</View>

						{/* Link ke Login */}
						<View className="mt-8 flex-row justify-center">
							<Text className="text-sm text-gray-600 font-sans">
								Sudah punya akun?{" "}
							</Text>
							<TouchableOpacity
								onPress={() => navigation.navigate("Login")}
							>
								<Text className="text-sm font-medium text-blue-600 font-bold">
									Masuk di sini
								</Text>
							</TouchableOpacity>
						</View>
					</View>
				</View>
			</ScrollView>
		</KeyboardAvoidingView>
	);
};

export default RegisterScreen;
