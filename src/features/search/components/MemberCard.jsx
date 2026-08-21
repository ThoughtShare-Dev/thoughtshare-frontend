import { Link } from "react-router-dom";
import StarRating from "../../../components/StarRating.jsx";
import SkillTag from "../../../components/skills/SkillTag.jsx";
import "./MemberCard.css";

/**
 * One result row on the Search Results screen. `member` is a single item
 * from GET /search's `results` array — see membersApi.search(). Note that
 * shape only includes `teachingSkills` as plain name strings (not full
 * {skillId, name, contextNote} objects like the full member view does),
 * so we render each as a read-only tag with no note/tooltip.
 */
export default function MemberCard({ member }) {
  return (
    <li className="member-card">
      <div className="member-card__top">
        <div className="member-card__avatar" aria-hidden="true">
          {member.name
            .split(" ")
            .map((p) => p[0])
            .slice(0, 2)
            .join("")
            .toUpperCase()}
        </div>
        <div className="member-card__identity">
          <Link to={`/members/${member.id}`} className="member-card__name">
            {member.name}
          </Link>
          <StarRating rating={member.avgRating} count={member.ratingCount} />
        </div>
      </div>

      {member.teachingSkills.length > 0 && (
        <div className="member-card__skills">
          {member.teachingSkills.map((skillName) => (
            <SkillTag key={skillName} label={skillName} variant="teach" />
          ))}
        </div>
      )}

      <Link to={`/members/${member.id}`} className="btn btn--secondary member-card__cta">
        View profile
      </Link>
    </li>
  );
}
