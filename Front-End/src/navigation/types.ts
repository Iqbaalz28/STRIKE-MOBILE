import { NavigatorScreenParams } from "@react-navigation/native";

// 1. Daftar halaman untuk Auth (Login/Register)
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

// 2. Daftar halaman Utama (setelah Login)
export type MainTabParamList = {
  Home: undefined;
  BookingStack: undefined;
  ShopStack: undefined;
  Community: undefined;
  Profile: undefined;
  History: undefined;
  CreatePost: undefined;
  PostDetail: { id: number };
};

// Stack khusus untuk Shop
export type ShopStackParamList = {
  ShopHome: undefined;
  ProductDetail: { id: number }; // Butuh parameter ID
  Cart: undefined;
  Checkout: undefined;
};

// Definisi untuk Booking Stack
export type BookingStackParamList = {
  LocationList: undefined;
  LocationDetail: { id: number };
  BookingForm: { locationId: number; locationName: string; price: number }; // <-- Parameter penting
};

// 3. Root Navigator (Menggabungkan Auth & Main)
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
  NotFound: undefined;
  EventList: undefined;
  EditProfile: undefined;
};

// Helper type untuk dipakai di komponen
export type AuthScreenProps<T extends keyof AuthStackParamList> = {
  navigation: any;
  route: { params: AuthStackParamList[T] };
};
