import { useState } from "react";
import toast from "react-hot-toast";
import { useTheme } from "../context/ThemeContext";
import { claimCoupon } from "../services/api";

function ClaimCoupon({ onClaim, sessionId }) {
  const { isDark } = useTheme();
  const [loading, setLoading] = useState(false);
  const [claimedCoupon, setClaimedCoupon] = useState(null);

  const handleClaimCoupon = async () => {
    setLoading(true);
    try {
      const response = await claimCoupon(sessionId);

      if (response.data.coupon) {
        setClaimedCoupon(response.data.coupon);
        toast.success("Successfully claimed coupon!", { id: "claim-success" });
        if (onClaim) onClaim();
      }
    } catch (error) {
      console.error("Error claiming coupon:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to claim coupon";
      toast.error(errorMessage, { id: "claim-error" });

      if (error.response?.status === 429) {
        toast.error("Please wait 24 hours before claiming another coupon", {
          id: "cooldown-error",
        });
      } else if (error.response?.status === 404) {
        toast.error("No coupons available at the moment", {
          id: "no-coupons-error",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {!claimedCoupon ? (
        <button
          onClick={handleClaimCoupon}
          disabled={loading}
          className={`w-full py-3 px-4 rounded-md font-semibold text-white transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed ${
            isDark
              ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500"
              : "bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500"
          }`}
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Claiming...
            </div>
          ) : (
            "Claim Coupon"
          )}
        </button>
      ) : (
        <div
          className={`p-6 rounded-lg ${
            isDark ? "bg-gray-800/50" : "bg-blue-50"
          } space-y-4`}
        >
          <div className="flex items-center justify-center">
            <svg
              className="w-12 h-12 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div className="text-center">
            <h3
              className={`text-lg font-semibold ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              Coupon Claimed Successfully!
            </h3>
            <div className="mt-2">
              <p
                className={`font-mono text-xl font-bold ${
                  isDark ? "text-blue-400" : "text-blue-600"
                }`}
              >
                {claimedCoupon.code}
              </p>
              <p
                className={`mt-1 text-sm ${
                  isDark ? "text-gray-300" : "text-gray-600"
                }`}
              >
                {claimedCoupon.description}
              </p>
              <p
                className={`mt-2 text-xs ${
                  isDark ? "text-gray-400" : "text-gray-500"
                }`}
              >
                Expires:{" "}
                {new Date(claimedCoupon.expiryDate).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ClaimCoupon;
