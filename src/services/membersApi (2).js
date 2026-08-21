import api from "./api.js";

/**
 * Members, profile, and search. Backs the Search, Search Results, Member
 * Profile, My Profile, and Edit Profile screens (Dev 2's scope).
 *
 * Contact fields (preferredContactType/Value) are server-controlled — the
 * backend only sends them once an ACCEPTED connection exists between the
 * viewer and the member. Don't add client-side hiding logic; the API
 * already withholds them.
 */
const membersApi = {
  getById(id) {
    return api.get(`/members/${id}`).then((r) => r.data.data);
  },
  updateMe({ name, bio, preferredContactType, preferredContactValue } = {}) {
    return api
      .put("/members/me", { name, bio, preferredContactType, preferredContactValue })
      .then((r) => r.data.data);
  },
  /** mode: "teach" | "learn" (default "teach") */
  search({ skill, mode = "teach", page, pageSize } = {}) {
    return api.get("/search", { params: { skill, mode, page, pageSize } }).then((r) => r.data.data);
  },
};

export default membersApi;
