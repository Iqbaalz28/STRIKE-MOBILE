import React, { useState, useEffect } from "react";
import {
	View,
	Text,
	ScrollView,
	TouchableOpacity,
	TextInput,
	Alert,
	Switch,
	KeyboardAvoidingView,
	Platform,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ArrowLeft, Save, MapPin } from "lucide-react-native";
import {
	SavedAddress,
	getAddresses,
	saveAddresses,
} from "./SavedAddressesScreen";

// Generate UUID
const generateId = () => {
	return "addr_" + Date.now().toString(36) + Math.random().toString(36).substr(2);
};

const AddEditAddressScreen = () => {
	const navigation = useNavigation<NativeStackNavigationProp<any>>();
	const route = useRoute<any>();
	const existingAddress: SavedAddress | undefined = route.params?.address;
	const isEditing = !!existingAddress;

	// Form state
	const [label, setLabel] = useState(existingAddress?.label || "");
	const [recipientName, setRecipientName] = useState(
		existingAddress?.recipientName || ""
	);
	const [phone, setPhone] = useState(existingAddress?.phone || "");
	const [street, setStreet] = useState(existingAddress?.street || "");
	const [city, setCity] = useState(existingAddress?.city || "");
	const [province, setProvince] = useState(existingAddress?.province || "");
	const [postcode, setPostcode] = useState(existingAddress?.postcode || "");
	const [isDefault, setIsDefault] = useState(existingAddress?.isDefault || false);
	const [saving, setSaving] = useState(false);

	// Preset labels
	const presetLabels = ["Rumah", "Kantor", "Apartemen", "Kos", "Lainnya"];

	const validateForm = () => {
		if (!label.trim()) {
			Alert.alert("Error", "Label alamat harus diisi");
			return false;
		}
		if (!recipientName.trim()) {
			Alert.alert("Error", "Nama penerima harus diisi");
			return false;
		}
		if (!phone.trim()) {
			Alert.alert("Error", "Nomor telepon harus diisi");
			return false;
		}
		if (!street.trim()) {
			Alert.alert("Error", "Alamat jalan harus diisi");
			return false;
		}
		if (!city.trim()) {
			Alert.alert("Error", "Kota harus diisi");
			return false;
		}
		return true;
	};

	const handleSave = async () => {
		if (!validateForm()) return;

		setSaving(true);
		try {
			const addresses = await getAddresses();

			const newAddress: SavedAddress = {
				id: existingAddress?.id || generateId(),
				label: label.trim(),
				recipientName: recipientName.trim(),
				phone: phone.trim(),
				street: street.trim(),
				city: city.trim(),
				province: province.trim(),
				postcode: postcode.trim(),
				isDefault: isDefault,
			};

			let updatedAddresses: SavedAddress[];

			if (isEditing) {
				// Update existing address
				updatedAddresses = addresses.map((addr) =>
					addr.id === existingAddress.id ? newAddress : addr
				);
			} else {
				// Add new address
				updatedAddresses = [...addresses, newAddress];
			}

			// If this address is set as default, unset others
			if (isDefault) {
				updatedAddresses = updatedAddresses.map((addr) => ({
					...addr,
					isDefault: addr.id === newAddress.id,
				}));
			}

			// If no default is set and this is the first address, make it default
			if (updatedAddresses.length === 1) {
				updatedAddresses[0].isDefault = true;
			}

			await saveAddresses(updatedAddresses);

			Alert.alert(
				"Berhasil",
				isEditing ? "Alamat berhasil diperbarui" : "Alamat berhasil ditambahkan",
				[{ text: "OK", onPress: () => navigation.goBack() }]
			);
		} catch (error) {
			console.error("Error saving address:", error);
			Alert.alert("Error", "Gagal menyimpan alamat");
		} finally {
			setSaving(false);
		}
	};

	return (
		<KeyboardAvoidingView
			behavior={Platform.OS === "ios" ? "padding" : "height"}
			className="flex-1 bg-gray-50"
		>
			{/* Header */}
			<View className="pt-12 px-4 pb-4 bg-white border-b border-gray-100 flex-row items-center gap-3">
				<TouchableOpacity onPress={() => navigation.goBack()}>
					<ArrowLeft size={24} color="black" />
				</TouchableOpacity>
				<Text className="text-xl font-outfit-bold">
					{isEditing ? "Edit Alamat" : "Tambah Alamat"}
				</Text>
			</View>

			<ScrollView className="flex-1 p-4">
				{/* Label Selection */}
				<View className="bg-white rounded-2xl p-4 mb-4">
					<View className="flex-row items-center mb-3">
						<MapPin size={20} color="#2563EB" />
						<Text className="font-outfit-bold text-gray-900 ml-2">
							Label Alamat <Text className="text-red-500">*</Text>
						</Text>
					</View>

					{/* Preset chips */}
					<View className="flex-row flex-wrap gap-2 mb-3">
						{presetLabels.map((preset) => (
							<TouchableOpacity
								key={preset}
								onPress={() => setLabel(preset)}
								className={`px-4 py-2 rounded-full border-2 ${
									label === preset
										? "bg-blue-600 border-blue-600"
										: "bg-white border-gray-200"
								}`}
							>
								<Text
									className={`font-outfit-medium ${
										label === preset ? "text-white" : "text-gray-700"
									}`}
								>
									{preset}
								</Text>
							</TouchableOpacity>
						))}
					</View>

					{/* Custom label input */}
					<TextInput
						placeholder="Atau tulis label custom..."
						value={label}
						onChangeText={setLabel}
						className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900"
					/>
				</View>

				{/* Recipient Info */}
				<View className="bg-white rounded-2xl p-4 mb-4">
					<Text className="font-outfit-bold text-gray-900 mb-3">
						Informasi Penerima
					</Text>

					<View className="mb-4">
						<Text className="text-gray-600 text-sm mb-1">
							Nama Penerima <Text className="text-red-500">*</Text>
						</Text>
						<TextInput
							placeholder="Nama lengkap penerima"
							value={recipientName}
							onChangeText={setRecipientName}
							className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900"
						/>
					</View>

					<View>
						<Text className="text-gray-600 text-sm mb-1">
							Nomor Telepon <Text className="text-red-500">*</Text>
						</Text>
						<TextInput
							placeholder="08xxxxxxxxxx"
							value={phone}
							onChangeText={setPhone}
							keyboardType="phone-pad"
							className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900"
						/>
					</View>
				</View>

				{/* Address Details */}
				<View className="bg-white rounded-2xl p-4 mb-4">
					<Text className="font-outfit-bold text-gray-900 mb-3">
						Detail Alamat
					</Text>

					<View className="mb-4">
						<Text className="text-gray-600 text-sm mb-1">
							Alamat Jalan <Text className="text-red-500">*</Text>
						</Text>
						<TextInput
							placeholder="Nama jalan, No. rumah, RT/RW"
							value={street}
							onChangeText={setStreet}
							multiline
							numberOfLines={2}
							className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900"
							style={{ textAlignVertical: "top", minHeight: 60 }}
						/>
					</View>

					<View className="flex-row gap-3 mb-4">
						<View className="flex-1">
							<Text className="text-gray-600 text-sm mb-1">
								Kota <Text className="text-red-500">*</Text>
							</Text>
							<TextInput
								placeholder="Nama kota"
								value={city}
								onChangeText={setCity}
								className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900"
							/>
						</View>
						<View className="flex-1">
							<Text className="text-gray-600 text-sm mb-1">Provinsi</Text>
							<TextInput
								placeholder="Provinsi"
								value={province}
								onChangeText={setProvince}
								className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900"
							/>
						</View>
					</View>

					<View>
						<Text className="text-gray-600 text-sm mb-1">Kode Pos</Text>
						<TextInput
							placeholder="Kode pos"
							value={postcode}
							onChangeText={setPostcode}
							keyboardType="number-pad"
							maxLength={5}
							className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900"
						/>
					</View>
				</View>

				{/* Default Address Toggle */}
				<View className="bg-white rounded-2xl p-4 mb-4 flex-row items-center justify-between">
					<View className="flex-1 mr-4">
						<Text className="font-outfit-bold text-gray-900">
							Jadikan Alamat Utama
						</Text>
						<Text className="text-gray-500 text-sm">
							Alamat ini akan digunakan sebagai default saat checkout
						</Text>
					</View>
					<Switch
						value={isDefault}
						onValueChange={setIsDefault}
						trackColor={{ false: "#D1D5DB", true: "#93C5FD" }}
						thumbColor={isDefault ? "#2563EB" : "#F3F4F6"}
					/>
				</View>

				<View className="h-24" />
			</ScrollView>

			{/* Save Button */}
			<View className="absolute bottom-0 w-full bg-white p-4 border-t border-gray-100 pb-8">
				<TouchableOpacity
					onPress={handleSave}
					disabled={saving}
					className={`py-4 rounded-xl flex-row items-center justify-center shadow-lg ${
						saving ? "bg-blue-400" : "bg-blue-600"
					}`}
				>
					<Save size={20} color="white" />
					<Text className="text-white font-outfit-bold text-lg ml-2">
						{saving ? "Menyimpan..." : "Simpan Alamat"}
					</Text>
				</TouchableOpacity>
			</View>
		</KeyboardAvoidingView>
	);
};

export default AddEditAddressScreen;
