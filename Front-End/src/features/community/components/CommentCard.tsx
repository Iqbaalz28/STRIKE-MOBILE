import React from "react";
import { View, Text } from "react-native";

const CommentCard = ({ comment }: { comment: any }) => {
	return (
		<View className="bg-white p-4 rounded-xl mb-3 shadow-sm border border-gray-100">
			<View className="flex-row items-center mb-2">
				<Text className="font-outfit-bold text-sm text-gray-800">
					{comment.author?.name || comment.username}
				</Text>
				<Text className="text-xs text-gray-400 ml-2">
					{new Date(comment.created_at).toLocaleDateString()}
				</Text>
			</View>
			<Text className="text-gray-700 leading-relaxed">
				{comment.content}
			</Text>
		</View>
	);
};

export default CommentCard;
