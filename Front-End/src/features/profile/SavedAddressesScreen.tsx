import React, { useState, useEffect, useCallback } from "react";
import {
	View,
	Text,
	ScrollView,
	TouchableOpacity,
	Alert,
	ActivityIndicator,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
	ArrowLeft,
	MapPin,
	Plus,
	Trash2,
	Edit2,
	Check,
	Home,
	Building,
} from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Address data structure
export interface SavedAddress {
	id: string;
	label: string;
	recipientName: string;
	phone: string;
	street: string;
	city: string;
	province: string;
	postcode: string;
	isDefault: boolean;
}

const ADDRESSES_STORAGE_KEY = "@saved_addresses";

// Helper functions for address storage
export const getAddresses = async (): Promise<SavedAddress[]> => {
	try {
		const data = await AsyncStorage.getItem(ADDRESSES_STORAGE_KEY);
		return data ? JSON.parse(data) : [];
	} catch (error) {
		console.error("Error getting addresses:", error);
		return [];
	}
};

export const saveAddresses = async (addresses: SavedAddress[]): Promise<void> => {
	try {
		await AsyncStorage.setItem(ADDRESSES_STORAGE_KEY, JSON.stringify(addresses));
	} catch (error) {
		console.error("Error saving addresses:", error);
	}
};

const SavedAddressesScreen = () => {
	const navigation = useNavigation<NativeStackNavigationProp<any>>();
	const [addresses, setAddresses] = useState<SavedAddress[]>([]);
	const [loading, setLoading] = useState(true);

	// Load addresses when screen is focused
	useFocusEffect(
		useCallback(() => {
			loadAddresses();
		}, [])
	);

	const loadAddresses = async () => {
		setLoading(true);
		const data = await getAddresses();
		setAddresses(data);
		setLoading(false);
	};

	const handleDelete = (id: string) => {
		Alert.alert(
			"Hapus Alamat",
			"Apakah Anda yakin ingin menghapus alamat ini?",
			[
				{ text: "Batal", style: "cancel" },
				{
					text: "Hapus",
					style: "destructive",
					onPress: async () => {
						const updated = addresses.filter((addr) => addr.id !== id);
						// If deleted address was default, set first one as default
						if (updated.length > 0 && !updated.some((a) => a.isDefault)) {
							updated[0].isDefault = true;
						}
						await saveAddresses(updated);
						setAddresses(updated);
					},
				},
			]
		);
	};

	const handleSetDefault = async (id: string) => {
		const updated = addresses.map((addr) => ({
			...addr,
			isDefault: addr.id === id,
		}));
		await saveAddresses(updated);
		setAddresses(updated);
	};

	const getLabelIcon = (label: string) => {
		const lowerLabel = label.toLowerCase();
		if (lowerLabel.includes("rumah") || lowerLabel.includes("home")) {
			return <Home size={20} color="#2563EB" />;
		} else if (lowerLabel.includes("kantor") || lowerLabel.includes("office")) {
			return <Building size={20} color="#2563EB" />;
		}
		return <MapPin size={20} color="#2563EB" />;
	};

	return (
		<View className="flex-1 bg-gray-50">
			{/* Header */}
			<View className="pt-12 px-4 pb-4 bg-white border-b border-gray-100 flex-row items-center gap-3">
				<TouchableOpacity onPress={() => navigation.goBack()}>
					<ArrowLeft size={24} color="black" />
				</TouchableOpacity>
				<Text className="text-xl font-outfit-bold">Alamat Tersimpan</Text>
			</View>

			{loading ? (
				<View className="flex-1 justify-center items-center">
					<ActivityIndicator size="large" color="#2563EB" />
				</View>
			) : (
				<ScrollView className="flex-1 p-4">
					{addresses.length === 0 ? (
						<View className="bg-white rounded-2xl p-8 items-center">
							<MapPin size={64} color="#D1D5DB" />
							<Text className="text-gray-500 text-center mt-4 mb-2">
								Belum ada alamat tersimpan
							</Text>
							<Text className="text-gray-400 text-sm text-center">
								Tambahkan alamat untuk mempercepat proses checkout
							</Text>
						</View>
					) : (
						addresses.map((address) => (
							<View
								key={address.id}
								className={`bg-white rounded-2xl p-4 mb-3 border-2 ${
									address.isDefault ? "border-blue-600" : "border-gray-100"
								}`}
							>
								{/* Header with label and badges */}
								<View className="flex-row items-center mb-2">
									{getLabelIcon(address.label)}
									<Text className="font-outfit-bold text-gray-900 ml-2 flex-1">
										{address.label}
									</Text>
									{address.isDefault && (
										<View className="bg-blue-100 px-2 py-1 rounded-full flex-row items-center">
											<Check size={12} color="#2563EB" />
											<Text className="text-blue-600 text-xs ml-1 font-outfit-medium">
												Utama
											</Text>
										</View>
									)}
								</View>

								{/* Recipient info */}
								<Text className="text-gray-900 font-outfit-medium">
									{address.recipientName}
								</Text>
								<Text className="text-gray-500 text-sm">{address.phone}</Text>

								{/* Address details */}
								<Text className="text-gray-600 mt-2">
									{address.street}
									{address.city && `, ${address.city}`}
									{address.province && `, ${address.province}`}
									{address.postcode && ` ${address.postcode}`}
								</Text>

								{/* Action buttons */}
								<View className="flex-row mt-4 pt-3 border-t border-gray-100 gap-2">
									{!address.isDefault && (
										<TouchableOpacity
											onPress={() => handleSetDefault(address.id)}
											className="flex-1 bg-blue-50 py-2 rounded-lg items-center flex-row justify-center"
										>
											<Check size={16} color="#2563EB" />
											<Text className="text-blue-600 ml-1 font-outfit-medium text-sm">
												Jadikan Utama
											</Text>
										</TouchableOpacity>
									)}
									<TouchableOpacity
										onPress={() =>
											navigation.navigate("AddEditAddress", { address })
										}
										className="bg-gray-100 p-2 rounded-lg"
									>
										<Edit2 size={18} color="#6B7280" />
									</TouchableOpacity>
									<TouchableOpacity
										onPress={() => handleDelete(address.id)}
										className="bg-red-50 p-2 rounded-lg"
									>
										<Trash2 size={18} color="#EF4444" />
									</TouchableOpacity>
								</View>
							</View>
						))
					)}

					<View className="h-24" />
				</ScrollView>
			)}

			{/* Add Address Button */}
			<View className="absolute bottom-0 w-full bg-white p-4 border-t border-gray-100 pb-8">
				<TouchableOpacity
					onPress={() => navigation.navigate("AddEditAddress")}
					className="bg-blue-600 py-4 rounded-xl flex-row items-center justify-center shadow-lg"
				>
					<Plus size={20} color="white" />
					<Text className="text-white font-outfit-bold text-lg ml-2">
						Tambah Alamat Baru
					</Text>
				</TouchableOpacity>
			</View>
		</View>
	);
};

export default SavedAddressesScreen;
