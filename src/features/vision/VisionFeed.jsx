import { useState } from "react";
import { Link } from "react-router-dom";
import VisionBanner from "./VisionBanner.jsx";

const FAKE_MATCHES = [
  {
    id: "1",
    name: "Tunde Alabi",
    location: "Lagos · Active today",
    match: 94,
    quote: "I've edited for 3 YouTube channels. Happy to trade for spreadsheet help!",
    teaches: "Video editing",
    wants: "Excel",
    isPro: false,
  },
  {
    id: "2",
    name: "Zainab Bello",
    location: "Kano · New member",
    match: 81,
    quote: "Freelance editor for 2 years. Want to finally understand pivot tables.",
    teaches: "Editing",
    wants: "Excel",
    isPro: false,
  },
  {
    id: "3",
    name: "Kelechi Obi",
    location: "Abuja · Verified pro",
    match: 76,
    quote: "ThoughtShare Professional: Adobe Premiere & DaVinci Resolve.",
    teaches: "Editing",
    wants: null,
    isPro: true,
  },
];

export default function VisionFeed() {
  const [mode, setMode] = useState("learn");

  return (
    <>
      <VisionBanner />
      <div className="page">
        <p className="auth-card__eyebrow">Matches for you</p>
        <div
          style={{
            display: "flex",
            gap: "var(--space-2)",
            marginBottom: "var(--space-4)",
            flexWrap: "wrap",
          }}
        >
          <button
            type="button"
            className={`btn ${mode === "learn" ? "btn--primary" : "btn--secondary"}`}
            onClick={() => setMode("learn")}
          >
            Learn: Video editing
          </button>
          <button
            type="button"
            className={`btn ${mode === "nearby" ? "btn--primary" : "btn--secondary"}`}
            onClick={() => setMode("nearby")}
          >
            Nearby
          </button>
          <button
            type="button"
            className={`btn ${mode === "pro" ? "btn--primary" : "btn--secondary"}`}
            onClick={() => setMode("pro")}
          >
            Verified pros
          </button>
        </div>

        <div style={{ display: "grid", gap: "var(--space-3)" }}>
          {FAKE_MATCHES.map((m) => (
            <div key={m.id} className="entity-card">
              <div className="entity-card__header">
                <div>
                  <p style={{ fontWeight: 600 }}>{m.name}</p>
                  <p className="entity-card__meta">{m.location}</p>
                </div>
                <span className="badge badge--accepted">{m.match}% match</span>
              </div>
              <p>&quot;{m.quote}&quot;</p>
              <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap" }}>
                <span className="badge badge--pending">Teaches {m.teaches}</span>
                {m.wants && <span className="badge badge--declined">Wants {m.wants}</span>}
                {m.isPro && <span className="badge badge--pending">PRO</span>}
              </div>
              {m.isPro ? (
                <Link to="/vision/upgrade" className="btn btn--primary">
                  Book instead
                </Link>
              ) : (
                <Link to={`/vision/chat/${m.id}`} className="btn btn--primary">
                  Propose a swap
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
