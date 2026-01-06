import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

const CommentCard = ({ comment, onReply }: { comment: any, onReply: (comment: any) => void }) => {
	const hasChildren = comment.children && comment.children.length > 0;

	return (
		<View className="mb-3">
			{/* Main Chat Bubble */}
			<View className={`bg-white p-4 rounded-xl border border-gray-100 ${hasChildren ? 'rounded-b-none border-b-0' : 'shadow-sm'}`}>
				<View className="flex-row items-center mb-2">
					<Text className="font-outfit-bold text-sm text-gray-800">
						{comment.author?.name || comment.username}
					</Text>
					<Text className="text-xs text-gray-400 ml-2">
						{new Date(comment.created_at).toLocaleDateString()}
					</Text>
				</View>
				<Text className="text-gray-700 leading-relaxed mb-2">
					{comment.content}
				</Text>
				<TouchableOpacity onPress={() => onReply(comment)}>
					<Text className="text-xs font-outfit-bold text-gray-500">Balas</Text>
				</TouchableOpacity>
			</View>

			{/* Nested Replies (Under the Shade) */}
			{hasChildren && (
				<View className="bg-gray-50 ml-4 p-3 rounded-b-xl border border-t-0 border-gray-100">
					{comment.children.map((child: any, index: number) => (
						<View key={index} className="mb-3 last:mb-0 border-b border-gray-200 last:border-0 pb-3 last:pb-0">
							<View className="flex-row items-center mb-1">
								<Text className="font-outfit-bold text-xs text-gray-700">
									{child.author?.name || child.username}
								</Text>
								<Text className="text-[10px] text-gray-400 ml-2">
									{new Date(child.created_at).toLocaleDateString()}
								</Text>
							</View>
							<Text className="text-sm text-gray-600 leading-relaxed">
								{child.content}
							</Text>
						</View>
					))}
				</View>
			)}
		</View>
	);
};

export default CommentCard;
