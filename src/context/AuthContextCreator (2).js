import { createContext } from "react";

/**
 * AuthContext — the single source of truth for auth state.
 *
 * Dev 2 and Dev 3: consume this via the useAuth() hook (src/hooks/useAuth.js).
 * Never call authApi or read/write the token directly from a feature screen —
 * that keeps this contract stable even if the underlying auth flow changes.
 *
 * Matches docs/API_CONTRACT.md v1.0 (§9.1): responses are wrapped in
 * { success, data }, the token field is `accessToken`, and the member
 * object is `data.member` (register/login) or `data` directly (/auth/me).
 * `role` isn't in the documented member payload, so we decode it from the
 * JWT instead (the contract guarantees it's there) and merge it in.
 *
 * Shape:
 *   user            -> { id, name, email, role, ... } or null when signed out
 *   isAuthenticated -> boolean
 *   isLoading       -> true while the initial session check is in flight
 *                       (use this to avoid a flash-redirect to /login on refresh)
 *   error           -> last auth-flow error message, or null
 *   login(email, password)          -> Promise, resolves once signed in
 *   register(name, email, password) -> Promise, resolves once signed up + signed in
 *   logout()                        -> Promise, resolves once signed out
 *   clearError()                    -> clears `error` (e.g. when a form unmounts)
 */
export const AuthContext = createContext(null);
