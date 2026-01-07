import React, { useState } from "react";
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
    ArrowLeft,
    CreditCard,
    Smartphone,
    Building2,
    Check,
} from "lucide-react-native";
import { SavedPaymentMethod, getPaymentMethods, savePaymentMethods } from "./PaymentMethodsScreen";

type PaymentType = "card" | "ewallet" | "bank";

interface EWalletOption {
    id: string;
    name: string;
    color: string;
}

interface BankOption {
    id: string;
    name: string;
    color: string;
}

const EWALLET_OPTIONS: EWalletOption[] = [
    { id: "gopay", name: "GoPay", color: "#00AA13" },
    { id: "ovo", name: "OVO", color: "#4C3494" },
    { id: "dana", name: "DANA", color: "#118EEA" },
    { id: "shopeepay", name: "ShopeePay", color: "#EE4D2D" },
    { id: "linkaja", name: "LinkAja", color: "#E31837" },
];

const BANK_OPTIONS: BankOption[] = [
    { id: "bca", name: "BCA", color: "#0066AE" },
    { id: "mandiri", name: "Mandiri", color: "#003366" },
    { id: "bni", name: "BNI", color: "#F15A23" },
    { id: "bri", name: "BRI", color: "#00529C" },
    { id: "cimb", name: "CIMB Niaga", color: "#7B0C10" },
];

const AddPaymentMethodScreen = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();

    const [selectedType, setSelectedType] = useState<PaymentType>("card");
    const [saving, setSaving] = useState(false);

    // Card fields
    const [cardNumber, setCardNumber] = useState("");
    const [cardHolder, setCardHolder] = useState("");
    const [expiryDate, setExpiryDate] = useState("");
    const [cvv, setCvv] = useState("");

    // E-Wallet fields
    const [selectedEwallet, setSelectedEwallet] = useState<string>("");
    const [phoneNumber, setPhoneNumber] = useState("");

    // Bank fields
    const [selectedBank, setSelectedBank] = useState<string>("");
    const [accountNumber, setAccountNumber] = useState("");
    const [accountName, setAccountName] = useState("");

    const formatCardNumber = (text: string) => {
        const cleaned = text.replace(/\s/g, "").replace(/\D/g, "");
        const formatted = cleaned.match(/.{1,4}/g)?.join(" ") || cleaned;
        return formatted.substring(0, 19);
    };

    const formatExpiryDate = (text: string) => {
        const cleaned = text.replace(/\D/g, "");
        if (cleaned.length >= 2) {
            return `${cleaned.substring(0, 2)}/${cleaned.substring(2, 4)}`;
        }
        return cleaned;
    };

    const maskCardNumber = (cardNum: string) => {
        const cleaned = cardNum.replace(/\s/g, "");
        if (cleaned.length < 4) return cleaned;
        return `•••• •••• •••• ${cleaned.slice(-4)}`;
    };

    const handleSave = async () => {
        // Validation
        if (selectedType === "card") {
            if (!cardNumber || !cardHolder || !expiryDate || !cvv) {
                Alert.alert("Error", "Mohon lengkapi semua field kartu");
                return;
            }
            if (cardNumber.replace(/\s/g, "").length < 16) {
                Alert.alert("Error", "Nomor kartu tidak valid");
                return;
            }
        } else if (selectedType === "ewallet") {
            if (!selectedEwallet || !phoneNumber) {
                Alert.alert("Error", "Mohon pilih e-wallet dan masukkan nomor HP");
                return;
            }
            if (phoneNumber.length < 10) {
                Alert.alert("Error", "Nomor HP tidak valid");
                return;
            }
        } else if (selectedType === "bank") {
            if (!selectedBank || !accountNumber || !accountName) {
                Alert.alert("Error", "Mohon lengkapi semua informasi rekening");
                return;
            }
        }

        setSaving(true);
        try {
            const existingMethods = await getPaymentMethods();

            let newMethod: SavedPaymentMethod;

            if (selectedType === "card") {
                newMethod = {
                    id: Date.now().toString(),
                    type: "card",
                    name: cardHolder,
                    details: maskCardNumber(cardNumber),
                    isDefault: existingMethods.length === 0,
                };
            } else if (selectedType === "ewallet") {
                const wallet = EWALLET_OPTIONS.find(e => e.id === selectedEwallet);
                newMethod = {
                    id: Date.now().toString(),
                    type: "ewallet",
                    name: wallet?.name || "E-Wallet",
                    details: phoneNumber,
                    isDefault: existingMethods.length === 0,
                };
            } else {
                const bank = BANK_OPTIONS.find(b => b.id === selectedBank);
                newMethod = {
                    id: Date.now().toString(),
                    type: "bank",
                    name: `${bank?.name} - ${accountName}`,
                    details: `•••• ${accountNumber.slice(-4)}`,
                    isDefault: existingMethods.length === 0,
                };
            }

            await savePaymentMethods([...existingMethods, newMethod]);

            Alert.alert("Berhasil", "Metode pembayaran berhasil ditambahkan", [
                { text: "OK", onPress: () => navigation.goBack() },
            ]);
        } catch (error) {
            Alert.alert("Error", "Gagal menyimpan metode pembayaran");
        } finally {
            setSaving(false);
        }
    };

    const renderTypeSelector = () => (
        <View className="flex-row bg-gray-100 rounded-xl p-1 mb-6">
            <TouchableOpacity
                onPress={() => setSelectedType("card")}
                className={`flex-1 flex-row items-center justify-center py-3 rounded-lg ${selectedType === "card" ? "bg-white shadow-sm" : ""
                    }`}
            >
                <CreditCard size={18} color={selectedType === "card" ? "#2563EB" : "#6B7280"} />
                <Text
                    className={`ml-1 font-outfit-medium text-sm ${selectedType === "card" ? "text-blue-600" : "text-gray-500"
                        }`}
                >
                    Kartu
                </Text>
            </TouchableOpacity>
            <TouchableOpacity
                onPress={() => setSelectedType("ewallet")}
                className={`flex-1 flex-row items-center justify-center py-3 rounded-lg ${selectedType === "ewallet" ? "bg-white shadow-sm" : ""
                    }`}
            >
                <Smartphone size={18} color={selectedType === "ewallet" ? "#10B981" : "#6B7280"} />
                <Text
                    className={`ml-1 font-outfit-medium text-sm ${selectedType === "ewallet" ? "text-green-600" : "text-gray-500"
                        }`}
                >
                    E-Wallet
                </Text>
            </TouchableOpacity>
            <TouchableOpacity
                onPress={() => setSelectedType("bank")}
                className={`flex-1 flex-row items-center justify-center py-3 rounded-lg ${selectedType === "bank" ? "bg-white shadow-sm" : ""
                    }`}
            >
                <Building2 size={18} color={selectedType === "bank" ? "#F59E0B" : "#6B7280"} />
                <Text
                    className={`ml-1 font-outfit-medium text-sm ${selectedType === "bank" ? "text-amber-600" : "text-gray-500"
                        }`}
                >
                    Bank
                </Text>
            </TouchableOpacity>
        </View>
    );

    const renderCardForm = () => (
        <View>
            {/* Card Preview */}
            <View className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-5 mb-6 h-48 justify-between"
                style={{ backgroundColor: "#2563EB" }}
            >
                <View className="flex-row justify-between items-start">
                    <CreditCard size={32} color="white" />
                    <Text className="text-white font-outfit-bold opacity-80">VISA</Text>
                </View>
                <Text className="text-white text-xl font-outfit-medium tracking-widest">
                    {cardNumber || "•••• •••• •••• ••••"}
                </Text>
                <View className="flex-row justify-between">
                    <View>
                        <Text className="text-white opacity-60 text-xs">CARD HOLDER</Text>
                        <Text className="text-white font-outfit-medium">
                            {cardHolder || "NAMA PEMEGANG KARTU"}
                        </Text>
                    </View>
                    <View>
                        <Text className="text-white opacity-60 text-xs">EXPIRES</Text>
                        <Text className="text-white font-outfit-medium">
                            {expiryDate || "MM/YY"}
                        </Text>
                    </View>
                </View>
            </View>

            {/* Card Fields */}
            <View className="bg-white rounded-2xl p-4 mb-4">
                <Text className="text-gray-500 text-sm mb-2 font-outfit-medium">Nomor Kartu</Text>
                <TextInput
                    className="bg-gray-50 rounded-xl p-4 text-gray-900 font-outfit-medium text-lg"
                    placeholder="1234 5678 9012 3456"
                    value={cardNumber}
                    onChangeText={(text) => setCardNumber(formatCardNumber(text))}
                    keyboardType="numeric"
                    maxLength={19}
                />
            </View>

            <View className="bg-white rounded-2xl p-4 mb-4">
                <Text className="text-gray-500 text-sm mb-2 font-outfit-medium">Nama Pemegang Kartu</Text>
                <TextInput
                    className="bg-gray-50 rounded-xl p-4 text-gray-900 font-outfit-medium"
                    placeholder="JOHN DOE"
                    value={cardHolder}
                    onChangeText={(text) => setCardHolder(text.toUpperCase())}
                    autoCapitalize="characters"
                />
            </View>

            <View className="flex-row gap-4">
                <View className="flex-1 bg-white rounded-2xl p-4">
                    <Text className="text-gray-500 text-sm mb-2 font-outfit-medium">Expire Date</Text>
                    <TextInput
                        className="bg-gray-50 rounded-xl p-4 text-gray-900 font-outfit-medium"
                        placeholder="MM/YY"
                        value={expiryDate}
                        onChangeText={(text) => setExpiryDate(formatExpiryDate(text))}
                        keyboardType="numeric"
                        maxLength={5}
                    />
                </View>
                <View className="flex-1 bg-white rounded-2xl p-4">
                    <Text className="text-gray-500 text-sm mb-2 font-outfit-medium">CVV</Text>
                    <TextInput
                        className="bg-gray-50 rounded-xl p-4 text-gray-900 font-outfit-medium"
                        placeholder="•••"
                        value={cvv}
                        onChangeText={setCvv}
                        keyboardType="numeric"
                        maxLength={4}
                        secureTextEntry
                    />
                </View>
            </View>
        </View>
    );

    const renderEwalletForm = () => (
        <View>
            <Text className="text-gray-900 font-outfit-bold mb-3">Pilih E-Wallet</Text>
            <View className="flex-row flex-wrap gap-3 mb-6">
                {EWALLET_OPTIONS.map((wallet) => (
                    <TouchableOpacity
                        key={wallet.id}
                        onPress={() => setSelectedEwallet(wallet.id)}
                        className={`bg-white rounded-xl p-4 flex-row items-center border-2 ${selectedEwallet === wallet.id ? "border-green-500" : "border-gray-100"
                            }`}
                        style={{ minWidth: "45%" }}
                    >
                        <View
                            className="w-10 h-10 rounded-full items-center justify-center mr-3"
                            style={{ backgroundColor: `${wallet.color}20` }}
                        >
                            <Text style={{ color: wallet.color }} className="font-outfit-bold text-sm">
                                {wallet.name.charAt(0)}
                            </Text>
                        </View>
                        <Text className="font-outfit-medium text-gray-900 flex-1">{wallet.name}</Text>
                        {selectedEwallet === wallet.id && (
                            <Check size={20} color="#10B981" />
                        )}
                    </TouchableOpacity>
                ))}
            </View>

            <View className="bg-white rounded-2xl p-4">
                <Text className="text-gray-500 text-sm mb-2 font-outfit-medium">Nomor HP Terdaftar</Text>
                <TextInput
                    className="bg-gray-50 rounded-xl p-4 text-gray-900 font-outfit-medium"
                    placeholder="08123456789"
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    keyboardType="phone-pad"
                />
            </View>
        </View>
    );

    const renderBankForm = () => (
        <View>
            <Text className="text-gray-900 font-outfit-bold mb-3">Pilih Bank</Text>
            <View className="flex-row flex-wrap gap-3 mb-6">
                {BANK_OPTIONS.map((bank) => (
                    <TouchableOpacity
                        key={bank.id}
                        onPress={() => setSelectedBank(bank.id)}
                        className={`bg-white rounded-xl p-4 flex-row items-center border-2 ${selectedBank === bank.id ? "border-amber-500" : "border-gray-100"
                            }`}
                        style={{ minWidth: "45%" }}
                    >
                        <View
                            className="w-10 h-10 rounded-full items-center justify-center mr-3"
                            style={{ backgroundColor: `${bank.color}20` }}
                        >
                            <Text style={{ color: bank.color }} className="font-outfit-bold text-sm">
                                {bank.name.charAt(0)}
                            </Text>
                        </View>
                        <Text className="font-outfit-medium text-gray-900 flex-1">{bank.name}</Text>
                        {selectedBank === bank.id && (
                            <Check size={20} color="#F59E0B" />
                        )}
                    </TouchableOpacity>
                ))}
            </View>

            <View className="bg-white rounded-2xl p-4 mb-4">
                <Text className="text-gray-500 text-sm mb-2 font-outfit-medium">Nomor Rekening</Text>
                <TextInput
                    className="bg-gray-50 rounded-xl p-4 text-gray-900 font-outfit-medium"
                    placeholder="1234567890"
                    value={accountNumber}
                    onChangeText={setAccountNumber}
                    keyboardType="numeric"
                />
            </View>

            <View className="bg-white rounded-2xl p-4">
                <Text className="text-gray-500 text-sm mb-2 font-outfit-medium">Nama Pemilik Rekening</Text>
                <TextInput
                    className="bg-gray-50 rounded-xl p-4 text-gray-900 font-outfit-medium"
                    placeholder="JOHN DOE"
                    value={accountName}
                    onChangeText={(text) => setAccountName(text.toUpperCase())}
                    autoCapitalize="characters"
                />
            </View>
        </View>
    );

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            className="flex-1 bg-gray-50"
        >
            {/* Header */}
            <View className="pt-12 px-4 pb-4 bg-white border-b border-gray-100 flex-row items-center gap-3">
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <ArrowLeft size={24} color="black" />
                </TouchableOpacity>
                <Text className="text-xl font-outfit-bold">Tambah Metode Pembayaran</Text>
            </View>

            <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
                {renderTypeSelector()}

                {selectedType === "card" && renderCardForm()}
                {selectedType === "ewallet" && renderEwalletForm()}
                {selectedType === "bank" && renderBankForm()}

                {/* Info Text */}
                <View className="bg-blue-50 rounded-xl p-4 mt-6 mb-8">
                    <Text className="text-blue-700 text-sm font-outfit-medium">
                        ℹ️ Ini adalah simulasi. Data tidak akan diproses atau disimpan ke server.
                    </Text>
                </View>

                <View className="h-24" />
            </ScrollView>

            {/* Save Button */}
            <View className="absolute bottom-0 w-full bg-white p-4 border-t border-gray-100 pb-8">
                <TouchableOpacity
                    onPress={handleSave}
                    disabled={saving}
                    className={`py-4 rounded-xl items-center justify-center shadow-lg ${saving ? "bg-gray-300" : "bg-blue-600"
                        }`}
                >
                    <Text className="text-white font-outfit-bold text-lg">
                        {saving ? "Menyimpan..." : "Simpan Metode Pembayaran"}
                    </Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
};

export default AddPaymentMethodScreen;
