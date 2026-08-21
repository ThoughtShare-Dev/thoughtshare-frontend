import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import ProtectedRoute from "./ProtectedRoute.jsx";

/**
 * Same as ProtectedRoute, plus an admin-role check. Non-admins are sent
 * to /403 rather than /login, since they are authenticated — just not
 * authorized for this screen.
 */
export default function AdminRoute({ children }) {
  const { user } = useAuth();

  return (
    <ProtectedRoute>
      {user?.role === "admin" ? children : <Navigate to="/403" replace />}
    </ProtectedRoute>
  );
}
