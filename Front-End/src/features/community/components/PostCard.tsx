import React, { useState } from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { MessageSquare, Eye, ThumbsUp } from "lucide-react-native";
import api from "@/services/api";
import { getImageUrl } from "@/utils/imageHelper";
import { formatTimeAgo } from "@/utils/dateHelper";
// import { CommunityStackParamList } from "@/navigation/types";

// Definisi Tipe Data Post (Bisa dipindah ke types.ts)
interface Author {
	name: string;
	avatar: string | null;
}

interface PostStats {
	likes: number;
	views: number;
	comments: number;
}

interface PostData {
	id: number;
	title: string;
	content?: string;
	body?: string; // Handle inkonsistensi backend
	category: string;
	img?: string | null;
	created_at: string;
	author: Author;
	stats: PostStats;
	is_liked?: boolean; // Status awal dari backend
}

const PostCard = ({ post }: { post: PostData }) => {
	// Ganti 'any' dengan CommunityStackParamList jika sudah siap
	const navigation = useNavigation<NativeStackNavigationProp<any>>();

	const [likes, setLikes] = useState(post.stats?.likes || 0);
	const [isLiked, setIsLiked] = useState(post.is_liked || false);

	// Logic Avatar: Pakai gambar upload user ATAU generate inisial nama
	const avatarUrl = post.author?.avatar
		? getImageUrl(post.author.avatar)
		: `https://ui-avatars.com/api/?name=${encodeURIComponent(
			post.author?.name || "User",
		)}&background=random`;

	const handleLike = async () => {
		// Optimistic Update (Update UI duluan biar terasa cepat)
		const previousLikes = likes;
		const previousStatus = isLiked;

		setIsLiked(!isLiked);
		setLikes(isLiked ? likes - 1 : likes + 1);

		try {
			await api.toggleLikePost(post.id);
		} catch (error) {
			// Revert jika gagal (Rollback)
			console.log("Gagal like:", error);
			setIsLiked(previousStatus);
			setLikes(previousLikes);
		}
	};

	return (
		<TouchableOpacity
			onPress={() => navigation.navigate("PostDetail", { id: post.id })}
			className="bg-white p-4 rounded-2xl mb-4 border border-gray-100 shadow-sm"
			activeOpacity={0.7}
		>
			{/* Header: Author & Time */}
			<View className="flex-row items-center mb-3">
				<Image
					source={{ uri: avatarUrl }}
					className="w-10 h-10 rounded-full bg-gray-200"
				/>
				<View className="ml-3 flex-1">
					<Text className="font-outfit-bold text-gray-900" numberOfLines={1}>
						{post.author?.name || "Anonymous"}
					</Text>
					<Text className="text-xs text-gray-500">
						{formatTimeAgo(post.created_at)}
					</Text>
				</View>

				{/* Category Badge */}
				<View className="bg-blue-50 px-3 py-1 rounded-full ml-2">
					<Text className="text-blue-600 text-[10px] font-outfit-bold uppercase tracking-wider">
						{post.category}
					</Text>
				</View>
			</View>

			{/* Content */}
			<Text className="text-lg font-outfit-bold text-gray-900 mb-1 font-outfit-bold">
				{post.title}
			</Text>
			<Text
				className="text-gray-600 leading-relaxed mb-4 text-sm"
				numberOfLines={3}
			>
				{post.content || post.body || "Tidak ada konten pratinjau."}
			</Text>

			{/* Post Image */}
			{post.img && (
				<Image
					source={{ uri: getImageUrl(post.img) }}
					className="w-full h-48 rounded-xl mb-4 bg-gray-100"
					resizeMode="cover"
				/>
			)}



			{/* Footer: Stats */}
			<View className="flex-row justify-between items-center border-t border-gray-100 pt-3">
				<View className="flex-row gap-4">
					{/* Views */}
					<View className="flex-row items-center gap-1.5">
						<Eye size={14} color="#9CA3AF" />
						<Text className="text-gray-500 text-xs font-outfit-medium">
							{post.stats?.views || 0}
						</Text>
					</View>

					{/* Comments */}
					<View className="flex-row items-center gap-1.5">
						<MessageSquare size={14} color="#9CA3AF" />
						<Text className="text-gray-500 text-xs font-outfit-medium">
							{post.stats?.comments || 0}
						</Text>
					</View>
				</View>

				{/* Like Button */}
				<TouchableOpacity
					onPress={(e) => {
						e.stopPropagation(); // PENTING: Mencegah trigger navigasi ke detail saat klik like
						handleLike();
					}}
					className="flex-row items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-full active:bg-gray-200"
				>
					<ThumbsUp
						size={14}
						color={isLiked ? "#2563EB" : "#6B7280"}
						fill={isLiked ? "#2563EB" : "transparent"}
					/>
					<Text
						className={`text-xs font-outfit-bold ${isLiked ? "text-blue-600" : "text-gray-500"
							}`}
					>
						{likes}
					</Text>
				</TouchableOpacity>
			</View>
		</TouchableOpacity>
	);
};

export default PostCard;
