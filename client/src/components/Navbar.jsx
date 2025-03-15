import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { Moon, Sun } from "lucide-react";
function Navbar() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <nav
      className={`${
        isDark ? "bg-gray-900" : "bg-white/80 backdrop-blur-sm"
      } shadow-lg mb-8 border-b ${
        isDark ? "border-gray-800" : "border-gray-200"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link
            to="/"
            className={`text-xl font-bold tracking-tight ${
              isDark
                ? "text-blue-400 hover:text-blue-300"
                : "text-blue-600 hover:text-blue-500"
            } transition-all duration-300 hover:scale-105`}
          >
            <span className="font-mono">Coupon</span>App
          </Link>
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-xl transition-all duration-300 hover:scale-110 border border-blue-500  ${
                isDark
                  ? "bg-gray-800 text-yellow-300 hover:bg-gray-800 "
                  : " text-blue-500  "
              }`}
              aria-label="Toggle theme"
            >
              {isDark ? <Sun /> : <Moon />}
            </button>
            <Link
              to="/admin/login"
              className={`px-4 py-2 rounded-md transition-all duration-300 hover:scale-105 ${
                isDark
                  ? "text-gray-300 hover:text-white bg-gray-800 hover:bg-gray-700  border border-blue-500"
                  : "text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-50  border border-blue-200"
              }`}
            >
              Admin Login
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
