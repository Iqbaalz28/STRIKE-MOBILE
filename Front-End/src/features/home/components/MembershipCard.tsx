import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Crown } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";

interface MembershipCardProps {
	userData: {
		name: string;
		membership_name: string;
		points: number;
		booking_count: number;
		level: number;
	};
}

const MembershipCard = ({ userData }: MembershipCardProps) => {
	const navigation = useNavigation<any>();

	// Fallback values
	const membershipName = userData.membership_name || "Belum Berlangganan";
	const points = userData.points || 0;
	const bookingCount = userData.booking_count || 0;
	const level = userData.level || 1;
	const userName = userData.name || "Pengguna";

	return (
		<View className="mx-5 my-4">
			<View className="bg-blue-600 rounded-3xl p-5 shadow-lg">
				{/* Crown Icon */}
				<View className="absolute top-4 right-4">
					<View className="bg-yellow-400 p-2 rounded-full">
						<Crown size={24} color="white" fill="white" />
					</View>
				</View>

				{/* Status Badge (Sekarang Menampilkan Nama User) */}
				<View className="bg-blue-700 self-start px-3 py-1 rounded-full mb-3">
					<Text className="text-white text-xs font-outfit-bold">
						{userName}
					</Text>
				</View>

				{/* Membership Name (Big Title) */}
				<Text className="text-white text-2xl font-outfit-bold mb-4 font-outfit-bold">
					{membershipName}
				</Text>

				{/* Stats Row */}
				<View className="flex-row justify-around mb-5">
					<View className="items-center">
						<Text className="text-white text-2xl font-outfit-bold font-outfit-bold">
							{points}
						</Text>
						<Text className="text-blue-200 text-xs">Points</Text>
					</View>

					<View className="w-px bg-blue-400 mx-4" />

					<View className="items-center">
						<Text className="text-white text-2xl font-outfit-bold font-outfit-bold">
							{bookingCount}
						</Text>
						<Text className="text-blue-200 text-xs">Booking</Text>
					</View>

					<View className="w-px bg-blue-400 mx-4" />

					<View className="items-center">
						<Text className="text-white text-2xl font-outfit-bold font-outfit-bold">
							{level}
						</Text>
						<Text className="text-blue-200 text-xs">Level</Text>
					</View>
				</View>

				{/* Upgrade Button */}
				<TouchableOpacity
					onPress={() => navigation.navigate("Membership")}
					className="bg-white py-3 rounded-xl items-center"
				>
					<Text className="text-blue-600 font-outfit-bold">
						Upgrade Membership
					</Text>
				</TouchableOpacity>
			</View>
		</View>
	);
};

export default MembershipCard;
