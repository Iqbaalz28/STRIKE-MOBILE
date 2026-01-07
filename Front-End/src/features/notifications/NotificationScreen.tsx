import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    RefreshControl,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Bell, MessageCircle, Calendar, Tag, Check } from 'lucide-react-native';
import api from '@/services/api';

interface Notification {
    id: number;
    title: string;
    body: string;
    type: 'booking_reminder' | 'discount' | 'community';
    ref_id: number | null;
    is_read: boolean;
    created_at: string;
}

const NotificationScreen = () => {
    const navigation = useNavigation();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchNotifications = useCallback(async () => {
        try {
            const response = await api.getNotifications();
            setNotifications(response.data || []);
        } catch (error) {
            console.error('Failed to load notifications:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchNotifications();
    };

    const markAsRead = async (id: number) => {
        try {
            await api.markNotificationRead(id);
            setNotifications((prev) =>
                prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
            );
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await api.markAllNotificationsRead();
            setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'booking_reminder':
                return <Calendar size={20} color="#3B82F6" />;
            case 'discount':
                return <Tag size={20} color="#10B981" />;
            case 'community':
                return <MessageCircle size={20} color="#8B5CF6" />;
            default:
                return <Bell size={20} color="#6B7280" />;
        }
    };

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Baru saja';
        if (diffMins < 60) return `${diffMins} menit lalu`;
        if (diffHours < 24) return `${diffHours} jam lalu`;
        if (diffDays < 7) return `${diffDays} hari lalu`;
        return date.toLocaleDateString('id-ID');
    };

    const handleNotificationPress = (notif: Notification) => {
        if (!notif.is_read) {
            markAsRead(notif.id);
        }

        // Navigate based on type
        if (notif.type === 'booking_reminder' && notif.ref_id) {
            // Navigate to booking detail
            // navigation.navigate('BookingDetail', { id: notif.ref_id });
        } else if (notif.type === 'community' && notif.ref_id) {
            // Navigate to post detail
            // navigation.navigate('PostDetail', { id: notif.ref_id });
        }
    };

    const renderItem = ({ item }: { item: Notification }) => (
        <TouchableOpacity
            onPress={() => handleNotificationPress(item)}
            className={`flex-row p-4 border-b border-gray-100 ${!item.is_read ? 'bg-blue-50' : 'bg-white'
                }`}
        >
            {/* Icon */}
            <View className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center mr-3">
                {getIcon(item.type)}
            </View>

            {/* Content */}
            <View className="flex-1">
                <Text className={`text-base ${!item.is_read ? 'font-outfit-bold' : 'font-outfit-medium'}`}>
                    {item.title}
                </Text>
                <Text className="text-gray-600 text-sm mt-0.5" numberOfLines={2}>
                    {item.body}
                </Text>
                <Text className="text-gray-400 text-xs mt-1">{formatTime(item.created_at)}</Text>
            </View>

            {/* Unread indicator */}
            {!item.is_read && (
                <View className="w-2.5 h-2.5 bg-blue-500 rounded-full self-center" />
            )}
        </TouchableOpacity>
    );

    const unreadCount = notifications.filter((n) => !n.is_read).length;

    return (
        <SafeAreaView className="flex-1 bg-white">
            {/* Header */}
            <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-100">
                <View className="flex-row items-center">
                    <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3">
                        <ArrowLeft size={24} color="#1F2937" />
                    </TouchableOpacity>
                    <Text className="text-xl font-outfit-bold">Notifikasi</Text>
                    {unreadCount > 0 && (
                        <View className="bg-red-500 px-2 py-0.5 rounded-full ml-2">
                            <Text className="text-white text-xs font-bold">{unreadCount}</Text>
                        </View>
                    )}
                </View>

                {unreadCount > 0 && (
                    <TouchableOpacity onPress={markAllAsRead} className="flex-row items-center">
                        <Check size={16} color="#3B82F6" />
                        <Text className="text-blue-500 text-sm ml-1 font-outfit-medium">
                            Tandai semua
                        </Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Content */}
            {loading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#3B82F6" />
                </View>
            ) : notifications.length === 0 ? (
                <View className="flex-1 items-center justify-center p-8">
                    <Bell size={64} color="#D1D5DB" />
                    <Text className="text-gray-400 text-lg mt-4 font-outfit-medium">
                        Belum ada notifikasi
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={notifications}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderItem}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                />
            )}
        </SafeAreaView>
    );
};

export default NotificationScreen;
