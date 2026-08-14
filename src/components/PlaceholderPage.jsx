/**
 * Temporary stand-in for screens owned by Dev 2 / Dev 3, so every route in
 * the app is navigable from day one. Replace the corresponding import in
 * AppRoutes.jsx with the real screen component as it's built — nothing
 * else needs to change.
 */
export default function PlaceholderPage({ title, owner }) {
  return (
    <div className="page">
      <p className="auth-card__eyebrow">Coming soon · {owner}</p>
      <h1>{title}</h1>
      <p>This screen hasn&apos;t been built yet.</p>
    </div>
  );
}
