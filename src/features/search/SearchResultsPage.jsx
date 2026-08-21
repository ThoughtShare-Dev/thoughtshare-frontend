import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import membersApi from "../../services/membersApi.js";
import { getErrorMessage } from "../../services/api.js";
import MemberCard from "./components/MemberCard.jsx";
import "./SearchResultsPage.css";

/**
 * /search/results?skill=Excel&mode=teach
 * A skill param is required by the backend (400 SKILL_NOT_FOUND if
 * missing/invalid — see membersApi.search / GET /search), so this page
 * assumes it always arrives via SearchPage's form, not typed directly.
 */
export default function SearchResultsPage() {
  const [params] = useSearchParams();
  const skill = params.get("skill") ?? "";
  const mode = params.get("mode") === "learn" ? "learn" : "teach";

  const [results, setResults] = useState(null);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!skill) {
      setIsLoading(false);
      setError("No skill selected — go back to Search and pick one.");
      return;
    }
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    membersApi
      .search({ skill, mode })
      .then((data) => {
        if (cancelled) return;
        setResults(data.results ?? []);
        setTotal(data.total ?? 0);
      })
      .catch((err) => {
        if (!cancelled) setError(getErrorMessage(err, "Couldn't load search results."));
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [skill, mode]);

  return (
    <div className="page">
      <p className="auth-card__eyebrow">Results</p>
      <h1>{skill || "Search"}</h1>
      <Link to="/search" className="search-results__back">
        &larr; New search
      </Link>

      {error && <div className="banner banner--error">{error}</div>}

      {isLoading && <span className="spinner-standalone" />}

      {!isLoading && results && (
        <>
          <p className="search-results__count">
            {total} match{total === 1 ? "" : "es"}
          </p>
          {results.length > 0 ? (
            <ul className="search-results__list">
              {results.map((member) => (
                <MemberCard key={member.id} member={member} />
              ))}
            </ul>
          ) : (
            <div className="search-results__empty">
              No one {mode === "teach" ? "teaches" : "wants to learn"} {skill} yet.
            </div>
          )}
        </>
      )}
    </div>
  );
}
