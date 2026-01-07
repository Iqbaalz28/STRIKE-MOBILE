// src/services/api.ts
import axios, { AxiosError } from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import Constants from "expo-constants";

// IMPORT: Gunakan resetToLogin untuk logout yang aman saat sesi berakhir
import { resetToLogin } from "@/navigation/navigationRef";

// --- 1. SETUP BASE URL ---

/**
 * OPSI A: AUTO-DETECT IP (Gunakan ini jika pakai Emulator Android / iOS Simulator)
 * Cara pakai: Uncomment kode di bawah ini, dan comment OPSI B.
 */
/*
const getDeviceIP = () => {
  const debuggerHost = Constants.expoConfig?.hostUri;
  if (debuggerHost) {
	const host = debuggerHost.split(":")[0];
	return `http://${host}:3000`;
  }
  // Fallback: Android Emulator pakai 10.0.2.2, iOS/Web pakai localhost
  return Platform.OS === "android"
	? "http://10.0.2.2:3000"
	: "http://localhost:3000";
};
export const BASE_URL = getDeviceIP();
*/

/**
 * OPSI B: HARDCODE URL (Gunakan ini untuk HP Fisik dengan Ngrok / Server Production)
 * Cara pakai: Isi URL Ngrok/Server Anda di sini.
 * PENTING: Harus ada 'export' agar bisa dibaca oleh LoginScreen.tsx
 */
export const BASE_URL = "https://michael-tressier-glory.ngrok-free.dev";

console.log("🌐 API Base URL:", BASE_URL);

// --- 2. SETUP AXIOS INSTANCE ---
const api = axios.create({
	baseURL: BASE_URL,
	headers: {
		"Content-Type": "application/json",
		"ngrok-skip-browser-warning": "true", // Skip ngrok interstitial page
	},
	timeout: 60000, // Timeout 60 detik
});

// --- 3. INTERCEPTOR REQUEST (Kirim Token) ---
api.interceptors.request.use(
	async (config) => {
		// Uncomment untuk debug request yang dikirim
		// console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);

		const token = await AsyncStorage.getItem("token");
		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	},
	(error) => {
		console.error("❌ Request Interceptor Error:", error);
		return Promise.reject(error);
	},
);

// --- 4. INTERCEPTOR RESPONSE (Handle Error) ---
api.interceptors.response.use(
	(response) => {
		// Uncomment untuk debug response yang diterima
		// console.log(`✅ API Response: ${response.status} ${response.config.url}`);
		return response;
	},
	async (error: AxiosError) => {
		// Handle Error Network/Timeout
		if (error.code === "ECONNABORTED") {
			console.error("❌ Request Timeout");
		} else if (error.code === "ERR_NETWORK") {
			console.error("❌ Network Error - Cannot reach server");
			console.error("   Check if backend is running at:", BASE_URL);
		}

		// Handle 401 Unauthorized (Token Expired / Invalid)
		if (error.response && error.response.status === 401) {
			console.warn("⚠️ Sesi berakhir (401). Redirect ke login...");

			// 1. Hapus token dari storage HP
			await AsyncStorage.removeItem("token");
			await AsyncStorage.removeItem("user"); // Hapus data user juga biar bersih

			// 2. Reset Navigasi ke Login
			resetToLogin();
		}
		return Promise.reject(error);
	},
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
		// Pastikan ini "/register" sesuai dengan auth.js di backend
		return api.post("/register", data);
	},

	// --- USER PROFILE ---
	getMyProfile() {
		return api.get("/users/me");
	},
	updateProfile(data: any) {
		return api.put("/users/me", data);
	},

	// --- UPLOAD ---
	// React Native butuh objek khusus {uri, name, type} untuk upload
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
		return api.get("/references/discounts");
	},
	getMemberships() {
		return api.get("/references/memberships");
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
	getLocationSpots(id: number | string, date: string, hour?: number, duration?: number) {
		return api.get(`/locations/${id}/spots`, { params: { date, hour, duration } });
	},
	// Get hourly availability for time picker
	getHourAvailability(id: number | string, date: string) {
		return api.get(`/locations/${id}/availability`, { params: { date } });
	},
	// Alias untuk backward compatibility
	checkSpotAvailability(id: number | string, date: string) {
		return api.get(`/locations/${id}/spots`, { params: { date } });
	},
	checkVoucher(code: string) {
		return api.post("/references/discounts/check", { code });
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
		return api.post(`/payments/pay/booking/${bookingId}`);
	},
	payOrder(orderId: number | string) {
		return api.post(`/payments/pay/order/${orderId}`);
	},
	upgradeMembership(membershipId: number | string) {
		return api.post("/payments/upgrade-membership", {
			id_membership: membershipId,
		});
	},
	cancelMembership() {
		return api.post("/users/cancel-membership");
	},
	getPaymentMethods() {
		return api.get("/references/payment-methods");
	},
	updatePaymentMethod(id_payment_method: number | string) {
		return api.put("/users/me", { id_payment_method });
	},

	// --- ORDER & BOOKING DETAILS ---
	getOrderDetail(orderId: number | string) {
		return api.get(`/orders/${orderId}`);
	},
	getBookingDetail(bookingId: number | string) {
		return api.get(`/bookings/${bookingId}`);
	},

	// --- NOTIFICATIONS ---
	registerPushToken(push_token: string, device_type: string = 'android') {
		return api.post('/notifications/register-token', { push_token, device_type });
	},
	getNotifications() {
		return api.get('/notifications');
	},
	markNotificationRead(notifId: number | string) {
		return api.put(`/notifications/${notifId}/read`);
	},
	markAllNotificationsRead() {
		return api.put('/notifications/read-all');
	},
	getUnreadNotificationCount() {
		return api.get('/notifications/unread-count');
	},
};
