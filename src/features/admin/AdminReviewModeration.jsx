import { useEffect, useState, useCallback } from "react";
import adminApi from "../../services/adminApi.js";
import { getErrorMessage } from "../../services/api.js";

export default function AdminReviewModeration() {
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [removingId, setRemovingId] = useState(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await adminApi.reviews.list({ pageSize: 100 });
      setReviews(data.items);
    } catch (err) {
      setError(getErrorMessage(err, "Couldn't load reviews."));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleRemove(id) {
    if (!window.confirm("Remove this review? This can't be undone.")) return;
    setRemovingId(id);
    try {
      await adminApi.reviews.remove(id);
      setReviews((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      setError(getErrorMessage(err, "Couldn't remove that review."));
    } finally {
      setRemovingId(null);
    }
  }

  return (
    <div className="page">
      <p className="auth-card__eyebrow">Admin</p>
      <h1 style={{ fontSize: "var(--text-2xl)", marginBottom: "var(--space-4)" }}>Review moderation</h1>

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
      ) : reviews.length === 0 ? (
        <div className="empty-state">No reviews yet.</div>
      ) : (
        reviews.map((r) => (
          <div key={r.id} className="entity-card">
            <div className="entity-card__header">
              <div>
                <p style={{ fontWeight: 600 }}>
                  {r.reviewer?.name ?? "Unknown"} → {r.reviewee?.name ?? "Unknown"}
                </p>
                <p className="entity-card__meta">
                  {"★".repeat(r.rating)}
                  {"☆".repeat(5 - r.rating)} · {new Date(r.createdAt).toLocaleDateString()}
                </p>
              </div>
              <button
                type="button"
                className="btn btn--ghost"
                onClick={() => handleRemove(r.id)}
                disabled={removingId === r.id}
              >
                Remove
              </button>
            </div>
            {r.reviewText && <p>{r.reviewText}</p>}
          </div>
        ))
      )}
    </div>
  );
}
