import api from "./api.js";

/**
 * Learning requests. Backs the Requests screen (Dev 3's scope) — send,
 * list, accept, decline. GET /requests returns everything the caller is
 * either the sender or recipient of; split into Incoming/Outgoing tabs
 * on the client using the member's own id.
 */
const requestsApi = {
  send(recipientId) {
    return api.post("/requests", { recipientId }).then((r) => r.data.data);
  },
  list() {
    return api.get("/requests").then((r) => r.data.data);
  },
  accept(requestId) {
    return api.patch(`/requests/${requestId}/accept`).then((r) => r.data.data);
  },
  decline(requestId) {
    return api.patch(`/requests/${requestId}/decline`).then((r) => r.data.data);
  },
};

export default requestsApi;
