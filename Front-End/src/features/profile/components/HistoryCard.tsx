import React, { useState } from "react";
import { View, Text, TouchableOpacity, TextInput, Alert } from "react-native";
import { Calendar, ShoppingBag, MapPin, Star, MessageSquare, ChevronDown, ChevronUp } from "lucide-react-native";
import api from "@/services/api";

interface HistoryItem {
	id: number;
	originalId?: number;
	title: string;
	date: string;
	price: number;
	status: string;
	type: "booking" | "shop";
	targetId?: number; // Location ID for booking, Product ID for shop
	hasReviewed?: boolean;
}

interface HistoryCardProps {
	item: HistoryItem;
	onReviewSubmitted?: () => void;
}

const HistoryCard = ({ item, onReviewSubmitted }: HistoryCardProps) => {
	const [showReviewForm, setShowReviewForm] = useState(false);
	const [rating, setRating] = useState(0);
	const [reviewText, setReviewText] = useState("");
	const [submitting, setSubmitting] = useState(false);

	// Helper Warna Status - Updated to match backend statuses
	const getStatusStyle = (status: string) => {
		switch (status.toLowerCase()) {
			case "confirmed":
			case "completed":
			case "delivered":
			case "paid":
				return {
					bg: "bg-green-100",
					text: "text-green-700",
					label: "Selesai",
					canReview: true,
				};
			case "pending":
			case "unpaid":
				return {
					bg: "bg-yellow-100",
					text: "text-yellow-700",
					label: "Menunggu Bayar",
					canReview: false,
				};
			case "processing":
			case "shipped":
				return {
					bg: "bg-blue-100",
					text: "text-blue-700",
					label: "Diproses",
					canReview: false,
				};
			case "cancelled":
			case "failed":
				return {
					bg: "bg-red-100",
					text: "text-red-700",
					label: "Dibatalkan",
					canReview: false,
				};
			default:
				return {
					bg: "bg-gray-100",
					text: "text-gray-700",
					label: status,
					canReview: false,
				};
		}
	};

	const statusStyle = getStatusStyle(item.status);
	const canShowReview = statusStyle.canReview && !item.hasReviewed;

	const handleSubmitReview = async () => {
		if (rating === 0) {
			Alert.alert("Rating Diperlukan", "Silakan pilih rating bintang terlebih dahulu.");
			return;
		}

		setSubmitting(true);
		try {
			if (item.type === "booking" && item.targetId) {
				// Review for booking location
				await api.createReview({
					id_booking: item.originalId || item.id,
					id_location: item.targetId,
					rating: rating,
					comment: reviewText,
				});
			} else if (item.type === "shop" && item.targetId) {
				// Review for product
				await api.createProductReview(item.targetId, {
					rating: rating,
					comment: reviewText,
				});
			}

			Alert.alert("Berhasil!", "Ulasan Anda berhasil dikirim.");
			setShowReviewForm(false);
			setRating(0);
			setReviewText("");
			onReviewSubmitted?.();
		} catch (error: any) {
			Alert.alert("Gagal", error.response?.data?.message || "Terjadi kesalahan saat mengirim ulasan.");
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<View className="bg-white rounded-xl p-4 mb-4 border border-gray-100 shadow-sm">
			<View className="flex-row justify-between items-start mb-2">
				<View className="flex-row items-center gap-2 flex-1">
					<View
						className={`p-2 rounded-full ${item.type === "booking"
							? "bg-blue-50"
							: "bg-orange-50"
							}`}
					>
						{item.type === "booking" ? (
							<MapPin size={18} color="#2563EB" />
						) : (
							<ShoppingBag size={18} color="#EA580C" />
						)}
					</View>
					<View className="flex-1">
						<Text
							className="font-outfit-bold text-gray-800 text-base"
							numberOfLines={1}
						>
							{item.title}
						</Text>
						<Text className="text-xs text-gray-500 capitalize">
							{item.type === "booking"
								? "Booking Tempat"
								: "Belanja Toko"}
						</Text>
					</View>
				</View>

				{/* Badge Status */}
				<View className={`px-2 py-1 rounded-md ${statusStyle.bg}`}>
					<Text
						className={`text-[10px] font-outfit-bold ${statusStyle.text} uppercase`}
					>
						{statusStyle.label}
					</Text>
				</View>
			</View>

			<View className="my-2 border-t border-gray-100" />

			<View className="flex-row justify-between items-center">
				<View className="flex-row items-center">
					<Calendar size={14} color="#6B7280" />
					<Text className="text-gray-500 text-xs ml-1">
						{item.date}
					</Text>
				</View>
				<Text className="font-outfit-bold text-blue-600 text-base">
					Rp {item.price?.toLocaleString("id-ID") || "0"}
				</Text>
			</View>

			{/* Review Button - Only show for completed & not reviewed */}
			{canShowReview && (
				<TouchableOpacity
					onPress={() => setShowReviewForm(!showReviewForm)}
					className="mt-3 flex-row items-center justify-center py-2 bg-blue-50 rounded-lg border border-blue-200"
				>
					<MessageSquare size={16} color="#2563EB" />
					<Text className="text-blue-600 font-outfit-medium ml-2 text-sm">
						{showReviewForm ? "Tutup Form" : "Beri Ulasan"}
					</Text>
					{showReviewForm ? (
						<ChevronUp size={16} color="#2563EB" className="ml-1" />
					) : (
						<ChevronDown size={16} color="#2563EB" className="ml-1" />
					)}
				</TouchableOpacity>
			)}

			{/* Already Reviewed Badge */}
			{item.hasReviewed && statusStyle.canReview && (
				<View className="mt-3 flex-row items-center justify-center py-2 bg-green-50 rounded-lg">
					<Star size={16} color="#16A34A" fill="#16A34A" />
					<Text className="text-green-600 font-outfit-medium ml-2 text-sm">
						Sudah Diulas
					</Text>
				</View>
			)}

			{/* Inline Review Form */}
			{showReviewForm && (
				<View className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
					<Text className="font-outfit-bold text-gray-800 mb-3">Rating Anda</Text>

					{/* Star Rating */}
					<View className="flex-row gap-2 mb-4">
						{[1, 2, 3, 4, 5].map((star) => (
							<TouchableOpacity
								key={star}
								onPress={() => setRating(star)}
							>
								<Star
									size={32}
									color={star <= rating ? "#F59E0B" : "#D1D5DB"}
									fill={star <= rating ? "#F59E0B" : "transparent"}
								/>
							</TouchableOpacity>
						))}
					</View>

					{/* Review Text */}
					<TextInput
						placeholder="Tulis ulasan Anda (opsional)..."
						value={reviewText}
						onChangeText={setReviewText}
						multiline
						numberOfLines={3}
						className="bg-white border border-gray-200 rounded-lg px-4 py-3 text-gray-800 mb-4"
						style={{ textAlignVertical: "top", minHeight: 80 }}
					/>

					{/* Submit Button */}
					<TouchableOpacity
						onPress={handleSubmitReview}
						disabled={submitting}
						className={`py-3 rounded-xl items-center ${submitting ? "bg-gray-400" : "bg-blue-600"
							}`}
					>
						<Text className="text-white font-outfit-bold">
							{submitting ? "Mengirim..." : "Kirim Ulasan"}
						</Text>
					</TouchableOpacity>
				</View>
			)}
		</View>
	);
};

export default HistoryCard;
