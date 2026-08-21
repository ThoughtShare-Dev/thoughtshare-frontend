import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../../hooks/useAuth.js";

export default function Settings() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    setIsLoggingOut(true);
    await logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="page">
      <p className="auth-card__eyebrow">Settings</p>
      <h1 style={{ fontSize: "var(--text-2xl)", marginBottom: "var(--space-4)" }}>
        Account settings
      </h1>

      <div className="entity-card" style={{ maxWidth: 480 }}>
        <div>
          <p className="entity-card__meta">Name</p>
          <p style={{ fontWeight: 600 }}>{user?.name}</p>
        </div>
        <div>
          <p className="entity-card__meta">Email</p>
          <p>{user?.email}</p>
        </div>
        <p className="field-hint">
          To change your name, bio, or teaching/learning skills, go to{" "}
          <Link to="/profile/edit">Edit profile</Link>.
        </p>
      </div>

      <div className="entity-card" style={{ maxWidth: 480, marginTop: "var(--space-4)" }}>
        <p style={{ fontWeight: 600 }}>Log out</p>
        <p className="entity-card__meta">
          You&apos;ll need to log in again to access your account.
        </p>
        <button
          type="button"
          className="btn btn--secondary"
          onClick={handleLogout}
          disabled={isLoggingOut}
        >
          {isLoggingOut && <span className="spinner" />}
          {isLoggingOut ? "Logging out…" : "Log out"}
        </button>
      </div>
    </div>
  );
}
