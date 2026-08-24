import { useEffect, useState, useCallback } from "react";
import skillsApi from "../../services/skillsApi.js";
import { getErrorMessage } from "../../services/api.js";

export default function AdminSkillLibrary() {
  const [skills, setSkills] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [formError, setFormError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editCategory, setEditCategory] = useState("");

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await skillsApi.list({ pageSize: 100 });
      setSkills(data.items);
    } catch (err) {
      setError(getErrorMessage(err, "Couldn't load the skill library."));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleCreate(e) {
    e.preventDefault();
    if (!name.trim()) {
      setFormError("Skill name is required.");
      return;
    }
    setIsSubmitting(true);
    setFormError(null);
    try {
      await skillsApi.create(name.trim(), category.trim());
      setName("");
      setCategory("");
      load();
    } catch (err) {
      setFormError(getErrorMessage(err, "Couldn't create the skill."));
    } finally {
      setIsSubmitting(false);
    }
  }

  function startEdit(skill) {
    setEditingId(skill.id);
    setEditName(skill.name);
    setEditCategory(skill.category ?? "");
  }

  async function saveEdit(id) {
    try {
      await skillsApi.update(id, { name: editName.trim(), category: editCategory.trim() });
      setEditingId(null);
      load();
    } catch (err) {
      setError(getErrorMessage(err, "Couldn't update that skill."));
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this skill? This can't be undone.")) return;
    try {
      await skillsApi.remove(id);
      load();
    } catch (err) {
      setError(getErrorMessage(err, "Couldn't delete that skill, it may be in use."));
    }
  }

  return (
    <div className="page">
      <p className="auth-card__eyebrow">Admin</p>
      <h1 style={{ fontSize: "var(--text-2xl)", marginBottom: "var(--space-4)" }}>Skill library</h1>

      <form className="entity-card" style={{ maxWidth: 560 }} onSubmit={handleCreate}>
        <p style={{ fontWeight: 600 }}>Add a skill</p>
        {formError && (
          <div className="banner banner--error" role="alert">
            {formError}
          </div>
        )}
        <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap" }}>
          <div className="field" style={{ flex: 1, minWidth: 160 }}>
            <label htmlFor="new-skill-name">Name</label>
            <input id="new-skill-name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="field" style={{ flex: 1, minWidth: 160 }}>
            <label htmlFor="new-skill-category">Category</label>
            <input
              id="new-skill-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </div>
        </div>
        <button type="submit" className="btn btn--primary" disabled={isSubmitting}>
          {isSubmitting && <span className="spinner" />}
          {isSubmitting ? "Adding…" : "Add skill"}
        </button>
      </form>

      {error && (
        <div className="banner banner--error" role="alert" style={{ marginTop: "var(--space-4)" }}>
          {error}
        </div>
      )}

      {isLoading ? (
        <p style={{ marginTop: "var(--space-4)" }}>
          <span
            className="spinner"
            style={{ borderTopColor: "var(--color-primary)", borderColor: "rgba(39,72,232,0.25)" }}
          />{" "}
          Loading…
        </p>
      ) : (
        <div style={{ marginTop: "var(--space-4)" }}>
          {skills.map((s) => (
            <div key={s.id} className="entity-card">
              {editingId === s.id ? (
                <div
                  style={{
                    display: "flex",
                    gap: "var(--space-2)",
                    flexWrap: "wrap",
                    alignItems: "flex-end",
                  }}
                >
                  <div className="field" style={{ flex: 1, minWidth: 140 }}>
                    <label htmlFor={`edit-name-${s.id}`}>Name</label>
                    <input
                      id={`edit-name-${s.id}`}
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                    />
                  </div>
                  <div className="field" style={{ flex: 1, minWidth: 140 }}>
                    <label htmlFor={`edit-cat-${s.id}`}>Category</label>
                    <input
                      id={`edit-cat-${s.id}`}
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value)}
                    />
                  </div>
                  <button type="button" className="btn btn--primary" onClick={() => saveEdit(s.id)}>
                    Save
                  </button>
                  <button
                    type="button"
                    className="btn btn--ghost"
                    onClick={() => setEditingId(null)}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="entity-card__header">
                  <div>
                    <p style={{ fontWeight: 600 }}>{s.name}</p>
                    <p className="entity-card__meta">{s.category || "Uncategorized"}</p>
                  </div>
                  <div style={{ display: "flex", gap: "var(--space-2)" }}>
                    <button type="button" className="btn btn--ghost" onClick={() => startEdit(s)}>
                      Edit
                    </button>
                    <button
                      type="button"
                      className="btn btn--ghost"
                      onClick={() => handleDelete(s.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
