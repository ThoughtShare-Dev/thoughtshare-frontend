import { useState } from "react";
import requestsApi from "../services/requestsApi.js";
import { getErrorMessage } from "../services/api.js";

/**
 * "Send a learning request" button — drop this into Member Profile
 * (Dev 2's screen) once it exists, passing the member being viewed.
 * Handles its own pending/sent/error state so the parent screen doesn't
 * need to.
 */
export default function SendRequestButton({ recipientId, recipientName }) {
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error
  const [error, setError] = useState(null);

  async function handleClick() {
    setStatus("sending");
    setError(null);
    try {
      await requestsApi.send(recipientId);
      setStatus("sent");
    } catch (err) {
      setStatus("error");
      setError(getErrorMessage(err, "Couldn't send the request."));
    }
  }

  if (status === "sent") {
    return <p className="field-hint">Request sent to {recipientName}.</p>;
  }

  return (
    <div>
      <button type="button" className="btn btn--primary" onClick={handleClick} disabled={status === "sending"}>
        {status === "sending" && <span className="spinner" />}
        {status === "sending" ? "Sending…" : "Send learning request"}
      </button>
      {error && <p className="field-error">{error}</p>}
    </div>
  );
}
