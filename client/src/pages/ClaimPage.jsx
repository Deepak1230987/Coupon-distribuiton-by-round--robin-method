import { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import ClaimCoupon from "../components/ClaimCoupon";
import toast from "react-hot-toast";
import { getAvailableCoupons } from "../services/api";

function ClaimPage() {
  const { isDark } = useTheme();
  const [availableCoupons, setAvailableCoupons] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sessionId, setSessionId] = useState("");

  useEffect(() => {
    fetchAvailableCoupons();
    // Generate a session ID if not exists
    const existingSessionId = getCookie("sessionId") || generateSessionId();
    setSessionId(existingSessionId);
    // Set the session cookie if it doesn't exist
    if (!getCookie("sessionId")) {
      document.cookie = `sessionId=${existingSessionId}; path=/; max-age=${
        30 * 24 * 60 * 60
      }`;
    }
  }, []);

  const generateSessionId = () => {
    return "session_" + Math.random().toString(36).substr(2, 9);
  };

  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
  };

  const fetchAvailableCoupons = async () => {
    try {
      const response = await getAvailableCoupons(sessionId);
      setAvailableCoupons(response.data.availableCoupons);
    } catch (error) {
      console.error("Error fetching available coupons:", error);
      toast.error("Failed to fetch available coupons", {
        id: "fetch-available-error",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div
            className={`${
              isDark
                ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
                : "bg-white"
            } p-8 rounded-lg shadow-lg flex items-center justify-center`}
          >
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div
          className={`${
            isDark
              ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 shadow-[0_0_30px_rgba(59,130,246,0.1)]"
              : "bg-white shadow-[0_0_30px_rgba(59,130,246,0.05)]"
          } p-8 rounded-lg shadow-lg transition-all duration-500 ease-in-out hover:shadow-xl relative 
          before:absolute before:inset-0 before:rounded-lg before:p-[2px] before:bg-[length:200%_200%] ${
            isDark
              ? "before:bg-gradient-to-r before:from-violet-500 before:via-fuchsia-500 before:to-violet-500"
              : "before:bg-gradient-to-r before:from-blue-400 before:via-cyan-400 before:to-blue-400"
          } before:animate-shimmer before:opacity-0 hover:before:opacity-100 before:transition-all before:duration-500
          after:absolute after:inset-[1px] after:rounded-lg after:bg-gradient-to-br ${
            isDark
              ? "after:from-gray-900 after:via-gray-800 after:to-gray-900 hover:shadow-[0_0_30px_rgba(139,92,246,0.3)]"
              : "after:from-white after:to-white hover:shadow-[0_0_30px_rgba(59,130,246,0.3)]"
          }`}
        >
          <div className="relative z-10">
            <div className="text-center mb-8">
              <h1
                className={`text-3xl font-extrabold tracking-tight transition-colors duration-300 ${
                  isDark ? "text-blue-400" : "text-blue-600"
                }`}
              >
                Get Your Coupon
              </h1>
              <p
                className={`mt-2 text-sm ${
                  isDark ? "text-gray-300" : "text-gray-600"
                }`}
              >
                Claim a unique coupon code that you can use for your purchase
              </p>
              <p
                className={`mt-4 text-lg font-semibold ${
                  isDark ? "text-violet-400" : "text-blue-600"
                }`}
              >
                Available Coupons: {availableCoupons}
              </p>
            </div>

            <ClaimCoupon
              onClaim={() =>
                setAvailableCoupons((prev) => Math.max(0, prev - 1))
              }
              sessionId={sessionId}
            />

            <div
              className={`mt-8 text-sm text-center space-y-2 ${
                isDark ? "text-gray-400" : "text-gray-500"
              }`}
            >
              <div
                className={`p-4 rounded-md ${
                  isDark ? "bg-gray-800/50" : "bg-blue-50/50"
                }`}
              >
                <p className="flex items-center justify-center">
                  <svg
                    className={`w-5 h-5 mr-2 ${
                      isDark ? "text-blue-400" : "text-blue-500"
                    }`}
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  You can only claim one coupon every 24 hours
                </p>
                <p className="mt-2 flex items-center justify-center">
                  <svg
                    className={`w-5 h-5 mr-2 ${
                      isDark ? "text-blue-400" : "text-blue-500"
                    }`}
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  Make sure to save your coupon code after claiming
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-shimmer {
          animation: shimmer 3s ease infinite;
        }
      `}</style>
    </div>
  );
}

export default ClaimPage;
