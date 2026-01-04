import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { ShoppingCart } from "lucide-react-native";
import { getImageUrl } from "@/utils/imageHelper";
import { formatRupiah } from "@/utils/format";

// Definisikan Interface Props
interface ProductCardProps {
	product: any;
	onPress: () => void;
}

const ProductCard = ({ product, onPress }: ProductCardProps) => {
	// 1. Logic: Cek tipe transaksi (Sewa / Beli)
	// Menggunakan data dari backend (price_rent / price_sale)
	const isRent = (product.price_rent || 0) > 0;
	const isSale = (product.price_sale || 0) > 0;

	// 2. Logic: Menentukan harga utama yang ditampilkan
	// Prioritas tampilan: Harga Jual > Harga Sewa > Harga Default
	const displayPrice = isSale
		? product.price_sale
		: isRent
			? product.price_rent
			: product.price;

	return (
		<TouchableOpacity
			onPress={onPress}
			className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 m-1 overflow-hidden mb-4"
			activeOpacity={0.7}
		>
			{/* --- GAMBAR PRODUK --- */}
			<View className="relative">
				<Image
					// Gunakan getImageUrl untuk menangani URL localhost/android
					// Fallback ke product.img jika product.image tidak ada (sesuai database)
					source={{ uri: getImageUrl(product.image || product.img) }}
					className="w-full h-40 bg-gray-100"
					resizeMode="cover"
				/>

				{/* Badge Status (Pojok Kanan Atas) */}
				<View className="absolute top-2 right-2 flex-row gap-1">
					{isRent && (
						<View className="bg-blue-600 px-2 py-1 rounded-md shadow-sm">
							<Text className="text-[10px] text-white font-bold font-[Outfit_700Bold]">
								SEWA
							</Text>
						</View>
					)}
					{isSale && (
						<View className="bg-green-600 px-2 py-1 rounded-md shadow-sm">
							<Text className="text-[10px] text-white font-bold font-[Outfit_700Bold]">
								BELI
							</Text>
						</View>
					)}
				</View>
			</View>

			{/* --- INFO PRODUK --- */}
			<View className="p-3">
				{/* Nama Produk */}
				<Text
					className="text-sm font-bold text-gray-800 mb-1 h-10 font-[Outfit_500Medium]"
					numberOfLines={2}
				>
					{product.name}
				</Text>

				{/* Tampilan Harga */}
				<View className="mt-1">
					<Text className="text-sm font-bold text-blue-600 font-[Outfit_700Bold]">
						{/* Label Sewa jika barang sewaan */}
						{isRent && !isSale ? "Sewa: " : ""}

						{/* Gunakan formatRupiah dari utils */}
						{formatRupiah(displayPrice)}

						{/* Satuan waktu jika sewa */}
						{isRent && !isSale ? " /jam" : ""}
					</Text>
				</View>

				{/* Footer Card: Kategori & Icon Cart */}
				<View className="mt-3 flex-row justify-between items-center">
					<Text className="text-xs text-gray-500 capitalize font-[Outfit_400Regular]">
						{product.category || "Alat Pancing"}
					</Text>
					<View className="bg-blue-50 p-1.5 rounded-lg">
						<ShoppingCart size={16} color="#2563EB" />
					</View>
				</View>
			</View>
		</TouchableOpacity>
	);
};

export default ProductCard;
