import axios from "axios";

const API_URL = import.meta.env.VITE_API_URI?.trim() || "http://localhost:5000/api";

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL, // ✅ This already includes `/api`
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Auth endpoints
// Auth endpoints
export const adminSignup = (username, password, email) =>
  api.post("/api/auth/signup", { username, password, email });

export const adminLogin = (username, password) =>
  api.post("/api/auth/login", { username, password });

export const adminLogout = () => api.post("/api/auth/logout");  // ✅ Fix this

// Admin endpoints
export const addCoupon = (couponData) =>
  api.post("/api/admin/coupons", couponData);

export const getCoupons = () => api.get("/api/admin/coupons");

export const updateCoupon = (id, data) =>
  api.put(`/api/admin/coupons/${id}`, data);

export const getClaims = () => api.get("/api/admin/claims");

// Public endpoints
export const getAvailableCoupons = (sessionId) =>
  api.get("/api/coupons/available", {  // ✅ Fix this
    headers: {
      "X-Session-ID": sessionId,
    },
  });

export const claimCoupon = (sessionId) =>
  api.post(
    "/api/coupons/claim",  // ✅ Fix this
    {},
    {
      headers: {
        "X-Session-ID": sessionId,
      },
    }
  );


export default api;
