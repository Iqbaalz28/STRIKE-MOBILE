import React, { useState, useEffect } from "react";
import {
	View,
	Text,
	TextInput,
	TouchableOpacity,
	ScrollView,
	Alert,
	ActivityIndicator,
	Image,
	Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { ArrowLeft, Save, Camera, Calendar } from "lucide-react-native";
import * as ImagePicker from "expo-image-picker"; // Import Image Picker
import { useSafeAreaInsets } from "react-native-safe-area-context";
import DateTimePicker from "@react-native-community/datetimepicker";

import api from "@/services/api";
import { getImageUrl } from "@/utils/imageHelper";
import { formatDate } from "@/utils/format";

const EditProfileScreen = () => {
	const navigation = useNavigation();
	const insets = useSafeAreaInsets();

	// State Form
	const [form, setForm] = useState({
		name: "",
		email: "",
		date_birth: "",
		bio: "",
		avatar_img: "",
	});

	// State untuk Gambar Baru (Local URI)
	const [selectedImage, setSelectedImage] =
		useState<ImagePicker.ImagePickerAsset | null>(null);

	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [showDatePicker, setShowDatePicker] = useState(false);
	const [datePickerValue, setDatePickerValue] = useState(new Date());

	useEffect(() => {
		loadProfile();
	}, []);

	const loadProfile = async () => {
		try {
			const res = await api.getMyProfile();
			const user = res.data;
			setForm({
				name: user.name || "",
				email: user.email || "",
				date_birth: user.date_birth || "",
				bio: user.bio || "",
				avatar_img: user.avatar_img || "",
			});
			if (user.date_birth) {
				setDatePickerValue(new Date(user.date_birth));
			}
		} catch (error) {
			console.log("Error load profile", error);
		} finally {
			setLoading(false);
		}
	};

	// --- FUNGSI DATE PICKER ---
	const onDateChange = (event: any, selectedDate?: Date) => {
		setShowDatePicker(false);
		if (selectedDate) {
			setDatePickerValue(selectedDate);
			// Format YYYY-MM-DD
			const dateStr = selectedDate.toISOString().split("T")[0];
			setForm({ ...form, date_birth: dateStr });
		}
	};

	// --- 1. FUNGSI PILIH GAMBAR ---
	const pickImage = async () => {
		// Minta Izin Akses Galeri
		const permissionResult =
			await ImagePicker.requestMediaLibraryPermissionsAsync();

		if (permissionResult.granted === false) {
			Alert.alert(
				"Izin Ditolak",
				"Anda perlu mengizinkan akses galeri untuk mengganti foto.",
			);
			return;
		}

		const result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ImagePicker.MediaTypeOptions.Images,
			allowsEditing: true,
			aspect: [1, 1], // Kotak (Square)
			quality: 0.5, // Kompresi agar tidak terlalu besar
		});

		if (!result.canceled) {
			setSelectedImage(result.assets[0]);
		}
	};

	// --- 2. FUNGSI SIMPAN (UPLOAD + UPDATE) ---
	const handleSave = async () => {
		setSaving(true);
		try {
			let finalAvatar = form.avatar_img;

			// A. Jika ada gambar baru yang dipilih, UPLOAD dulu
			if (selectedImage) {
				const fileToUpload = {
					uri: selectedImage.uri,
					name: `avatar_${Date.now()}.jpg`,
					type: "image/jpeg",
				};

				console.log("Mengupload gambar...", fileToUpload.name);

				// Panggil API Upload
				const uploadRes = await api.uploadImage(fileToUpload);
				console.log("Upload Respon:", uploadRes.data);

				// --- PERBAIKAN LOGIC DISINI ---
				// Menangani respon backend: {"url": "http://.../uploads/avatar.jpg"}
				if (uploadRes.data?.url) {
					// Kita ambil nama filenya saja agar path-nya bersih & relatif
					// Contoh: "http://.../uploads/avatar.jpg" -> "avatar.jpg"
					const fullUrl = uploadRes.data.url;
					const filename = fullUrl.split("/").pop();
					finalAvatar = `uploads/${filename}`;
				}
				// Menangani respon backend format lain (jaga-jaga)
				else if (uploadRes.data?.file) {
					finalAvatar = uploadRes.data.file;
				} else if (uploadRes.data?.filename) {
					finalAvatar = uploadRes.data.filename;
				}

				console.log("Path Avatar Baru:", finalAvatar);
			}

			// B. Update Data Profil
			const payload = {
				...form,
				avatar_img: finalAvatar, // Kirim path baru ke database
			};

			await api.updateProfile(payload);

			Alert.alert("Sukses", "Profil berhasil diperbarui", [
				{ text: "OK", onPress: () => navigation.goBack() },
			]);
		} catch (error: any) {
			console.error("Save Error:", error);
			Alert.alert("Gagal", "Terjadi kesalahan/timeout saat menyimpan.");
		} finally {
			setSaving(false);
		}
	};

	if (loading)
		return (
			<View className="flex-1 justify-center">
				<ActivityIndicator color="#2563EB" />
			</View>
		);

	// Helper untuk menampilkan gambar preview
	// Jika ada selectedImage (lokal), pakai itu. Jika tidak, pakai URL dari backend.
	const displayImage = selectedImage
		? { uri: selectedImage.uri }
		: { uri: getImageUrl(form.avatar_img) };

	return (
		<View className="flex-1 bg-white">
			{/* Header */}
			<View className="pt-12 pb-4 px-5 border-b border-gray-100 flex-row items-center justify-between">
				<TouchableOpacity onPress={() => navigation.goBack()}>
					<ArrowLeft size={24} color="black" />
				</TouchableOpacity>
				<Text className="text-lg font-outfit-bold font-outfit-bold">
					Edit Profil
				</Text>
				<View style={{ width: 24 }} />
			</View>

			<ScrollView
				className="p-5"
				contentContainerStyle={{ paddingBottom: 200 }}
			>
				{/* --- UI GANTI FOTO --- */}
				<View className="items-center mb-8">
					<View className="relative">
						<Image
							source={displayImage}
							className="w-28 h-28 rounded-full bg-gray-200"
						/>
						<TouchableOpacity
							onPress={pickImage}
							className="absolute bottom-0 right-0 bg-blue-600 p-2 rounded-full border-2 border-white shadow-sm"
						>
							<Camera size={16} color="white" />
						</TouchableOpacity>
					</View>
					<Text
						className="text-blue-600 text-sm font-outfit-bold mt-3 font-outfit-bold"
						onPress={pickImage}
					>
						Ganti Foto Profil
					</Text>
				</View>

				{/* --- FORM INPUT --- */}
				<View className="space-y-4">
					<View>
						<Text className="text-gray-500 text-xs mb-1 ml-1">
							Nama Lengkap
						</Text>
						<TextInput
							value={form.name}
							onChangeText={(t) => setForm({ ...form, name: t })}
							className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800"
						/>
					</View>

					<View>
						<Text className="text-gray-500 text-xs mb-1 ml-1">
							Email (Tidak bisa diubah)
						</Text>
						<TextInput
							value={form.email}
							editable={false}
							className="bg-gray-100 border border-gray-200 rounded-xl px-4 py-3 text-gray-500"
						/>
					</View>

					<View>
						<Text className="text-gray-500 text-xs mb-1 ml-1">
							Tanggal Lahir
						</Text>
						<TouchableOpacity
							onPress={() => setShowDatePicker(true)}
							className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 flex-row justify-between items-center"
						>
							<Text className="text-gray-800">
								{form.date_birth
									? formatDate(form.date_birth)
									: "Pilih Tanggal Lahir"}
							</Text>
							<Calendar size={20} color="#6B7280" />
						</TouchableOpacity>
						{showDatePicker && (
							<DateTimePicker
								value={datePickerValue}
								mode="date"
								display="default"
								onChange={onDateChange}
								maximumDate={new Date()} // Tidak boleh lahir di masa depan
							/>
						)}
					</View>

					<View>
						<Text className="text-gray-500 text-xs mb-1 ml-1">
							Bio Singkat
						</Text>
						<TextInput
							value={form.bio}
							onChangeText={(t) => setForm({ ...form, bio: t })}
							multiline
							className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 h-20"
							style={{ textAlignVertical: "top" }}
							placeholder="Ceritakan sedikit tentang Anda..."
						/>
					</View>
				</View>
			</ScrollView>

			{/* --- STICKY FOOTER --- */}
			<View
				className="absolute bottom-0 left-0 right-0 bg-white p-5 border-t border-gray-100 shadow-lg"
				style={{ paddingBottom: Platform.OS === 'ios' ? 20 : 20 + insets.bottom }}
			>
				<TouchableOpacity
					onPress={handleSave}
					disabled={saving}
					className="bg-blue-600 py-4 rounded-xl flex-row justify-center items-center shadow-lg shadow-blue-200"
				>
					{saving ? (
						<ActivityIndicator color="white" />
					) : (
						<>
							<Save size={20} color="white" className="mr-2" />
							<Text className="text-white font-outfit-bold text-lg">
								Simpan Perubahan
							</Text>
						</>
					)}
				</TouchableOpacity>
			</View>
		</View>
	);
};

export default EditProfileScreen;
