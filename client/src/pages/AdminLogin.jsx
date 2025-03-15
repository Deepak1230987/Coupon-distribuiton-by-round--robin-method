import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useTheme } from "../context/ThemeContext";
import { adminLogin } from "../services/api";

function AdminLogin() {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await adminLogin(credentials.username, credentials.password);
      toast.success("Login successful!");
      navigate("/admin/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-8">
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
            className={`text-3xl font-bold mb-6 tracking-tight text-center transition-colors duration-300 ${
              isDark ? "text-blue-400" : "text-blue-600"
            }`}
          >
            Welcome Back
          </h2>
          <p
            className={`text-center mb-8 ${
              isDark ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Sign in to your admin account
          </p>
          <form onSubmit={handleSubmit} className="space-y-6">
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
                value={credentials.username}
                onChange={handleChange}
                required
                className={`w-full px-4 py-3 rounded-lg focus:outline-none  focus:ring-2 transition-all duration-300 ${
                  isDark
                    ? "bg-gray-800 border border-gray-700 text-white focus:ring-blue-500 focus:border-violet-500"
                    : "bg-gray-50 border border-gray-200 text-gray-900 focus:ring-blue-500"
                }`}
                placeholder="Enter your username"
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
                value={credentials.password}
                onChange={handleChange}
                required
                className={`w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 transition-all duration-300 ${
                  isDark
                    ? "bg-gray-800 border border-gray-700 text-white focus:ring-blue-500 focus:border-violet-500"
                    : "bg-gray-50 border border-gray-200 text-gray-900 focus:ring-blue-500"
                }`}
                placeholder="Enter your password"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 px-4 rounded-lg font-semibold text-white text-sm transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed ${
                isDark
                  ? "bg-gradient-to-r from-violet-600 to-blue-500 hover:from-violet-500 hover:to-green-500"
                  : "bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500"
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Logging in...
                </div>
              ) : (
                <h3 className="text-center text-lg">Sign In </h3>
              )}
            </button>
            <p
              className={`text-center text-sm mt-6 ${
                isDark ? "text-gray-400" : "text-gray-500"
              }`}
            >
              Don't have an account?{" "}
              <Link
                to="/admin/signup"
                className={`font-medium transition-colors duration-300 ${
                  isDark
                    ? "text-blue-500 hover:text-green-400"
                    : "text-blue-600 hover:text-blue-500"
                }`}
              >
                Sign up 
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

export default AdminLogin;
