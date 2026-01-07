import React, { useState, useEffect } from "react";
import {
	View,
	Text,
	ScrollView,
	TouchableOpacity,
	Alert,
	ActivityIndicator,
	TextInput,
	Image,
	Platform,
	KeyboardAvoidingView,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
	ArrowLeft,
	Check,
	CreditCard,
	Store,
	Calendar,
	Building,
	MapPin,
} from "lucide-react-native";
import api from "@/services/api";
import { getImageUrl } from "@/utils/imageHelper";
import AsyncStorage from "@react-native-async-storage/async-storage";

const BookingScreen = () => {
	const navigation = useNavigation<NativeStackNavigationProp<any>>();
	const route = useRoute<any>();

	// Ambil parameter dari halaman sebelumnya (LocationDetail)
	const {
		locationId = 1,
		locationName = "Strike It! Cabang Bandung",
		locationAddress = "Jl. Cipamokolan, Bandung",
		price = 15000,
		duration = 2,
		totalPrice = 30000,
		locationImage = "",
		selectedDate: initialDate,
	} = route.params || {};

	// --- STATE ---
	const [currentStep, setCurrentStep] = useState(1);

	// Step 1: Informasi Booking
	const [fullName, setFullName] = useState("");
	const [email, setEmail] = useState("");
	const [phone, setPhone] = useState("");
	const [selectedDate, setSelectedDate] = useState(
		initialDate ? new Date(initialDate) : new Date()
	);
	const [showDatePicker, setShowDatePicker] = useState(false);
	const [selectedHour, setSelectedHour] = useState<number | null>(null);
	const [hourAvailability, setHourAvailability] = useState<any[]>([]);
	const [loadingHours, setLoadingHours] = useState(false);

	// Step 2: Pilih Spot
	const [selectedSpot, setSelectedSpot] = useState<string | null>(null);
	const [spots, setSpots] = useState<any[]>([]);
	const [loadingSpots, setLoadingSpots] = useState(false);

	// Step 3: Pembayaran
	const [selectedPayment, setSelectedPayment] = useState<"card" | "qris" | "transfer" | "cod">("card");
	const [cardNumber, setCardNumber] = useState("");
	const [cardName, setCardName] = useState("");
	const [expiryDate, setExpiryDate] = useState("");
	const [cvv, setCvv] = useState("");
	const [voucherCode, setVoucherCode] = useState("");
	const [notes, setNotes] = useState("");

	// Voucher/Discount state
	const [discountAmount, setDiscountAmount] = useState(0);
	const [isVoucherApplied, setIsVoucherApplied] = useState(false);
	const [applyingVoucher, setApplyingVoucher] = useState(false);

	const [submitting, setSubmitting] = useState(false);

	// --- AUTO-FILL FROM PROFILE ---
	useEffect(() => {
		loadUserData();
	}, []);

	const loadUserData = async () => {
		try {
			const userData = await AsyncStorage.getItem("user");
			if (userData) {
				const user = JSON.parse(userData);
				setFullName(user.name || "");
				setEmail(user.email || "");
				setPhone(user.phone || "");
			}
		} catch (error) {
			console.log("Error loading user data:", error);
		}
	};

	// Date picker helper function
	const formatDate = (date: Date) => {
		return date.toLocaleDateString("id-ID", {
			weekday: "long",
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	};

	// Helper function to format date as YYYY-MM-DD using local timezone
	// This prevents the date from shifting due to UTC conversion
	const formatDateString = (date: Date) => {
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, "0");
		const day = String(date.getDate()).padStart(2, "0");
		return `${year}-${month}-${day}`;
	};

	const onDateChange = (event: any, date?: Date) => {
		if (Platform.OS === "android") {
			setShowDatePicker(false);
		}
		if (date) {
			setSelectedDate(date);
			setSelectedHour(null); // Reset hour when date changes
			fetchHourAvailability(date); // Fetch availability for new date
			if (Platform.OS === "ios") {
				setShowDatePicker(false);
			}
		}
	};

	// Fetch hour availability when component mounts or date changes
	useEffect(() => {
		fetchHourAvailability(selectedDate);
	}, []);

	const fetchHourAvailability = async (date: Date) => {
		setLoadingHours(true);
		try {
			const dateString = formatDateString(date);
			const res = await api.getHourAvailability(locationId, dateString);
			// The availability endpoint returns hourly data
			if (Array.isArray(res.data) && res.data.length > 0 && res.data[0].time) {
				setHourAvailability(res.data);
			} else {
				// Generate default availability from 8 AM to 5 PM
				const defaultHours = [];
				for (let h = 8; h <= 17; h++) {
					defaultHours.push({
						time: `${h.toString().padStart(2, "0")}:00`,
						hour: h,
						is_full: false,
						remaining: 10,
					});
				}
				setHourAvailability(defaultHours);
			}
		} catch (error) {
			console.log("Error fetching availability:", error);
			// Fallback: generate default hours
			const defaultHours = [];
			for (let h = 8; h <= 17; h++) {
				defaultHours.push({
					time: `${h.toString().padStart(2, "0")}:00`,
					hour: h,
					is_full: false,
					remaining: 10,
				});
			}
			setHourAvailability(defaultHours);
		} finally {
			setLoadingHours(false);
		}
	};

	// --- STEP 2: SPOT SELECTION LOGIC ---
	useEffect(() => {
		if (currentStep === 2) {
			fetchSpots();
		}
	}, [currentStep]);

	const generateBaseLayout = () => {
		const layout = [];
		// Top Row: A1-A5
		for (let i = 1; i <= 5; i++) layout.push({ id: `A${i}`, number: `A${i}`, status: 'available' });
		// Left Column: B1-B8
		for (let i = 1; i <= 8; i++) layout.push({ id: `B${i}`, number: `B${i}`, status: 'available' });
		// Right Column: C1-C8
		for (let i = 1; i <= 8; i++) layout.push({ id: `C${i}`, number: `C${i}`, status: 'available' });
		// Bottom Row: D1-D5
		for (let i = 1; i <= 5; i++) layout.push({ id: `D${i}`, number: `D${i}`, status: 'available' });
		return layout;
	};

	const fetchSpots = async () => {
		setLoadingSpots(true);
		try {
			// 1. Generate default layout (26 spots)
			let finalSpots = generateBaseLayout();

			// 2. Try to fetch real data with hour filtering
			try {
				// Use the selected date and hour for checking availability
				const dateString = formatDateString(selectedDate);
				// Pass selected hour and duration to get accurate spot availability
				const res = await api.getLocationSpots(
					locationId,
					dateString,
					selectedHour ?? undefined,
					duration
				);
				const apiSpots = res.data;

				if (Array.isArray(apiSpots) && apiSpots.length > 0) {
					// Merge API data into layout based on spot number
					finalSpots = finalSpots.map(defaultSpot => {
						const found = apiSpots.find((s: any) => s.number === defaultSpot.number);
						if (found) {
							return { ...defaultSpot, ...found };
						}
						return defaultSpot;
					});
				} else {
					// If API returns empty, keep them available
					console.log("API returned empty spots, using default layout");
				}
			} catch (apiError) {
				console.log("API Error, using default layout:", apiError);
				// Fallback: keep all available for demo
			}

			setSpots(finalSpots);
		} finally {
			setLoadingSpots(false);
		}
	};

	// Apply Voucher Function
	const applyVoucher = async () => {
		if (!voucherCode.trim()) {
			Alert.alert("Kode Kosong", "Masukkan kode voucher terlebih dahulu.");
			return;
		}

		setApplyingVoucher(true);
		try {
			const res = await api.checkVoucher(voucherCode);

			if (res.data.valid) {
				const valStr = res.data.discount_value;
				let discount = 0;
				const subtotal = totalPrice || price * duration;

				if (valStr.includes("%")) {
					const percent = parseInt(valStr.replace("%", ""));
					discount = Math.round(subtotal * (percent / 100));
				} else {
					discount = parseInt(valStr);
				}

				setDiscountAmount(discount);
				setIsVoucherApplied(true);
				Alert.alert("Berhasil!", `Voucher berhasil! Hemat Rp ${discount.toLocaleString("id-ID")}`);
			}
		} catch (error: any) {
			setDiscountAmount(0);
			setIsVoucherApplied(false);
			Alert.alert("Gagal", error.response?.data?.message || "Kode voucher tidak valid.");
		} finally {
			setApplyingVoucher(false);
		}
	};

	const removeVoucher = () => {
		setVoucherCode("");
		setDiscountAmount(0);
		setIsVoucherApplied(false);
	};

	// Calculate prices with discount
	const subtotal = totalPrice || price * duration;
	const tax = Math.round(subtotal * 0.1);
	const total = Math.max(0, subtotal + tax - discountAmount);

	// --- VALIDATE & SUBMIT ---
	const validateStep1 = () => {
		if (!fullName.trim() || !email.trim() || !phone.trim()) {
			Alert.alert("Lengkapi Data", "Semua field harus diisi.");
			return false;
		}
		if (selectedHour === null) {
			Alert.alert("Pilih Jam", "Silakan pilih jam booking terlebih dahulu.");
			return false;
		}
		return true;
	};

	const validateStep2 = () => {
		if (!selectedSpot) {
			Alert.alert("Pilih Spot", "Silakan pilih nomor spot terlebih dahulu.");
			return false;
		}
		return true;
	};

	const handleNext = () => {
		if (currentStep === 1 && !validateStep1()) return;
		if (currentStep === 2 && !validateStep2()) return;
		setCurrentStep(currentStep + 1);
	};

	const handleBooking = async () => {
		setSubmitting(true);
		try {
			// Split full name into first and last name
			const names = fullName.trim().split(" ");
			const firstName = names[0];
			const lastName = names.slice(1).join(" ") || names[0]; // Fallback if no last name

			const dateString = formatDateString(selectedDate);
			// Use selected hour for booking start time
			const hourStr = selectedHour !== null ? selectedHour.toString().padStart(2, "0") : "08";
			const bookingStart = `${dateString} ${hourStr}:00:00`;

			// Map payment method string to ID
			// 1: Debit Card, 2: Bank Transfer, 3: QRIS, 4: COD
			let paymentMethodId = 1;
			switch (selectedPayment) {
				case "card":
					paymentMethodId = 1;
					break;
				case "transfer":
					paymentMethodId = 2;
					break;
				case "qris":
					paymentMethodId = 3;
					break;
				case "cod":
					paymentMethodId = 4;
					break;
			}

			const payload = {
				id_location: locationId, // Backend expects id_location
				first_name: firstName,   // Backend expects first_name
				last_name: lastName,     // Backend expects last_name
				email: email,
				phone: phone,
				booking_date: dateString,
				booking_start: bookingStart, // Backend needs this for calculation
				spot_number: selectedSpot,
				duration: duration,
				// total_price: total, // Backend calculates this
				payment_method: paymentMethodId,
				voucher_code: voucherCode,
				notes: notes,
			};

			// Uncomment when API ready
			const res = await api.createBooking(payload);

			Alert.alert(
				"Berhasil!",
				"Booking berhasil dibuat. Silakan lakukan pembayaran.",
				[
					{
						text: "OK",
						onPress: () => navigation.goBack(),
					},
				],
			);
		} catch (error: any) {
			Alert.alert(
				"Gagal",
				error.response?.data?.message || "Terjadi kesalahan saat booking.",
			);
		} finally {
			setSubmitting(false);
		}
	};

	// --- RENDER STEPS ---

	// Step 1: Informasi Booking (Form Data Diri)
	const renderStep1 = () => (
		<View>
			<Text className="text-center text-gray-500 mb-6">
				Isi detail informasi di bawah ini
			</Text>

			{/* Location Card */}
			<View className="bg-white rounded-2xl overflow-hidden mb-6 shadow-sm">
				<Image
					source={{ uri: getImageUrl(locationImage) }}
					className="w-full h-48 bg-gray-200"
					resizeMode="cover"
				/>
				<View className="p-4">
					<View className="flex-row justify-between items-center mb-2">
						<Text className="text-blue-600 font-outfit-bold text-lg">
							Rp {Number(price).toLocaleString("id-ID")}/jam
						</Text>
						<Text className="text-gray-500 text-sm">per {duration} jam</Text>
					</View>
					<Text className="text-xl font-outfit-bold text-gray-900 mb-2">
						{locationName}
					</Text>
					<Text className="text-gray-500 text-sm mb-3">{locationAddress}</Text>

					<View className="bg-blue-50 rounded-lg p-3">
						<View className="flex-row justify-between items-center mb-1">
							<Text className="text-gray-600 text-sm">Durasi Booking</Text>
							<Text className="text-gray-900 font-outfit-bold">{duration} jam</Text>
						</View>
						<View className="flex-row justify-between items-center">
							<Text className="text-gray-600 text-sm">Total Harga</Text>
							<Text className="text-blue-600 font-outfit-bold text-lg">
								Rp {(totalPrice || price * duration).toLocaleString("id-ID")}
							</Text>
						</View>
					</View>
				</View>
			</View>

			{/* Date Picker */}
			<View className="mb-4">
				<Text className="text-gray-700 mb-2">
					Tanggal Booking <Text className="text-red-500">*</Text>
				</Text>
				<TouchableOpacity
					onPress={() => setShowDatePicker(true)}
					className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 flex-row items-center"
				>
					<Calendar size={20} color="#2563EB" />
					<Text className="text-gray-900 ml-3 flex-1">
						{formatDate(selectedDate)}
					</Text>
				</TouchableOpacity>
			</View>

			{showDatePicker && (
				<DateTimePicker
					value={selectedDate}
					mode="date"
					display={Platform.OS === "ios" ? "spinner" : "default"}
					onChange={onDateChange}
					minimumDate={new Date()}
					locale="id-ID"
				/>
			)}

			{/* Time Picker - Jam Booking */}
			<View className="mb-4">
				<Text className="text-gray-700 mb-2">
					Jam Booking <Text className="text-red-500">*</Text>
				</Text>
				{loadingHours ? (
					<View className="h-20 justify-center items-center">
						<ActivityIndicator size="small" color="#2563EB" />
					</View>
				) : (
					<View className="flex-row flex-wrap gap-2">
						{hourAvailability.map((slot) => {
							const hour = slot.hour !== undefined ? slot.hour : parseInt(slot.time.split(":")[0]);
							const isFull = slot.is_full;
							// Check if this hour is within the selected range
							const isSelected = selectedHour === hour;
							const isInRange = selectedHour !== null && hour >= selectedHour && hour < selectedHour + duration;

							return (
								<TouchableOpacity
									key={hour}
									disabled={isFull}
									onPress={() => {
										// Validate: check if all hours in duration exist and are available
										for (let i = 0; i < duration; i++) {
											const checkHour = hour + i;
											const checkSlot = hourAvailability.find(h => {
												const hTime = h.hour !== undefined ? h.hour : parseInt(h.time.split(":")[0]);
												return hTime === checkHour;
											});

											// If slot doesn't exist (shop closed at that hour)
											if (!checkSlot) {
												Alert.alert(
													"Jam Tidak Tersedia",
													`Booking ${duration} jam mulai pukul ${hour.toString().padStart(2, "0")}:00 tidak bisa karena lokasi tutup jam ${checkHour.toString().padStart(2, "0")}:00. Silakan pilih jam yang lebih awal atau kurangi durasi.`
												);
												return;
											}

											// If slot is full
											if (checkSlot.is_full) {
												Alert.alert(
													"Jadwal Konflik",
													`Jam ${checkHour.toString().padStart(2, "0")}:00 sudah penuh. Silakan pilih jam lain.`
												);
												return;
											}
										}

										setSelectedHour(hour);
									}}
									className={`px-4 py-3 rounded-xl border-2 min-w-[70px] items-center ${isFull
										? "bg-red-100 border-red-200 opacity-50"
										: isInRange
											? isSelected
												? "bg-blue-600 border-blue-600"
												: "bg-blue-400 border-blue-400"
											: "bg-gray-50 border-gray-200"
										}`}
								>
									<Text
										className={`font-outfit-bold text-sm ${isFull
											? "text-red-500"
											: isInRange
												? "text-white"
												: "text-gray-700"
											}`}
									>
										{hour.toString().padStart(2, "0")}:00
									</Text>
									{isFull && (
										<Text className="text-red-400 text-xs">Penuh</Text>
									)}
								</TouchableOpacity>
							);
						})}
					</View>
				)}
				{selectedHour !== null && (
					<View className="mt-3 bg-blue-50 rounded-lg p-3 flex-row items-center">
						<Check size={16} color="#2563EB" />
						<Text className="text-blue-700 ml-2 font-outfit-medium">
							Jam terpilih: {selectedHour.toString().padStart(2, "0")}:00 - {(selectedHour + duration).toString().padStart(2, "0")}:00
						</Text>
					</View>
				)}
			</View>

			{/* Form - 3 Fields Only */}
			<View className="space-y-4">
				<View>
					<Text className="text-gray-700 mb-2">
						Nama Lengkap <Text className="text-red-500">*</Text>
					</Text>
					<TextInput
						placeholder="Masukkan nama lengkap"
						value={fullName}
						onChangeText={setFullName}
						className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900"
					/>
				</View>

				<View className="mt-4">
					<Text className="text-gray-700 mb-2">
						Email <Text className="text-red-500">*</Text>
					</Text>
					<TextInput
						placeholder="contoh@email.com"
						value={email}
						onChangeText={setEmail}
						keyboardType="email-address"
						autoCapitalize="none"
						className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900"
					/>
				</View>

				<View className="mt-4">
					<Text className="text-gray-700 mb-2">
						Nomor Telepon <Text className="text-red-500">*</Text>
					</Text>
					<TextInput
						placeholder="08xxxxxxxxxx"
						value={phone}
						onChangeText={setPhone}
						keyboardType="phone-pad"
						className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900"
					/>
				</View>
			</View>
		</View>
	);

	// Step 2: Pilih Kursi (Spot Layout)
	const renderStep2 = () => {
		// Render single spot component
		const renderSpot = (spot: any) => {
			const isBooked = spot.status === "booked";
			const isSelected = selectedSpot === spot.number;

			// Determine fill color
			let fillColor = "transparent";
			if (isBooked) fillColor = "#EF4444";
			else if (isSelected) fillColor = "#2563EB";

			return (
				<TouchableOpacity
					key={spot.id || spot.number}
					disabled={isBooked}
					onPress={() => setSelectedSpot(spot.number)}
					className="items-center justify-center m-1"
				>
					<Store
						size={32}
						color={isBooked ? "#EF4444" : isSelected ? "#2563EB" : "#000000"}
						fill={fillColor}
						strokeWidth={1.5}
					/>
				</TouchableOpacity>
			);
		};

		const getSpots = (start: number, count: number) => {
			return spots.slice(start, start + count);
		};

		return (
			<View>
				{loadingSpots ? (
					<View className="h-96 justify-center items-center">
						<ActivityIndicator size="large" color="#2563EB" />
					</View>
				) : (
					<View>
						{spots.length === 0 ? (
							<View className="h-64 justify-center items-center">
								<Text className="text-gray-400">Tidak ada spot tersedia</Text>
							</View>
						) : (
							<View className="items-center mb-6 mt-4">
								{/* Top Row */}
								<View className="flex-row justify-center mb-2 gap-2">
									{getSpots(0, 5).map(renderSpot)}
								</View>

								<View className="flex-row justify-center items-stretch gap-2">
									{/* Left Column */}
									<View className="justify-center gap-2">
										{getSpots(5, 8).map(renderSpot)}
									</View>

									{/* Center Area */}
									{/* Center Area */}
									<View className="border border-gray-300 rounded-lg justify-center items-center w-48 mx-2 bg-white">
										<Text className="text-gray-900 text-center font-outfit-medium">
											Area Pemancingan
										</Text>
									</View>

									{/* Right Column */}
									<View className="justify-center gap-2">
										{getSpots(13, 8).map(renderSpot)}
									</View>
								</View>

								{/* Bottom Row */}
								<View className="flex-row justify-center mt-2 gap-2">
									{getSpots(21, 5).map(renderSpot)}
								</View>
							</View>
						)}

						{/* Legend / Informasi Kursi */}
						<View className="items-center mb-8">
							<Text className="text-blue-900 font-outfit-bold text-lg mb-4">
								Informasi Kursi
							</Text>
							<View className="flex-row gap-4">
								<View className="items-center bg-white p-4 rounded-2xl shadow-sm w-24 border border-gray-100">
									<Store size={32} color="#2563EB" fill="#2563EB" strokeWidth={1.5} />
									<Text className="text-blue-900 text-xs mt-2 font-outfit-medium">Dipilih</Text>
								</View>
								<View className="items-center bg-white p-4 rounded-2xl shadow-sm w-24 border border-gray-100">
									<Store size={32} color="#000000" strokeWidth={1.5} />
									<Text className="text-blue-900 text-xs mt-2 font-outfit-medium">Tersedia</Text>
								</View>
								<View className="items-center bg-white p-4 rounded-2xl shadow-sm w-24 border border-gray-100">
									<Store size={32} color="#EF4444" fill="#EF4444" strokeWidth={1.5} />
									<Text className="text-blue-900 text-xs mt-2 font-outfit-medium">Terisi</Text>
								</View>
							</View>
						</View>

						{/* Selected Spot Display */}
						{selectedSpot && (
							<View className="bg-blue-600 rounded-2xl p-4 mb-6 mx-4">
								<Text className="text-white text-sm mb-1 text-center">Spot Terpilih</Text>
								<Text className="text-white font-outfit-bold text-3xl text-center">
									{selectedSpot}
								</Text>
							</View>
						)}
					</View>
				)}
			</View>
		);
	};

	// Step 3: Pembayaran
	const renderStep3 = () => (
		<View>
			{/* Detail Booking Card */}
			<View className="bg-blue-600 rounded-2xl p-5 mb-6">
				<Text className="text-white font-outfit-bold text-lg mb-4">Detail Booking</Text>

				<View className="flex-row justify-between mb-2">
					<Text className="text-white/80">Lokasi</Text>
					<Text className="text-white font-outfit-medium">{locationName}</Text>
				</View>

				<View className="flex-row justify-between mb-2">
					<Text className="text-white/80">Durasi</Text>
					<Text className="text-white font-outfit-medium">{duration} jam</Text>
				</View>

				<View className="flex-row justify-between mb-2">
					<Text className="text-white/80">Waktu</Text>
					<Text className="text-white font-outfit-medium">
						{selectedHour !== null ? `${selectedHour.toString().padStart(2, "0")}:00 - ${(selectedHour + duration).toString().padStart(2, "0")}:00` : "-"}
					</Text>
				</View>

				<View className="flex-row justify-between mb-3">
					<Text className="text-white/80">Jumlah Spot</Text>
					<Text className="text-white font-outfit-medium">1 spot</Text>
				</View>

				{selectedSpot && (
					<View className="bg-blue-500 rounded-xl p-3 items-center justify-center">
						<Text className="text-white font-outfit-bold text-2xl">{selectedSpot}</Text>
					</View>
				)}
			</View>

			{/* Rincian Harga */}
			<View className="mb-6">
				<Text className="font-outfit-bold text-lg text-gray-900 mb-3">Rincian Harga</Text>

				<View className="flex-row justify-between mb-2">
					<Text className="text-gray-600">Subtotal</Text>
					<Text className="text-gray-900 font-outfit-medium">
						Rp {subtotal.toLocaleString("id-ID")}
					</Text>
				</View>

				<View className="flex-row justify-between mb-2">
					<Text className="text-gray-600">Pajak (10%)</Text>
					<Text className="text-gray-900 font-outfit-medium">
						Rp {tax.toLocaleString("id-ID")}
					</Text>
				</View>

				{discountAmount > 0 && (
					<View className="flex-row justify-between mb-2">
						<Text className="text-green-600">Diskon Voucher</Text>
						<Text className="text-green-600 font-outfit-medium">
							- Rp {discountAmount.toLocaleString("id-ID")}
						</Text>
					</View>
				)}

				<View className="h-[1px] bg-gray-200 mb-3" />

				<View className="flex-row justify-between">
					<Text className="font-outfit-bold text-lg text-gray-900">Total Pembayaran</Text>
					<Text className="font-outfit-bold text-xl text-blue-600">
						Rp {total.toLocaleString("id-ID")}
					</Text>
				</View>
			</View>

			{/* Metode Pembayaran */}
			<View className="mb-6">
				<Text className="font-outfit-bold text-lg text-gray-900 mb-3">Metode Pembayaran</Text>

				{/* Card Payment */}
				<TouchableOpacity
					onPress={() => setSelectedPayment("card")}
					className={`border-2 rounded-xl p-4 mb-3 flex-row items-center ${selectedPayment === "card" ? "border-blue-600 bg-blue-50" : "border-gray-200"
						}`}
				>
					<View
						className={`w-5 h-5 rounded-full border-2 mr-3 items-center justify-center ${selectedPayment === "card" ? "border-blue-600" : "border-gray-300"
							}`}
					>
						{selectedPayment === "card" && (
							<View className="w-3 h-3 rounded-full bg-blue-600" />
						)}
					</View>
					<CreditCard size={24} color={selectedPayment === "card" ? "#2563EB" : "#6B7280"} />
					<Text
						className={`ml-3 font-outfit-medium ${selectedPayment === "card" ? "text-blue-600" : "text-gray-700"
							}`}
					>
						Kartu Kredit/Debit
					</Text>
					<View className="ml-auto flex-row gap-2">
						<View className="bg-gray-200 px-2 py-1 rounded">
							<Text className="text-xs font-outfit-bold">VISA</Text>
						</View>
						<View className="bg-gray-200 px-2 py-1 rounded">
							<Text className="text-xs font-outfit-bold">MC</Text>
						</View>
					</View>
				</TouchableOpacity>

				{/* QRIS Payment */}
				<TouchableOpacity
					onPress={() => setSelectedPayment("qris")}
					className={`border-2 rounded-xl p-4 mb-3 flex-row items-center ${selectedPayment === "qris" ? "border-blue-600 bg-blue-50" : "border-gray-200"
						}`}
				>
					<View
						className={`w-5 h-5 rounded-full border-2 mr-3 items-center justify-center ${selectedPayment === "qris" ? "border-blue-600" : "border-gray-300"
							}`}
					>
						{selectedPayment === "qris" && (
							<View className="w-3 h-3 rounded-full bg-blue-600" />
						)}
					</View>
					<Store size={24} color={selectedPayment === "qris" ? "#2563EB" : "#6B7280"} />
					<Text
						className={`ml-3 font-outfit-medium ${selectedPayment === "qris" ? "text-blue-600" : "text-gray-700"
							}`}
					>
						QRIS (Scan & Pay)
					</Text>
				</TouchableOpacity>

				{/* Bank Transfer */}
				<TouchableOpacity
					onPress={() => setSelectedPayment("transfer")}
					className={`border-2 rounded-xl p-4 mb-3 flex-row items-center ${selectedPayment === "transfer" ? "border-blue-600 bg-blue-50" : "border-gray-200"
						}`}
				>
					<View
						className={`w-5 h-5 rounded-full border-2 mr-3 items-center justify-center ${selectedPayment === "transfer" ? "border-blue-600" : "border-gray-300"
							}`}
					>
						{selectedPayment === "transfer" && (
							<View className="w-3 h-3 rounded-full bg-blue-600" />
						)}
					</View>
					<Building size={24} color={selectedPayment === "transfer" ? "#2563EB" : "#6B7280"} />
					<Text
						className={`ml-3 font-outfit-medium ${selectedPayment === "transfer" ? "text-blue-600" : "text-gray-700"
							}`}
					>
						Bank Transfer (VA)
					</Text>
					<View className="ml-auto flex-row gap-1">
						<View className="bg-gray-200 px-2 py-1 rounded">
							<Text className="text-xs font-outfit-bold">BCA</Text>
						</View>
						<View className="bg-gray-200 px-2 py-1 rounded">
							<Text className="text-xs font-outfit-bold">BRI</Text>
						</View>
					</View>
				</TouchableOpacity>

				{/* COD - Bayar di Lokasi */}
				<TouchableOpacity
					onPress={() => setSelectedPayment("cod")}
					className={`border-2 rounded-xl p-4 flex-row items-center ${selectedPayment === "cod" ? "border-blue-600 bg-blue-50" : "border-gray-200"
						}`}
				>
					<View
						className={`w-5 h-5 rounded-full border-2 mr-3 items-center justify-center ${selectedPayment === "cod" ? "border-blue-600" : "border-gray-300"
							}`}
					>
						{selectedPayment === "cod" && (
							<View className="w-3 h-3 rounded-full bg-blue-600" />
						)}
					</View>
					<MapPin size={24} color={selectedPayment === "cod" ? "#2563EB" : "#6B7280"} />
					<Text
						className={`ml-3 font-outfit-medium ${selectedPayment === "cod" ? "text-blue-600" : "text-gray-700"
							}`}
					>
						Bayar di Lokasi
					</Text>
				</TouchableOpacity>
			</View>

			{/* Card Details - Only show if card selected */}
			{selectedPayment === "card" && (
				<View className="mb-6 space-y-4">
					<View>
						<Text className="text-gray-700 mb-2">Nomor Kartu</Text>
						<TextInput
							placeholder="1234 5678 9012 3456"
							value={cardNumber}
							onChangeText={setCardNumber}
							keyboardType="number-pad"
							maxLength={19}
							className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900"
						/>
					</View>

					<View className="mt-4">
						<Text className="text-gray-700 mb-2">Nama Pemegang Kartu</Text>
						<TextInput
							placeholder="Nama sesuai kartu"
							value={cardName}
							onChangeText={setCardName}
							className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900"
						/>
					</View>

					<View className="flex-row gap-3 mt-4">
						<View className="flex-1">
							<Text className="text-gray-700 mb-2">Tanggal Kadaluarsa</Text>
							<TextInput
								placeholder="MM/YY"
								value={expiryDate}
								onChangeText={setExpiryDate}
								maxLength={5}
								className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900"
							/>
						</View>
						<View className="flex-1">
							<Text className="text-gray-700 mb-2">CVV</Text>
							<TextInput
								placeholder="123"
								value={cvv}
								onChangeText={setCvv}
								keyboardType="number-pad"
								maxLength={3}
								secureTextEntry
								className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900"
							/>
						</View>
					</View>
				</View>
			)}

			{/* QRIS QR Code - Only show if QRIS selected */}
			{selectedPayment === "qris" && (
				<View className="mb-6 bg-white rounded-2xl p-6 border border-gray-100 items-center">
					<Text className="text-gray-900 font-outfit-bold text-lg mb-4">
						Scan QR Code untuk Membayar
					</Text>
					<Image
						source={{
							uri: "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=StrikeItBookingPayment",
						}}
						className="w-48 h-48 mb-4"
						resizeMode="contain"
					/>
					<Text className="text-gray-500 text-sm text-center">
						Gunakan aplikasi e-wallet atau mobile banking{"\n"}untuk scan kode QR di atas
					</Text>
					<View className="flex-row gap-2 mt-4">
						<View className="bg-gray-100 px-3 py-1 rounded-full">
							<Text className="text-xs text-gray-600">GoPay</Text>
						</View>
						<View className="bg-gray-100 px-3 py-1 rounded-full">
							<Text className="text-xs text-gray-600">OVO</Text>
						</View>
						<View className="bg-gray-100 px-3 py-1 rounded-full">
							<Text className="text-xs text-gray-600">DANA</Text>
						</View>
						<View className="bg-gray-100 px-3 py-1 rounded-full">
							<Text className="text-xs text-gray-600">ShopeePay</Text>
						</View>
					</View>
				</View>
			)}

			{/* Voucher */}
			<View className="mb-6">
				<Text className="font-outfit-bold text-lg text-gray-900 mb-3">
					Punya Kode Voucher?
				</Text>
				<View className="flex-row gap-2">
					<TextInput
						placeholder="Contoh: DISKON10"
						value={voucherCode}
						onChangeText={setVoucherCode}
						editable={!isVoucherApplied}
						autoCapitalize="characters"
						className={`flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 uppercase ${isVoucherApplied ? "bg-green-50 border-green-200" : ""
							}`}
					/>
					{isVoucherApplied ? (
						<TouchableOpacity
							onPress={removeVoucher}
							className="bg-red-500 px-4 rounded-xl justify-center"
						>
							<Text className="text-white font-outfit-bold">Hapus</Text>
						</TouchableOpacity>
					) : (
						<TouchableOpacity
							onPress={applyVoucher}
							disabled={applyingVoucher}
							className={`px-6 rounded-xl justify-center ${applyingVoucher ? "bg-gray-400" : "bg-blue-600"
								}`}
						>
							{applyingVoucher ? (
								<ActivityIndicator size="small" color="white" />
							) : (
								<Text className="text-white font-outfit-bold">Pakai</Text>
							)}
						</TouchableOpacity>
					)}
				</View>
				{isVoucherApplied && (
					<View className="mt-2 bg-green-50 p-3 rounded-lg flex-row items-center">
						<Check size={16} color="#16A34A" />
						<Text className="text-green-600 ml-2 text-sm font-outfit-medium">
							Diskon Rp {discountAmount.toLocaleString("id-ID")} berhasil diterapkan!
						</Text>
					</View>
				)}
			</View>

			{/* Catatan */}
			<View className="mb-6">
				<Text className="font-outfit-bold text-lg text-gray-900 mb-3">
					Catatan Booking
				</Text>
				<TextInput
					placeholder="Tulis catatan khusus untuk booking Anda (optional)"
					value={notes}
					onChangeText={setNotes}
					multiline
					numberOfLines={3}
					className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900"
					style={{ textAlignVertical: "top" }}
				/>
			</View>
		</View>
	);

	return (
		<KeyboardAvoidingView
			behavior={Platform.OS === "ios" ? "padding" : "height"}
			className="flex-1 bg-gray-50"
		>
			{/* Header */}
			<View className="bg-white pt-12 pb-4 px-5 border-b border-gray-100">
				<View className="flex-row items-center mb-4">
					<TouchableOpacity onPress={() => navigation.goBack()} className="mr-3">
						<ArrowLeft size={24} color="#000" />
					</TouchableOpacity>
					<Text className="text-xl font-outfit-bold text-gray-900">
						{currentStep === 1 && "Informasi Booking"}
						{currentStep === 2 && "Pilih Kursi"}
						{currentStep === 3 && "Pembayaran"}
					</Text>
				</View>

				{/* Progress Indicator */}
				<View className="flex-row justify-center items-center">
					{[1, 2, 3].map((step) => (
						<View key={step} className="flex-row items-center">
							<View
								className={`w-10 h-10 rounded-full items-center justify-center ${currentStep === step
									? "bg-blue-600"
									: currentStep > step
										? "bg-green-500"
										: "bg-gray-200"
									}`}
							>
								{currentStep > step ? (
									<Check size={20} color="white" />
								) : (
									<Text className={`font-outfit-bold ${currentStep === step ? "text-white" : "text-gray-400"}`}>
										{step}
									</Text>
								)}
							</View>
							{step < 3 && (
								<View className={`w-20 h-1 ${currentStep > step ? "bg-green-500" : "bg-gray-200"}`} />
							)}
						</View>
					))}
				</View>
			</View>

			{/* Main Content */}
			<ScrollView className="flex-1 px-5 py-6" showsVerticalScrollIndicator={false}>
				{currentStep === 1 && renderStep1()}
				{currentStep === 2 && renderStep2()}
				{currentStep === 3 && renderStep3()}
				<View className="h-32" />
			</ScrollView>

			{/* Bottom Actions */}
			<View className="bg-white px-5 py-4 border-t border-gray-100 pb-8">
				{currentStep < 3 ? (
					<View className="space-y-3">
						<TouchableOpacity
							onPress={handleNext}
							className="bg-blue-600 py-4 rounded-xl items-center shadow-lg"
						>
							<Text className="text-white font-outfit-bold text-base">
								Lanjutkan Pembayaran
							</Text>
						</TouchableOpacity>

						<TouchableOpacity
							onPress={() => navigation.goBack()}
							className="bg-red-500 py-4 rounded-xl items-center"
						>
							<Text className="text-white font-outfit-bold text-base">
								Batalkan
							</Text>
						</TouchableOpacity>
					</View>
				) : (
					<TouchableOpacity
						onPress={handleBooking}
						disabled={submitting}
						className={`py-4 rounded-xl items-center shadow-lg ${submitting ? "bg-gray-400" : "bg-blue-600"
							}`}
					>
						{submitting ? (
							<ActivityIndicator color="white" />
						) : (
							<Text className="text-white font-outfit-bold text-base">
								Bayar Sekarang • Rp {total.toLocaleString("id-ID")}
							</Text>
						)}
					</TouchableOpacity>
				)}
			</View>
		</KeyboardAvoidingView>
	);
};

export default BookingScreen;
