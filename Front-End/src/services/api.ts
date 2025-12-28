// src/services/api.ts
import axios, { AxiosRequestConfig, AxiosError } from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import { navigate } from "@/navigation/navigationRef"; // Import helper navigasi tadi

// 1. SETUP BASE URL
// Android Emulator menggunakan 10.0.2.2 untuk mengakses localhost komputer
const BASE_URL =
  Platform.OS === "android" ? "http://10.0.2.2:3000" : "http://localhost:3000";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// 2. INTERCEPTOR REQUEST (Ganti localStorage dengan AsyncStorage)
api.interceptors.request.use(
  async (config) => {
    // AsyncStorage bersifat Asynchronous
    const token = await AsyncStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 3. INTERCEPTOR RESPONSE (Handle 401 Logout)
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response && error.response.status === 401) {
      console.warn("Sesi berakhir. Redirect ke login...");

      // Hapus token dari storage HP
      await AsyncStorage.removeItem("token");

      // Gunakan helper navigasi untuk melempar user ke Login Screen
      navigate("Login");
    }
    return Promise.reject(error);
  }
);

// Definisi Tipe untuk File Upload di React Native
interface RNFile {
  uri: string;
  name: string;
  type: string;
}

export default {
  // --- AUTHENTICATION ---
  login(email: string, password: string) {
    return api.post("/login", { email, password });
  },
  register(data: any) {
    return api.post("/users", data);
  },

  // --- USER PROFILE ---
  getMyProfile() {
    return api.get("/users/me");
  },
  updateProfile(data: any) {
    return api.put("/users/me", data);
  },

  // --- UPLOAD ---
  // Perubahan penting: React Native butuh objek {uri, name, type}
  uploadImage(file: RNFile) {
    const formData = new FormData();
    // @ts-ignore: FormData di React Native menerima object file khusus ini
    formData.append("file", {
      uri: file.uri,
      name: file.name,
      type: file.type,
    });

    return api.post("/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  // --- PRODUCTS (SHOP) ---
  getProducts(params?: any) {
    return api.get("/products", { params });
  },
  getProductDetail(id: number | string) {
    return api.get(`/products/${id}`);
  },
  getProductReviews(id: number | string) {
    return api.get(`/products/${id}/reviews`);
  },
  createProductReview(id: number | string, data: any) {
    return api.post(`/products/${id}/reviews`, data);
  },

  // --- MASTER DATA ---
  getEvents() {
    return api.get("/events");
  },
  getDiscounts() {
    return api.get("/discounts");
  },
  getMemberships() {
    return api.get("/memberships");
  },

  // --- LOCATIONS (BOOKING) ---
  getLocations() {
    return api.get("/locations");
  },
  getLocationDetail(id: number | string) {
    return api.get(`/locations/${id}`);
  },
  getLocationReviews(id: number | string) {
    return api.get(`/locations/${id}/reviews`);
  },
  getLocationSpots(id: number | string, date: string) {
    return api.get(`/locations/${id}/spots`, { params: { date } });
  },
  checkVoucher(code: string) {
    return api.post("/discounts/check", { code });
  },
  createBooking(data: any) {
    return api.post("/bookings", data);
  },
  getMyBookings() {
    return api.get("/bookings/my-bookings");
  },

  // --- CART & ORDERS ---
  getCart() {
    return api.get("/cart");
  },
  addToCart(data: any) {
    return api.post("/cart", data);
  },
  removeFromCart(cartId: number | string) {
    return api.delete(`/cart/${cartId}`);
  },
  createOrder(data: any) {
    return api.post("/orders", data);
  },
  getMyOrders() {
    return api.get("/orders/my-orders");
  },

  // --- REVIEWS (Landing Page) ---
  getPublicReviews() {
    return api.get("/reviews/location-public");
  },
  createReview(data: any) {
    return api.post("/reviews", data);
  },

  // --- COMMUNITY ---
  getAllPosts() {
    return api.get("/community/posts");
  },
  getPostDetail(id: number | string) {
    return api.get(`/community/posts/${id}`);
  },
  createPost(data: any) {
    return api.post("/community/posts", data);
  },
  toggleLikePost(postId: number | string) {
    return api.post(`/community/posts/${postId}/like`);
  },
  getPostComments(postId: number | string) {
    return api.get(`/community/posts/${postId}/comments`);
  },
  createComment(postId: number | string, data: any) {
    return api.post(`/community/posts/${postId}/comments`, data);
  },
  toggleLikeComment(commentId: number | string) {
    return api.post(`/community/comments/${commentId}/like`);
  },

  // --- PAYMENTS ---
  payBooking(bookingId: number | string) {
    return api.post(`/pay/booking/${bookingId}`);
  },
  payOrder(orderId: number | string) {
    return api.post(`/pay/order/${orderId}`);
  },
  upgradeMembership(membershipId: number | string) {
    return api.post("/upgrade-membership", { id_membership: membershipId });
  },
  getPaymentMethods() {
    return api.get("/payment-methods");
  },
  updatePaymentMethod(id_payment_method: number | string) {
    return api.put("/users/me", { id_payment_method });
  },
};
