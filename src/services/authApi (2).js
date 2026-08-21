import api from "./api.js";

/**
 * Auth endpoints, matching docs/API_CONTRACT.md v1.0 (§9.1).
 * Only AuthContext should call these directly — the rest of the app
 * consumes auth state via useAuth(), not this file.
 *
 * Base URL already includes /api/v1 (see VITE_API_BASE_URL), so paths
 * here are relative to that, e.g. POST {baseURL}/auth/register.
 */
const authApi = {
  register(name, email, password) {
    return api.post("/auth/register", { name, email, password });
  },

  login(email, password) {
    return api.post("/auth/login", { email, password });
  },

  logout() {
    // Best-effort — MVP logout is stateless per the contract (client just
    // drops the token), so a failure here shouldn't block signing out locally.
    return api.post("/auth/logout").catch(() => {});
  },

  me() {
    return api.get("/auth/me");
  },
};

export default authApi;
