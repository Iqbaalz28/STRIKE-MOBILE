import React, { useState, useEffect } from "react";
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
import { ArrowLeft, Save } from "lucide-react-native";
import api from "@/services/api";

const EditProfileScreen = () => {
  const navigation = useNavigation();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    bio: "",
  });
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
      });
    } catch (error) {
      console.log("Error load profile", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.updateProfile(form);
      Alert.alert("Sukses", "Profil berhasil diperbarui", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
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
            <Text className="text-gray-500 text-xs mb-1 ml-1">Nomor HP</Text>
            <TextInput
              value={form.phone}
              onChangeText={(t) => setForm({ ...form, phone: t })}
              keyboardType="phone-pad"
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800"
              placeholder="08xxxxxxxx"
            />
          </View>

          <View>
            <Text className="text-gray-500 text-xs mb-1 ml-1">Alamat</Text>
            <TextInput
              value={form.address}
              onChangeText={(t) => setForm({ ...form, address: t })}
              multiline
              numberOfLines={3}
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 h-24"
              style={{ textAlignVertical: "top" }}
            />
          </View>

          <View>
            <Text className="text-gray-500 text-xs mb-1 ml-1">Bio Singkat</Text>
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
      </ScrollView>
    </View>
  );
};

export default EditProfileScreen;
