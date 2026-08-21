import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import notificationsApi from "../../services/notificationsApi.js";
import { getErrorMessage } from "../../services/api.js";

const NOTIFICATION_COPY = {
  NEW_REQUEST: "sent you a learning request.",
  REQUEST_ACCEPTED: "accepted your learning request.",
  REQUEST_DECLINED: "declined your learning request.",
};

function timeAgo(iso) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function Notifications() {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await notificationsApi.list();
        if (!cancelled) setItems(data.items);
      } catch (err) {
        if (!cancelled) setError(getErrorMessage(err, "Couldn't load notifications."));
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="page">
      <p className="auth-card__eyebrow">Notifications</p>
      <h1 style={{ fontSize: "var(--text-2xl)", marginBottom: "var(--space-4)" }}>Notifications</h1>

      {error && (
        <div className="banner banner--error" role="alert">
          {error}
        </div>
      )}

      {isLoading ? (
        <p>
          <span className="spinner" style={{ borderTopColor: "var(--color-primary)", borderColor: "rgba(39,72,232,0.25)" }} />{" "}
          Loading…
        </p>
      ) : items.length === 0 ? (
        <div className="empty-state">Nothing yet. Requests and responses will show up here.</div>
      ) : (
        items.map((n) => (
          <div key={n.id} className="entity-card" style={{ opacity: n.isRead ? 0.7 : 1 }}>
            <div className="entity-card__header">
              <p>{NOTIFICATION_COPY[n.type] ?? "New activity."}</p>
              {!n.isRead && <span className="badge badge--pending">New</span>}
            </div>
            <div className="entity-card__header">
              <p className="entity-card__meta">{timeAgo(n.createdAt)}</p>
              {n.learningRequestId && (
                <Link to="/requests" className="btn btn--ghost">
                  View request
                </Link>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
