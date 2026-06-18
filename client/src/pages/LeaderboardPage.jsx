import { useEffect, useState } from "react";
import { Alert, Badge, Card, Spinner, Table } from "react-bootstrap";
import { getLeaderboard } from "../api";
import { useNavigate } from "react-router";

function LeaderboardPage({ user }) {
  const navigate = useNavigate();
  if (!user) {
    navigate("/login");
  }

  const [leaderboard, setLeaderboard] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getLeaderboard()
      .then((data) => {
        setLeaderboard(data);
        console.log(data);
        setError("");
      })
      .catch((err) => {
        setError("Cannot load leaderboard");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

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
                  <th>Player</th>
                  <th>Best score</th>
                </tr>
              </thead>

              <tbody>
                {leaderboard.map((player, index) => (
                  <tr key={player.user_id}>
                    <td>
                      {index === 0 ? (
                        <span>1st</span>
                      ) : index === 1 ? (
                        <span>2nd</span>
                      ) : index === 2 ? (
                        <span>3rd</span>
                      ) : (
                        index + 1
                      )}
                    </td>

                    <td className="fw-semibold">{player.user_name}</td>

                    <td className="">
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
