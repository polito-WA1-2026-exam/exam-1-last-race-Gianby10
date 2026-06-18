import { Card, ListGroup } from "react-bootstrap";

const PhaseOne = () => {
  return (
    <Card className="h-100 shadow-sm">
      <Card.Body>
        <Card.Title className="fw-bold">1. Setup phase</Card.Title>
        <Card.Text>
          You will see the complete underground map, with all the stations,
          connections, and metro lines. Use this phase to study the map and when
          you are ready, start the game!
        </Card.Text>
      </Card.Body>
    </Card>
  );
};

const PhaseTwo = () => {
  return (
    <Card className="h-100 shadow-sm">
      <Card.Body>
        <Card.Title className="fw-bold">2. Planning phase</Card.Title>
        <Card.Text>
          The connections disappear from the map. You will receive a random
          starting station and destination, then your objective is to build a
          valid route by selecting connected station pairs.
        </Card.Text>

        <ListGroup variant="flush" className="mt-3">
          <ListGroup.Item>90 seconds of time</ListGroup.Item>
          <ListGroup.Item>
            A route is <span className="fw-bold">valid</span> when it starts at
            the assigned station and ends at the destination station.
          </ListGroup.Item>
          <ListGroup.Item>
            Each segment must be reachable through one of the lines.
          </ListGroup.Item>
          <ListGroup.Item>
            Each segment can be selected only once.
          </ListGroup.Item>
          <ListGroup.Item>
            Line changes are possible only at interchange stations.
          </ListGroup.Item>
          <ListGroup.Item>
            If the route is invalid, you lose and your final score will be 0.
          </ListGroup.Item>
        </ListGroup>
      </Card.Body>
    </Card>
  );
};

const PhaseThree = () => {
  return (
    <Card className="h-100 shadow-sm">
      <Card.Body>
        <Card.Title className="fw-bold">3. Execution phase</Card.Title>
        <Card.Text>
          After submission, the game validates your route. If the route is
          valid, the journey is executed one segment at a time. For each
          segment, a random event is selected randomly and its effect is applied
          to your coins.
        </Card.Text>
      </Card.Body>
    </Card>
  );
};

const PhaseFour = () => {
  return (
    <Card className="h-100 shadow-sm">
      <Card.Body>
        <Card.Title className="fw-bold">4. Result phase</Card.Title>
        <Card.Text>
          At the end of the game, your final score is shown. If your score
          becomes negative, it is stored and displayed as zero. Your best result
          will appear in the leaderboard.
        </Card.Text>
      </Card.Body>
    </Card>
  );
};

export { PhaseOne, PhaseTwo, PhaseThree, PhaseFour };
