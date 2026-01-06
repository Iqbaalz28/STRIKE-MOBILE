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
import api, { BASE_URL } from "@/services/api";
import CommentCard from "./components/CommentCard";

const PostDetailScreen = () => {
	const route = useRoute<any>();
	const navigation = useNavigation();
	const { id } = route.params;

	const [post, setPost] = useState<any>(null);
	const [comments, setComments] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [newComment, setNewComment] = useState("");
	const [submitting, setSubmitting] = useState(false);

	const [replyingTo, setReplyingTo] = useState<any>(null);

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

			// Format and group comments
			const rawComments = commentRes.data.map((c: any) => ({
				...c,
				author: {
					name: c.author_name,
					avatar: c.author_avatar
				},
				children: [] // Init children
			}));

			// Grouping logic
			const commentMap: any = {};
			const roots: any[] = [];

			rawComments.forEach((c: any) => {
				commentMap[c.id] = c;
			});

			rawComments.forEach((c: any) => {
				if (c.parent_id && commentMap[c.parent_id]) {
					commentMap[c.parent_id].children.push(c);
				} else {
					roots.push(c);
				}
			});

			setComments(roots);
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
			await api.createComment(id, { 
				content: newComment,
				parent_id: replyingTo?.id 
			});
			setNewComment("");
			setReplyingTo(null); // Reset reply state
			
			// Refresh comments
			fetchData(); // Re-use fetchData to get fresh groups
		} catch (error) {
			console.log("Gagal komen:", error);
		} finally {
			setSubmitting(false);
		}
	};

	// Helper Avatar (sama kyk PostCard)
	const getAvatar = (path: string, name: string) => {
		if (!path)
			return `https://ui-avatars.com/api/?name=${name || "User"
				}&background=random`;
		return path.startsWith("http")
			? path
			: `${BASE_URL}/uploads/${path}`;
	};
    
    	const handleReply = (comment: any) => {
		setReplyingTo(comment);
		// Focus input logic could go here if using ref
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
				<Text className="text-lg font-outfit-bold">Detail Postingan</Text>
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
							<Text className="font-outfit-bold text-lg">
								{post?.author_name}
							</Text>
							<Text className="text-gray-500">
								{new Date(
									post?.created_at,
								).toLocaleDateString()}
							</Text>
						</View>
					</View>

					<Text className="text-xl font-outfit-bold text-gray-900 mb-2 font-outfit-bold">
						{post?.title}
					</Text>
					<Text className="text-gray-700 leading-relaxed text-base">
						{post?.body || post?.content}
					</Text>

					{/* Post Image */}
					{post?.img && (
						<Image
							source={{
								uri: post.img.startsWith("http")
									? post.img
									: `${BASE_URL}/${post.img}`
							}}
							className="w-full h-64 rounded-xl mt-4 bg-gray-100"
							resizeMode="cover"
						/>
					)}
				</View>

				{/* Comments Section */}
				<View className="p-5 bg-gray-50 min-h-screen">
					<Text className="font-outfit-bold text-gray-600 mb-4">
						Komentar ({comments.length})
					</Text>

					{/* --- BAGIAN YANG DIPERBARUI --- */}
					{comments.map((c: any, index) => (
						<CommentCard key={index} comment={c} onReply={handleReply} />
					))}
					{/* ---------------------------- */}

					<View className="h-20" />
				</View>
			</ScrollView>

			{/* Input Komentar */}
			<View className="bg-white border-t border-gray-100">
				{replyingTo && (
					<View className="flex-row items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-200">
						<Text className="text-gray-500 text-sm">
							Membalas <Text className="font-bold">{replyingTo.author?.name || replyingTo.username}</Text>
						</Text>
						<TouchableOpacity onPress={() => setReplyingTo(null)}>
							<Text className="text-red-500 text-xs font-bold">Batal</Text>
						</TouchableOpacity>
					</View>
				)}
				<View className="p-4 flex-row items-center gap-2">
					<TextInput
						className="flex-1 bg-gray-100 rounded-full px-4 py-3 text-gray-800"
						placeholder={replyingTo ? "Tulis balasan..." : "Tulis komentar..."}
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
			</View>
		</KeyboardAvoidingView>
	);
};

export default PostDetailScreen;
