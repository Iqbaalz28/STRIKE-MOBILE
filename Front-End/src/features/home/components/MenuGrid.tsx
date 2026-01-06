import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Calendar, ShoppingBag, Users, Trophy } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";

const MenuGrid = () => {
	const navigation = useNavigation<any>();

	// Fungsi navigasi ke Tab
	// Kita gunakan navigation.navigate(tabName) langsung karena kita sudah berada di dalam TabNavigator (MainTab).
	const navigateToTab = (tabName: string) => {
		navigation.navigate(tabName);
	};

	const menuItems = [
		{
			id: 1,
			title: "Booking",
			subtitle: "Pesan tempat",
			icon: Calendar,
			color: "bg-blue-600",
			bgColor: "bg-blue-50",
			// Mengarahkan ke Tab Lokasi (Booking)
			onPress: () => navigateToTab("BookingStack"),
		},
		{
			id: 2,
			title: "Shop",
			subtitle: "Belanja alat",
			icon: ShoppingBag,
			color: "bg-green-600",
			bgColor: "bg-green-50",
			// Mengarahkan ke Tab Toko
			onPress: () => navigateToTab("ShopStack"),
		},
		{
			id: 3,
			title: "Komunitas",
			subtitle: "Forum diskusi",
			icon: Users,
			color: "bg-orange-600",
			bgColor: "bg-orange-50",
			// Mengarahkan ke Tab Komunitas
			onPress: () => navigateToTab("Community"),
		},
		{
			id: 4,
			title: "Event",
			subtitle: "Ikuti lomba",
			icon: Trophy,
			color: "bg-purple-600",
			bgColor: "bg-purple-50",
			// Mengarahkan ke Halaman Event (Bukan Tab, tapi Stack Screen)
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
						className="w-[48%] mb-4" // Lebar 48% agar ada jarak di tengah
						activeOpacity={0.7}
					>
						{/* PERUBAHAN UTAMA DISINI: 
                h-32: Memberikan tinggi tetap agar semua kotak sama rata.
                justify-between: Agar ikon dan teks terpisah rapi.
            */}
						<View
							className={`${item.bgColor} rounded-2xl p-4 h-32 justify-between border border-white shadow-sm`}
						>
							{/* Bagian Atas: Icon */}
							<View
								className={`${item.color} w-10 h-10 rounded-xl items-center justify-center shadow-sm`}
							>
								<item.icon size={20} color="white" />
							</View>

							{/* Bagian Bawah: Teks */}
							<View>
								<Text className="text-gray-900 font-outfit-bold text-base font-outfit-bold">
									{item.title}
								</Text>
								<Text
									className="text-gray-500 text-xs font-outfit"
									numberOfLines={1}
								>
									{item.subtitle}
								</Text>
							</View>
						</View>
					</TouchableOpacity>
				))}
			</View>
		</View>
	);
};

export default MenuGrid;
