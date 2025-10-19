import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");
  const adminToken = localStorage.getItem("adminToken");
  
  // Allow access if either farmer token or admin token exists
  return (token || adminToken) ? children : <Navigate to="/login" replace />;
}
