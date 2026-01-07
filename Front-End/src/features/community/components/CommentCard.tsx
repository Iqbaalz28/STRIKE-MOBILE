import React, { useState } from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { MessageCircle, Heart, ChevronDown, ChevronUp } from "lucide-react-native";
import { BASE_URL } from "@/services/api";

interface CommentProps {
	comment: any;
	onReply: (comment: any) => void;
	isReply?: boolean;
}

const CommentCard = ({ comment, onReply, isReply = false }: CommentProps) => {
	const [showReplies, setShowReplies] = useState(true);
	const hasChildren = comment.children && comment.children.length > 0;

	// Avatar helper
	const getAvatar = (path: string, name: string) => {
		if (!path)
			return `https://ui-avatars.com/api/?name=${name || "U"}&background=random&size=80`;
		if (path.startsWith("http")) return path;
		if (path.startsWith("uploads/")) return `${BASE_URL}/${path}`;
		return `${BASE_URL}/uploads/${path}`;
	};

	const authorName = comment.author?.name || comment.author_name || "Anonim";
	const authorAvatar = comment.author?.avatar || comment.author_avatar;

	const formatTime = (dateStr: string) => {
		const date = new Date(dateStr);
		const now = new Date();
		const diffMs = now.getTime() - date.getTime();
		const diffMins = Math.floor(diffMs / 60000);
		const diffHours = Math.floor(diffMs / 3600000);
		const diffDays = Math.floor(diffMs / 86400000);

		if (diffMins < 1) return "Baru saja";
		if (diffMins < 60) return `${diffMins}m`;
		if (diffHours < 24) return `${diffHours}j`;
		if (diffDays < 7) return `${diffDays}h`;
		return date.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
	};

	return (
		<View className={`${isReply ? "ml-12 mt-2" : "mb-4"}`}>
			{/* Comment Row - Instagram Style */}
			<View className="flex-row">
				{/* Avatar */}
				<Image
					source={{ uri: getAvatar(authorAvatar, authorName) }}
					className={`${isReply ? "w-8 h-8" : "w-10 h-10"} rounded-full bg-gray-300`}
				/>

				{/* Content */}
				<View className="flex-1 ml-3">
					{/* Name + Comment inline */}
					<Text className="text-gray-800 leading-5">
						<Text className="font-outfit-bold">{authorName} </Text>
						<Text>{comment.content}</Text>
					</Text>

					{/* Actions Row */}
					<View className="flex-row items-center mt-1.5 gap-4">
						<Text className="text-xs text-gray-400">{formatTime(comment.created_at)}</Text>
						{!isReply && (
							<TouchableOpacity onPress={() => onReply(comment)}>
								<Text className="text-xs font-outfit-bold text-gray-400">Balas</Text>
							</TouchableOpacity>
						)}
					</View>
				</View>
			</View>

			{/* Replies Section - Instagram Style */}
			{hasChildren && (
				<View className="mt-2">
					{/* Toggle Replies */}
					<TouchableOpacity
						onPress={() => setShowReplies(!showReplies)}
						className="flex-row items-center ml-12 mb-2"
					>
						<View className="w-6 h-px bg-gray-300 mr-2" />
						<Text className="text-xs font-outfit-bold text-gray-400">
							{showReplies ? "Sembunyikan" : `Lihat ${comment.children.length} balasan`}
						</Text>
						{showReplies ? (
							<ChevronUp size={12} color="#9CA3AF" className="ml-1" />
						) : (
							<ChevronDown size={12} color="#9CA3AF" className="ml-1" />
						)}
					</TouchableOpacity>

					{/* Replies List */}
					{showReplies && comment.children.map((child: any) => (
						<CommentCard
							key={child.id}
							comment={child}
							onReply={onReply}
							isReply={true}
						/>
					))}
				</View>
			)}
		</View>
	);
};

export default CommentCard;


