import { Alert, Button, Card } from "react-bootstrap";
import { Link } from "react-router";

export default function ResultPhase({
  isRouteValid,
  finalScore,
  handlePlayAgain,
}) {
  return (
    <div className="mb-4">
      <h2 className="fw-bold mb-3 text-center">Game result</h2>
      <Card
        className="shadow-sm border-0 mx-auto"
        style={{ maxWidth: "650px" }}
      >
        <Card.Body className="p-4 text-center">
          {isRouteValid ? (
            <>
              <h3 className="fw-bold mb-3">You've reached the destination!</h3>
              <p className="text-secondary">
                Your route was valid and all events have been applied.
              </p>
              <Alert variant="success" className="mt-4">
                <div className="text-uppercase small fw-semibold">
                  Final score
                </div>
                <div className="display-4 fw-bold"> {finalScore} </div>
                <div>coins</div>
              </Alert>
            </>
          ) : (
            <>
              <h3 className="fw-bold mb-3">The destination was not reached</h3>
              <p className="text-secondary">
                The selected segments do not form a valid route from the
                starting station to the destination station.
              </p>
              <Alert variant="danger" className="mt-4">
                <div className="text-uppercase small fw-semibold">
                  Final score
                </div>
                <div className="display-4 fw-bold"> 0 </div>
                <div>coins</div>
              </Alert>
            </>
          )}
          <div className="d-flex justify-content-center gap-2 mt-4">
            <Button variant="primary" onClick={handlePlayAgain}>
              Play again
            </Button>
            <Button as={Link} to="/leaderboard" variant="outline-secondary">
              View leaderboard
            </Button>
            <Button as={Link} to="/" variant="outline-secondary">
              Back to home
            </Button>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
}
