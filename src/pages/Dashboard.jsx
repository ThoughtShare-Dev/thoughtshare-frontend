import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";

const actions = [
  {
    to: "/search",
    title: "Search for a skill",
    body: "Look through the skill library and find someone who teaches what you want to learn.",
  },
  {
    to: "/requests",
    title: "Check your requests",
    body: "See who's asked to learn from you, and follow up on requests you've sent out.",
  },
  {
    to: "/notifications",
    title: "Catch up on notifications",
    body: "New requests, acceptances, and updates land here, check in whenever you like.",
  },
  {
    to: "/profile",
    title: "Your profile",
    body: "See how your profile looks to others, and review what you're currently teaching and learning.",
  },
];

export default function Dashboard() {
  const { user } = useAuth();
  const firstName = user?.name?.split(" ")[0] || "there";

  return (
    <div className="page">
      <p className="auth-card__eyebrow">Dashboard</p>
      <h1 style={{ fontSize: "var(--text-2xl)", marginBottom: "var(--space-2)" }}>
        Welcome back, {firstName}
      </h1>
      <p style={{ color: "var(--color-ink-soft)", marginBottom: "var(--space-5)", maxWidth: 520 }}>
        Here is what you can do today,search for a new skill to learn, keep an eye on your requests,
        or catch up on anything new.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "var(--space-4)",
        }}
      >
        {actions.map((a) => (
          <Link
            key={a.to}
            to={a.to}
            className="entity-card"
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <p style={{ fontWeight: 600, fontSize: "var(--text-md)" }}>{a.title}</p>
            <p style={{ color: "var(--color-ink-soft)" }}>{a.body}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
