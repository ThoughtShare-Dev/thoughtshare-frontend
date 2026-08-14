import { useCallback, useEffect, useMemo, useState } from "react";
import { AuthContext } from "./AuthContextCreator.js";
import authApi from "../services/authApi.js";
import {
  setToken,
  clearToken,
  registerUnauthorizedHandler,
  getErrorMessage,
} from "../services/api.js";
import { roleFromToken } from "../utils/jwt.js";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const clearError = useCallback(() => setError(null), []);

  const signOut = useCallback(() => {
    clearToken();
    setUser(null);
  }, []);

  // Any 401 from anywhere in the app routes through here.
  useEffect(() => {
    registerUnauthorizedHandler(() => {
      signOut();
    });
  }, [signOut]);

  // On first load, try to restore a session so a page refresh doesn't
  // bounce an already-authenticated member back to /login.
  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      try {
        const storedToken = sessionStorage.getItem("ts_token");
        if (!storedToken) {
          setIsLoading(false);
          return;
        }
        setToken(storedToken);
        const res = await authApi.me();
        const member = res.data.data; // GET /auth/me returns the member directly under `data`
        if (!cancelled) setUser({ ...member, role: roleFromToken(storedToken) ?? "member" });
      } catch {
        clearToken();
        sessionStorage.removeItem("ts_token");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    restoreSession();
    return () => {
      cancelled = true;
    };
  }, []);

  const applySession = useCallback((accessToken, member) => {
    // Session storage (not localStorage) keeps the token out of long-term
    // persistent storage while still surviving a same-tab refresh, which
    // is the main case ProtectedRoute needs to handle gracefully.
    sessionStorage.setItem("ts_token", accessToken);
    setToken(accessToken);
    setUser({ ...member, role: roleFromToken(accessToken) ?? "member" });
  }, []);

  const login = useCallback(
    async (email, password) => {
      setError(null);
      try {
        const res = await authApi.login(email, password);
        const { accessToken, member } = res.data.data;
        applySession(accessToken, member);
        return member;
      } catch (err) {
        const code = err?.response?.data?.error?.code;
        const message =
          code === "ACCOUNT_DEACTIVATED"
            ? getErrorMessage(err, "This account has been deactivated.")
            : getErrorMessage(err, "Invalid email or password.");
        setError(message);
        throw err;
      }
    },
    [applySession]
  );

  const register = useCallback(
    async (name, email, password) => {
      setError(null);
      try {
        const res = await authApi.register(name, email, password);
        const { accessToken, member } = res.data.data;
        applySession(accessToken, member);
        return member;
      } catch (err) {
        const message = getErrorMessage(err, "Couldn't create your account.");
        setError(message);
        throw err;
      }
    },
    [applySession]
  );

  const logout = useCallback(async () => {
    await authApi.logout();
    sessionStorage.removeItem("ts_token");
    signOut();
  }, [signOut]);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      isLoading,
      error,
      login,
      register,
      logout,
      clearError,
    }),
    [user, isLoading, error, login, register, logout, clearError]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
