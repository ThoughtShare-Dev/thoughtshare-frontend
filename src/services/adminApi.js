import api from "./api.js";

/**
 * Admin-only endpoints — Reports and Review Moderation screens.
 * Skill Library admin actions live in skillsApi.js instead, since they
 * share the same underlying resource as the public skill list.
 *
 * Note: these endpoints aren't in the original backend API contract yet.
 * They're built here against a reasonable target shape (matching the
 * conventions of the rest of the contract) so development isn't blocked —
 * confirm the real shape with the backend dev before relying on this
 * against the live backend.
 */
const adminApi = {
  reports: {
    /** status: "PENDING" | "DISMISSED" | "CONFIRMED" (optional filter) */
    list({ status, page, pageSize } = {}) {
      return api.get("/admin/reports", { params: { status, page, pageSize } }).then((r) => r.data.data);
    },
    /** action: "DISMISS" | "CONFIRM" */
    resolve(reportId, action) {
      return api.patch(`/admin/reports/${reportId}/resolve`, { action }).then((r) => r.data.data);
    },
  },
  reviews: {
    list({ page, pageSize } = {}) {
      return api.get("/admin/reviews", { params: { page, pageSize } }).then((r) => r.data.data);
    },
    remove(reviewId) {
      return api.delete(`/admin/reviews/${reviewId}`);
    },
  },
};

export default adminApi;
