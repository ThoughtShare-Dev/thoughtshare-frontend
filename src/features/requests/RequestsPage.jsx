import { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth.js";
import RequestCard from "./RequestCard.jsx";
import requestsApi, { getErrorMessage } from "../../services/requestsApi.js";

export default function RequestsPage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const res = await requestsApi.getAll();
        // NOTE: this endpoint returns a plain array under data, not the
        // usual { items, ... } collection shape — see requestsApi.js.
        if (!cancelled) setRequests(res.data.data);
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

  const handleUpdated = (updatedRequest) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === updatedRequest.id ? { ...r, status: updatedRequest.status } : r))
    );
  };

  if (isLoading) {
    return (
      <div className="page page--centered">
        <span className="spinner" />
      </div>
    );
  }

  if (error) return <div className="banner banner--error">{error}</div>;

  return (
    <div className="page">
      <h1>Requests</h1>
      {requests.length === 0 ? (
        <p>No requests yet.</p>
      ) : (
        <div className="requests-page__list">
          {requests.map((request) => (
            <RequestCard
              key={request.id}
              request={request}
              currentUserId={user?.id}
              onUpdated={handleUpdated}
            />
          ))}
        </div>
      )}
    </div>
  );
}
