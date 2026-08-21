import api from "./api.js";

/**
 * Notifications (Dev 3's scope). Refresh-based only — no websocket/push.
 * Fetch on page load / manual refresh, not on an interval.
 */
const notificationsApi = {
  list({ page, pageSize } = {}) {
    return api.get("/notifications", { params: { page, pageSize } }).then((r) => r.data.data);
  },
};

export default notificationsApi;
