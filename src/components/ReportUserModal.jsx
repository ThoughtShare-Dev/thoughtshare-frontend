import { useState } from "react";
import reportsApi from "../services/reportsApi.js";
import { getErrorMessage } from "../services/api.js";

/**
 * Report-a-member modal. Reusable — Requests uses it today; Dev 2's
 * Member Profile screen should use it too once built, same props.
 * The backend hides the reported member from search the moment a
 * report is filed — nothing further to do here after submission.
 */
export default function ReportUserModal({ memberId, memberName, onClose, onSubmitted }) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!reason.trim()) {
      setError("Tell us what happened.");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      await reportsApi.create(memberId, reason.trim());
      onSubmitted?.();
      onClose();
    } catch (err) {
      setError(getErrorMessage(err, "Couldn't submit the report. Try again."));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="report-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="report-modal-title" style={{ fontSize: "var(--text-lg)" }}>
          Report {memberName}
        </h2>
        <p className="field-hint" style={{ marginBottom: "var(--space-3)" }}>
          Tell us what happened. This member won&apos;t be notified, and won&apos;t appear in search
          while your report is reviewed.
        </p>

        <form onSubmit={handleSubmit}>
          {error && (
            <div className="banner banner--error" role="alert">
              {error}
            </div>
          )}
          <div className="field">
            <label htmlFor="report-reason">What happened?</label>
            <textarea
              id="report-reason"
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Describe the issue…"
            />
          </div>
          <div style={{ display: "flex", gap: "var(--space-2)", justifyContent: "flex-end" }}>
            <button
              type="button"
              className="btn btn--ghost"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn--primary" disabled={isSubmitting}>
              {isSubmitting && <span className="spinner" />}
              {isSubmitting ? "Submitting…" : "Submit report"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
