import axios from "axios";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim() || "/api/v1";

/**
 * Shared axios instance. Dev 2 and Dev 3: build your resource files
 * (profileApi.js, requestsApi.js, reviewsApi.js, etc.) on top of this —
 * don't create your own axios.create() elsewhere in the app.
 *
 * Auth: the token is attached automatically via the request interceptor
 * below, sourced from tokenStore (see setToken/clearToken). You never
 * need to read or attach the token yourself.
 */
const api = axios.create({
  baseURL: apiBaseUrl,
  headers: { "Content-Type": "application/json" },
});

// --- in-memory token store -------------------------------------------------
// Kept out of localStorage to reduce XSS exposure. AuthContext is the only
// module that should call setToken/clearToken directly.
let currentToken = null;

export function setToken(token) {
  currentToken = token;
}

export function clearToken() {
  currentToken = null;
}

// --- 401 handling -----------------------------------------------------------
// AuthContext registers itself here on mount so a 401 from anywhere in the
// app (any screen, any developer's code) triggers a single, consistent
// logout + redirect instead of each screen handling it separately.
let onUnauthorized = () => {};

export function registerUnauthorizedHandler(handler) {
  onUnauthorized = handler;
}

// --- interceptors -------------------------------------------------------
api.interceptors.request.use((config) => {
  if (currentToken) {
    config.headers.Authorization = `Bearer ${currentToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      onUnauthorized();
    }
    return Promise.reject(error);
  }
);

/**
 * Normalizes the backend's error shape:
 *   { success: false, error: { code, message, field? } }
 * into a plain string every screen can render without re-parsing axios
 * errors individually.
 */
export function getErrorMessage(error, fallback = "Something went wrong. Please try again.") {
  const apiMessage = error?.response?.data?.error?.message;
  if (apiMessage) return apiMessage;
  if (error?.message === "Network Error") return "Can't reach the server. Check your connection.";
  return fallback;
}

/**
 * Returns the field name an error applies to, if any, so a form can show
 * it inline against the right input instead of only as a top-level banner.
 */
export function getErrorField(error) {
  return error?.response?.data?.error?.field ?? null;
}

export function getErrorStatus(error) {
  return error?.response?.status ?? null;
}

export default api;
