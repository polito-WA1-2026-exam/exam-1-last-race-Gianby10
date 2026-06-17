import { Navigate } from "react-router";

export default function LeaderboardPage({ user }) {
  if (!user) {
    return <Navigate to="/login" />;
  }
  return <h1>Leaderboard</h1>;
}
