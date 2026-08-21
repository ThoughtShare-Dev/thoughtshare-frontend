import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import StarRating from "../../components/StarRating.jsx";
import SkillTag from "../../components/skills/SkillTag.jsx";
import "./ProfilePage.css";

/**
 * /profile — the logged-in member's own profile, read-only. Editing
 * happens on the separate /profile/edit screen (EditProfilePage), per
 * AppRoutes.jsx's route table. `user` comes from useAuth() — this is the
 * same object AuthContext already fetched from GET /auth/me, so no
 * extra request is needed just to view your own profile.
 */
export default function ProfilePage() {
  const { user } = useAuth();

  if (!user) return null; // ProtectedRoute guarantees this shouldn't happen

  return (
    <div className="page profile-page">
      <div className="profile-page__header">
        <div>
          <p className="auth-card__eyebrow">Your profile</p>
          <h1>{user.name}</h1>
          <StarRating rating={user.avgRating ?? 0} count={user.ratingCount ?? 0} />
        </div>
        <Link to="/profile/edit" className="btn btn--secondary">
          Edit profile
        </Link>
      </div>

      <section className="profile-page__section">
        <h2>About</h2>
        <p>{user.bio || "No bio yet."}</p>
        {user.preferredContactType && (
          <p className="profile-page__contact">
            <strong>{user.preferredContactType}</strong> · {user.preferredContactValue}
          </p>
        )}
      </section>

      <section className="profile-page__section">
        <h2>Skills you teach</h2>
        <div className="profile-page__skills">
          {(user.teachingSkills ?? []).length > 0 ? (
            user.teachingSkills.map((s) => (
              <SkillTag key={s.skillId} label={s.name} variant="teach" note={s.contextNote} />
            ))
          ) : (
            <p className="profile-page__empty">You haven&apos;t added any teaching skills yet.</p>
          )}
        </div>
      </section>

      <section className="profile-page__section">
        <h2>Skills you want to learn</h2>
        <div className="profile-page__skills">
          {(user.learningSkills ?? []).length > 0 ? (
            user.learningSkills.map((s) => (
              <SkillTag key={s.skillId} label={s.name} variant="learn" note={s.reasonNote} />
            ))
          ) : (
            <p className="profile-page__empty">You haven&apos;t added any learning skills yet.</p>
          )}
        </div>
      </section>
    </div>
  );
}
