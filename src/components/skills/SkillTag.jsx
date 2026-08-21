import "./SkillTag.css";

/**
 * Displays one skill as a pill. Uses global.css's --color-accent (Teach
 * Amber) / --color-primary (Signal Blue) tokens — the same "amber=teach,
 * blue=learn" grammar Dev 1 documented in global.css's header comment, so
 * this stays visually consistent with the rest of the app.
 *
 * `note` (context/reason text) shows as a native tooltip — fine for MVP.
 * `onRemove`, if passed, shows a remove (×) button — used only in the
 * (currently read-only, see EditProfilePage) skill list; omitted on
 * read-only displays like search results or public profiles.
 */
export default function SkillTag({ label, variant, note, onRemove }) {
  return (
    <span className={`skill-tag skill-tag--${variant}`} title={note}>
      {label}
      {onRemove && (
        <button
          type="button"
          className="skill-tag__remove"
          onClick={onRemove}
          aria-label={`Remove ${label}`}
        >
          ×
        </button>
      )}
    </span>
  );
}
