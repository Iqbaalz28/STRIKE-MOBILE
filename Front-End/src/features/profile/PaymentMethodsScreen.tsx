import React, { useState, useCallback } from "react";
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    Image,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
    ArrowLeft,
    CreditCard,
    Plus,
    Trash2,
    Check,
    Wallet,
    Smartphone,
    Building2,
} from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Payment Method data structure
export interface SavedPaymentMethod {
    id: string;
    type: "card" | "ewallet" | "bank";
    name: string;
    details: string; // Card number masked, phone number, or bank account
    icon?: string;
    isDefault: boolean;
}

const PAYMENT_METHODS_STORAGE_KEY = "@saved_payment_methods";

// Helper functions for payment methods storage
export const getPaymentMethods = async (): Promise<SavedPaymentMethod[]> => {
    try {
        const data = await AsyncStorage.getItem(PAYMENT_METHODS_STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error("Error getting payment methods:", error);
        return [];
    }
};

export const savePaymentMethods = async (methods: SavedPaymentMethod[]): Promise<void> => {
    try {
        await AsyncStorage.setItem(PAYMENT_METHODS_STORAGE_KEY, JSON.stringify(methods));
    } catch (error) {
        console.error("Error saving payment methods:", error);
    }
};

const PaymentMethodsScreen = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const [paymentMethods, setPaymentMethods] = useState<SavedPaymentMethod[]>([]);
    const [loading, setLoading] = useState(true);

    // Load payment methods when screen is focused
    useFocusEffect(
        useCallback(() => {
            loadPaymentMethods();
        }, [])
    );

    const loadPaymentMethods = async () => {
        setLoading(true);
        const data = await getPaymentMethods();
        setPaymentMethods(data);
        setLoading(false);
    };

    const handleDelete = (id: string) => {
        Alert.alert(
            "Hapus Metode Pembayaran",
            "Apakah Anda yakin ingin menghapus metode pembayaran ini?",
            [
                { text: "Batal", style: "cancel" },
                {
                    text: "Hapus",
                    style: "destructive",
                    onPress: async () => {
                        const updated = paymentMethods.filter((method) => method.id !== id);
                        // If deleted method was default, set first one as default
                        if (updated.length > 0 && !updated.some((m) => m.isDefault)) {
                            updated[0].isDefault = true;
                        }
                        await savePaymentMethods(updated);
                        setPaymentMethods(updated);
                    },
                },
            ]
        );
    };

    const handleSetDefault = async (id: string) => {
        const updated = paymentMethods.map((method) => ({
            ...method,
            isDefault: method.id === id,
        }));
        await savePaymentMethods(updated);
        setPaymentMethods(updated);
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case "card":
                return <CreditCard size={24} color="#2563EB" />;
            case "ewallet":
                return <Smartphone size={24} color="#10B981" />;
            case "bank":
                return <Building2 size={24} color="#F59E0B" />;
            default:
                return <Wallet size={24} color="#6B7280" />;
        }
    };

    const getTypeLabel = (type: string) => {
        switch (type) {
            case "card":
                return "Kartu Kredit/Debit";
            case "ewallet":
                return "E-Wallet";
            case "bank":
                return "Transfer Bank";
            default:
                return "Lainnya";
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case "card":
                return "#2563EB";
            case "ewallet":
                return "#10B981";
            case "bank":
                return "#F59E0B";
            default:
                return "#6B7280";
        }
    };

    return (
        <View className="flex-1 bg-gray-50">
            {/* Header */}
            <View className="pt-12 px-4 pb-4 bg-white border-b border-gray-100 flex-row items-center gap-3">
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <ArrowLeft size={24} color="black" />
                </TouchableOpacity>
                <Text className="text-xl font-outfit-bold">Metode Pembayaran</Text>
            </View>

            {loading ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#2563EB" />
                </View>
            ) : (
                <ScrollView className="flex-1 p-4">
                    {paymentMethods.length === 0 ? (
                        <View className="bg-white rounded-2xl p-8 items-center">
                            <CreditCard size={64} color="#D1D5DB" />
                            <Text className="text-gray-500 text-center mt-4 mb-2 font-outfit-medium">
                                Belum ada metode pembayaran
                            </Text>
                            <Text className="text-gray-400 text-sm text-center">
                                Tambahkan metode pembayaran untuk mempercepat proses transaksi
                            </Text>
                        </View>
                    ) : (
                        paymentMethods.map((method) => (
                            <View
                                key={method.id}
                                className={`bg-white rounded-2xl p-4 mb-3 border-2 ${method.isDefault ? "border-blue-600" : "border-gray-100"
                                    }`}
                            >
                                {/* Header with icon and badges */}
                                <View className="flex-row items-center mb-3">
                                    <View
                                        className="w-12 h-12 rounded-xl items-center justify-center"
                                        style={{ backgroundColor: `${getTypeColor(method.type)}15` }}
                                    >
                                        {getTypeIcon(method.type)}
                                    </View>
                                    <View className="ml-3 flex-1">
                                        <Text className="font-outfit-bold text-gray-900">
                                            {method.name}
                                        </Text>
                                        <Text className="text-gray-500 text-sm">
                                            {getTypeLabel(method.type)}
                                        </Text>
                                    </View>
                                    {method.isDefault && (
                                        <View className="bg-blue-100 px-3 py-1 rounded-full flex-row items-center">
                                            <Check size={12} color="#2563EB" />
                                            <Text className="text-blue-600 text-xs ml-1 font-outfit-medium">
                                                Utama
                                            </Text>
                                        </View>
                                    )}
                                </View>

                                {/* Payment details */}
                                <View className="bg-gray-50 rounded-xl p-3 mb-3">
                                    <Text className="text-gray-700 font-outfit-medium">
                                        {method.details}
                                    </Text>
                                </View>

                                {/* Action buttons */}
                                <View className="flex-row gap-2">
                                    {!method.isDefault && (
                                        <TouchableOpacity
                                            onPress={() => handleSetDefault(method.id)}
                                            className="flex-1 bg-blue-50 py-2 rounded-lg items-center flex-row justify-center"
                                        >
                                            <Check size={16} color="#2563EB" />
                                            <Text className="text-blue-600 ml-1 font-outfit-medium text-sm">
                                                Jadikan Utama
                                            </Text>
                                        </TouchableOpacity>
                                    )}
                                    <TouchableOpacity
                                        onPress={() => handleDelete(method.id)}
                                        className="bg-red-50 px-4 py-2 rounded-lg flex-row items-center"
                                    >
                                        <Trash2 size={16} color="#EF4444" />
                                        <Text className="text-red-500 ml-1 font-outfit-medium text-sm">
                                            Hapus
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))
                    )}

                    <View className="h-24" />
                </ScrollView>
            )}

            {/* Add Payment Method Button */}
            <View className="absolute bottom-0 w-full bg-white p-4 border-t border-gray-100 pb-8">
                <TouchableOpacity
                    onPress={() => navigation.navigate("AddPaymentMethod")}
                    className="bg-blue-600 py-4 rounded-xl flex-row items-center justify-center shadow-lg"
                >
                    <Plus size={20} color="white" />
                    <Text className="text-white font-outfit-bold text-lg ml-2">
                        Tambah Metode Pembayaran
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default PaymentMethodsScreen;
