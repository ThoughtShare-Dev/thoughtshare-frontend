import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div className="page">
      <section style={{ padding: "var(--space-7) 0", textAlign: "center" }}>
        <p className="auth-card__eyebrow" style={{ textAlign: "center" }}>
          Peer-to-peer skill learning
        </p>
        <h1 style={{ fontSize: "var(--text-3xl)", maxWidth: 640, margin: "0 auto var(--space-4)" }}>
          Find someone who can teach you. Teach someone who wants to learn.
        </h1>
        <p style={{ maxWidth: 520, margin: "0 auto var(--space-5)" }}>
          Search a skill, connect with a member who knows it, and take the conversation from there.
        </p>
        <div style={{ display: "flex", gap: "var(--space-3)", justifyContent: "center" }}>
          <Link to="/register" className="btn btn--primary">
            Get started
          </Link>
          <Link to="/login" className="btn btn--secondary">
            Log in
          </Link>
        </div>
      </section>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "var(--space-4)",
          marginTop: "var(--space-6)",
        }}
      >
        {[
          ["Search", "Look up a skill from our library — Excel, public speaking, whatever you're after."],
          ["Request", "Send a learning request to a highly-rated member who teaches it."],
          ["Learn", "Once they accept, you'll see how to reach them and take it from there."],
        ].map(([title, body]) => (
          <div
            key={title}
            style={{
              background: "var(--color-surface)",
              borderRadius: "var(--radius-md)",
              padding: "var(--space-4)",
              boxShadow: "var(--shadow-flat)",
            }}
          >
            <h3>{title}</h3>
            <p>{body}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
