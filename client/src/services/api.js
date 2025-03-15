import axios from "axios";

const API_URL = import.meta.env.VITE_API_URI?.trim() || "https://coupon-distribution-by-round-robin-method.onrender.com/api";

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Auth endpoints
export const adminSignup = (username, password, email) =>
  api.post("/auth/signup", { username, password, email });

export const adminLogin = (username, password) =>
  api.post("/auth/login", { username, password });

export const adminLogout = () => api.post("/auth/logout");

// Admin endpoints
export const addCoupon = (couponData) =>
  api.post("/admin/coupons", couponData);

export const getCoupons = () => api.get("/admin/coupons");

export const updateCoupon = (id, data) =>
  api.put(`/admin/coupons/${id}`, data);

export const getClaims = () => api.get("/admin/claims");

// Public endpoints
export const getAvailableCoupons = (sessionId) =>
  api.get("/coupons/available", {
    headers: {
      "X-Session-ID": sessionId,
    },
  });

export const claimCoupon = (sessionId) =>
  api.post(
    "/coupons/claim",
    {},
    {
      headers: {
        "X-Session-ID": sessionId,
      },
    }
  );

export default api;

