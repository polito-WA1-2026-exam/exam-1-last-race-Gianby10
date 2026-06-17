import { Link } from "react-router-dom";
import { Button, Card, Col, Row } from "react-bootstrap";

function HomePage({ user }) {
  return (
    <>
      <section className="mb-4">
        <h1>Last Race</h1>
        <p className="gray-500">
          Have a look at the underground network, remember the connections and
          rebuild the route before time runs out!
        </p>
      </section>

      <p className="fw-lighter fs-4">The game is divded into 4 phases:</p>

      <Card>
        <Card.Title>First phase</Card.Title>
        <Card.Body>Ciao</Card.Body>
      </Card>

      {user ? (
        <Link to="/game">
          <Button variant="primary">Start playing</Button>
        </Link>
      ) : (
        <Link to="/login">
          <Button variant="primary">Login to play</Button>
        </Link>
      )}
    </>
  );
}

export default HomePage;
