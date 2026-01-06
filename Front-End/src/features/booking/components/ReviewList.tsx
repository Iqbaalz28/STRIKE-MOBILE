import React from "react";
import { View, Text, Image } from "react-native";
import { Star } from "lucide-react-native";
import { BASE_URL } from "@/services/api";

// Interface untuk review dari database
interface Review {
	id: number;
	username: string;
	avatarUrl?: string;
	comment: string;
	rating: number;
	created_at: string;
}

// Fungsi untuk format tanggal relatif
const formatRelativeDate = (dateStr: string) => {
	try {
		const date = new Date(dateStr.toString().replace(" ", "T"));
		const now = new Date();
		const diffMs = now.getTime() - date.getTime();
		const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

		if (diffDays === 0) return "Hari ini";
		if (diffDays === 1) return "Kemarin";
		if (diffDays < 7) return `${diffDays} hari lalu`;
		if (diffDays < 30) return `${Math.floor(diffDays / 7)} minggu lalu`;
		if (diffDays < 365) return `${Math.floor(diffDays / 30)} bulan lalu`;
		return `${Math.floor(diffDays / 365)} tahun lalu`;
	} catch {
		return "-";
	}
};

// Fungsi untuk mendapatkan URL avatar
const getAvatarUrl = (avatarUrl?: string, username?: string) => {
	if (!avatarUrl) {
		// Fallback ke UI Avatars jika tidak ada avatar
		return `https://ui-avatars.com/api/?name=${encodeURIComponent(username || "User")}&background=random`;
	}
	if (avatarUrl.startsWith("http")) return avatarUrl;
	return `${BASE_URL}/${avatarUrl}`;
};

const ReviewList = ({ reviews = [] }: { reviews?: Review[] }) => {
	// Jika tidak ada review dari database, tampilkan pesan kosong
	if (!reviews || reviews.length === 0) {
		return (
			<View className="mb-6">
				<Text className="font-outfit-bold text-lg text-gray-900 mb-3 font-outfit-bold">
					Ulasan Pengunjung
				</Text>
				<View className="bg-gray-50 p-6 rounded-xl border border-dashed border-gray-200 items-center">
					<Text className="text-gray-400 text-center">
						Belum ada ulasan untuk tempat ini.
					</Text>
				</View>
			</View>
		);
	}

	return (
		<View className="mb-6">
			<Text className="font-outfit-bold text-lg text-gray-900 mb-3 font-outfit-bold">
				Ulasan Pengunjung ({reviews.length})
			</Text>

			{reviews.map((item: Review) => (
				<View
					key={item.id}
					className="bg-white p-4 rounded-xl border border-gray-100 mb-3 shadow-sm"
				>
					<View className="flex-row justify-between items-start mb-2">
						<View className="flex-row items-center">
							<Image
								source={{
									uri: getAvatarUrl(item.avatarUrl, item.username),
								}}
								className="w-8 h-8 rounded-full bg-gray-200 mr-2"
							/>
							<View>
								<Text className="font-outfit-bold text-gray-800 text-sm">
									{item.username}
								</Text>
								<Text className="text-xs text-gray-400">
									{formatRelativeDate(item.created_at)}
								</Text>
							</View>
						</View>
						<View className="flex-row bg-yellow-50 px-2 py-1 rounded-lg">
							<Star size={12} fill="#FBBF24" color="#FBBF24" />
							<Text className="text-xs font-outfit-bold text-yellow-700 ml-1">
								{item.rating}
							</Text>
						</View>
					</View>
					<Text className="text-gray-600 text-sm leading-relaxed">
						"{item.comment}"
					</Text>
				</View>
			))}
		</View>
	);
};

export default ReviewList;
