import { useEffect, useState } from "react";
import { Alert, Badge, Card, Spinner, Table } from "react-bootstrap";
import { getLeaderboard } from "../api";
import { Navigate } from "react-router-dom";

function LeaderboardPage({ user }) {
  const [leaderboard, setLeaderboard] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    getLeaderboard()
      .then((data) => {
        setLeaderboard(data);
        setError("");
      })
      .catch((err) => {
        setError("Cannot load leaderboard");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [user]);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (isLoading) {
    return (
      <div className="d-flex align-items-center gap-2">
        <Spinner animation="border" size="sm" />
        <span>Loading leaderboard...</span>
      </div>
    );
  }

  return (
    <>
      <section className="mb-4">
        <h1 className="fw-bold">Leaderboard</h1>
        <p className="text-secondary fs-5">
          The leaderboard shows the best score of registered users.
        </p>
      </section>

      {error && <Alert variant="danger">{error}</Alert>}

      {!error && leaderboard.length <= 0 && (
        <Alert variant="info">
          No completed games yet. Play a game to appear in the leaderboard.
        </Alert>
      )}

      {/* se mpm ci sono errori e ci sono entries */}
      {!error && leaderboard.length > 0 && (
        <Card className="shadow-lg">
          <Card.Body>
            <Table responsive hover className="table-striped">
              <thead className="table-light">
                <tr>
                  <th>Rank</th>
                  <th className="text-center">Player</th>
                  <th className="text-end">Best score</th>
                </tr>
              </thead>

              <tbody>
                {leaderboard.map((player, index) => (
                  <tr
                    key={player.user_id}
                    className={
                      Number(player.user_id) === Number(user.id)
                        ? "table-primary"
                        : ""
                    }
                  >
                    <td>
                      {index === 0 ? (
                        <Badge className="bg-warning">1st</Badge>
                      ) : index === 1 ? (
                        <Badge className="bg-secondary">2nd</Badge>
                      ) : index === 2 ? (
                        <Badge className="bg-dark">3rd</Badge>
                      ) : (
                        index + 1
                      )}
                    </td>

                    <td className="fw-semibold text-center">
                      {player.user_name}
                    </td>

                    <td className="text-end">
                      <span className="fw-bold">{player.score}</span> coins
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}
    </>
  );
}

export default LeaderboardPage;
