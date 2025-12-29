import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Crown } from "lucide-react-native";

const MembershipCard = () => {
	// Mock data - nanti bisa diganti dengan data dari API/Context
	const memberData = {
		name: "Kawan Mancing",
		status: "Status Membership",
		points: 450,
		bookingCount: 12,
		level: 3,
	};

	return (
		<View className="mx-5 my-4">
			<View className="bg-blue-600 rounded-3xl p-5 shadow-lg">
				{/* Crown Icon */}
				<View className="absolute top-4 right-4">
					<View className="bg-yellow-400 p-2 rounded-full">
						<Crown size={24} color="white" fill="white" />
					</View>
				</View>

				{/* Status Badge */}
				<View className="bg-blue-700 self-start px-3 py-1 rounded-full mb-3">
					<Text className="text-white text-xs font-bold">
						{memberData.status}
					</Text>
				</View>

				{/* Member Name */}
				<Text className="text-white text-2xl font-bold mb-4 font-[Outfit_700Bold]">
					{memberData.name}
				</Text>

				{/* Stats Row */}
				<View className="flex-row justify-between mb-5">
					<View className="items-center">
						<Text className="text-white text-2xl font-bold font-[Outfit_700Bold]">
							{memberData.points}
						</Text>
						<Text className="text-blue-200 text-xs">Points</Text>
					</View>

					<View className="w-px bg-blue-400 mx-4" />

					<View className="items-center">
						<Text className="text-white text-2xl font-bold font-[Outfit_700Bold]">
							{memberData.bookingCount}
						</Text>
						<Text className="text-blue-200 text-xs">Booking</Text>
					</View>

					<View className="w-px bg-blue-400 mx-4" />

					<View className="items-center">
						<Text className="text-white text-2xl font-bold font-[Outfit_700Bold]">
							{memberData.level}
						</Text>
						<Text className="text-blue-200 text-xs">Level</Text>
					</View>
				</View>

				{/* Upgrade Button */}
				<TouchableOpacity className="bg-white py-3 rounded-xl items-center">
					<Text className="text-blue-600 font-bold">
						Upgrade Membership
					</Text>
				</TouchableOpacity>
			</View>
		</View>
	);
};

export default MembershipCard;
