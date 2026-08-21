import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import skillsApi from "../../services/skillsApi.js";
import { getErrorMessage } from "../../services/api.js";
import "./SearchPage.css";

/**
 * /search — pick a skill + mode, then navigate to /search/results with
 * both as query params. Kept as a separate screen from Search Results
 * (rather than one combined page) per AppRoutes.jsx's route table.
 */
export default function SearchPage() {
  const navigate = useNavigate();
  const [skills, setSkills] = useState([]);
  const [skillName, setSkillName] = useState("");
  const [mode, setMode] = useState("teach");
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    skillsApi
      .list({ pageSize: 100 })
      .then((res) => {
        if (!cancelled) setSkills(res.items ?? []);
      })
      .catch((err) => {
        if (!cancelled) setLoadError(getErrorMessage(err, "Couldn't load the skill library."));
      });
    return () => {
      cancelled = true;
    };
  }, []);

  function handleSubmit(e) {
    e.preventDefault();
    if (!skillName) return;
    const params = new URLSearchParams({ skill: skillName, mode });
    navigate(`/search/results?${params.toString()}`);
  }

  return (
    <div className="page search-page">
      <p className="auth-card__eyebrow">Discover</p>
      <h1>Find a skill match</h1>
      <p>Choose a skill from the ThoughtShare library, then decide whether you want to find people who teach it or people who want to learn it.</p>

      {loadError && <div className="banner banner--error">{loadError}</div>}

      <form className="search-page__form" onSubmit={handleSubmit}>
        <div className="field search-page__field">
          <label htmlFor="search-skill">Skill</label>
          <select
            id="search-skill"
            value={skillName}
            onChange={(e) => setSkillName(e.target.value)}
            required
          >
            <option value="">Choose a skill</option>
            {skills.map((s) => (
              <option key={s.id} value={s.name}>
                {s.name}
                {s.category ? ` · ${s.category}` : ""}
              </option>
            ))}
          </select>
        </div>

        <div className="search-page__mode">
          <span className="search-page__mode-label">I want to</span>
          <div className="search-page__mode-toggle">
            <button
              type="button"
              className={`btn ${mode === "teach" ? "btn--primary" : "btn--secondary"}`}
              onClick={() => setMode("teach")}
            >
              Find teachers
            </button>
            <button
              type="button"
              className={`btn ${mode === "learn" ? "btn--primary" : "btn--secondary"}`}
              onClick={() => setMode("learn")}
            >
              Find learners
            </button>
          </div>
        </div>

        <button type="submit" className="btn btn--primary btn--block" disabled={!skillName}>
          Search
        </button>
      </form>
    </div>
  );
}
