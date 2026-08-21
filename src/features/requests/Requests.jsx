import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import requestsApi from "../../services/requestsApi.js";
import membersApi from "../../services/membersApi.js";
import { getErrorMessage } from "../../services/api.js";
import ReportUserModal from "../../components/ReportUserModal.jsx";

const STATUS_LABEL = { PENDING: "Pending", ACCEPTED: "Accepted", DECLINED: "Declined" };
const STATUS_CLASS = { PENDING: "badge--pending", ACCEPTED: "badge--accepted", DECLINED: "badge--declined" };

function formatDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function ContactReveal({ memberId }) {
  const [contact, setContact] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  async function load() {
    setIsLoading(true);
    setError(null);
    try {
      const member = await membersApi.getById(memberId);
      setContact(member.preferredContactType ? member : null);
      if (!member.preferredContactType) setError("No contact method on file yet.");
    } catch (err) {
      setError(getErrorMessage(err, "Couldn't load contact info."));
    } finally {
      setIsLoading(false);
    }
  }

  if (contact) {
    return (
      <p className="entity-card__meta">
        Contact: {contact.preferredContactType} — {contact.preferredContactValue}
      </p>
    );
  }

  return (
    <div>
      <button type="button" className="btn btn--ghost" onClick={load} disabled={isLoading}>
        {isLoading && <span className="spinner" />}
        {isLoading ? "Loading…" : "View contact info"}
      </button>
      {error && <p className="field-error">{error}</p>}
    </div>
  );
}

function RequestRow({ request, viewerId, onAccept, onDecline, onReport, isResponding }) {
  const isIncoming = request.recipient.id === viewerId;
  const counterpart = isIncoming ? request.sender : request.recipient;

  return (
    <div className="entity-card">
      <div className="entity-card__header">
        <div>
          <p style={{ fontWeight: 600 }}>{counterpart.name}</p>
          <p className="entity-card__meta">
            {isIncoming ? "Wants to learn from you" : "You reached out"} · {formatDate(request.createdAt)}
          </p>
        </div>
        <span className={`badge ${STATUS_CLASS[request.status]}`}>{STATUS_LABEL[request.status]}</span>
      </div>

      {isIncoming && request.status === "PENDING" && (
        <div style={{ display: "flex", gap: "var(--space-2)" }}>
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => onAccept(request.id)}
            disabled={isResponding}
          >
            Accept
          </button>
          <button
            type="button"
            className="btn btn--secondary"
            onClick={() => onDecline(request.id)}
            disabled={isResponding}
          >
            Decline
          </button>
        </div>
      )}

      {!isIncoming && request.status === "PENDING" && (
        <p className="entity-card__meta">Waiting for {counterpart.name} to respond.</p>
      )}

      {request.status === "ACCEPTED" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
          <ContactReveal memberId={counterpart.id} />
          <div style={{ display: "flex", gap: "var(--space-2)" }}>
            <Link to={`/connections/${request.id}/review`} className="btn btn--ghost">
              Leave a review
            </Link>
            <button type="button" className="btn btn--ghost" onClick={() => onReport(counterpart)}>
              Report
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Requests() {
  const { user } = useAuth();
  const [tab, setTab] = useState("incoming");
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [respondingId, setRespondingId] = useState(null);
  const [reportTarget, setReportTarget] = useState(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await requestsApi.list();
      setRequests(data);
    } catch (err) {
      setError(getErrorMessage(err, "Couldn't load your requests."));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function respond(id, action) {
    setRespondingId(id);
    try {
      const updated = action === "accept" ? await requestsApi.accept(id) : await requestsApi.decline(id);
      setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status: updated.status } : r)));
    } catch (err) {
      setError(getErrorMessage(err, "Couldn't update that request."));
    } finally {
      setRespondingId(null);
    }
  }

  const incoming = requests.filter((r) => r.recipient.id === user?.id);
  const outgoing = requests.filter((r) => r.sender.id === user?.id);
  const visible = tab === "incoming" ? incoming : outgoing;

  return (
    <div className="page">
      <p className="auth-card__eyebrow">Requests</p>
      <h1 style={{ fontSize: "var(--text-2xl)", marginBottom: "var(--space-4)" }}>Learning requests</h1>

      <div className="tabs">
        <button
          type="button"
          className={`tab ${tab === "incoming" ? "tab--active" : ""}`}
          onClick={() => setTab("incoming")}
        >
          Incoming ({incoming.length})
        </button>
        <button
          type="button"
          className={`tab ${tab === "outgoing" ? "tab--active" : ""}`}
          onClick={() => setTab("outgoing")}
        >
          Outgoing ({outgoing.length})
        </button>
      </div>

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
      ) : visible.length === 0 ? (
        <div className="empty-state">
          {tab === "incoming"
            ? "No incoming requests yet. Once someone wants to learn what you teach, it'll show up here."
            : "You haven't reached out to anyone yet. Find a match in Search and send a request."}
        </div>
      ) : (
        visible.map((r) => (
          <RequestRow
            key={r.id}
            request={r}
            viewerId={user?.id}
            onAccept={(id) => respond(id, "accept")}
            onDecline={(id) => respond(id, "decline")}
            onReport={(member) => setReportTarget(member)}
            isResponding={respondingId === r.id}
          />
        ))
      )}

      {reportTarget && (
        <ReportUserModal
          memberId={reportTarget.id}
          memberName={reportTarget.name}
          onClose={() => setReportTarget(null)}
        />
      )}
    </div>
  );
}
