import api from "./api.js";

/**
 * Skill library. GET /skills is used by the SkillAutocomplete component
 * (Search, Edit Profile — see the PRD's Search and Edit Profile screens).
 * Admin CRUD is for the Admin — Skill Library screen only.
 */
const skillsApi = {
  list({ category, page, pageSize } = {}) {
    return api.get("/skills", { params: { category, page, pageSize } }).then((r) => r.data.data);
  },
  get(id) {
    return api.get(`/skills/${id}`).then((r) => r.data.data);
  },
  create(name, category) {
    return api.post("/admin/skills", { name, category }).then((r) => r.data.data);
  },
  update(id, { name, category } = {}) {
    return api.put(`/admin/skills/${id}`, { name, category }).then((r) => r.data.data);
  },
  remove(id) {
    return api.delete(`/admin/skills/${id}`);
  },
};

export default skillsApi;
