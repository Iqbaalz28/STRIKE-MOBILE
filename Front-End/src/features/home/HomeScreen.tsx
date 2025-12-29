import React from "react";
import { ScrollView, StatusBar, View } from "react-native";

// Components
import LandingSection from "./components/LandingSection";
import LocationPreview from "./components/LocationPreview";
import DiscountSection from "./components/DiscountSection"; // <--- Baru
import EventSection from "./components/EventSection"; // <--- Baru
import PlaceholderSection from "./components/PlaceholderSection";

const HomeScreen = () => {
  return (
    <View className="flex-1 bg-white">
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      <ScrollView showsVerticalScrollIndicator={false} className="bg-white">
        {/* 1. Landing (Hero) */}
        <LandingSection />

        {/* 2. Location (Core Feature) */}
        <LocationPreview />

        {/* 3. Discount (Promo) */}
        <DiscountSection />

        {/* 4. Event (Community) */}
        <EventSection />

        {/* 5. Sisa Placeholder (Pricing & Review menyusul) */}
        <PlaceholderSection title="Pricing & Membership" />
        <PlaceholderSection title="Review Section" />

        {/* Padding Bawah */}
        <View className="h-24" />
      </ScrollView>
    </View>
  );
};

export default HomeScreen;
