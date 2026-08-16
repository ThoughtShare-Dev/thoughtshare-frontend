import { useState } from "react";
import requestsApi, { getErrorMessage } from "../../services/requestsApi.js";

/**
 * Renders one connection request with Accept/Decline actions.
 *
 * `request` now comes from the real GET /requests endpoint (confirmed live
 * per THOUGHTSHARE_MOCK_DATA.md §5), which nests full sender/recipient
 * objects — so we no longer need a separate senderName prop.
 *
 * request shape:
 * {
 *   id, status: "PENDING"|"ACCEPTED"|"DECLINED", createdAt,
 *   sender: { id, name, profilePictureUrl },
 *   recipient: { id, name, profilePictureUrl }
 * }
 *
 * currentUserId is needed to figure out which side is "the other person" —
 * pass it in from useAuth() wherever this card is rendered.
 */
export default function RequestCard({ request, currentUserId, onUpdated }) {
  const [status, setStatus] = useState(request.status);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const otherPerson =
    request.sender.id === currentUserId ? request.recipient : request.sender;
  const isIncoming = request.recipient.id === currentUserId;

  const act = async (action) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await requestsApi[action](request.id);
      setStatus(res.data.data.status);
      onUpdated?.(res.data.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="request-card">
      <div className="request-card__body">
        <p className="request-card__name">{otherPerson.name}</p>
        <p className="request-card__meta">
          {isIncoming ? "wants to connect with you" : "connection request sent"}
        </p>
        <span className={`request-card__status request-card__status--${status.toLowerCase()}`}>
          {status}
        </span>
      </div>

      {error && <div className="banner banner--error">{error}</div>}

      {/* Only the recipient can accept/decline — per contract §11 Requests rules */}
      {status === "PENDING" && isIncoming && (
        <div className="request-card__actions">
          <button className="btn btn--primary" onClick={() => act("accept")} disabled={isLoading}>
            {isLoading ? <span className="spinner" /> : "Accept"}
          </button>
          <button className="btn btn--ghost" onClick={() => act("decline")} disabled={isLoading}>
            Decline
          </button>
        </div>
      )}
    </div>
  );
}
