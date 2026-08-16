import { useParams } from "react-router-dom";
import { useState } from "react";
import ReviewForm from "./ReviewForm.jsx";

// Route: /connections/:id/review
// :id here is the request id for the accepted connection being reviewed —
// confirm that's what Dev 1/Dev 2 intend to pass in the URL, since the
// contract's review object calls it `requestId`, not `connectionId`.
export default function ReviewPage() {
  const { id } = useParams();
  const [saved, setSaved] = useState(false);

  if (saved) {
    return (
      <div className="page page--centered">
        <div className="banner banner--success">Thanks — your review has been saved.</div>
      </div>
    );
  }

  return (
    <div className="page">
      <h1>Leave a review</h1>
      <ReviewForm requestId={id} onSaved={() => setSaved(true)} />
    </div>
  );
}
