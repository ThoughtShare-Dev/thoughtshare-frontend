import "./StarRating.css";

/**
 * Read-only star rating. avgRating/ratingCount come straight off the
 * member object the API returns (memberPublicView / memberMeView / search
 * results all include them) — no client-side calculation.
 */
export default function StarRating({ rating, count, size = "sm", hideLabel = false }) {
  if (!count) {
    return <span className="star-rating star-rating--empty">No reviews yet</span>;
  }

  return (
    <span className={`star-rating star-rating--${size}`}>
      <span className="star-rating__stars" aria-hidden="true">
        {Array.from({ length: 5 }).map((_, i) => (
          <span key={i} className={i < Math.round(rating) ? "star star--filled" : "star"}>
            ★
          </span>
        ))}
      </span>
      {!hideLabel && (
        <span className="star-rating__label">
          {rating.toFixed(1)} ({count})
        </span>
      )}
    </span>
  );
}
