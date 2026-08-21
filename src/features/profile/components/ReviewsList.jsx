import StarRating from "../../../components/StarRating.jsx";
import "./ReviewsList.css";

/**
 * Renders reviews from GET /members/:id/reviews — reviewsApi.listForMember().
 * Each item's shape (per the mock handler) is:
 *   { id, rating, reviewText, createdAt, reviewer: { id, name, profilePictureUrl } }
 * Note `reviewer` is nested, not a flat `reviewerName` field.
 */
export default function ReviewsList({ reviews }) {
  if (!reviews || reviews.length === 0) {
    return (
      <p className="reviews-list__empty">
        No reviews yet — reviews appear here once a connection is complete.
      </p>
    );
  }

  return (
    <ul className="reviews-list">
      {reviews.map((review) => (
        <li key={review.id} className="reviews-list__item">
          <div className="reviews-list__top">
            <span className="reviews-list__reviewer">{review.reviewer.name}</span>
            <span className="reviews-list__date">
              {new Date(review.createdAt).toLocaleDateString()}
            </span>
          </div>
          <StarRating rating={review.rating} count={1} size="sm" hideLabel />
          <p className="reviews-list__text">{review.reviewText}</p>
        </li>
      ))}
    </ul>
  );
}
