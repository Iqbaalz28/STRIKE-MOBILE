import React, { useState, useCallback } from "react";
import { ScrollView, StatusBar, View, RefreshControl } from "react-native";

// Components Lama
import LandingSection from "./components/LandingSection";
import LocationPreview from "./components/LocationPreview";
import DiscountSection from "./components/DiscountSection";
import EventSection from "./components/EventSection";

// Components Baru (Pengganti Placeholder)
import PricingSection from "./components/PricingSection";
import ReviewSection from "./components/ReviewSection";

const HomeScreen = () => {
  const [refreshing, setRefreshing] = useState(false);

  // Logic simulasi refresh (tarik layar ke bawah)
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Di sini nanti bisa dipanggil fungsi reload data API
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        className="bg-gray-50"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#2563EB"]}
          />
        }
      >
        {/* 1. Landing (Hero) */}
        <LandingSection />

        {/* 2. Location (Core Feature) */}
        <View className="mt-6">
          <LocationPreview />
        </View>

        {/* 3. Discount (Promo) */}
        <View className="mt-2">
          <DiscountSection />
        </View>

        {/* 4. Membership Plans */}
        <View className="mt-4">
          <PricingSection />
        </View>

        {/* 5. Event (Community) */}
        <View className="mt-2">
          <EventSection />
        </View>

        {/* 6. Testimoni (BARU) */}
        <View className="mt-2">
          <ReviewSection />
        </View>

        {/* Padding Bawah agar tidak tertutup TabBar */}
        <View className="h-24" />
      </ScrollView>
    </View>
  );
};

export default HomeScreen;
