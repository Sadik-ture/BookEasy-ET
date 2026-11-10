import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// UX guard only. The backend enforces real permissions.
export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="grid place-items-center py-32 text-slate-500">Loading…</div>;
  }
  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  return children;
}