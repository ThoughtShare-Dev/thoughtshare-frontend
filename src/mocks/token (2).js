/**
 * Generates a structurally-decodable fake JWT for mock login/register.
 * Not signed, not secure — for local mock-mode use only. Shaped so
 * src/utils/jwt.js (decodeJwt / roleFromToken) can read `role` out of it
 * exactly like it would from a real token.
 */
export function createMockToken(member) {
  const header = btoa(JSON.stringify({ alg: "mock", typ: "JWT" }));
  const payload = btoa(
    JSON.stringify({
      sub: member.id,
      role: member.role ?? "MEMBER",
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 2,
    })
  );
  return `${header}.${payload}.mocksignature`;
}
