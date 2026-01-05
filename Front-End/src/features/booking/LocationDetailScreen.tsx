import React, { useEffect, useState } from "react";
import {
	View,
	Text,
	Image,
	ScrollView,
	TouchableOpacity,
	ActivityIndicator,
	Dimensions,
	Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRoute, useNavigation } from "@react-navigation/native";
import { ArrowLeft, MapPin, Star, Clock, Calendar, Minus, Plus } from "lucide-react-native";
import api from "@/services/api";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import ReviewList from "./components/ReviewList";
import LocationMapCard from "./components/LocationMapCard";
import { getImageUrl } from "@/utils/imageHelper";

const { width } = Dimensions.get("window");

const LocationDetailScreen = () => {
	const route = useRoute<any>();
	const navigation = useNavigation<NativeStackNavigationProp<any>>();
	const { id } = route.params;

	const [location, setLocation] = useState<any>(null);
	const [loading, setLoading] = useState(true);
	const [duration, setDuration] = useState(2);
	const [selectedDate, setSelectedDate] = useState(new Date());
	const [showDatePicker, setShowDatePicker] = useState(false);

	useEffect(() => {
		fetchDetail();
	}, [id]);

	const fetchDetail = async () => {
		try {
			const res = await api.getLocationDetail(id);
			setLocation(res.data);
		} catch (error) {
			console.log("Error load detail lokasi:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleIncreaseDuration = () => {
		setDuration(duration + 1);
	};

	const handleDecreaseDuration = () => {
		if (duration > 1) {
			setDuration(duration - 1);
		}
	};

	const calculateTotal = () => {
		const pricePerHour = location?.price_per_hour || 0;
		return pricePerHour * duration;
	};

	const formatDate = (date: Date) => {
		return date.toLocaleDateString("id-ID", {
			day: "numeric",
			month: "long",
			year: "numeric",
		});
	};

	const onDateChange = (event: any, date?: Date) => {
		if (Platform.OS === "android") {
			setShowDatePicker(false);
		}
		if (date) {
			setSelectedDate(date);
			if (Platform.OS === "ios") {
				setShowDatePicker(false);
			}
		}
	};

	if (loading || !location)
		return (
			<View className="flex-1 justify-center">
				<ActivityIndicator size="large" color="#2563EB" />
			</View>
		);

	return (
		<View className="flex-1 bg-white">
			<ScrollView
				showsVerticalScrollIndicator={false}
				contentContainerStyle={{ paddingBottom: 100 }}
			>
				{/* Image Header */}
				<View className="relative">
					<Image
						source={{
							uri: getImageUrl(location?.img || location?.image),
						}}
						className="w-full h-64 bg-gray-200"
						resizeMode="cover"
					/>
					<TouchableOpacity
						onPress={() => navigation.goBack()}
						className="absolute top-12 left-5 bg-white/80 p-2 rounded-full"
					>
						<ArrowLeft size={24} color="black" />
					</TouchableOpacity>
				</View>

				{/* Content */}
				<View className="px-5 py-6 -mt-6 bg-white rounded-t-3xl">
					{/* Title and Rating */}
					<Text className="text-2xl font-bold text-gray-900 mb-2 font-[Outfit_700Bold]">
						{location.name}
					</Text>

					{/* Address */}
					<View className="flex-row items-center mb-3">
						<MapPin size={14} color="#6B7280" />
						<Text className="text-gray-500 text-sm ml-1">
							{location.address}, {location.city}
						</Text>
					</View>

					{/* Rating and Hours */}
					<View className="flex-row items-center mb-6">
						<View className="flex-row items-center mr-6">
							<Star size={16} fill="#FBBF24" color="#FBBF24" />
							<Text className="ml-1 font-bold text-gray-900">
								{location.rating_average || "4.9"}
							</Text>
							<Text className="text-gray-500 text-sm ml-1">
								· {location.total_reviews || "168"} ulasan
							</Text>
						</View>
						<View className="flex-row items-center">
							<Clock size={16} color="#6B7280" />
							<Text className="text-gray-500 text-sm ml-1">
								06:00 - 22:00
							</Text>
						</View>
					</View>

					{/* Price per hour */}
					<View className="flex-row items-center mb-6">
						<Text className="text-gray-500 text-sm mr-2">Jam buka</Text>
						<View className="h-4 w-[1px] bg-gray-300 mr-2" />
						<Text className="text-blue-600 font-bold text-lg">
							Rp {Number(location.price_per_hour || 0).toLocaleString("id-ID")}/jam
						</Text>
					</View>

					<View className="h-[1px] bg-gray-100 mb-6" />

					{/* Description */}
					<Text className="font-bold text-lg text-gray-900 mb-3">
						Tentang tempat ini
					</Text>
					<Text className="text-gray-600 leading-relaxed mb-6">
						{location.description ||
							"Nikmati pengalaman memancing yang menenangkan di lokasi kami dengan fasilitas lengkap dan pemandangan asri."}
					</Text>

					{/* Booking Card */}
					<View className="bg-blue-600 rounded-3xl p-5 mb-6 shadow-lg">
						<Text className="text-white font-bold text-xl mb-4">
							Mulai Booking
						</Text>

						{/* Price */}
						<Text className="text-white/80 text-sm mb-1">Harga Tiket</Text>
						<Text className="text-white font-bold text-2xl mb-4">
							Rp {Number(location.price_per_hour || 0).toLocaleString("id-ID")}/jam
						</Text>

						{/* Date Picker */}
						<Text className="text-white/80 text-sm mb-2">Pilih Tanggal</Text>
						<TouchableOpacity 
							onPress={() => setShowDatePicker(true)}
							className="bg-blue-500 rounded-xl px-4 py-3 mb-4 flex-row items-center"
						>
							<Calendar size={18} color="white" />
							<Text className="text-white ml-2 font-medium">
								{formatDate(selectedDate)}
							</Text>
						</TouchableOpacity>

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

						{/* Duration Rental */}
						<Text className="text-white/80 text-sm mb-2">Durasi Rental</Text>
						<View className="flex-row items-center justify-between mb-4">
							<TouchableOpacity
								onPress={handleDecreaseDuration}
								className="bg-red-500 w-10 h-10 rounded-full items-center justify-center"
							>
								<Minus size={20} color="white" />
							</TouchableOpacity>
							<Text className="text-white font-bold text-xl">
								{duration} jam
							</Text>
							<TouchableOpacity
								onPress={handleIncreaseDuration}
								className="bg-green-500 w-10 h-10 rounded-full items-center justify-center"
							>
								<Plus size={20} color="white" />
							</TouchableOpacity>
						</View>

						{/* Calculation */}
						<View className="bg-blue-500/50 rounded-xl px-4 py-3 mb-2">
							<View className="flex-row justify-between items-center">
								<Text className="text-white/90 text-sm">
									Rp {Number(location.price_per_hour || 0).toLocaleString("id-ID")} x {duration} jam
								</Text>
								<Text className="text-white font-bold text-base">
									Rp {calculateTotal().toLocaleString("id-ID")}
								</Text>
							</View>
						</View>

						{/* Total */}
						<View className="flex-row justify-between items-center mb-4">
							<Text className="text-white font-bold text-lg">Total</Text>
							<Text className="text-white font-bold text-2xl">
								Rp {calculateTotal().toLocaleString("id-ID")}
							</Text>
						</View>

						{/* Button */}
						<TouchableOpacity
							onPress={() =>
								navigation.navigate("BookingForm", {
									locationId: location.id,
									locationName: location.name,
									locationAddress: `${location.address}, ${location.city}`,
									price: location.price_per_hour,
									duration: duration,
									totalPrice: calculateTotal(),
									locationImage: location.img || location.image,
									selectedDate: selectedDate.toISOString(),
								})
							}
							className="bg-white rounded-xl py-4 items-center"
						>
							<Text className="text-blue-600 font-bold text-base">
								Lanjutkan Pembayaran
							</Text>
						</TouchableOpacity>
					</View>

					<View className="h-[1px] bg-gray-100 mb-6" />

					{/* Location Section */}
					<LocationMapCard
						address={location.address}
						city={location.city}
					/>

					{/* Review Section */}
					<View className="mt-6">
						<ReviewList reviews={location.reviews} />
					</View>

					{/* Spacer agar tidak tertutup tombol bawah */}
					<View className="h-12" />
				</View>
			</ScrollView>
		</View>
	);
};

export default LocationDetailScreen;
