import api from "./api.js";

/**
 * Reporting a member (Dev 3's scope — Report User modal). Backend hides
 * the reported member from search/browse server-side once a report is
 * filed; there's nothing further to poll or reflect client-side beyond
 * the submission confirmation.
 */
const reportsApi = {
  create(reportedMemberId, reason) {
    return api.post("/reports", { reportedMemberId, reason }).then((r) => r.data.data);
  },
};

export default reportsApi;
