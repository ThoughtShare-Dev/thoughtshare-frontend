import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import skillsApi from "../services/skillsApi.js";

const steps = [
  ["1", "Create your profile", "Sign up in a minute."],
  ["2", "Add your skills", "What you can teach, what you want to learn."],
  ["3", "Find a match", "Search the skill library for someone who fits."],
  ["4", "Send a request", "They accept, and you're connected."],
];

export default function Landing() {
  const [skillCount, setSkillCount] = useState(null);

  useEffect(() => {
    let cancelled = false;
    // Real, live number — not a made-up stat. Fails silently if the
    // skills endpoint isn't up yet; the page works fine without it.
    skillsApi
      .list({ pageSize: 1 })
      .then((data) => {
        if (!cancelled) setSkillCount(data.total);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="page">
      <section style={{ padding: "var(--space-7) 0", textAlign: "center" }}>
        <p className="auth-card__eyebrow" style={{ textAlign: "center" }}>
          Peer-to-peer skill learning
        </p>
        <h1 style={{ fontSize: "var(--text-3xl)", maxWidth: 640, margin: "0 auto var(--space-4)" }}>
          Share what you know. Learn what you need.
        </h1>
        <p
          style={{ maxWidth: 480, margin: "0 auto var(--space-5)", color: "var(--color-ink-soft)" }}
        >
          Free peer-to-peer skill trading. No fees, no fluff.
        </p>
        <div
          style={{
            display: "flex",
            gap: "var(--space-3)",
            justifyContent: "center",
            marginBottom: "var(--space-5)",
          }}
        >
          <Link to="/register" className="btn btn--primary">
            Get started
          </Link>
          <Link to="/login" className="btn btn--secondary">
            Log in
          </Link>
        </div>

        {skillCount !== null && (
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              fontFamily: "var(--font-mono)",
              fontSize: "var(--text-sm)",
              color: "var(--color-ink-soft)",
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "var(--color-accent)",
                display: "inline-block",
              }}
            />
            {skillCount} skill{skillCount === 1 ? "" : "s"} in the library, ready to search
          </div>
        )}
      </section>

      <section style={{ marginTop: "var(--space-6)" }}>
        <h2
          style={{
            fontSize: "var(--text-lg)",
            textAlign: "center",
            marginBottom: "var(--space-4)",
          }}
        >
          How it works
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "var(--space-4)",
          }}
        >
          {steps.map(([num, title, body]) => (
            <div
              key={num}
              style={{
                background: "var(--color-surface)",
                borderRadius: "var(--radius-md)",
                padding: "var(--space-4)",
                boxShadow: "var(--shadow-flat)",
              }}
            >
              <p
                style={{
                  fontFamily: "var(--font-mono)",
                  color: "var(--color-accent-dark)",
                  fontWeight: 700,
                  marginBottom: "4px",
                }}
              >
                {num}
              </p>
              <h3 style={{ fontSize: "var(--text-md)" }}>{title}</h3>
              <p style={{ color: "var(--color-ink-soft)" }}>{body}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
