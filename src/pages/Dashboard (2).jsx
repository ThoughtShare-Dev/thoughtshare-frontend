import { useAuth } from "../hooks/useAuth.js";

/**
 * Dashboard shell — Dev 1 owns getting this route wired up and
 * authenticated; the summary widgets described in the PRD (pending
 * requests, recent notifications) pull from Dev 3's data once that's
 * available. Replace this body as those pieces land.
 */
export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="page">
      <h1>Welcome{user?.name ? `, ${user.name}` : ""}</h1>
      <p>Search for a skill, check your requests, or catch up on notifications.</p>
    </div>
  );
}
