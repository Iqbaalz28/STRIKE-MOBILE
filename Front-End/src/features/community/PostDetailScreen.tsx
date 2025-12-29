import React, { useEffect, useState } from "react";
import {
	View,
	Text,
	ScrollView,
	TextInput,
	TouchableOpacity,
	Image,
	KeyboardAvoidingView,
	Platform,
	ActivityIndicator,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { ArrowLeft, Send } from "lucide-react-native";
import api from "@/services/api";
import CommentCard from "./components/CommentCard"; // Pastikan import ini ada

const PostDetailScreen = () => {
	const route = useRoute<any>();
	const navigation = useNavigation();
	const { id } = route.params;

	const [post, setPost] = useState<any>(null);
	const [comments, setComments] = useState([]);
	const [loading, setLoading] = useState(true);
	const [newComment, setNewComment] = useState("");
	const [submitting, setSubmitting] = useState(false);

	useEffect(() => {
		fetchData();
	}, [id]);

	const fetchData = async () => {
		try {
			const [postRes, commentRes] = await Promise.all([
				api.getPostDetail(id),
				api.getPostComments(id),
			]);
			setPost(postRes.data);
			setComments(commentRes.data);
		} catch (error) {
			console.log("Error load detail:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleSendComment = async () => {
		if (!newComment.trim()) return;
		setSubmitting(true);
		try {
			await api.createComment(id, { content: newComment });
			setNewComment("");
			// Refresh comments
			const res = await api.getPostComments(id);
			setComments(res.data);
		} catch (error) {
			console.log("Gagal komen:", error);
		} finally {
			setSubmitting(false);
		}
	};

	// Helper Avatar (sama kyk PostCard)
	const getAvatar = (path: string, name: string) => {
		if (!path)
			return `https://ui-avatars.com/api/?name=${
				name || "User"
			}&background=random`;
		return path.startsWith("http")
			? path
			: `http://10.0.2.2:3000/uploads/${path}`;
	};

	if (loading)
		return (
			<View className="flex-1 justify-center">
				<ActivityIndicator size="large" color="#2563EB" />
			</View>
		);

	return (
		<KeyboardAvoidingView
			behavior={Platform.OS === "ios" ? "padding" : undefined}
			className="flex-1 bg-white"
		>
			<View className="pt-12 px-4 pb-2 border-b border-gray-100 flex-row items-center gap-3">
				<TouchableOpacity onPress={() => navigation.goBack()}>
					<ArrowLeft size={24} color="black" />
				</TouchableOpacity>
				<Text className="text-lg font-bold">Detail Postingan</Text>
			</View>

			<ScrollView className="flex-1">
				{/* Post Content */}
				<View className="p-5 border-b border-gray-100">
					<View className="flex-row items-center mb-4">
						<Image
							source={{
								uri: getAvatar(
									post?.author_avatar,
									post?.author_name,
								),
							}}
							className="w-12 h-12 rounded-full bg-gray-200"
						/>
						<View className="ml-3">
							<Text className="font-bold text-lg">
								{post?.author_name}
							</Text>
							<Text className="text-gray-500">
								{new Date(
									post?.created_at,
								).toLocaleDateString()}
							</Text>
						</View>
					</View>

					<Text className="text-xl font-bold text-gray-900 mb-2 font-[Outfit_700Bold]">
						{post?.title}
					</Text>
					<Text className="text-gray-700 leading-relaxed text-base">
						{post?.body || post?.content}
					</Text>
				</View>

				{/* Comments Section */}
				<View className="p-5 bg-gray-50 min-h-screen">
					<Text className="font-bold text-gray-600 mb-4">
						Komentar ({comments.length})
					</Text>

					{/* --- BAGIAN YANG DIPERBARUI --- */}
					{comments.map((c: any, index) => (
						<CommentCard key={index} comment={c} />
					))}
					{/* ---------------------------- */}

					<View className="h-20" />
				</View>
			</ScrollView>

			{/* Input Komentar */}
			<View className="p-4 bg-white border-t border-gray-100 flex-row items-center gap-2">
				<TextInput
					className="flex-1 bg-gray-100 rounded-full px-4 py-3 text-gray-800"
					placeholder="Tulis komentar..."
					value={newComment}
					onChangeText={setNewComment}
				/>
				<TouchableOpacity
					onPress={handleSendComment}
					disabled={submitting}
					className="bg-blue-600 p-3 rounded-full"
				>
					{submitting ? (
						<ActivityIndicator size="small" color="white" />
					) : (
						<Send size={20} color="white" />
					)}
				</TouchableOpacity>
			</View>
		</KeyboardAvoidingView>
	);
};

export default PostDetailScreen;
