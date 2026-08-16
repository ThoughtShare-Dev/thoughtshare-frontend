import api from "./api.js";

/**
 * Ratings & reviews. Backs the Reviews flow (Dev 3's scope). Never send
 * reviewerId/revieweeId — the server derives both from the auth token
 * and the request. `editCount` on a review drives whether the edit
 * button should be enabled client-side (limit is 2).
 */
const reviewsApi = {
  create(requestId, rating, reviewText) {
    return api.post("/reviews", { requestId, rating, reviewText }).then((r) => r.data.data);
  },
  update(reviewId, { rating, reviewText } = {}) {
    return api.put(`/reviews/${reviewId}`, { rating, reviewText }).then((r) => r.data.data);
  },
  listForMember(memberId) {
    return api.get(`/members/${memberId}/reviews`).then((r) => r.data.data);
  },
};

export default reviewsApi;
