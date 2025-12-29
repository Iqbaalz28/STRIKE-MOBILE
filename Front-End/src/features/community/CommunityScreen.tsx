import React, { useCallback, useState } from "react";
import {
	View,
	Text,
	FlatList,
	TouchableOpacity,
	ActivityIndicator,
	RefreshControl,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { Plus } from "lucide-react-native";
import api from "@/services/api";
import PostCard from "./components/PostCard";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

const CommunityScreen = () => {
	const navigation = useNavigation<NativeStackNavigationProp<any>>();
	const [posts, setPosts] = useState([]);
	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);

	const fetchPosts = async () => {
		try {
			const res = await api.getAllPosts();
			setPosts(res.data);
		} catch (error) {
			console.log("Error fetching posts:", error);
		} finally {
			setLoading(false);
			setRefreshing(false);
		}
	};

	// Auto refresh saat halaman dibuka kembali (misal habis buat post)
	useFocusEffect(
		useCallback(() => {
			fetchPosts();
		}, []),
	);

	const onRefresh = () => {
		setRefreshing(true);
		fetchPosts();
	};

	return (
		<View className="flex-1 bg-gray-50">
			{/* Header */}
			<View className="pt-12 pb-4 px-5 bg-white border-b border-gray-100">
				<Text className="text-2xl font-bold text-gray-900 font-[Outfit_700Bold]">
					Komunitas
				</Text>
				<Text className="text-gray-500 text-sm">
					Diskusi seru sesama pemancing
				</Text>
			</View>

			{/* List Post */}
			{loading ? (
				<View className="mt-10">
					<ActivityIndicator size="large" color="#2563EB" />
				</View>
			) : (
				<FlatList
					data={posts}
					keyExtractor={(item: any) => item.id.toString()}
					contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
					renderItem={({ item }) => <PostCard post={item} />}
					refreshControl={
						<RefreshControl
							refreshing={refreshing}
							onRefresh={onRefresh}
						/>
					}
					ListEmptyComponent={
						<Text className="text-center text-gray-500 mt-10">
							Belum ada postingan. Jadilah yang pertama!
						</Text>
					}
				/>
			)}

			{/* Floating Action Button (FAB) - Create Post */}
			<TouchableOpacity
				onPress={() => navigation.navigate("CreatePost")}
				className="absolute bottom-6 right-6 bg-blue-600 w-14 h-14 rounded-full justify-center items-center shadow-lg shadow-blue-300 z-50"
			>
				<Plus color="white" size={28} />
			</TouchableOpacity>
		</View>
	);
};

export default CommunityScreen;
