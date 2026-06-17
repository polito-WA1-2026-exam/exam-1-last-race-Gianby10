import { Navigate } from "react-router";

export default function GamePage({ user }) {
  if (!user) {
    return <Navigate to="/login" />;
  }

  return <h1>Game page</h1>;
}
