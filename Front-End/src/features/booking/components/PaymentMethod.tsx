import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Image, ScrollView } from "react-native";

// Kita export tipe datanya agar bisa dipakai di CheckoutScreen
export interface PaymentMethodType {
	id: number;
	name: string;
}

const PaymentMethod = ({
	onSelect,
}: {
	onSelect: (method: PaymentMethodType) => void;
}) => {
	const [activeTab, setActiveTab] = useState("transfer");
	const [selectedBank, setSelectedBank] = useState("bca");

	// Trigger onSelect saat activeTab berubah
	useEffect(() => {
		let methodData: PaymentMethodType = { id: 2, name: "Bank Transfer" };
		switch (activeTab) {
			case "card":
				methodData = { id: 1, name: "Kartu Debit/Kredit" };
				break;
			case "transfer":
				methodData = { id: 2, name: "Bank Transfer" };
				break;
			case "qris":
				methodData = { id: 3, name: "QRIS" };
				break;
			case "cod":
				methodData = { id: 4, name: "Cash on Delivery" };
				break;
		}
		onSelect(methodData);
	}, [activeTab]);

	const tabs = [
		{ id: "transfer", label: "Transfer" },
		{ id: "qris", label: "QRIS" },
		{ id: "card", label: "Kartu" },
		{ id: "cod", label: "COD" },
	];

	return (
		<View className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
			<Text className="text-xl font-outfit-bold mb-4 text-gray-900 font-outfit-bold">
				Metode Pembayaran
			</Text>

			{/* Tabs */}
			<ScrollView
				horizontal
				showsHorizontalScrollIndicator={false}
				className="mb-4 border-b border-gray-100 pb-2"
			>
				{tabs.map((tab) => (
					<TouchableOpacity
						key={tab.id}
						onPress={() => setActiveTab(tab.id)}
						className={`px-4 py-2 mr-2 rounded-full border ${activeTab === tab.id
							? "bg-blue-50 border-blue-600"
							: "bg-white border-gray-200"
							}`}
					>
						<Text
							className={
								activeTab === tab.id
									? "text-blue-600 font-outfit-bold"
									: "text-gray-500"
							}
						>
							{tab.label}
						</Text>
					</TouchableOpacity>
				))}
			</ScrollView>

			{/* Content */}
			<View className="min-h-[150px]">
				{activeTab === "transfer" && (
					<View className="space-y-3">
						{["bca", "mandiri", "bri"].map((bank) => (
							<TouchableOpacity
								key={bank}
								onPress={() => setSelectedBank(bank)}
								className={`flex-row items-center p-3 border rounded-xl mb-2 ${selectedBank === bank
									? "border-blue-600 bg-blue-50"
									: "border-gray-200"
									}`}
							>
								<View
									className={`w-4 h-4 rounded-full border mr-3 items-center justify-center ${selectedBank === bank
										? "border-blue-600"
										: "border-gray-400"
										}`}
								>
									{selectedBank === bank && (
										<View className="w-2 h-2 rounded-full bg-blue-600" />
									)}
								</View>
								<Text className="capitalize font-outfit-medium text-gray-800">
									{bank} Virtual Account
								</Text>
							</TouchableOpacity>
						))}
					</View>
				)}

				{activeTab === "qris" && (
					<View className="items-center py-4">
						<Image
							source={{
								uri: "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=StrikeItPayment",
							}}
							className="w-40 h-40"
						/>
						<Text className="text-center text-xs text-gray-500 mt-2">
							Scan QR code di atas
						</Text>
					</View>
				)}

				{activeTab === "card" && (
					<View className="space-y-4">
						{/* Nomor Kartu */}
						<View>
							<Text className="text-gray-700 mb-2 font-outfit-medium">Nomor Kartu</Text>
							<View className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
								<Text className="text-gray-400">1234 5678 9012 3456</Text>
							</View>
						</View>

						{/* Nama Pemegang Kartu */}
						<View>
							<Text className="text-gray-700 mb-2 font-outfit-medium">Nama Pemegang Kartu</Text>
							<View className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
								<Text className="text-gray-400">Nama sesuai kartu</Text>
							</View>
						</View>

						{/* Row: Expiry Date & CVV */}
						<View className="flex-row gap-3">
							<View className="flex-1">
								<Text className="text-gray-700 mb-2 font-outfit-medium">Tanggal Kadaluarsa</Text>
								<View className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
									<Text className="text-gray-400">MM/YY</Text>
								</View>
							</View>
							<View className="flex-1">
								<Text className="text-gray-700 mb-2 font-outfit-medium">CVV</Text>
								<View className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
									<Text className="text-gray-400">123</Text>
								</View>
							</View>
						</View>

						{/* Info keamanan */}
						<View className="bg-blue-50 rounded-xl p-3 flex-row items-center">
							<View className="w-8 h-8 bg-blue-100 rounded-full items-center justify-center mr-3">
								<Text className="text-blue-600 font-outfit-bold">🔒</Text>
							</View>
							<Text className="text-blue-700 text-xs flex-1">
								Data kartu Anda aman & terenkripsi
							</Text>
						</View>
					</View>
				)}
				{activeTab === "cod" && (
					<View className="py-4 items-center">
						<Text className="text-gray-800 font-outfit-bold">
							Bayar di Tempat
						</Text>
						<Text className="text-gray-500 text-center text-sm mt-1">
							Siapkan uang pas saat check-in.
						</Text>
					</View>
				)}
			</View>
		</View>
	);
};

export default PaymentMethod;
