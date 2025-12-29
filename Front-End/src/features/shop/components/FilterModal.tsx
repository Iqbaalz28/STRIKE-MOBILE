import React, { useState } from "react";
import {
	View,
	Text,
	TouchableOpacity,
	ScrollView,
	Modal,
	TextInput,
} from "react-native";
import { X } from "lucide-react-native";

interface FilterModalProps {
	visible: boolean;
	onClose: () => void;
	onApply: (filters: any) => void;
}

const FilterModal = ({ visible, onClose, onApply }: FilterModalProps) => {
	const [minPrice, setMinPrice] = useState("");
	const [maxPrice, setMaxPrice] = useState("");
	const [selectedCategory, setSelectedCategory] = useState("All");

	const categories = [
		"All",
		"Joran",
		"Umpan",
		"Kail",
		"Aksesoris",
		"Set Pancing",
	];

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
				<View className="bg-white rounded-t-3xl p-5 h-[60%]">
					{/* Header */}
					<View className="flex-row justify-between items-center mb-6">
						<Text className="text-xl font-bold text-gray-900 font-[Outfit_700Bold]">
							Filter Produk
						</Text>
						<TouchableOpacity onPress={onClose}>
							<X size={24} color="black" />
						</TouchableOpacity>
					</View>

					<ScrollView showsVerticalScrollIndicator={false}>
						{/* Kategori */}
						<Text className="font-bold text-gray-700 mb-3">
							Kategori
						</Text>
						<View className="flex-row flex-wrap gap-2 mb-6">
							{categories.map((cat) => (
								<TouchableOpacity
									key={cat}
									onPress={() => setSelectedCategory(cat)}
									className={`px-4 py-2 rounded-full border ${
										selectedCategory === cat
											? "bg-blue-600 border-blue-600"
											: "bg-white border-gray-300"
									}`}
								>
									<Text
										className={
											selectedCategory === cat
												? "text-white font-bold"
												: "text-gray-600"
										}
									>
										{cat}
									</Text>
								</TouchableOpacity>
							))}
						</View>

						{/* Rentang Harga */}
						<Text className="font-bold text-gray-700 mb-3">
							Rentang Harga
						</Text>
						<View className="flex-row gap-3 mb-6">
							<View className="flex-1">
								<Text className="text-xs text-gray-500 mb-1">
									Minimum
								</Text>
								<TextInput
									keyboardType="numeric"
									value={minPrice}
									onChangeText={setMinPrice}
									placeholder="0"
									className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3"
								/>
							</View>
							<View className="flex-1">
								<Text className="text-xs text-gray-500 mb-1">
									Maksimum
								</Text>
								<TextInput
									keyboardType="numeric"
									value={maxPrice}
									onChangeText={setMaxPrice}
									placeholder="999.999"
									className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3"
								/>
							</View>
						</View>
					</ScrollView>

					{/* Button */}
					<View className="pt-4 border-t border-gray-100">
						<TouchableOpacity
							onPress={handleApply}
							className="bg-blue-600 w-full py-4 rounded-xl items-center shadow-lg shadow-blue-200"
						>
							<Text className="text-white font-bold text-lg">
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
