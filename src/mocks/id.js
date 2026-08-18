/**
 * Tiny UUID-v4-shaped ID generator for records created during a mock
 * session (new registrations, requests, reviews, reports). Doesn't need
 * to be cryptographically correct — just unique and UUID-shaped so it's
 * indistinguishable from a real backend ID in the UI.
 */
export function v4ish() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
