import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useTheme } from "../context/ThemeContext";
import { adminSignup } from "../services/api";

function AdminSignup() {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    email: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (
      !formData.username ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      toast.error("Please fill in all fields");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    // Password validation
    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    // Confirm password
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      // Log the request data (remove in production)
      console.log("Sending signup request with data:", {
        username: formData.username,
        email: formData.email,
        password: "***", // Don't log actual password
      });

      const response = await adminSignup(
        formData.username,
        formData.password,
        formData.email
      );
      console.log("Signup successful:", response);
      toast.success("Admin account created successfully!");
      navigate("/admin/login");
    } catch (error) {
      console.error("Signup error details:", {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers,
      });

      let errorMessage = "Failed to create admin account";

      if (error.response?.status === 500) {
        errorMessage = "Server error. Please try again later.";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message.includes("Network Error")) {
        errorMessage =
          "Cannot connect to server. Please check your internet connection.";
      }

      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto ">
      <div
        className={`${
          isDark
            ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 shadow-[0_0_30px_rgba(59,130,246,0.1)]"
            : "bg-white shadow-[0_0_30px_rgba(59,130,246,0.05)]"
        } p-8 rounded-xl shadow-lg transition-all duration-500 ease-in-out hover:shadow-xl relative 
        before:absolute before:inset-0 before:rounded-xl before:p-[2px] before:bg-[length:200%_200%] ${
          isDark
            ? "before:bg-gradient-to-r before:from-violet-500 before:via-fuchsia-500 before:to-violet-500"
            : "before:bg-gradient-to-r before:from-blue-400 before:via-cyan-400 before:to-blue-400"
        } before:animate-shimmer before:opacity-0 hover:before:opacity-100 before:transition-all before:duration-500
        after:absolute after:inset-[1px] after:rounded-xl after:bg-gradient-to-br ${
          isDark
            ? "after:from-gray-900 after:via-gray-800 after:to-gray-900 hover:shadow-[0_0_30px_rgba(139,92,246,0.3)]"
            : "after:from-white after:to-white hover:shadow-[0_0_30px_rgba(59,130,246,0.3)]"
        }`}
      >
        <div className="relative z-10">
          <h2
            className={`text-3xl font-bold mb-4 tracking-tight text-center transition-colors duration-300 ${
              isDark ? "text-blue-400" : "text-blue-600"
            }`}
          >
            Create Account
          </h2>
          <p
            className={`text-center mb-6 ${
              isDark ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Sign up for an admin account
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="username"
                className={`block text-sm font-medium mb-2 ${
                  isDark ? "text-gray-200" : "text-gray-700"
                }`}
              >
                Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                className={`w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 transition-all duration-300 ${
                  isDark
                    ? "bg-gray-800 border-gray-700 text-white focus:ring-blue-500"
                    : "bg-gray-50 border border-gray-200 text-gray-900 focus:ring-blue-500"
                }`}
                placeholder="Choose a username"
              />
            </div>
            <div>
              <label
                htmlFor="email"
                className={`block text-sm font-medium mb-2 ${
                  isDark ? "text-gray-200" : "text-gray-700"
                }`}
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className={`w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 transition-all duration-300 ${
                  isDark
                    ? "bg-gray-800 border-gray-700 text-white focus:ring-blue-500"
                    : "bg-gray-50 border border-gray-200 text-gray-900 focus:ring-blue-500"
                }`}
                placeholder="Enter your email"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className={`block text-sm font-medium mb-2 ${
                  isDark ? "text-gray-200" : "text-gray-700"
                }`}
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength="6"
                className={`w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 transition-all duration-300 ${
                  isDark
                    ? "bg-gray-800 border-gray-700 text-white focus:ring-blue-500"
                    : "bg-gray-50 border border-gray-200 text-gray-900 focus:ring-blue-500"
                }`}
                placeholder="Create a password"
              />
            </div>
            <div>
              <label
                htmlFor="confirmPassword"
                className={`block text-sm font-medium mb-2 ${
                  isDark ? "text-gray-200" : "text-gray-700"
                }`}
              >
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className={`w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 transition-all duration-300 ${
                  isDark
                    ? "bg-gray-800 border-gray-700 text-white focus:ring-blue-500"
                    : "bg-gray-50 border border-gray-200 text-gray-900 focus:ring-blue-500"
                }`}
                placeholder="Confirm your password"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 px-4 rounded-lg font-semibold text-white text-sm transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed ${
                isDark
                  ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500"
                  : "bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500"
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Creating Account...
                </div>
              ) : (
                "Create Account"
              )}
            </button>
            <p
              className={`text-center text-sm mt-4 ${
                isDark ? "text-gray-400" : "text-gray-500"
              }`}
            >
              Already have an account?{" "}
              <Link
                to="/admin/login"
                className={`font-medium transition-colors duration-300 ${
                  isDark
                    ? "text-violet-400 hover:text-violet-300"
                    : "text-blue-600 hover:text-blue-500"
                }`}
              >
                Login here
              </Link>
            </p>
          </form>
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

export default AdminSignup;
