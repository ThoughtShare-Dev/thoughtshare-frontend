import api, { getErrorMessage, getErrorField, getErrorStatus } from "./api.js";

// Confirmed against THOUGHTSHARE_API_CONTRACT.md + THOUGHTSHARE_MOCK_DATA.md

const reviewsApi = {
  // requestId must reference an ACCEPTED request between the two members.
  // reviewerId/revieweeId are derived server-side — never send them.
  // 201 -> { id, requestId, reviewerId, revieweeId, rating, reviewText, editCount, createdAt }
  // Errors: 400 VALIDATION_ERROR, 403 NO_ACCEPTED_CONNECTION, 409 REVIEW_ALREADY_EXISTS
  create: ({ requestId, rating, reviewText }) =>
    api.post("/reviews", { requestId, rating, reviewText }),

  // Author-only. Capped at 2 edits total (editCount tracked server-side).
  // 200 -> updated review
  // Errors: 400 VALIDATION_ERROR, 403 FORBIDDEN, 403 EDIT_LIMIT_REACHED, 404 NOT_FOUND
  update: (id, { rating, reviewText }) => api.put(`/reviews/${id}`, { rating, reviewText }),

  // Real endpoint, confirmed live (not in the original written contract, but
  // present and documented in THOUGHTSHARE_MOCK_DATA.md §7 as available for
  // profile pages). Returns a plain array under `data`, same as requestsApi.getAll.
  // 200 -> { data: [ { id, rating, reviewText, createdAt,
  //                     reviewer: {id,name,profilePictureUrl} }, ... ] }
  getForMember: (memberId) => api.get(`/members/${memberId}/reviews`),
};

export default reviewsApi;
export { getErrorMessage, getErrorField, getErrorStatus };
