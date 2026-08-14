import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import "./Navbar.css";

const memberLinks = [
  { to: "/search", label: "Search" },
  { to: "/requests", label: "Requests" },
  { to: "/notifications", label: "Notifications" },
];

function Wordmark() {
  return (
    <Link to="/" className="navbar__brand" aria-label="ThoughtShare home">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M12 3c-4.4 0-8 3.2-8 7.2 0 2.5 1.4 4.7 3.6 6V19a1 1 0 0 0 1.5.87L11.9 18h.2c4.4 0 8-3.2 8-7.2S16.4 3 12 3Z"
          fill="var(--color-primary)"
        />
        <circle cx="9" cy="10.2" r="1.1" fill="var(--color-bg)" />
        <circle cx="12" cy="10.2" r="1.1" fill="var(--color-bg)" />
        <circle cx="15" cy="10.2" r="1.1" fill="var(--color-bg)" />
      </svg>
      <span className="navbar__wordmark">ThoughtShare</span>
    </Link>
  );
}

export default function Navbar() {
  const { isAuthenticated, isLoading, user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  async function handleLogout() {
    setProfileMenuOpen(false);
    setMenuOpen(false);
    await logout();
    navigate("/login");
  }

  const isAdmin = user?.role === "admin";

  return (
    <header className="navbar">
      <div className="navbar__inner">
        <Wordmark />

        {!isLoading && isAuthenticated && (
          <button
            className="navbar__toggle"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span />
            <span />
            <span />
          </button>
        )}

        {isLoading ? null : isAuthenticated ? (
          <nav className={`navbar__links ${menuOpen ? "navbar__links--open" : ""}`} aria-label="Primary">
            {memberLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) => `navbar__link ${isActive ? "navbar__link--active" : ""}`}
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </NavLink>
            ))}
            {isAdmin && (
              <NavLink
                to="/admin/reports"
                className={({ isActive }) => `navbar__link ${isActive ? "navbar__link--active" : ""}`}
                onClick={() => setMenuOpen(false)}
              >
                Admin
              </NavLink>
            )}

            <div className="navbar__profile">
              <button
                className="navbar__profile-trigger"
                onClick={() => setProfileMenuOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={profileMenuOpen}
              >
                <span className="navbar__avatar" aria-hidden="true">
                  {(user?.name || user?.email || "?").charAt(0).toUpperCase()}
                </span>
              </button>
              {profileMenuOpen && (
                <div className="navbar__dropdown" role="menu">
                  <Link to="/profile" role="menuitem" onClick={() => setProfileMenuOpen(false)}>
                    My Profile
                  </Link>
                  <Link to="/settings" role="menuitem" onClick={() => setProfileMenuOpen(false)}>
                    Settings
                  </Link>
                  <button role="menuitem" onClick={handleLogout}>
                    Log out
                  </button>
                </div>
              )}
            </div>
          </nav>
        ) : (
          <nav className="navbar__links" aria-label="Primary">
            <Link to="/login" className="navbar__link">
              Log in
            </Link>
            <Link to="/register" className="btn btn--primary">
              Get started
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
