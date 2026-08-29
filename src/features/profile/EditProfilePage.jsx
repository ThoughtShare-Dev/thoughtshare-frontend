import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import membersApi from "../../services/membersApi.js";
import skillsApi from "../../services/skillsApi.js";
import { getErrorMessage, getErrorField } from "../../services/api.js";
import SkillTag from "../../components/skills/SkillTag.jsx";
import "./EditProfilePage.css";

const CONTACT_TYPES = ["EMAIL", "WHATSAPP", "PHONE", "INSTAGRAM"];
const MAX_TEACHING_SKILLS = 5;
const MAX_LEARNING_SKILLS = 6;

/**
 * /profile/edit
 *
 * Two independent save paths, matching how the API is actually shaped:
 *  - name/bio/contact go through PUT /members/me (handleSubmit below)
 *  - each teaching/learning skill is its own POST/DELETE against
 *    /members/me/teaching-skills and /members/me/learning-skills
 *    (API_CONTRACT.md §9.3) — adding or removing a skill saves
 *    immediately, it isn't batched into the profile form's Save button.
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

  // Local copies so add/remove feel instant without waiting on a full
  // /auth/me refetch — see the AuthContext note further down.
  const [teachingSkills, setTeachingSkills] = useState(user?.teachingSkills ?? []);
  const [learningSkills, setLearningSkills] = useState(user?.learningSkills ?? []);

  const [skillLibrary, setSkillLibrary] = useState([]);
  const [skillLoadError, setSkillLoadError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    skillsApi
      .list({ pageSize: 100 })
      .then((res) => {
        if (!cancelled) setSkillLibrary(res.items ?? []);
      })
      .catch((err) => {
        if (!cancelled) setSkillLoadError(getErrorMessage(err, "Couldn't load the skill library."));
      });
    return () => {
      cancelled = true;
    };
  }, []);

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

      {skillLoadError && <div className="banner banner--error">{skillLoadError}</div>}

      <SkillSection
        title="Skills you teach"
        variant="teach"
        max={MAX_TEACHING_SKILLS}
        skills={teachingSkills}
        skillLibrary={skillLibrary}
        noteLabel="Context"
        notePlaceholder="e.g. Five years building financial models."
        onAdd={async (skillId, note) => {
          const created = await membersApi.addTeachingSkill({ skillId, contextNote: note });
          setTeachingSkills((prev) => [...prev, created]);
        }}
        onRemove={async (id) => {
          await membersApi.removeTeachingSkill(id);
          setTeachingSkills((prev) => prev.filter((s) => s.id !== id));
        }}
      />

      <SkillSection
        title="Skills you want to learn"
        variant="learn"
        max={MAX_LEARNING_SKILLS}
        skills={learningSkills}
        skillLibrary={skillLibrary}
        noteLabel="Reason"
        notePlaceholder="e.g. Want to create educational content."
        onAdd={async (skillId, note) => {
          const created = await membersApi.addLearningSkill({ skillId, reasonNote: note });
          setLearningSkills((prev) => [...prev, created]);
        }}
        onRemove={async (id) => {
          await membersApi.removeLearningSkill(id);
          setLearningSkills((prev) => prev.filter((s) => s.id !== id));
        }}
      />
    </div>
  );
}

/**
 * One teach/learn skill list with its own add form. Kept local to this
 * file (not promoted to components/) since nothing else needs it —
 * promote it later if that changes.
 */
function SkillSection({
  title,
  variant,
  max,
  skills,
  skillLibrary,
  noteLabel,
  notePlaceholder,
  onAdd,
  onRemove,
}) {
  const [skillId, setSkillId] = useState("");
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const atMax = skills.length >= max;
  const noteKey = variant === "teach" ? "contextNote" : "reasonNote";

  async function handleAdd(e) {
    e.preventDefault();
    setError(null);
    if (!skillId) {
      setError("Pick a skill.");
      return;
    }
    if (!note.trim()) {
      setError(`${noteLabel} is required.`);
      return;
    }
    setIsSubmitting(true);
    try {
      await onAdd(skillId, note.trim());
      setSkillId("");
      setNote("");
    } catch (err) {
      setError(getErrorMessage(err, "Couldn't add that skill."));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleRemove(id) {
    setError(null);
    try {
      await onRemove(id);
    } catch (err) {
      setError(getErrorMessage(err, "Couldn't remove that skill."));
    }
  }

  return (
    <section className="edit-profile-page__skills-section">
      <div className="edit-profile-page__skills-header">
        <h2>{title}</h2>
        <span className="field-hint">
          {skills.length}/{max}
        </span>
      </div>

      {error && <div className="banner banner--error">{error}</div>}

      <div className="edit-profile-page__skills">
        {skills.length === 0 && <p className="field-hint">Nothing added yet.</p>}
        {skills.map((s) => (
          <SkillTag
            key={s.id}
            label={s.name}
            variant={variant}
            note={s[noteKey]}
            onRemove={() => handleRemove(s.id)}
          />
        ))}
      </div>

      {atMax ? (
        <p className="field-hint">Maximum reached ({max}/{max}) — remove one to add another.</p>
      ) : (
        <form className="edit-profile-page__skill-form" onSubmit={handleAdd}>
          <div className="field">
            <label>Skill</label>
            <select value={skillId} onChange={(e) => setSkillId(e.target.value)}>
              <option value="">Choose a skill</option>
              {skillLibrary.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                  {s.category ? ` · ${s.category}` : ""}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>{noteLabel}</label>
            <textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder={notePlaceholder} />
          </div>
          <button type="submit" className="btn btn--secondary" disabled={isSubmitting}>
            {isSubmitting ? "Adding…" : `Add ${variant === "teach" ? "teaching" : "learning"} skill`}
          </button>
        </form>
      )}
    </section>
  );
}
