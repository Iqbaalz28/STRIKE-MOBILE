import React, { useState, useEffect } from "react";
import {
	View,
	Text,
	TouchableOpacity,
	ScrollView,
	Modal,
	TextInput,
	Platform,
} from "react-native";
import { X, Trash2 } from "lucide-react-native";

interface FilterModalProps {
	visible: boolean;
	onClose: () => void;
	onApply: (filters: any) => void;
	initialFilters?: {
		minPrice: number;
		maxPrice: number;
		category: string;
	};
}

const FilterModal = ({
	visible,
	onClose,
	onApply,
	initialFilters,
}: FilterModalProps) => {
	const [minPrice, setMinPrice] = useState("");
	const [maxPrice, setMaxPrice] = useState("");
	const [selectedCategory, setSelectedCategory] = useState("All");

	const categories = [
		"All",
		"Joran",
		"Reel",
		"Umpan",
		"Kail",
		"Aksesoris",
		"Set Pancing",
	];

	// Sync state when modal opens
	useEffect(() => {
		if (visible && initialFilters) {
			setMinPrice(
				initialFilters.minPrice > 0
					? initialFilters.minPrice.toString()
					: "",
			);
			setMaxPrice(
				initialFilters.maxPrice < 999999999
					? initialFilters.maxPrice.toString()
					: "",
			);
			setSelectedCategory(initialFilters.category || "All");
		}
	}, [visible, initialFilters]);

	const handleReset = () => {
		setMinPrice("");
		setMaxPrice("");
		setSelectedCategory("All");
	};

	const handleApply = () => {
		onApply({
			minPrice: minPrice ? parseInt(minPrice) : 0,
			maxPrice: maxPrice ? parseInt(maxPrice) : 999999999,
			category: selectedCategory === "All" ? "" : selectedCategory,
		});
		onClose();
	};

	return (
		<Modal
			animationType="slide"
			transparent={true}
			visible={visible}
			onRequestClose={onClose}
		>
			<View className="flex-1 justify-end bg-black/50">
				{/* Dimiss area */}
				<TouchableOpacity
					className="absolute inset-0"
					activeOpacity={1}
					onPress={onClose}
				/>

				<View className="bg-white rounded-t-3xl h-[65%] w-full shadow-2xl overflow-hidden">
					{/* Header */}
					<View className="flex-row justify-between items-center px-5 py-4 border-b border-gray-100 bg-gray-50">
						<Text className="text-xl font-outfit-bold text-gray-900 font-outfit-bold">
							Filter Produk
						</Text>
						<View className="flex-row gap-2">
							<TouchableOpacity
								onPress={handleReset}
								className="p-2 bg-red-100/50 rounded-full"
							>
								<Trash2 size={20} color="#EF4444" />
							</TouchableOpacity>
							<TouchableOpacity
								onPress={onClose}
								className="p-2 bg-gray-200 rounded-full"
							>
								<X size={20} color="#374151" />
							</TouchableOpacity>
						</View>
					</View>

					<ScrollView
						showsVerticalScrollIndicator={false}
						contentContainerStyle={{ padding: 20 }}
						className="px-5 pt-2"
					>
						{/* Kategori */}
						<View className="mt-4 mb-6">
							<Text className="font-outfit-bold text-gray-800 mb-3 text-base">
								Kategori
							</Text>
							<View className="flex-row flex-wrap gap-2.5">
								{categories.map((cat) => (
									<TouchableOpacity
										key={cat}
										onPress={() => setSelectedCategory(cat)}
										className={`px-4 py-2.5 rounded-xl border ${selectedCategory === cat
											? "bg-blue-600 border-blue-600 shadow-sm shadow-blue-200"
											: "bg-white border-gray-200"
											}`}
									>
										<Text
											className={`font-outfit-medium text-sm ${selectedCategory === cat
												? "text-white"
												: "text-gray-600"
												}`}
										>
											{cat}
										</Text>
									</TouchableOpacity>
								))}
							</View>
						</View>

						{/* Rentang Harga */}
						<View className="mb-8">
							<Text className="font-outfit-bold text-gray-800 mb-3 text-base">
								Rentang Harga
							</Text>
							<View className="flex-row gap-4 items-center">
								{/* Min Price */}
								<View className="flex-1">
									<Text className="text-xs font-outfit-medium text-gray-500 mb-1.5 ml-1">
										Terendah
									</Text>
									<View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-xl px-3 h-12 focus:border-blue-500 focus:bg-blue-50/10">
										<Text className="text-gray-400 font-outfit-medium mr-1">
											Rp
										</Text>
										<TextInput
											keyboardType="numeric"
											value={minPrice}
											onChangeText={setMinPrice}
											placeholder="0"
											placeholderTextColor="#9CA3AF"
											className="flex-1 text-gray-800 font-outfit-bold h-full"
										/>
									</View>
								</View>

								<View className="h-[1px] w-4 bg-gray-300 mt-5" />

								{/* Max Price */}
								<View className="flex-1">
									<Text className="text-xs font-outfit-medium text-gray-500 mb-1.5 ml-1">
										Tertinggi
									</Text>
									<View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-xl px-3 h-12">
										<Text className="text-gray-400 font-outfit-medium mr-1">
											Rp
										</Text>
										<TextInput
											keyboardType="numeric"
											value={maxPrice}
											onChangeText={setMaxPrice}
											placeholder="..."
											placeholderTextColor="#9CA3AF"
											className="flex-1 text-gray-800 font-outfit-bold h-full"
										/>
									</View>
								</View>
							</View>
						</View>
					</ScrollView>

					{/* Footer Button */}
					<View className="p-5 border-t border-gray-100 bg-white">
						<TouchableOpacity
							onPress={handleApply}
							className="bg-blue-600 w-full py-4 rounded-xl items-center shadow-lg shadow-blue-200 active:bg-blue-700"
						>
							<Text className="text-white font-outfit-bold text-lg font-outfit-bold">
								Terapkan Filter
							</Text>
						</TouchableOpacity>
					</View>
				</View>
			</View>
		</Modal>
	);
};

export default FilterModal;
