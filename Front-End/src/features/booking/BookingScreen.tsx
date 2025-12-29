import React, { useState, useEffect } from "react";
import {
	View,
	Text,
	ScrollView,
	TouchableOpacity,
	Alert,
	ActivityIndicator,
	FlatList,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
	Calendar,
	MapPin,
	Check,
	ChevronRight,
	ChevronLeft,
	CreditCard,
} from "lucide-react-native";
import api from "@/services/api";
import PaymentMethod from "./components/PaymentMethod";
import { BookingStackParamList } from "@/navigation/types";

const BookingScreen = () => {
	const navigation =
		useNavigation<NativeStackNavigationProp<BookingStackParamList>>();
	const route = useRoute<any>();

	// Ambil parameter dari halaman sebelumnya (LocationDetail)
	// Default nilai dummy jika diakses langsung (untuk dev)
	const {
		locationId = 1,
		locationName = "Kolam Pancing",
		price = 50000,
	} = route.params || {};

	// --- STATE ---
	const [currentStep, setCurrentStep] = useState(1);
	const [selectedDate, setSelectedDate] = useState(new Date());
	const [selectedSpot, setSelectedSpot] = useState<number | null>(null);
	const [selectedPayment, setSelectedPayment] = useState<any>(null);

	const [spots, setSpots] = useState<any[]>([]);
	const [loadingSpots, setLoadingSpots] = useState(false);
	const [submitting, setSubmitting] = useState(false);

	// --- STEP 1: DATE SELECTION HELPERS ---
	// Generate 7 hari ke depan
	const getNext7Days = () => {
		const dates = [];
		for (let i = 0; i < 7; i++) {
			const d = new Date();
			d.setDate(d.getDate() + i);
			dates.push(d);
		}
		return dates;
	};
	const availableDates = getNext7Days();

	// --- STEP 2: SPOT SELECTION LOGIC ---
	useEffect(() => {
		if (currentStep === 2) {
			fetchSpots();
		}
	}, [currentStep, selectedDate]);

	const fetchSpots = async () => {
		setLoadingSpots(true);
		try {
			// Format tanggal YYYY-MM-DD untuk API
			const dateStr = selectedDate.toISOString().split("T")[0];
			const res = await api.getLocationSpots(locationId, dateStr);
			setSpots(res.data);
		} catch (error) {
			console.log("Gagal load spot:", error);
			// Dummy data jika API belum siap
			setSpots(
				Array.from({ length: 20 }, (_, i) => ({
					id: i + 1,
					number: i + 1,
					status: Math.random() > 0.7 ? "booked" : "available",
				})),
			);
		} finally {
			setLoadingSpots(false);
		}
	};

	// --- STEP 3: SUBMIT LOGIC ---
	const handleBooking = async () => {
		if (!selectedSpot || !selectedPayment) {
			Alert.alert(
				"Lengkapi Data",
				"Pastikan lapak dan metode pembayaran sudah dipilih.",
			);
			return;
		}

		setSubmitting(true);
		try {
			const payload = {
				location_id: locationId,
				date: selectedDate.toISOString().split("T")[0],
				spot_number: selectedSpot,
				payment_method_id: selectedPayment.id,
				total_price: price,
			};

			const res = await api.createBooking(payload);

			Alert.alert(
				"Berhasil!",
				"Booking berhasil dibuat. Silakan lakukan pembayaran.",
				[
					{
						text: "OK",
						onPress: () => {
							// Reset navigasi ke Home / History
							navigation.popToTop();
							// @ts-ignore
							navigation.navigate("History");
						},
					},
				],
			);
		} catch (error: any) {
			Alert.alert(
				"Gagal",
				error.response?.data?.message ||
					"Terjadi kesalahan saat booking.",
			);
		} finally {
			setSubmitting(false);
		}
	};

	// --- RENDER STEPS ---

	// 1. Render Pilih Tanggal
	const renderStep1 = () => (
		<View>
			<Text className="text-xl font-bold text-gray-900 mb-4 font-[Outfit_700Bold]">
				Pilih Tanggal Mancing
			</Text>
			<View className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
				<FlatList
					horizontal
					data={availableDates}
					showsHorizontalScrollIndicator={false}
					keyExtractor={(item) => item.toISOString()}
					renderItem={({ item }) => {
						const isSelected =
							item.toDateString() === selectedDate.toDateString();
						return (
							<TouchableOpacity
								onPress={() => setSelectedDate(item)}
								className={`mr-3 p-3 rounded-xl border items-center w-20 ${
									isSelected
										? "bg-blue-600 border-blue-600"
										: "bg-gray-50 border-gray-200"
								}`}
							>
								<Text
									className={`text-xs mb-1 ${
										isSelected
											? "text-blue-100"
											: "text-gray-500"
									}`}
								>
									{item.toLocaleDateString("id-ID", {
										weekday: "short",
									})}
								</Text>
								<Text
									className={`text-xl font-bold ${
										isSelected
											? "text-white"
											: "text-gray-800"
									}`}
								>
									{item.getDate()}
								</Text>
							</TouchableOpacity>
						);
					}}
				/>
				<View className="mt-6 p-4 bg-blue-50 rounded-xl flex-row items-center">
					<Calendar size={20} color="#2563EB" />
					<Text className="ml-3 text-blue-800 font-medium">
						{selectedDate.toLocaleDateString("id-ID", {
							weekday: "long",
							year: "numeric",
							month: "long",
							day: "numeric",
						})}
					</Text>
				</View>
			</View>
		</View>
	);

	// 2. Render Pilih Lapak
	const renderStep2 = () => (
		<View>
			<Text className="text-xl font-bold text-gray-900 mb-4 font-[Outfit_700Bold]">
				Pilih Nomor Lapak
			</Text>

			<View className="flex-row justify-center gap-4 mb-4">
				<View className="flex-row items-center">
					<View className="w-3 h-3 bg-white border border-gray-300 rounded mr-2" />
					<Text className="text-xs text-gray-500">Tersedia</Text>
				</View>
				<View className="flex-row items-center">
					<View className="w-3 h-3 bg-blue-600 rounded mr-2" />
					<Text className="text-xs text-gray-500">Dipilih</Text>
				</View>
				<View className="flex-row items-center">
					<View className="w-3 h-3 bg-gray-300 rounded mr-2" />
					<Text className="text-xs text-gray-500">Terisi</Text>
				</View>
			</View>

			{loadingSpots ? (
				<View className="h-60 justify-center">
					<ActivityIndicator size="large" color="#2563EB" />
				</View>
			) : (
				<View className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex-row flex-wrap justify-center gap-3">
					{spots.map((spot) => {
						const isBooked = spot.status === "booked";
						const isSelected = selectedSpot === spot.number;

						return (
							<TouchableOpacity
								key={spot.id}
								disabled={isBooked}
								onPress={() => setSelectedSpot(spot.number)}
								className={`w-12 h-12 rounded-lg items-center justify-center border ${
									isBooked
										? "bg-gray-200 border-gray-200"
										: isSelected
											? "bg-blue-600 border-blue-600"
											: "bg-white border-gray-300"
								}`}
							>
								<Text
									className={`font-bold ${
										isBooked
											? "text-gray-400"
											: isSelected
												? "text-white"
												: "text-gray-700"
									}`}
								>
									{spot.number}
								</Text>
							</TouchableOpacity>
						);
					})}
				</View>
			)}
		</View>
	);

	// 3. Render Konfirmasi
	const renderStep3 = () => (
		<View>
			<Text className="text-xl font-bold text-gray-900 mb-4 font-[Outfit_700Bold]">
				Konfirmasi & Bayar
			</Text>

			{/* Ringkasan */}
			<View className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm mb-6">
				<View className="flex-row justify-between mb-2">
					<Text className="text-gray-500">Lokasi</Text>
					<Text className="font-bold text-gray-900">
						{locationName}
					</Text>
				</View>
				<View className="flex-row justify-between mb-2">
					<Text className="text-gray-500">Tanggal</Text>
					<Text className="font-bold text-gray-900">
						{selectedDate.toLocaleDateString("id-ID")}
					</Text>
				</View>
				<View className="flex-row justify-between mb-2">
					<Text className="text-gray-500">Nomor Lapak</Text>
					<Text className="font-bold text-gray-900">
						#{selectedSpot}
					</Text>
				</View>
				<View className="h-[1px] bg-gray-100 my-2" />
				<View className="flex-row justify-between">
					<Text className="font-bold text-gray-900">Total Harga</Text>
					<Text className="font-bold text-blue-600 text-lg">
						Rp {Number(price).toLocaleString("id-ID")}
					</Text>
				</View>
			</View>

			{/* Payment Method Reuse */}
			<PaymentMethod
				onSelect={(method: any) => setSelectedPayment(method)}
			/>
		</View>
	);

	return (
		<View className="flex-1 bg-gray-50">
			{/* Progress Header */}
			<View className="bg-white pt-12 pb-4 px-5 border-b border-gray-100">
				<Text className="text-center font-bold text-gray-900 mb-4 font-[Outfit_700Bold]">
					Booking Wizard
				</Text>
				<View className="flex-row justify-between items-center px-4">
					{[1, 2, 3].map((step) => (
						<View key={step} className="flex-row items-center">
							<View
								className={`w-8 h-8 rounded-full items-center justify-center ${
									currentStep >= step
										? "bg-blue-600"
										: "bg-gray-200"
								}`}
							>
								<Text className="text-white font-bold">
									{step}
								</Text>
							</View>
							{step < 3 && (
								<View
									className={`w-16 h-1 mx-2 ${
										currentStep > step
											? "bg-blue-600"
											: "bg-gray-200"
									}`}
								/>
							)}
						</View>
					))}
				</View>
				<View className="flex-row justify-between px-2 mt-2">
					<Text className="text-xs text-gray-500">Tanggal</Text>
					<Text className="text-xs text-gray-500 ml-4">Lapak</Text>
					<Text className="text-xs text-gray-500">Bayar</Text>
				</View>
			</View>

			{/* Main Content */}
			<ScrollView className="flex-1 p-5">
				{currentStep === 1 && renderStep1()}
				{currentStep === 2 && renderStep2()}
				{currentStep === 3 && renderStep3()}
				<View className="h-24" />
			</ScrollView>

			{/* Bottom Actions */}
			<View className="absolute bottom-0 w-full bg-white p-5 border-t border-gray-100 shadow-2xl flex-row justify-between">
				{currentStep > 1 ? (
					<TouchableOpacity
						onPress={() => setCurrentStep(currentStep - 1)}
						className="px-6 py-3 rounded-xl border border-gray-300 bg-white"
					>
						<Text className="font-bold text-gray-700">Kembali</Text>
					</TouchableOpacity>
				) : (
					<View /> // Spacer
				)}

				{currentStep < 3 ? (
					<TouchableOpacity
						onPress={() => {
							if (currentStep === 2 && !selectedSpot) {
								Alert.alert(
									"Pilih Lapak",
									"Silakan pilih nomor lapak terlebih dahulu.",
								);
								return;
							}
							setCurrentStep(currentStep + 1);
						}}
						className="px-6 py-3 rounded-xl bg-blue-600 shadow-lg shadow-blue-200 flex-row items-center"
					>
						<Text className="font-bold text-white mr-2">
							Lanjut
						</Text>
						<ChevronRight size={20} color="white" />
					</TouchableOpacity>
				) : (
					<TouchableOpacity
						onPress={handleBooking}
						disabled={submitting}
						className={`px-8 py-3 rounded-xl flex-row items-center shadow-lg ${
							submitting
								? "bg-gray-400"
								: "bg-green-600 shadow-green-200"
						}`}
					>
						{submitting ? (
							<ActivityIndicator color="white" />
						) : (
							<>
								<Check
									size={20}
									color="white"
									className="mr-2"
								/>
								<Text className="font-bold text-white">
									Selesaikan
								</Text>
							</>
						)}
					</TouchableOpacity>
				)}
			</View>
		</View>
	);
};

export default BookingScreen;
