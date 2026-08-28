import { useEffect, useState, useCallback } from "react";
import adminApi from "../../services/adminApi.js";
import { getErrorMessage } from "../../services/api.js";

const STATUS_CLASS = { PENDING: "badge--pending", CONFIRMED: "badge--declined", DISMISSED: "badge--accepted" };

export default function AdminReports() {
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [resolvingId, setResolvingId] = useState(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await adminApi.reports.list({ status: "PENDING", pageSize: 100 });
      setReports(data.items);
    } catch (err) {
      setError(getErrorMessage(err, "Couldn't load reports."));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function resolve(id, action) {
    setResolvingId(id);
    try {
      await adminApi.reports.resolve(id, action);
      setReports((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      setError(getErrorMessage(err, "Couldn't resolve that report."));
    } finally {
      setResolvingId(null);
    }
  }

  return (
    <div className="page">
      <p className="auth-card__eyebrow">Admin</p>
      <h1 style={{ fontSize: "var(--text-2xl)", marginBottom: "var(--space-4)" }}>Reports</h1>

      {error && (
        <div className="banner banner--error" role="alert">
          {error}
        </div>
      )}

      {isLoading ? (
        <p>
          <span className="spinner" style={{ borderTopColor: "var(--color-primary)", borderColor: "rgba(39,72,232,0.25)" }} />{" "}
          Loading…
        </p>
      ) : reports.length === 0 ? (
        <div className="empty-state">No pending reports. All clear.</div>
      ) : (
        reports.map((r) => (
          <div key={r.id} className="entity-card">
            <div className="entity-card__header">
              <div>
                <p style={{ fontWeight: 600 }}>
                  {r.reportedMember?.name ?? "Unknown member"}{" "}
                  <span className="entity-card__meta">reported by {r.reporter?.name ?? "unknown"}</span>
                </p>
                <p className="entity-card__meta">{new Date(r.createdAt).toLocaleString()}</p>
              </div>
              <span className={`badge ${STATUS_CLASS[r.status]}`}>{r.status}</span>
            </div>
            <p>{r.reason}</p>
            <div style={{ display: "flex", gap: "var(--space-2)" }}>
              <button
                type="button"
                className="btn btn--secondary"
                onClick={() => resolve(r.id, "DISMISS")}
                disabled={resolvingId === r.id}
              >
                Dismiss
              </button>
              <button
                type="button"
                className="btn btn--primary"
                onClick={() => resolve(r.id, "CONFIRM")}
                disabled={resolvingId === r.id}
              >
                Confirm — deactivate member
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
