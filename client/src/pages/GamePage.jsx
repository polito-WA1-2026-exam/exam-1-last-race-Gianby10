import { useEffect, useState } from "react";
import { Alert, Badge, Button, Card, Col, Row, Spinner } from "react-bootstrap";
import { getFullNetwork } from "../api";

const SETUP_PHASE = "setup";

function GamePage() {
  const [phase, setPhase] = useState(SETUP_PHASE);

  const [network, setNetwork] = useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getFullNetwork()
      .then((data) => {
        setNetwork(data);
        console.log(data);
        setError("");
      })
      .catch((err) => {
        setError(err.message || "Cannot load network");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return (
      <div className="d-flex align-items-center gap-2">
        <Spinner animation="border" size="sm" />
        <span>Loading game...</span>
      </div>
    );
  }

  return (
    <>
      <section className="mb-4">
        <h1 className="fw-bold">Last Race</h1>
        <p className="text-secondary fs-5">
          Study the network, then start the game and rebuild the route before
          time runs out.
        </p>
      </section>

      {error && <Alert variant="danger">{error}</Alert>}

      {phase === SETUP_PHASE && <SetupPhase />}
    </>
  );
}

function SetupPhase() {
  return <h1>Phase1 asdasda</h1>;
}

export default GamePage;
