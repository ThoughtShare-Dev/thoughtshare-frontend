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

  // --- Teaching skills — API_CONTRACT.md §9.3 ---
  addTeachingSkill({ skillId, contextNote }) {
    return api
      .post("/members/me/teaching-skills", { skillId, contextNote })
      .then((r) => r.data.data);
  },
  updateTeachingSkill(id, { contextNote }) {
    return api.put(`/members/me/teaching-skills/${id}`, { contextNote }).then((r) => r.data.data);
  },
  removeTeachingSkill(id) {
    return api.delete(`/members/me/teaching-skills/${id}`);
  },

  // --- Learning skills — API_CONTRACT.md §9.3 ---
  addLearningSkill({ skillId, reasonNote }) {
    return api
      .post("/members/me/learning-skills", { skillId, reasonNote })
      .then((r) => r.data.data);
  },
  updateLearningSkill(id, { reasonNote }) {
    return api.put(`/members/me/learning-skills/${id}`, { reasonNote }).then((r) => r.data.data);
  },
  removeLearningSkill(id) {
    return api.delete(`/members/me/learning-skills/${id}`);
  },
};

export default membersApi;
