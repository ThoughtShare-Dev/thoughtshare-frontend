import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import requestsApi from "../../services/requestsApi.js";
import reviewsApi from "../../services/reviewsApi.js";
import { getErrorMessage } from "../../services/api.js";

const MAX_EDITS = 2;

function StarPicker({ value, onChange, disabled }) {
  return (
    <div role="radiogroup" aria-label="Rating" style={{ display: "flex", gap: "var(--space-1)" }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} star${n > 1 ? "s" : ""}`}
          onClick={() => onChange(n)}
          disabled={disabled}
          style={{
            background: "none",
            border: "none",
            cursor: disabled ? "default" : "pointer",
            fontSize: "1.75rem",
            color: n <= value ? "var(--color-accent)" : "var(--color-border-strong)",
            lineHeight: 1,
            padding: 0,
          }}
        >
          ★
        </button>
      ))}
    </div>
  );
}

export default function Review() {
  const { id: requestId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [request, setRequest] = useState(null);
  const [existingReview, setExistingReview] = useState(null);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const all = await requestsApi.list();
        const req = all.find((r) => r.id === requestId);
        if (!req) {
          if (!cancelled) setError("This connection couldn't be found.");
          return;
        }
        if (!cancelled) setRequest(req);

        const counterpart = req.sender.id === user.id ? req.recipient : req.sender;
        const theirReviews = await reviewsApi.listForMember(counterpart.id);
        const mine = theirReviews.find((r) => r.reviewer.id === user.id);
        // listForMember doesn't include requestId on each item in our shape,
        // so we match on reviewer as a best-effort — fine for one review per pair in practice.
        if (mine && !cancelled) {
          setExistingReview(mine);
          setRating(mine.rating);
          setReviewText(mine.reviewText ?? "");
        }
      } catch (err) {
        if (!cancelled) setError(getErrorMessage(err, "Couldn't load this connection."));
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    if (user) load();
    return () => {
      cancelled = true;
    };
  }, [requestId, user]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (rating < 1) {
      setError("Pick a rating first.");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      if (existingReview) {
        await reviewsApi.update(existingReview.id, { rating, reviewText });
      } else {
        await reviewsApi.create(requestId, rating, reviewText);
      }
      setSaved(true);
    } catch (err) {
      setError(getErrorMessage(err, "Couldn't save the review."));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="page">
        <span className="spinner" style={{ borderTopColor: "var(--color-primary)", borderColor: "rgba(39,72,232,0.25)" }} />
      </div>
    );
  }

  if (error && !request) {
    return (
      <div className="page">
        <div className="banner banner--error" role="alert">
          {error}
        </div>
      </div>
    );
  }

  const editCount = existingReview?.editCount ?? 0;
  const editLimitReached = existingReview && editCount >= MAX_EDITS;
  const counterpart = request && (request.sender.id === user.id ? request.recipient : request.sender);

  if (saved) {
    return (
      <div className="page--centered">
        <div className="auth-card">
          <div className="banner banner--success">Review saved.</div>
          <button type="button" className="btn btn--primary btn--block" onClick={() => navigate("/requests")}>
            Back to requests
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page--centered">
      <form className="auth-card" onSubmit={handleSubmit}>
        <p className="auth-card__eyebrow">{existingReview ? "Edit review" : "Leave a review"}</p>
        <h1 style={{ fontSize: "var(--text-xl)" }}>{counterpart?.name}</h1>

        {error && (
          <div className="banner banner--error" role="alert">
            {error}
          </div>
        )}

        {editLimitReached ? (
          <p className="field-hint">This review has reached the maximum number of edits and can no longer be changed.</p>
        ) : (
          <>
            <div className="field">
              <label>Rating</label>
              <StarPicker value={rating} onChange={setRating} disabled={isSubmitting} />
            </div>

            <div className="field">
              <label htmlFor="review-text">What was the experience like?</label>
              <textarea
                id="review-text"
                rows={5}
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            {existingReview && (
              <p className="field-hint">
                {MAX_EDITS - editCount} edit{MAX_EDITS - editCount === 1 ? "" : "s"} remaining after this one.
              </p>
            )}

            <button type="submit" className="btn btn--primary btn--block" disabled={isSubmitting}>
              {isSubmitting && <span className="spinner" />}
              {isSubmitting ? "Saving…" : existingReview ? "Save changes" : "Submit review"}
            </button>
          </>
        )}
      </form>
    </div>
  );
}
