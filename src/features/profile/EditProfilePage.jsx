import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import membersApi from "../../services/membersApi.js";
import { getErrorMessage, getErrorField } from "../../services/api.js";
import SkillTag from "../../components/skills/SkillTag.jsx";
import "./EditProfilePage.css";

const CONTACT_TYPES = ["EMAIL", "WHATSAPP", "PHONE", "INSTAGRAM"];

/**
 * /profile/edit — only edits fields PUT /members/me actually accepts:
 * name, bio, preferredContactType, preferredContactValue. See
 * membersApi.js and the mock handler for /members/me — there is currently
 * no endpoint to add/remove teaching or learning skills, so that section
 * is shown read-only with an explicit note rather than a form that would
 * silently fail to save. Flag to backend/Dev 1 if skill editing needs to
 * ship before demo — see the handoff notes.
 */
export default function EditProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name ?? "");
  const [bio, setBio] = useState(user?.bio ?? "");
  const [contactType, setContactType] = useState(user?.preferredContactType ?? "EMAIL");
  const [contactValue, setContactValue] = useState(user?.preferredContactValue ?? "");

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [fieldError, setFieldError] = useState(null);

  if (!user) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setFieldError(null);
    setIsSaving(true);
    try {
      await membersApi.updateMe({
        name,
        bio,
        preferredContactType: contactType,
        preferredContactValue: contactValue,
      });
      // AuthContext caches `user` from the initial /auth/me call and
      // doesn't currently expose a way to refresh it after an edit (see
      // handoff notes — worth asking Dev 1 to add one). A full reload on
      // navigate is a safe stopgap: it re-triggers AuthContext's session
      // restore, which re-fetches /auth/me, so /profile shows the saved
      // changes rather than stale cached data.
      navigate("/profile");
      window.location.reload();
    } catch (err) {
      setError(getErrorMessage(err, "Couldn't save your profile."));
      setFieldError(getErrorField(err));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="page edit-profile-page">
      <p className="auth-card__eyebrow">Edit profile</p>
      <h1>Update your details</h1>

      {error && <div className="banner banner--error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className={`field ${fieldError === "name" ? "field--error" : ""}`}>
          <label htmlFor="edit-name">Name</label>
          <input id="edit-name" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>

        <div className={`field ${fieldError === "bio" ? "field--error" : ""}`}>
          <label htmlFor="edit-bio">Bio</label>
          <textarea
            id="edit-bio"
            rows={4}
            maxLength={500}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />
          <p className="field-hint">{bio.length}/500</p>
        </div>

        <div className="edit-profile-page__contact-row">
          <div
            className={`field ${fieldError === "preferredContactType" ? "field--error" : ""}`}
          >
            <label htmlFor="edit-contact-type">Preferred contact method</label>
            <select
              id="edit-contact-type"
              value={contactType}
              onChange={(e) => setContactType(e.target.value)}
            >
              {CONTACT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="edit-contact-value">Contact value</label>
            <input
              id="edit-contact-value"
              value={contactValue}
              onChange={(e) => setContactValue(e.target.value)}
              placeholder="e.g. +2348000000000"
            />
          </div>
        </div>

        <div className="edit-profile-page__actions">
          <button type="submit" className="btn btn--primary" disabled={isSaving}>
            {isSaving && <span className="spinner" />}
            {isSaving ? "Saving…" : "Save changes"}
          </button>
          <button
            type="button"
            className="btn btn--ghost"
            onClick={() => navigate("/profile")}
            disabled={isSaving}
          >
            Cancel
          </button>
        </div>
      </form>

      <section className="edit-profile-page__skills-note">
        <h2>Skills</h2>
        <p className="field-hint">
          Adding or removing skills isn&apos;t supported by the API yet — this list is read-only
          for now. Flag to backend if it needs to ship before demo.
        </p>
        <div className="edit-profile-page__skills">
          {(user.teachingSkills ?? []).map((s) => (
            <SkillTag key={s.skillId} label={s.name} variant="teach" note={s.contextNote} />
          ))}
          {(user.learningSkills ?? []).map((s) => (
            <SkillTag key={s.skillId} label={s.name} variant="learn" note={s.reasonNote} />
          ))}
        </div>
      </section>
    </div>
  );
}
