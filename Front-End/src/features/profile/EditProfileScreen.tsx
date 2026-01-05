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
import { ArrowLeft, Save, Camera } from "lucide-react-native";
import * as ImagePicker from "expo-image-picker"; // Import Image Picker

import api from "@/services/api";
import { getImageUrl } from "@/utils/imageHelper";

const EditProfileScreen = () => {
	const navigation = useNavigation();

	// State Form
	const [form, setForm] = useState({
		name: "",
		email: "",
		phone: "",
		address: "",
		bio: "",
		avatar_img: "", // Tambahkan field ini
	});

	// State untuk Gambar Baru (Local URI)
	const [selectedImage, setSelectedImage] =
		useState<ImagePicker.ImagePickerAsset | null>(null);

	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);

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
				phone: user.phone || "",
				address: user.address || "",
				bio: user.bio || "",
				avatar_img: user.avatar_img || "",
			});
		} catch (error) {
			console.log("Error load profile", error);
		} finally {
			setLoading(false);
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
				// Siapkan objek file untuk React Native FormData
				const fileToUpload = {
					uri: selectedImage.uri,
					name: `avatar_${Date.now()}.jpg`, // Generate nama unik
					type: "image/jpeg",
				};

				// Panggil API Upload
				const uploadRes = await api.uploadImage(fileToUpload);

				// Debugging: Cek respon backend di terminal
				console.log("Upload Success:", uploadRes.data);

				// Ambil path file dari respon backend
				// Sesuaikan dengan struktur JSON backend Anda (biasanya `file`, `filename`, atau `path`)
				if (uploadRes.data && uploadRes.data.file) {
					finalAvatar = uploadRes.data.file;
				} else if (uploadRes.data && uploadRes.data.filename) {
					finalAvatar = uploadRes.data.filename;
				} else if (typeof uploadRes.data === "string") {
					// Jaga-jaga kalau backend return string langsung
					finalAvatar = uploadRes.data;
				}
			}

			// B. Update Data Profil (termasuk avatar baru jika ada)
			const payload = {
				...form,
				avatar_img: finalAvatar,
			};

			await api.updateProfile(payload);

			Alert.alert("Sukses", "Profil berhasil diperbarui", [
				{ text: "OK", onPress: () => navigation.goBack() },
			]);
		} catch (error: any) {
			console.error("Save Error:", error);
			Alert.alert("Gagal", "Terjadi kesalahan saat menyimpan profil.");
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
				<Text className="text-lg font-bold font-[Outfit_700Bold]">
					Edit Profil
				</Text>
				<View style={{ width: 24 }} />
			</View>

			<ScrollView className="p-5">
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
						className="text-blue-600 text-sm font-bold mt-3 font-[Outfit_700Bold]"
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
							Nomor HP
						</Text>
						<TextInput
							value={form.phone}
							onChangeText={(t) => setForm({ ...form, phone: t })}
							keyboardType="phone-pad"
							className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800"
							placeholder="08xxxxxxxx"
						/>
					</View>

					<View>
						<Text className="text-gray-500 text-xs mb-1 ml-1">
							Alamat
						</Text>
						<TextInput
							value={form.address}
							onChangeText={(t) =>
								setForm({ ...form, address: t })
							}
							multiline
							numberOfLines={3}
							className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 h-24"
							style={{ textAlignVertical: "top" }}
						/>
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

				<TouchableOpacity
					onPress={handleSave}
					disabled={saving}
					className="mt-8 bg-blue-600 py-4 rounded-xl flex-row justify-center items-center shadow-lg shadow-blue-200"
				>
					{saving ? (
						<ActivityIndicator color="white" />
					) : (
						<>
							<Save size={20} color="white" className="mr-2" />
							<Text className="text-white font-bold text-lg">
								Simpan Perubahan
							</Text>
						</>
					)}
				</TouchableOpacity>

				{/* Spacer Bawah */}
				<View className="h-10" />
			</ScrollView>
		</View>
	);
};

export default EditProfileScreen;
