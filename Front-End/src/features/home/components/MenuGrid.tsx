import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Calendar, ShoppingBag, Users, Trophy } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";

const MenuGrid = () => {
	const navigation = useNavigation<any>();

	const menuItems = [
		{
			id: 1,
			title: "Booking",
			subtitle: "Pesan tempat",
			icon: Calendar,
			color: "bg-blue-500",
			bgColor: "bg-blue-50",
			onPress: () =>
				navigation.navigate("MainTab", { screen: "Booking" }),
		},
		{
			id: 2,
			title: "Shop",
			subtitle: "Belanja peralatan",
			icon: ShoppingBag,
			color: "bg-green-500",
			bgColor: "bg-blue-50",
			onPress: () => navigation.navigate("MainTab", { screen: "Shop" }),
		},
		{
			id: 3,
			title: "Komunitas",
			subtitle: "Temui komunitas",
			icon: Users,
			color: "bg-orange-500",
			bgColor: "bg-blue-50",
			onPress: () =>
				navigation.navigate("MainTab", { screen: "Community" }),
		},
		{
			id: 4,
			title: "Event Perlombaan",
			subtitle: "Ikuti perlombaan",
			icon: Trophy,
			color: "bg-purple-500",
			bgColor: "bg-blue-50",
			onPress: () => navigation.navigate("EventList"),
		},
	];

	return (
		<View className="px-5 my-4">
			<View className="flex-row flex-wrap justify-between">
				{menuItems.map((item) => (
					<TouchableOpacity
						key={item.id}
						onPress={item.onPress}
						className="w-[48%] mb-4"
						activeOpacity={0.7}
					>
						<View className={`${item.bgColor} rounded-2xl p-4`}>
							<View
								className={`${item.color} w-12 h-12 rounded-xl items-center justify-center mb-3`}
							>
								<item.icon size={24} color="white" />
							</View>
							<Text className="text-gray-900 font-bold text-base mb-1 font-[Outfit_700Bold]">
								{item.title}
							</Text>
							<Text className="text-gray-500 text-xs font-[Outfit_400Regular]">
								{item.subtitle}
							</Text>
						</View>
					</TouchableOpacity>
				))}
			</View>
		</View>
	);
};

export default MenuGrid;
