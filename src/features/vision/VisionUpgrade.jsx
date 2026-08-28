import { useState } from "react";
import VisionBanner from "./VisionBanner.jsx";

const PLANS = [
  {
    id: "free",
    name: "FREE",
    price: "₦0",
    features: ["Swap with members", "Unlimited peer swaps", "Standard matching"],
  },
  {
    id: "pro",
    name: "PRO",
    price: "₦4,500/mo",
    features: [
      "Everything in Free",
      "Sessions with verified Professionals",
      "Priority matching",
      "Unlimited swap proposals",
      "Completion certificates",
    ],
  },
];

export default function VisionUpgrade() {
  const [selected, setSelected] = useState(null);

  return (
    <>
      <VisionBanner />
      <div className="page" style={{ textAlign: "center" }}>
        <p className="auth-card__eyebrow">Upgrade</p>
        <h1 style={{ fontSize: "var(--text-2xl)", maxWidth: 480, margin: "0 auto var(--space-3)" }}>
          Learn straight from ThoughtShare Professionals
        </h1>
        <p
          style={{ maxWidth: 440, margin: "0 auto var(--space-5)", color: "var(--color-ink-soft)" }}
        >
          Skip the swap and book a verified expert directly.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "var(--space-4)",
            maxWidth: 560,
            margin: "0 auto",
          }}
        >
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className="entity-card"
              style={{
                textAlign: "left",
                border: plan.id === "pro" ? "2px solid var(--color-accent)" : undefined,
              }}
            >
              <p style={{ fontFamily: "var(--font-mono)", fontWeight: 700 }}>{plan.name}</p>
              <p style={{ fontSize: "var(--text-2xl)", fontFamily: "var(--font-display)" }}>
                {plan.price}
              </p>
              <ul style={{ paddingLeft: "1.1em", color: "var(--color-ink-soft)" }}>
                {plan.features.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {selected === "pro" ? (
          <p className="field-hint" style={{ marginTop: "var(--space-4)" }}>
            This is a prototype and no real payment is processed.
          </p>
        ) : (
          <button
            type="button"
            className="btn btn--primary"
            style={{ marginTop: "var(--space-5)" }}
            onClick={() => setSelected("pro")}
          >
            Upgrade — ₦4,500/mo
          </button>
        )}
      </div>
    </>
  );
}
