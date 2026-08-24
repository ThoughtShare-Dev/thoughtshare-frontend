import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import "./Navbar.css";

const memberLinks = [
  { to: "/search", label: "Search skills" },
  { to: "/requests", label: "Requests" },
  { to: "/notifications", label: "Notifications" },
];

function Wordmark({ to }) {
  return (
    <Link to={to} className="navbar__brand" aria-label="ThoughtShare home">
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
  const displayName = user?.name || user?.email || "Account";
  const initial = displayName.charAt(0).toUpperCase();
  const homeTo = isAdmin ? "/admin/reports" : isAuthenticated ? "/dashboard" : "/";

  return (
    <header className="navbar">
      <div className="navbar__inner">
        <Wordmark to={homeTo} />

        {!isLoading && isAuthenticated && (
          <button
            type="button"
            className="navbar__toggle"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span className="navbar__toggle-icon" aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
            <span className="navbar__toggle-label">Menu</span>
          </button>
        )}

        {isLoading ? null : isAuthenticated ? (
          <nav
            className={`navbar__links ${menuOpen ? "navbar__links--open" : ""}`}
            aria-label="Primary"
          >
            {!isAdmin && (
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  `navbar__link ${isActive ? "navbar__link--active" : ""}`
                }
                onClick={() => setMenuOpen(false)}
              >
                Home
              </NavLink>
            )}
            {!isAdmin &&
              memberLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `navbar__link ${isActive ? "navbar__link--active" : ""}`
                  }
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </NavLink>
              ))}
            {isAdmin && (
              <NavLink
                to="/admin/reports"
                className={({ isActive }) =>
                  `navbar__link ${isActive ? "navbar__link--active" : ""}`
                }
                onClick={() => setMenuOpen(false)}
              >
                Reports
              </NavLink>
            )}
            {isAdmin && (
              <NavLink
                to="/admin/skills"
                className={({ isActive }) =>
                  `navbar__link ${isActive ? "navbar__link--active" : ""}`
                }
                onClick={() => setMenuOpen(false)}
              >
                Skill library
              </NavLink>
            )}
            {isAdmin && (
              <NavLink
                to="/admin/reviews"
                className={({ isActive }) =>
                  `navbar__link ${isActive ? "navbar__link--active" : ""}`
                }
                onClick={() => setMenuOpen(false)}
              >
                Review moderation
              </NavLink>
            )}
            <NavLink
              to="/vision/feed"
              className={({ isActive }) =>
                `navbar__link navbar__link--vision ${isActive ? "navbar__link--active" : ""}`
              }
              onClick={() => setMenuOpen(false)}
            >
              Vision preview
            </NavLink>

            <div className="navbar__mobile-account">
              <div className="navbar__mobile-account-name">{displayName}</div>
              <Link to="/profile" className="navbar__link" onClick={() => setMenuOpen(false)}>
                My profile
              </Link>
              <Link to="/settings" className="navbar__link" onClick={() => setMenuOpen(false)}>
                Settings
              </Link>
              <button
                type="button"
                className="navbar__link navbar__link--button"
                onClick={handleLogout}
              >
                Log out
              </button>
            </div>

            <div className="navbar__profile">
              <button
                type="button"
                className="navbar__profile-trigger"
                onClick={() => setProfileMenuOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={profileMenuOpen}
                aria-label="Open profile menu"
              >
                <span className="navbar__avatar" aria-hidden="true">
                  {initial}
                </span>
              </button>
              {profileMenuOpen && (
                <div className="navbar__dropdown" role="menu">
                  <div className="navbar__dropdown-name">{displayName}</div>
                  {!isAdmin && (
                    <Link to="/profile" role="menuitem" onClick={() => setProfileMenuOpen(false)}>
                      My profile
                    </Link>
                  )}
                  <Link to="/settings" role="menuitem" onClick={() => setProfileMenuOpen(false)}>
                    Settings
                  </Link>
                  <button type="button" role="menuitem" onClick={handleLogout}>
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
