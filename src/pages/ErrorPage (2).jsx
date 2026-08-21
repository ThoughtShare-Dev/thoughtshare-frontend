import { Link } from "react-router-dom";

const COPY = {
  404: {
    title: "Page not found",
    body: "The page you're looking for doesn't exist or may have moved.",
  },
  403: {
    title: "Access denied",
    body: "You don't have permission to view this page.",
  },
  generic: {
    title: "Something went wrong",
    body: "An unexpected error occurred. Try going back to your dashboard.",
  },
};

export default function ErrorPage({ code = "generic" }) {
  const copy = COPY[code] ?? COPY.generic;

  return (
    <div className="page--centered">
      <div style={{ textAlign: "center", maxWidth: 420 }}>
        {code !== "generic" && (
          <p className="auth-card__eyebrow" style={{ textAlign: "center" }}>
            Error {code}
          </p>
        )}
        <h1>{copy.title}</h1>
        <p>{copy.body}</p>
        <Link to="/dashboard" className="btn btn--primary">
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
