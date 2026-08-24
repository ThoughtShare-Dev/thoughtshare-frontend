/**
 * Shown at the top of every /vision/* screen. These screens are a visual
 * prototype only — fake local data, no real backend calls, no payments,
 * no messaging infrastructure. They exist to show the product direction
 * from the UI kit, not as working features of the real app.
 */
export default function VisionBanner() {
  return (
    <div
      style={{
        background: "var(--color-primary-dark)",
        color: "#fff",
        padding: "10px var(--space-4)",
        textAlign: "center",
        fontSize: "var(--text-sm)",
      }}
    >
      🔮 Prototype preview — not connected to real accounts or payments. Shows the product direction, not a working feature.
    </div>
  );
}
