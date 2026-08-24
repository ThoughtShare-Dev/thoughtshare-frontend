import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import VisionBanner from "./VisionBanner.jsx";

const FAKE_MESSAGES = [
  { from: "them", text: "Hey! Saw you want to learn editing. I'm decent with Premiere." },
  { from: "me", text: "Perfect, I can walk you through pivot tables and VLOOKUP" },
  { from: "them", text: "Deal. Are you free Thursday evenings?" },
  { from: "me", text: "Thursdays work. Sending a swap proposal now." },
];

export default function VisionChat() {
  const { memberId } = useParams();
  const [proposalStatus, setProposalStatus] = useState("pending"); // pending | accepted
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState(FAKE_MESSAGES);

  function handleSend(e) {
    e.preventDefault();
    if (!draft.trim()) return;
    setMessages((prev) => [...prev, { from: "me", text: draft.trim() }]);
    setDraft("");
  }

  return (
    <>
      <VisionBanner />
      <div className="page" style={{ maxWidth: 640 }}>
        <Link
          to="/vision/feed"
          className="btn btn--ghost"
          style={{ marginBottom: "var(--space-3)" }}
        >
          ← Back to matches
        </Link>

        <div className="entity-card" style={{ border: "2px solid var(--color-accent)" }}>
          <p
            className="entity-card__meta"
            style={{ fontWeight: 700, color: "var(--color-accent-dark)" }}
          >
            SWAP PROPOSAL
          </p>
          <p>
            You teach <strong>Excel</strong> ⇄ they teach <strong>Video editing</strong>
          </p>
          <p className="entity-card__meta">3 sessions · 45 min each · Thursdays</p>
          {proposalStatus === "pending" ? (
            <div style={{ display: "flex", gap: "var(--space-2)" }}>
              <button
                type="button"
                className="btn btn--primary"
                onClick={() => setProposalStatus("accepted")}
              >
                Accept
              </button>
              <button type="button" className="btn btn--secondary">
                Counter
              </button>
            </div>
          ) : (
            <span className="badge badge--accepted">Accepted</span>
          )}
        </div>

        <div
          style={{
            marginTop: "var(--space-4)",
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-2)",
          }}
        >
          {messages.map((m, i) => (
            <div
              key={i}
              style={{
                alignSelf: m.from === "me" ? "flex-end" : "flex-start",
                background: m.from === "me" ? "var(--color-primary)" : "var(--color-surface)",
                color: m.from === "me" ? "#fff" : "var(--color-ink)",
                border: m.from === "me" ? "none" : "1px solid var(--color-border)",
                borderRadius: "var(--radius-md)",
                padding: "8px 14px",
                maxWidth: "75%",
              }}
            >
              {m.text}
            </div>
          ))}
        </div>

        <form
          onSubmit={handleSend}
          style={{ display: "flex", gap: "var(--space-2)", marginTop: "var(--space-4)" }}
        >
          <input
            className="field"
            style={{ flex: 1, margin: 0 }}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={`Message${memberId ? "" : "…"}`}
          />
          <button type="submit" className="btn btn--primary">
            Send
          </button>
        </form>
      </div>
    </>
  );
}
