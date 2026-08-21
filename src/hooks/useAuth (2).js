import { useContext } from "react";
import { AuthContext } from "../context/AuthContextCreator.js";

/**
 * const { user, isAuthenticated, isLoading, login, register, logout } = useAuth();
 *
 * This is the only supported way to read or change auth state anywhere
 * in the app. See AuthContext.jsx for the full contract.
 */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth() must be used inside <AuthProvider>.");
  }
  return ctx;
}
