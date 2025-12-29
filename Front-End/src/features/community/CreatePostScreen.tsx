import React, { useState } from "react";
import {
	View,
	Text,
	TextInput,
	TouchableOpacity,
	ScrollView,
	Alert,
	ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { ArrowLeft, X } from "lucide-react-native";
import api from "@/services/api";

const CreatePostScreen = () => {
	const navigation = useNavigation();
	const [form, setForm] = useState({
		title: "",
		body: "",
		category: "general",
	});
	const [loading, setLoading] = useState(false);

	const categories = ["general", "discussion", "review", "event", "tips"];

	const handleSubmit = async () => {
		if (!form.title || !form.body) {
			Alert.alert("Gagal", "Judul dan isi tidak boleh kosong");
			return;
		}

		setLoading(true);
		try {
			await api.createPost(form);
			Alert.alert("Sukses", "Postingan berhasil dibuat!");
			navigation.goBack();
		} catch (error) {
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
				<Text className="font-bold text-lg">Buat Postingan</Text>
				<TouchableOpacity onPress={handleSubmit} disabled={loading}>
					{loading ? (
						<ActivityIndicator color="#2563EB" />
					) : (
						<Text className="text-blue-600 font-bold text-lg">
							Post
						</Text>
					)}
				</TouchableOpacity>
			</View>

			<ScrollView className="p-5">
				{/* Category Selector */}
				<Text className="text-gray-500 text-xs mb-2 font-bold uppercase tracking-wider">
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
							className={`px-4 py-2 rounded-full mr-2 border ${
								form.category === cat
									? "bg-blue-600 border-blue-600"
									: "bg-white border-gray-300"
							}`}
						>
							<Text
								className={`capitalize font-bold ${
									form.category === cat
										? "text-white"
										: "text-gray-500"
								}`}
							>
								{cat}
							</Text>
						</TouchableOpacity>
					))}
				</ScrollView>

				<TextInput
					placeholder="Judul Postingan"
					className="text-2xl font-bold text-gray-900 mb-4"
					placeholderTextColor="#9CA3AF"
					value={form.title}
					onChangeText={(t) => setForm({ ...form, title: t })}
				/>

				<TextInput
					placeholder="Apa yang ingin Anda diskusikan?"
					className="text-lg text-gray-700 leading-relaxed h-64"
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
