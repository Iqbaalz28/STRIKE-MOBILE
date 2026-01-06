import React, { useState } from "react";
import {
	View,
	Text,
	TextInput,
	TouchableOpacity,
	ScrollView,
	Alert,
	ActivityIndicator,
	Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { ArrowLeft, X, Camera, Image as ImageIcon } from "lucide-react-native";
import api from "@/services/api";

const CreatePostScreen = () => {
	const navigation = useNavigation();
	// State Form
	const [form, setForm] = useState({
		title: "",
		body: "",
		category: "general",
	});
	const [loading, setLoading] = useState(false);
	// State untuk Gambar
	const [selectedImage, setSelectedImage] = useState<any>(null);

	const categories = ["general", "discussion", "review", "event"];

	const pickImage = async () => {
		// Minta Izin Akses Galeri
		const permissionResult = await import("expo-image-picker").then((mod) =>
			mod.requestMediaLibraryPermissionsAsync()
		);

		if (permissionResult.granted === false) {
			Alert.alert("Izin Ditolak", "Anda perlu mengizinkan akses galeri untuk upload foto.");
			return;
		}

		const result = await import("expo-image-picker").then((mod) =>
			mod.launchImageLibraryAsync({
				mediaTypes: mod.MediaTypeOptions.Images,
				allowsEditing: true,
				aspect: [4, 3],
				quality: 0.7,
			})
		);

		if (!result.canceled) {
			setSelectedImage(result.assets[0]);
		}
	};

	const pickCamera = async () => {
		const permissionResult = await import("expo-image-picker").then((mod) =>
			mod.requestCameraPermissionsAsync()
		);

		if (permissionResult.granted === false) {
			Alert.alert("Izin Ditolak", "Anda perlu mengizinkan akses kamera.");
			return;
		}

		const result = await import("expo-image-picker").then((mod) =>
			mod.launchCameraAsync({
				allowsEditing: true,
				aspect: [4, 3],
				quality: 0.7,
			})
		);

		if (!result.canceled) {
			setSelectedImage(result.assets[0]);
		}
	};

	const handleSubmit = async () => {
		if (!form.title || !form.body) {
			Alert.alert("Gagal", "Judul dan isi tidak boleh kosong");
			return;
		}

		setLoading(true);
		try {
			let imgFilename = null;

			// 1. Upload Image jika ada
			if (selectedImage) {
				const fileToUpload = {
					uri: selectedImage.uri,
					name: `post_${Date.now()}.jpg`,
					type: "image/jpeg",
				};

				const uploadRes = await api.uploadImage(fileToUpload);
				if (uploadRes.data?.url) {
					const fullUrl = uploadRes.data.url;
					imgFilename = `uploads/${fullUrl.split("/").pop()}`;
				} else if (uploadRes.data?.file) {
					imgFilename = uploadRes.data.file;
				} else if (uploadRes.data?.filename) {
					imgFilename = uploadRes.data.filename;
				}
			}

			// 2. Create Post
			await api.createPost({
				...form,
				img: imgFilename
			});

			Alert.alert("Sukses", "Postingan berhasil dibuat!");
			navigation.goBack();
		} catch (error) {
			console.error("Create post error:", error);
			Alert.alert("Error", "Gagal membuat postingan");
		} finally {
			setLoading(false);
		}
	};

	return (
		<View className="flex-1 bg-white pt-12">
			{/* Header */}
			<View className="px-5 pb-4 border-b border-gray-100 flex-row justify-between items-center">
				<TouchableOpacity onPress={() => navigation.goBack()}>
					<X size={24} color="black" />
				</TouchableOpacity>
				<Text className="font-outfit-bold text-lg">Buat Postingan</Text>
				<TouchableOpacity onPress={handleSubmit} disabled={loading}>
					{loading ? (
						<ActivityIndicator color="#2563EB" />
					) : (
						<Text className="text-blue-600 font-outfit-bold text-lg">
							Post
						</Text>
					)}
				</TouchableOpacity>
			</View>

			<ScrollView className="p-5">
				{/* Category Selector */}
				<Text className="text-gray-500 text-xs mb-2 font-outfit-bold uppercase tracking-wider">
					Kategori
				</Text>
				<ScrollView
					horizontal
					showsHorizontalScrollIndicator={false}
					className="mb-6"
				>
					{categories.map((cat) => (
						<TouchableOpacity
							key={cat}
							onPress={() => setForm({ ...form, category: cat })}
							className={`px-4 py-2 rounded-full mr-2 border ${form.category === cat
								? "bg-blue-600 border-blue-600"
								: "bg-white border-gray-300"
								}`}
						>
							<Text
								className={`capitalize font-outfit-bold ${form.category === cat
									? "text-white"
									: "text-gray-500"
									}`}
							>
								{cat}
							</Text>
						</TouchableOpacity>
					))}
				</ScrollView>

				{/* Image Picker Section */}
				<View className="mb-6">
					{selectedImage ? (
						<View className="rounded-xl overflow-hidden relative">
							<Image
								source={{ uri: selectedImage.uri }}
								style={{ width: '100%', height: 200 }}
								resizeMode="cover"
							/>
							<TouchableOpacity
								onPress={() => setSelectedImage(null)}
								className="absolute top-2 right-2 bg-black/50 p-2 rounded-full"
							>
								<X size={16} color="white" />
							</TouchableOpacity>
						</View>
					) : (
						<View className="flex-row gap-4">
							<TouchableOpacity
								onPress={pickCamera}
								className="flex-1 bg-gray-50 border border-gray-200 border-dashed rounded-xl h-32 justify-center items-center"
							>
								<Camera size={24} color="#6B7280" />
								<Text className="text-gray-500 text-xs mt-2 font-outfit-medium">Ambil Foto</Text>
							</TouchableOpacity>
							<TouchableOpacity
								onPress={pickImage}
								className="flex-1 bg-gray-50 border border-gray-200 border-dashed rounded-xl h-32 justify-center items-center"
							>
								<ImageIcon size={24} color="#6B7280" />
								<Text className="text-gray-500 text-xs mt-2 font-outfit-medium">Buka Galeri</Text>
							</TouchableOpacity>
						</View>
					)}
				</View>

				<TextInput
					placeholder="Judul Postingan"
					className="text-2xl font-outfit-bold text-gray-900 mb-4"
					placeholderTextColor="#9CA3AF"
					value={form.title}
					onChangeText={(t) => setForm({ ...form, title: t })}
				/>

				<TextInput
					placeholder="Apa yang ingin Anda diskusikan?"
					className="text-lg text-gray-700 leading-relaxed h-40"
					placeholderTextColor="#9CA3AF"
					multiline
					textAlignVertical="top"
					value={form.body}
					onChangeText={(t) => setForm({ ...form, body: t })}
				/>
			</ScrollView>
		</View>
	);
};

export default CreatePostScreen;
