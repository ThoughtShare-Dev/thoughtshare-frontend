import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";

/**
 * Wrap any screen that requires a signed-in member:
 *
 *   <Route path="/requests" element={
 *     <ProtectedRoute><Requests /></ProtectedRoute>
 *   } />
 *
 * Waits for the initial session check (isLoading) before deciding, so an
 * authenticated member never gets flash-redirected to /login on refresh.
 * Preserves the intended destination in location state so Login can send
 * them back where they meant to go.
 */
export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="page--centered" role="status" aria-live="polite">
        <span className="spinner" style={{ borderTopColor: "var(--color-primary)", borderColor: "rgba(47,111,94,0.25)" }} />
        <span className="visually-hidden">Loading your session…</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
