import { Link } from "react-router-dom";
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Row,
  ListGroup,
} from "react-bootstrap";
import {
  PhaseFour,
  PhaseOne,
  PhaseThree,
  PhaseTwo,
} from "../components/GamePhases.jsx";
import LoginButton from "../components/LoginButton.jsx";

function HomePage({ user }) {
  return (
    <>
      <section className="mb-5 p-4 rounded border">
        <h1 className="display-5 fw-bold">Last Race</h1>

        <p className="fs-5 text-secondary mb-4">
          Study the underground network, remember the connections, and rebuild
          the correct route before time runs out.
        </p>

        {user ? (
          <Button as={Link} to="/game" variant="primary" size="lg">
            Start game
          </Button>
        ) : (
          <LoginButton text="Login to play" />
        )}
      </section>

      <section className="mb-4">
        <h2 className="fw-bold">Game rules</h2>
        <p className="text-secondary fs-5">
          The game is divided into four phases. Each game starts with{" "}
          <span className="fw-bold">20 coins</span>.
        </p>
      </section>

      <Row className="g-4 mb-5">
        <Col md={4}>
          <PhaseOne />
        </Col>

        <Col md={8}>
          <PhaseTwo />
        </Col>

        <Col md={6}>
          <PhaseThree />
        </Col>

        <Col md={6}>
          <PhaseFour />
        </Col>
      </Row>

      {!user && (
        <Alert variant="warning" className="mb-4">
          Only registered users can play the game and see the leaderboard.
        </Alert>
      )}

      <div className="d-flex gap-2 mb-5">
        {user ? (
          <>
            <Button as={Link} to="/game" variant="primary">
              Start game
            </Button>

            <Button as={Link} to="/leaderboard" variant="outline-primary">
              View leaderboard
            </Button>
          </>
        ) : (
          <LoginButton text="Login to play" />
        )}
      </div>
    </>
  );
}

export default HomePage;
