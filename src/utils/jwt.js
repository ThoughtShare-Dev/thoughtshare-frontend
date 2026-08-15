/**
 * Minimal JWT payload decoder (no signature verification — that's the
 * backend's job). The API contract guarantees the payload shape:
 *   { sub: memberId, role: "MEMBER" | "ADMIN", iat, exp }
 *
 * We decode client-side only to read `role`, since /auth/me's documented
 * response doesn't include it. If the backend adds `role` to the member
 * payload later, this becomes redundant but harmless.
 */
export function decodeJwt(token) {
  try {
    const payload = token.split(".")[1];
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
        .join("")
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function roleFromToken(token) {
  const payload = decodeJwt(token);
  return payload?.role ? payload.role.toLowerCase() : null;
}
