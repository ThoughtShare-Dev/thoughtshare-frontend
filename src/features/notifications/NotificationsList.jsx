import { useEffect, useState } from "react";
import notificationsApi, { getErrorMessage } from "../../services/notificationsApi.js";

// Human-readable labels for each notification type from §9.5/9.6 of the contract.
// Unknown types fall back to the raw type string, per the contract's versioning
// rule ("new notification types... provided existing consumers ignore unknown
// values safely") — so this won't break if the backend adds a new type later.
const LABELS = {
  NEW_REQUEST: "sent you a connection request",
  REQUEST_ACCEPTED: "accepted your request",
  REQUEST_DECLINED: "declined your request",
};

export default function NotificationsList() {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const res = await notificationsApi.getAll({ page: 1, pageSize: 20 });
        if (!cancelled) setNotifications(res.data.data.items);
      } catch (err) {
        if (!cancelled) setError(getErrorMessage(err));
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="page page--centered">
        <span className="spinner" />
      </div>
    );
  }

  if (error) return <div className="banner banner--error">{error}</div>;
  if (notifications.length === 0) return <p className="notifications__empty">No notifications yet.</p>;

  return (
    <ul className="notifications-list">
      {notifications.map((n) => (
        // The unread styling below reads isRead correctly, but there's currently
        // no way to ever flip it to true — see the note in notificationsApi.js.
        // Once a mark-read endpoint exists, wire an onClick here to call it.
        <li
          key={n.id}
          className={`notifications-list__item ${n.isRead ? "" : "notifications-list__item--unread"}`}
        >
          <span className="notifications-list__text">{LABELS[n.type] ?? n.type}</span>
          <time className="notifications-list__time">{new Date(n.createdAt).toLocaleString()}</time>
        </li>
      ))}
    </ul>
  );
}
