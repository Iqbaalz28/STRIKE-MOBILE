// src/services/api.ts
import axios, { AxiosRequestConfig, AxiosError } from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import { navigate } from "@/navigation/navigationRef"; // Import helper navigasi tadi

// 1. SETUP BASE URL
import Constants from "expo-constants";

const getDeviceIP = () => {
	const debuggerHost = Constants.expoConfig?.hostUri;
	if (debuggerHost) {
		const host = debuggerHost.split(":")[0];
		return `http://${host}:3000`;
	}
	// Fallback
	return Platform.OS === "android"
		? "http://10.0.2.2:3000"
		: "http://localhost:3000";
};

const BASE_URL = getDeviceIP();

console.log("🌐 API Base URL:", BASE_URL);

const api = axios.create({
	baseURL: BASE_URL,
	headers: {
		"Content-Type": "application/json",
	},
	timeout: 10000, // 10 second timeout
});

// 2. INTERCEPTOR REQUEST (Ganti localStorage dengan AsyncStorage)
api.interceptors.request.use(
	async (config) => {
		console.log(
			`🚀 API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`,
		);
		// AsyncStorage bersifat Asynchronous
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

// 3. INTERCEPTOR RESPONSE (Handle 401 Logout)
api.interceptors.response.use(
	(response) => {
		console.log(
			`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`,
		);
		return response;
	},
	async (error: AxiosError) => {
		if (error.code === "ECONNABORTED") {
			console.error("❌ Request Timeout");
		} else if (error.code === "ERR_NETWORK") {
			console.error("❌ Network Error - Cannot reach server");
			console.error("   Check if backend is running at:", BASE_URL);
		}

		if (error.response && error.response.status === 401) {
			console.warn("Sesi berakhir. Redirect ke login...");

			// Hapus token dari storage HP
			await AsyncStorage.removeItem("token");

			// Gunakan helper navigasi untuk melempar user ke Login Screen
			navigate("Login");
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
	// React Native butuh objek {uri, name, type}
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
	getLocationSpots(id: number | string, date: string) {
		return api.get(`/locations/${id}/availability`, { params: { date } });
	},
	// Alias untuk backward compatibility
	checkSpotAvailability(id: number | string, date: string) {
		return api.get(`/locations/${id}/availability`, { params: { date } });
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
	getPaymentMethods() {
		return api.get("/references/payment-methods");
	},
	updatePaymentMethod(id_payment_method: number | string) {
		return api.put("/users/me", { id_payment_method });
	},
};
