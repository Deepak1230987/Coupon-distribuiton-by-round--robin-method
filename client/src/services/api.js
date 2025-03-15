import axios from "axios";

const API_URL = import.meta.env.VITE_API_URI?.trim() || "https://coupon-distribution-by-round-robin-method.onrender.com";

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json"
  },
  timeout: 15000,
});

// Generate a session ID if not exists
const getSessionId = () => {
  let sessionId = localStorage.getItem('sessionId');
  if (!sessionId) {
    sessionId = 'session_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('sessionId', sessionId);
  }
  return sessionId;
};

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    // Remove sensitive data from logging
    const logConfig = { ...config };
    if (logConfig.data?.password) {
      logConfig.data = { ...logConfig.data, password: '[REDACTED]' };
    }
    console.log('Request:', {
      url: logConfig.url,
      method: logConfig.method,
      headers: logConfig.headers,
      data: logConfig.data
    });
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log('Response:', {
      status: response.status,
      headers: response.headers,
      data: response.data
    });
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      console.error('Authentication Error:', {
        message: error.message,
        response: error.response?.data
      });
      // Redirect to login if not authenticated
      if (window.location.pathname !== '/admin/login' && window.location.pathname !== '/admin/signup') {
        window.location.href = '/admin/login';
      }
      throw new Error('Please log in to continue');
    }
    if (error.response?.status === 500) {
      console.error('Server Error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      throw new Error('Internal server error. Please try again later.');
    }
    if (error.response?.status === 400) {
      console.error('Validation Error:', {
        message: error.message,
        response: error.response?.data
      });
      throw new Error(error.response?.data?.message || 'Invalid input data');
    }
    console.error('Response Error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    return Promise.reject(error);
  }
);

// Auth endpoints
export const adminSignup = async (username, password, email) => {
  try {
    const response = await api.post("/api/auth/signup", {
      username: username.trim(),
      password: password,
      email: email.trim().toLowerCase()
    });
    return response;
  } catch (error) {
    console.error('Signup Error:', error.message);
    throw error;
  }
};

export const adminLogin = async (username, password) => {
  try {
    const response = await api.post("/api/auth/login", {
      username: username.trim(),
      password: password
    });
    return response;
  } catch (error) {
    console.error('Login Error:', error.message);
    throw error;
  }
};

export const adminLogout = async () => {
  try {
    const response = await api.post("/api/auth/logout");
    return response;
  } catch (error) {
    console.error('Logout Error:', error.message);
    throw error;
  }
};

// Admin endpoints (these require authentication)
export const addCoupon = async (couponData) => {
  try {
    const response = await api.post("/api/admin/coupons", couponData);
    return response;
  } catch (error) {
    console.error('Add Coupon Error:', error.message);
    throw error;
  }
};

export const getCoupons = async () => {
  try {
    const response = await api.get("/api/admin/coupons");
    return response;
  } catch (error) {
    console.error('Get Coupons Error:', error.message);
    throw error;
  }
};

export const updateCoupon = async (id, data) => {
  try {
    const response = await api.put(`/api/admin/coupons/${id}`, data);
    return response;
  } catch (error) {
    console.error('Update Coupon Error:', error.message);
    throw error;
  }
};

export const getClaims = async () => {
  try {
    const response = await api.get("/api/admin/claims");
    return response;
  } catch (error) {
    console.error('Get Claims Error:', error.message);
    throw error;
  }
};

// Public endpoints
export const getAvailableCoupons = async (sessionId) => {
  try {
    const response = await api.get("/api/coupons/available", {
      headers: {
        "X-Session-ID": sessionId,
      },
    });
    return response;
  } catch (error) {
    console.error('Get Available Coupons Error:', error.message);
    throw error;
  }
};

export const claimCoupon = async () => {
  try {
    const sessionId = getSessionId();
    const response = await api.post(
      "/api/coupons/claim",
      {},
      {
        headers: {
          "X-Session-ID": sessionId
        }
      }
    );
    return response;
  } catch (error) {
    console.error('Claim Coupon Error:', error.message);
    if (error.response?.status === 500) {
      throw new Error('Server error while claiming coupon. Please try again later.');
    }
    throw error;
  }
};

export default api;

