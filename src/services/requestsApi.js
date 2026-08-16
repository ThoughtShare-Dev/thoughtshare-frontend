import api, { getErrorMessage, getErrorField, getErrorStatus } from "./api.js";

// Confirmed against THOUGHTSHARE_API_CONTRACT.md + THOUGHTSHARE_MOCK_DATA.md

const requestsApi = {
  // Real endpoint, confirmed live (mock data doc §5). Returns requests where
  // the logged-in member is either the sender or the recipient.
  // 200 -> { data: [ { id, status, createdAt, sender: {id,name,profilePictureUrl},
  //                     recipient: {id,name,profilePictureUrl} }, ... ] }
  // NOTE: this comes back as a plain array under `data`, NOT the usual
  // { items, page, pageSize, total, totalPages } collection envelope used
  // elsewhere in the contract — read res.data.data directly as an array.
  getAll: () => api.get("/requests"),

  // Send a connection request to another member.
  // 201 -> { id, senderId, recipientId, status: "PENDING", createdAt }
  // Errors: 400 SELF_REQUEST, 404 RECIPIENT_NOT_FOUND, 409 REQUEST_ALREADY_PENDING
  send: (recipientId) => api.post("/requests", { recipientId }),

  // Accept a pending request. Only the recipient can call this.
  // 200 -> { id, senderId, recipientId, status: "ACCEPTED", updatedAt }
  // Errors: 403 NOT_RECIPIENT, 404 NOT_FOUND, 409 INVALID_STATE
  accept: (id) => api.patch(`/requests/${id}/accept`),

  // Decline a pending request. Only the recipient can call this.
  // 200 -> { id, status: "DECLINED" }
  // Errors: 403 NOT_RECIPIENT, 404 NOT_FOUND, 409 INVALID_STATE
  decline: (id) => api.patch(`/requests/${id}/decline`),
};

export default requestsApi;
export { getErrorMessage, getErrorField, getErrorStatus };
