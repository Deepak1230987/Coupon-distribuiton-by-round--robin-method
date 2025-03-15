import { Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";

function ProtectedRoute({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const API_URL =
    import.meta.env.VITE_API_URI?.trim() || "http://localhost:5000/api";
  useEffect(() => {
    const checkAuth = async () => {
      try {
        await axios.get(API_URL, {
          withCredentials: true,
        });
        setIsAuthenticated(true);
      } catch (error) {
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) {
    return <div className="text-center">Loading...</div>;
  }

  return isAuthenticated ? children : <Navigate to="/admin/login" />;
}

export default ProtectedRoute;
