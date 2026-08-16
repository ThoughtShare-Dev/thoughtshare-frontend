import { useState } from "react";
import reviewsApi, { getErrorMessage, getErrorField } from "../../services/reviewsApi.js";

/**
 * Create or edit a review.
 *
 * Pass `requestId` to create a new review (must be an ACCEPTED request).
 * Pass `existingReview` instead to edit one — the contract caps edits at 2
 * (`editCount`), so this form self-disables once that limit's hit rather
 * than letting the user submit into a guaranteed 403 EDIT_LIMIT_REACHED.
 */
export default function ReviewForm({ requestId, existingReview, onSaved }) {
  const isEditing = Boolean(existingReview);
  const [rating, setRating] = useState(existingReview?.rating ?? 5);
  const [reviewText, setReviewText] = useState(existingReview?.reviewText ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [fieldError, setFieldError] = useState(null);

  const editCount = existingReview?.editCount ?? 0;
  const editLimitReached = isEditing && editCount >= 2;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setFieldError(null);
    try {
      const res = isEditing
        ? await reviewsApi.update(existingReview.id, { rating, reviewText })
        : await reviewsApi.create({ requestId, rating, reviewText });
      onSaved?.(res.data.data);
    } catch (err) {
      setError(getErrorMessage(err));
      setFieldError(getErrorField(err));
    } finally {
      setIsSaving(false);
    }
  };

  if (editLimitReached) {
    return (
      <div className="banner banner--error">
        This review has reached its edit limit and can't be changed again.
      </div>
    );
  }

  return (
    <form className="review-form" onSubmit={handleSubmit}>
      <div className="field">
        <label htmlFor="rating">Rating</label>
        <div className="review-form__stars" role="radiogroup" aria-label="Rating">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              type="button"
              key={n}
              className={`review-form__star ${n <= rating ? "review-form__star--filled" : ""}`}
              onClick={() => setRating(n)}
              aria-label={`${n} star${n > 1 ? "s" : ""}`}
            >
              ★
            </button>
          ))}
        </div>
      </div>

      <div className={`field ${fieldError === "reviewText" ? "field--error" : ""}`}>
        <label htmlFor="reviewText">Your review</label>
        <textarea
          id="reviewText"
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          rows={4}
          placeholder="What was it like learning or teaching with this person?"
          required
        />
      </div>

      {error && <div className="banner banner--error">{error}</div>}

      <button className="btn btn--primary btn--block" type="submit" disabled={isSaving}>
        {isSaving ? <span className="spinner" /> : isEditing ? "Save changes" : "Submit review"}
      </button>

      {isEditing && (
        <p className="review-form__edit-note">
          {2 - editCount} edit{2 - editCount === 1 ? "" : "s"} remaining
        </p>
      )}
    </form>
  );
}
