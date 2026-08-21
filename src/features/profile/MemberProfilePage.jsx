import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import membersApi from "../../services/membersApi.js";
import reviewsApi from "../../services/reviewsApi.js";
import requestsApi from "../../services/requestsApi.js";
import { getErrorMessage } from "../../services/api.js";
import StarRating from "../../components/StarRating.jsx";
import SkillTag from "../../components/skills/SkillTag.jsx";
import ReviewsList from "./components/ReviewsList.jsx";
import "./MemberProfilePage.css";

/**
 * /members/:id — public view of another member.
 *
 * Contact reveal: preferredContactType/Value come back null from the API
 * unless the viewer has an ACCEPTED connection with this member (server
 * decides this — see memberPublicView() in mocks/db.js, and the note in
 * membersApi.js). We only ever render what the API sent; there is no
 * client-side "is this connection accepted" check anywhere in this file.
 */
export default function MemberProfilePage() {
  const { id } = useParams();
  const { user: viewer } = useAuth();

  const [member, setMember] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [requestState, setRequestState] = useState("idle"); // idle | sending | sent | error
  const [requestError, setRequestError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    Promise.all([membersApi.getById(id), reviewsApi.listForMember(id)])
      .then(([memberData, reviewData]) => {
        if (cancelled) return;
        setMember(memberData);
        setReviews(reviewData ?? []);
      })
      .catch((err) => {
        if (!cancelled) setError(getErrorMessage(err, "Couldn't load this profile."));
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  async function handleSendRequest() {
    setRequestState("sending");
    setRequestError(null);
    try {
      await requestsApi.send(id);
      setRequestState("sent");
    } catch (err) {
      setRequestState("error");
      setRequestError(getErrorMessage(err, "Couldn't send that request."));
    }
  }

  if (isLoading) return <div className="page">Loading profile…</div>;
  if (error) return <div className="page banner banner--error">{error}</div>;
  if (!member) return null;

  const isOwnProfile = viewer?.id === member.id;
  const contactRevealed = Boolean(member.preferredContactValue);

  return (
    <div className="page member-profile-page">
      <div className="member-profile-page__header">
        <div className="member-profile-page__avatar" aria-hidden="true">
          {member.name
            .split(" ")
            .map((p) => p[0])
            .slice(0, 2)
            .join("")
            .toUpperCase()}
        </div>
        <div>
          <p className="auth-card__eyebrow">ThoughtShare member</p>
          <h1>{member.name}</h1>
          <StarRating rating={member.avgRating} count={member.ratingCount} />
        </div>
      </div>

      {member.bio && (
        <section className="member-profile-page__section">
          <h2>About</h2>
          <p>{member.bio}</p>
        </section>
      )}

      <div className="member-profile-page__skills-grid">
        <section className="member-profile-page__section">
          <h2>Teaches</h2>
          <div className="member-profile-page__skills">
            {member.teachingSkills.length > 0 ? (
              member.teachingSkills.map((s) => (
                <SkillTag key={s.skillId} label={s.name} variant="teach" note={s.contextNote} />
              ))
            ) : (
              <p className="field-hint">Nothing listed yet.</p>
            )}
          </div>
        </section>
        <section className="member-profile-page__section">
          <h2>Learning</h2>
          <div className="member-profile-page__skills">
            {member.learningSkills.length > 0 ? (
              member.learningSkills.map((s) => (
                <SkillTag key={s.skillId} label={s.name} variant="learn" note={s.reasonNote} />
              ))
            ) : (
              <p className="field-hint">Nothing listed yet.</p>
            )}
          </div>
        </section>
      </div>

      {!isOwnProfile && (
        <section className="member-profile-page__contact">
          {contactRevealed ? (
            <p>
              <strong>{member.preferredContactType}</strong> · {member.preferredContactValue}
            </p>
          ) : (
            <>
              <p>Contact info is shown once {member.name.split(" ")[0]} accepts your request.</p>
              {requestError && <div className="banner banner--error">{requestError}</div>}
              <button
                type="button"
                className="btn btn--primary"
                onClick={handleSendRequest}
                disabled={requestState === "sending" || requestState === "sent"}
              >
                {requestState === "sending" && <span className="spinner" />}
                {requestState === "sent" ? "Request sent" : "Send learning request"}
              </button>
            </>
          )}
        </section>
      )}

      <section className="member-profile-page__section">
        <p className="auth-card__eyebrow">Member feedback</p>
        <h2>Reviews</h2>
        <ReviewsList reviews={reviews} />
      </section>
    </div>
  );
}
