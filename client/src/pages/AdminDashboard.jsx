import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useTheme } from "../context/ThemeContext";
import {
  addCoupon,
  getCoupons,
  getClaims,
  updateCoupon,
  adminLogout,
} from "../services/api";

function AdminDashboard() {
  const navigate = useNavigate();
  const [coupons, setCoupons] = useState([]);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newCoupon, setNewCoupon] = useState({
    code: "",
    description: "",
    expiryDate: "",
  });
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const { isDark } = useTheme();

  useEffect(() => {
    fetchCoupons();
    fetchClaims();
  }, []);

  const fetchCoupons = async () => {
    try {
      const response = await getCoupons();
      setCoupons(response.data);
    } catch (err) {
      console.error("Error fetching coupons:", err);
      toast.error("Failed to fetch coupons", { id: "fetch-coupons-error" });
    }
  };

  const fetchClaims = async () => {
    try {
      const response = await getClaims();
      setClaims(response.data);
    } catch (err) {
      console.error("Error fetching claims:", err);
      toast.error("Failed to fetch claims", { id: "fetch-claims-error" });
    } finally {
      setLoading(false);
    }
  };

  const handleNewCouponChange = (e) => {
    setNewCoupon({
      ...newCoupon,
      [e.target.name]: e.target.value,
    });
  };

  const handleAddCoupon = async (e) => {
    e.preventDefault();
    try {
      // Validate inputs
      if (!newCoupon.code || !newCoupon.description || !newCoupon.expiryDate) {
        toast.error("Please fill in all fields", {
          id: "fields-required-error",
        });
        return;
      }

      // Validate code is not "NULL" or empty
      if (
        newCoupon.code.trim().toUpperCase() === "NULL" ||
        newCoupon.code.trim() === ""
      ) {
        toast.error("Invalid coupon code", { id: "invalid-code-error" });
        return;
      }

      // Validate description is not "null" or empty
      if (
        newCoupon.description.trim().toLowerCase() === "null" ||
        newCoupon.description.trim() === ""
      ) {
        toast.error("Invalid description", { id: "invalid-description-error" });
        return;
      }

      // Validate expiry date
      const expiryDate = new Date(newCoupon.expiryDate);
      if (isNaN(expiryDate.getTime())) {
        toast.error("Invalid expiry date", { id: "invalid-date-error" });
        return;
      }

      // Ensure expiry date is in the future
      if (expiryDate <= new Date()) {
        toast.error("Expiry date must be in the future", {
          id: "future-date-error",
        });
        return;
      }

      const couponData = {
        code: newCoupon.code.trim().toUpperCase(),
        description: newCoupon.description.trim(),
        expiryDate: expiryDate.toISOString(),
        isActive: true,
        isUsed: false,
        lastClaimAt: null,
        claimedBy: [],
      };

      const response = await addCoupon(couponData);
      console.log("Server response:", response.data);
      toast.success("Coupon added successfully", { id: "add-coupon-success" });
      setNewCoupon({ code: "", description: "", expiryDate: "" });
      fetchCoupons();
    } catch (err) {
      let errorMessage = "Failed to add coupon";

      if (err.response?.status === 401) {
        errorMessage = "Please log in as admin first";
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
        if (err.response.data.details) {
          errorMessage +=
            ": " +
            Object.values(err.response.data.details).filter(Boolean).join(", ");
        }
      } else if (err.message.includes("Network Error")) {
        errorMessage =
          "Cannot connect to server. Please check if the server is running.";
      }

      toast.error(errorMessage, { id: "add-coupon-error" });
    }
  };

  const toggleCouponStatus = async (id, currentStatus) => {
    try {
      await updateCoupon(id, { isActive: !currentStatus });
      toast.success("Coupon status updated", { id: "status-update-success" });
      fetchCoupons();
    } catch (err) {
      console.error("Error updating coupon status:", err);
      toast.error("Failed to update coupon status", {
        id: "status-update-error",
      });
    }
  };

  const handleLogout = async () => {
    try {
      await adminLogout();
      toast.success("Logged out successfully", { id: "logout-success" });
      navigate("/admin/login");
    } catch (err) {
      console.error("Error logging out:", err);
      toast.error("Failed to logout", { id: "logout-error" });
    }
  };

  const handleEditClick = (coupon) => {
    setEditingCoupon({
      ...coupon,
      expiryDate: new Date(coupon.expiryDate).toISOString().slice(0, 16),
    });
    setShowEditModal(true);
  };

  const handleEditChange = (e) => {
    setEditingCoupon({
      ...editingCoupon,
      [e.target.name]: e.target.value,
    });
  };

  const handleUpdateCoupon = async (e) => {
    e.preventDefault();
    try {
      // Validate inputs
      if (!editingCoupon.description || !editingCoupon.expiryDate) {
        toast.error("Please fill in all fields", {
          id: "edit-fields-required-error",
        });
        return;
      }

      // Validate description
      if (
        editingCoupon.description.trim().toLowerCase() === "null" ||
        editingCoupon.description.trim() === ""
      ) {
        toast.error("Invalid description", {
          id: "edit-invalid-description-error",
        });
        return;
      }

      // Validate expiry date
      const expiryDate = new Date(editingCoupon.expiryDate);
      if (isNaN(expiryDate.getTime())) {
        toast.error("Invalid expiry date", { id: "edit-invalid-date-error" });
        return;
      }

      const couponData = {
        description: editingCoupon.description.trim(),
        expiryDate: expiryDate.toISOString(),
      };

      await updateCoupon(editingCoupon._id, couponData);
      toast.success("Coupon updated successfully", {
        id: "update-coupon-success",
      });
      setShowEditModal(false);
      setEditingCoupon(null);
      fetchCoupons();
    } catch (err) {
      let errorMessage = "Failed to update coupon";
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      toast.error(errorMessage, { id: "update-coupon-error" });
    }
  };

  if (loading) {
    return (
      <div className={`text-center ${isDark ? "text-white" : "text-gray-900"}`}>
        Loading...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Admin Header with Logout */}
      <div
        className={`${
          isDark
            ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 shadow-[0_0_30px_rgba(59,130,246,0.1)]"
            : "bg-white shadow-[0_0_30px_rgba(59,130,246,0.05)]"
        } p-4 rounded-lg shadow-lg flex justify-between items-center mb-8`}
      >
        <h1
          className={`text-2xl font-bold ${
            isDark ? "text-blue-400" : "text-blue-600"
          }`}
        >
          Admin Dashboard
        </h1>
        <button
          onClick={handleLogout}
          className={`px-4 py-2 rounded-md transition-all duration-300 hover:scale-105 ${
            isDark
              ? "bg-red-600 hover:bg-red-700 text-white"
              : "bg-red-500 hover:bg-red-600 text-white"
          }`}
        >
          Logout
        </button>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column - Add New Coupon Form */}
        <div
          className={`${
            isDark
              ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 shadow-[0_0_30px_rgba(59,130,246,0.1)]"
              : "bg-white shadow-[0_0_30px_rgba(59,130,246,0.05)]"
          } p-6 rounded-lg shadow-lg transition-all duration-500 ease-in-out hover:shadow-xl relative 
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
            <h2
              className={`text-2xl font-bold mb-4 tracking-tight transition-colors duration-300 ${
                isDark ? "text-blue-400" : "text-blue-600"
              }`}
            >
              Add New Coupon
            </h2>
            <form onSubmit={handleAddCoupon} className="space-y-4">
              <div>
                <label
                  className={`block text-sm font-medium transition-colors duration-300 ${
                    isDark ? "text-gray-300" : "text-blue-700"
                  }`}
                >
                  Code
                </label>
                <input
                  type="text"
                  name="code"
                  value={newCoupon.code}
                  onChange={handleNewCouponChange}
                  required
                  className={`mt-1 focus:outline-none block w-full rounded-md shadow-sm px-2 py-1 focus:border-blue-500 focus:ring-blue-500 transition-all duration-300 ease-in-out ${
                    isDark
                      ? "bg-gray-800 border-gray-700 text-white hover:border-blue-500/50"
                      : "bg-white border-blue-100 text-gray-900 hover:border-blue-300"
                  }`}
                />
              </div>
              <div>
                <label
                  className={`block text-sm font-medium transition-colors duration-300 ${
                    isDark ? "text-gray-300" : "text-blue-700"
                  }`}
                >
                  Description
                </label>
                <input
                  type="text"
                  name="description"
                  value={newCoupon.description}
                  onChange={handleNewCouponChange}
                  required
                  className={`mt-1 focus:outline-none block w-full rounded-md shadow-sm px-2 py-1 focus:border-blue-500 focus:ring-blue-500 transition-all duration-300 ease-in-out ${
                    isDark
                      ? "bg-gray-800 border-gray-700 text-white hover:border-blue-500/50"
                      : "bg-white border-blue-100 text-gray-900 hover:border-blue-300"
                  }`}
                />
              </div>
              <div>
                <label
                  className={`block text-sm font-medium transition-colors duration-300 ${
                    isDark ? "text-gray-300" : "text-blue-700"
                  }`}
                >
                  Expiry Date
                </label>
                <input
                  type="datetime-local"
                  name="expiryDate"
                  value={newCoupon.expiryDate}
                  onChange={handleNewCouponChange}
                  required
                  className={`mt-1 focus:outline-none block w-full rounded-md shadow-sm px-2 py-1 focus:border-blue-500 focus:ring-blue-500 transition-all duration-300 ease-in-out ${
                    isDark
                      ? "bg-gray-800 border-gray-700 text-white hover:border-blue-500/50"
                      : "bg-white border-blue-100 text-gray-900 hover:border-blue-300"
                  }`}
                />
              </div>
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-all duration-300 ease-in-out hover:shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:scale-105 active:scale-95"
              >
                Add Coupon
              </button>
            </form>
          </div>
        </div>

        {/* Right Column - Recent Claims */}
        <div
          className={`${
            isDark
              ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 shadow-[0_0_30px_rgba(59,130,246,0.1)]"
              : "bg-white shadow-[0_0_30px_rgba(59,130,246,0.05)]"
          } p-6 rounded-lg shadow-lg transition-all duration-500 ease-in-out hover:shadow-xl relative 
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
            <h2
              className={`text-2xl font-bold mb-4 tracking-tight transition-colors duration-300 ${
                isDark ? "text-blue-400" : "text-blue-600"
              }`}
            >
              Recent Claims
            </h2>
            <div className="overflow-x-auto h-[300px]">
              <div
                className={`overflow-y-auto modern-scrollbar ${
                  isDark ? "dark" : ""
                }`}
              >
                <table className="min-w-full divide-y divide-gray-200">
                  <thead
                    className={`${
                      isDark ? "bg-gray-800" : "bg-blue-50"
                    } transition-colors duration-300`}
                  >
                    <tr>
                      <th
                        className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                          isDark ? "text-gray-300" : "text-blue-700"
                        }`}
                      >
                        Coupon Code
                      </th>
                      <th
                        className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                          isDark ? "text-gray-300" : "text-blue-700"
                        }`}
                      >
                        IP Address
                      </th>
                      <th
                        className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                          isDark ? "text-gray-300" : "text-blue-700"
                        }`}
                      >
                        Claimed At
                      </th>
                    </tr>
                  </thead>
                  <tbody
                    className={`${
                      isDark
                        ? "bg-gray-900 divide-gray-800"
                        : "bg-white divide-blue-100"
                    } transition-colors duration-300`}
                  >
                    {claims.slice(0, 5).map((claim) =>
                      claim.claimedBy.map((claimInfo, index) => (
                        <tr
                          key={`${claim._id}-${index}`}
                          className={`transition-all duration-300 ease-in-out ${
                            isDark ? "hover:bg-gray-800" : "hover:bg-blue-50/50"
                          }`}
                        >
                          <td
                            className={`px-6 py-4 whitespace-nowrap ${
                              isDark ? "text-white" : "text-gray-900"
                            }`}
                          >
                            {claim.code}
                          </td>
                          <td
                            className={`px-6 py-4 whitespace-nowrap ${
                              isDark ? "text-white" : "text-gray-900"
                            }`}
                          >
                            {claimInfo.ip}
                          </td>
                          <td
                            className={`px-6 py-4 whitespace-nowrap ${
                              isDark ? "text-white" : "text-gray-900"
                            }`}
                          >
                            {new Date(claimInfo.claimedAt).toLocaleString()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section - Available Coupons */}
      <div
        className={`${
          isDark
            ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 shadow-[0_0_30px_rgba(59,130,246,0.1)]"
            : "bg-white shadow-[0_0_30px_rgba(59,130,246,0.05)]"
        } p-6 rounded-lg shadow-lg transition-all duration-500 ease-in-out hover:shadow-xl relative 
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
          <h2
            className={`text-2xl font-bold mb-4 tracking-tight transition-colors duration-300 ${
              isDark ? "text-blue-400" : "text-blue-600"
            }`}
          >
            Available Coupons
          </h2>
          <div className="overflow-x-auto h-[650px]">
            <div
              className={`overflow-y-auto modern-scrollbar ${
                isDark ? "dark" : ""
              }`}
            >
              <table className="min-w-full divide-y divide-gray-200">
                <thead
                  className={`${
                    isDark ? "bg-gray-800" : "bg-blue-50"
                  } transition-colors duration-300`}
                >
                  <tr>
                    <th
                      className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                        isDark ? "text-gray-300" : "text-blue-700"
                      }`}
                    >
                      Code
                    </th>
                    <th
                      className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                        isDark ? "text-gray-300" : "text-blue-700"
                      }`}
                    >
                      Description
                    </th>
                    <th
                      className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                        isDark ? "text-gray-300" : "text-blue-700"
                      }`}
                    >
                      Status
                    </th>
                    <th
                      className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                        isDark ? "text-gray-300" : "text-blue-700"
                      }`}
                    >
                      Expiry Date
                    </th>
                    <th
                      className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                        isDark ? "text-gray-300" : "text-blue-700"
                      }`}
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody
                  className={`${
                    isDark
                      ? "bg-gray-900 divide-gray-800"
                      : "bg-white divide-blue-100"
                  } transition-colors duration-300`}
                >
                  {coupons.map((coupon) => (
                    <tr
                      key={coupon._id}
                      className={`transition-all duration-300 ease-in-out ${
                        isDark ? "hover:bg-gray-800" : "hover:bg-cyan-100"
                      }`}
                    >
                      <td
                        className={`px-6 py-4 whitespace-nowrap ${
                          isDark ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {coupon.code}
                      </td>
                      <td
                        className={`px-6 py-4 ${
                          isDark ? "text-white" : "text-gray-900"
                        }`}
                      >
                        <div
                          className="max-w-[200px] truncate"
                          title={coupon.description}
                        >
                          {coupon.description}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 inline-flex items-center gap-1.5 text-xs font-medium rounded-full transition-all duration-300 ease-in-out ${
                            isDark
                              ? "dark:bg-green-900/30 dark:text-green-400 dark:border-emerald-800/50"
                              : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          } ${
                            coupon.isActive
                              ? ""
                              : isDark
                              ? "dark:bg-red-900/30 dark:text-red-400 dark:border-rose-800/50"
                              : "bg-rose-50 text-rose-700 border border-rose-200"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${
                              coupon.isActive
                                ? "bg-emerald-500 dark:bg-emerald-400"
                                : "bg-rose-500 dark:bg-rose-400"
                            }`}
                          ></span>
                          {coupon.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td
                        className={`px-6 py-4 whitespace-nowrap ${
                          isDark ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {new Date(coupon.expiryDate).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap space-x-2">
                        <button
                          onClick={() => handleEditClick(coupon)}
                          className={`px-3 py-1 rounded-md text-white transition-all duration-300 ease-in-out hover:scale-105 active:scale-95 ${
                            isDark
                              ? "bg-blue-600 hover:bg-blue-700"
                              : "bg-blue-500 hover:bg-blue-600"
                          }`}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() =>
                            toggleCouponStatus(coupon._id, coupon.isActive)
                          }
                          className={`px-3 py-1 rounded-md text-white transition-all duration-300 ease-in-out hover:scale-105 active:scale-95 ${
                            coupon.isActive
                              ? "bg-rose-500 hover:bg-rose-700 hover:shadow-[0_0_15px_rgba(239,68,68,0.3)]"
                              : "bg-green-500 hover:bg-green-600 hover:shadow-[0_0_15px_rgba(34,197,94,0.3)]"
                          }`}
                        >
                          {coupon.isActive ? "Deactivate" : "Activate"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div
            className={`${
              isDark
                ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
                : "bg-white"
            } rounded-lg shadow-xl max-w-md w-full p-6 relative`}
          >
            <h3
              className={`text-xl font-bold mb-4 ${
                isDark ? "text-blue-400" : "text-blue-600"
              }`}
            >
              Edit Coupon
            </h3>
            <form onSubmit={handleUpdateCoupon} className="space-y-4">
              <div>
                <label
                  className={`block text-sm font-medium ${
                    isDark ? "text-gray-300" : "text-blue-700"
                  }`}
                >
                  Code
                </label>
                <input
                  type="text"
                  value={editingCoupon.code}
                  disabled
                  className={`mt-1 block w-full rounded-md shadow-sm px-3 py-2 bg-gray-100 cursor-not-allowed ${
                    isDark ? "text-gray-400" : "text-gray-500"
                  }`}
                />
              </div>
              <div>
                <label
                  className={`block text-sm font-medium ${
                    isDark ? "text-gray-300" : "text-blue-700"
                  }`}
                >
                  Description
                </label>
                <input
                  type="text"
                  name="description"
                  value={editingCoupon.description}
                  onChange={handleEditChange}
                  required
                  className={`mt-1 block w-full rounded-md shadow-sm px-3 py-2 ${
                    isDark
                      ? "bg-gray-800 border-gray-700 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  }`}
                />
              </div>
              <div>
                <label
                  className={`block text-sm font-medium ${
                    isDark ? "text-gray-300" : "text-blue-700"
                  }`}
                >
                  Expiry Date
                </label>
                <input
                  type="datetime-local"
                  name="expiryDate"
                  value={editingCoupon.expiryDate}
                  onChange={handleEditChange}
                  required
                  className={`mt-1 block w-full rounded-md shadow-sm px-3 py-2 ${
                    isDark
                      ? "bg-gray-800 border-gray-700 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  }`}
                />
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingCoupon(null);
                  }}
                  className={`px-4 py-2 rounded-md ${
                    isDark
                      ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

  
    </div>
  );
}

export default AdminDashboard;
