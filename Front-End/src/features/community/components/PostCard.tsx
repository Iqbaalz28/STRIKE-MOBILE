import React, { useState } from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { MessageSquare, Eye, ThumbsUp } from "lucide-react-native";
import { MainTabParamList } from "@/navigation/types"; // Nanti kita update types
import api from "@/services/api";

// Helper Time Ago
const timeAgo = (dateString: string) => {
	const date = new Date(dateString);
	const now = new Date();
	const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
	let interval = seconds / 3600;
	if (interval > 24) return Math.floor(interval / 24) + " hari lalu";
	if (interval > 1) return Math.floor(interval) + " jam lalu";
	interval = seconds / 60;
	if (interval > 1) return Math.floor(interval) + " menit lalu";
	return "Baru saja";
};

// Helper Avatar
const getAvatar = (path: string, name: string) => {
	if (!path)
		return `https://ui-avatars.com/api/?name=${name}&background=random`;
	if (path.startsWith("http")) return path;
	return `http://10.0.2.2:3000/uploads/${path}`;
};

const PostCard = ({ post }: { post: any }) => {
	const navigation = useNavigation<NativeStackNavigationProp<any>>();
	const [likes, setLikes] = useState(post.stats?.likes || 0);
	const [isLiked, setIsLiked] = useState(false); // Idealnya cek dari DB user_likes

	const handleLike = async () => {
		try {
			await api.toggleLikePost(post.id);
			// Optimistic Update
			if (isLiked) {
				setLikes(likes - 1);
				setIsLiked(false);
			} else {
				setLikes(likes + 1);
				setIsLiked(true);
			}
		} catch (error) {
			console.log("Gagal like:", error);
		}
	};

	return (
		<TouchableOpacity
			onPress={() => navigation.navigate("PostDetail", { id: post.id })}
			className="bg-white p-4 rounded-2xl mb-4 border border-gray-100 shadow-sm"
		>
			{/* Header: Author & Time */}
			<View className="flex-row items-center mb-3">
				<Image
					source={{
						uri: getAvatar(post.author?.avatar, post.author?.name),
					}}
					className="w-10 h-10 rounded-full bg-gray-200"
				/>
				<View className="ml-3">
					<Text className="font-bold text-gray-900">
						{post.author?.name || "User"}
					</Text>
					<Text className="text-xs text-gray-500">
						{timeAgo(post.created_at)}
					</Text>
				</View>

				{/* Category Badge */}
				<View className="ml-auto bg-blue-50 px-3 py-1 rounded-full">
					<Text className="text-blue-600 text-xs font-bold capitalize">
						{post.category}
					</Text>
				</View>
			</View>

			{/* Content */}
			<Text className="text-lg font-bold text-gray-900 mb-1 font-[Outfit_700Bold]">
				{post.title}
			</Text>
			<Text
				className="text-gray-600 leading-relaxed mb-4"
				numberOfLines={3}
			>
				{post.content || post.body}
			</Text>

			{/* Footer: Stats */}
			<View className="flex-row justify-between items-center border-t border-gray-100 pt-3">
				<View className="flex-row gap-4">
					<View className="flex-row items-center gap-1">
						<Eye size={16} color="#9CA3AF" />
						<Text className="text-gray-500 text-xs">
							{post.stats?.views || 0}
						</Text>
					</View>
					<View className="flex-row items-center gap-1">
						<MessageSquare size={16} color="#9CA3AF" />
						<Text className="text-gray-500 text-xs">
							{post.stats?.comments || 0}
						</Text>
					</View>
				</View>

				<TouchableOpacity
					onPress={handleLike}
					className="flex-row items-center gap-1 bg-gray-50 px-3 py-1 rounded-full"
				>
					<ThumbsUp
						size={16}
						color={isLiked ? "#2563EB" : "#6B7280"}
						fill={isLiked ? "#2563EB" : "transparent"}
					/>
					<Text
						className={
							isLiked
								? "text-blue-600 font-bold text-xs"
								: "text-gray-500 text-xs"
						}
					>
						{likes}
					</Text>
				</TouchableOpacity>
			</View>
		</TouchableOpacity>
	);
};

export default PostCard;
