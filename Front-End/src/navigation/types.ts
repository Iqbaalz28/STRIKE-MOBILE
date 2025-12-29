import { NavigatorScreenParams } from "@react-navigation/native";

// 1. Auth Stack
export type AuthStackParamList = {
	Login: undefined;
	Register: undefined;
};

// 2. Booking Stack (Flow Lokasi)
export type BookingStackParamList = {
	LocationList: undefined;
	LocationDetail: { id: number };
	BookingForm: { locationId: number; locationName: string; price: number };
};

// 3. Shop Stack (Flow Belanja)
export type ShopStackParamList = {
	Shop: undefined;
	ProductDetail: { id: number };
	Cart: undefined;
	Checkout: { items: any[]; total: number }; // Untuk CheckoutScreen
};

// 4. Main Tab (Menu Bawah)
export type MainTabParamList = {
	Home: undefined;
	BookingStack: NavigatorScreenParams<BookingStackParamList>; // Nested Navigator
	ShopStack: NavigatorScreenParams<ShopStackParamList>; // Nested Navigator
	Community: undefined;
	Profile: undefined;
};

// 5. Root Stack (Global Navigation)
export type RootStackParamList = {
	Auth: NavigatorScreenParams<AuthStackParamList>;
	MainTab: NavigatorScreenParams<MainTabParamList>;

	// Global Screens (Bisa diakses dari mana saja)
	EventList: undefined;
	EditProfile: undefined;
	About: undefined;

	// Community Screens (Sementara taruh di Root agar bisa menimpa Tab)
	CreatePost: undefined;
	PostDetail: { id: number };
	History: undefined;
};

// Helper types (Opsional, untuk mempermudah di component)
export type AuthScreenProps<T extends keyof AuthStackParamList> = {
	navigation: any;
	route: { params: AuthStackParamList[T] };
};
