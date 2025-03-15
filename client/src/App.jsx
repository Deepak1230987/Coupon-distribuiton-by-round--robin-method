import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "./context/ThemeContext";
import { useTheme } from "./context/ThemeContext";
import Navbar from "./components/Navbar";
import ClaimPage from "./pages/ClaimPage";
import AdminLogin from "./pages/AdminLogin";
import AdminSignup from "./pages/AdminSignup";
import AdminDashboard from "./pages/AdminDashboard";
import ProtectedRoute from "./components/ProtectedRoute";

function AppContent() {
  const { isDark } = useTheme();

  return (
    <Router>
      <div
        className={`min-h-screen ${isDark ? "bg-gray-900" : "bg-[#EAEFF1]"}`}
      >
        <Toaster
          position="bottom-right"
          toastOptions={{
            // Prevent duplicate toasts
            id: (t) => t.message,
            // Custom styling
            style: {
              background: isDark ? "#1f2937" : "#ffffff",
              color: isDark ? "#ffffff" : "#000000",
            },
            // Prevent multiple toasts stacking
            multiple: false,
            // Duration for each toast
            duration: 3000,
          }}
        />
        <Navbar />
        <main className="container mx-auto px-4 py-8 max-w-7xl">
          <Routes>
            <Route path="/" element={<ClaimPage />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/signup" element={<AdminSignup />} />
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
