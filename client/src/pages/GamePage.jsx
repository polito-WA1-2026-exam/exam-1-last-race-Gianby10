import { useEffect, useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Container,
  Dropdown,
  Form,
  Row,
  Spinner,
} from "react-bootstrap";
import { getFullNetwork, getNetworkSegments } from "../api";
import Arrow from "../components/Arrow";
import {
  PhaseOne,
  PhaseTwo,
  PhaseThree,
  PhaseFour,
} from "../components/GamePhases";
import { useNavigate } from "react-router";

const SETUP_PHASE = "setup";
const PLANNING_PHASE = "planning";

const getLineName = (network, lineId) => {
  const line = network.lines.find((v) => v.id === lineId);
  return line.name;
};

const getStationName = (network, stationId) => {
  const station = network.stations.find((v) => v.id === stationId);
  return station.name;
};

function GamePage({ user }) {
  const navigate = useNavigate();
  if (!user) {
    navigate("/login");
  }

  const [phase, setPhase] = useState(SETUP_PHASE);

  const [network, setNetwork] = useState(null);
  const [segments, setSegments] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([getFullNetwork(), getNetworkSegments()])
      .then(([networkData, segmentsData]) => {
        setNetwork(networkData);
        setSegments(segmentsData);
        setError("");
      })
      .catch((err) => {
        setError(err.message || "Cannot load game data");
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

      {!error && phase === SETUP_PHASE && (
        <>
          <Row className="g-4">
            <Col md={8}>
              <SetupPhase network={network} />
            </Col>

            <Col md={4}>
              <GameControls phase={phase} setPhase={setPhase} />
            </Col>
          </Row>
        </>
      )}

      {!error && phase === PLANNING_PHASE && (
        <>
          <Row className="g-4">
            <Col md={8}>
              <PlanningPhase network={network} />
            </Col>

            <Col md={4}>
              <GameControls
                phase={phase}
                setPhase={setPhase}
                network={network}
                segments={segments}
              />
            </Col>
          </Row>
        </>
      )}
    </>
  );
}

function GameControls({ phase, network, setPhase, segments }) {
  const handleStartGame = () => {
    setPhase(PLANNING_PHASE);
    // TODO start game on server
  };
  const [selectedSegments, setSelectedSegments] = useState([]);
  const handleChange = (e) => {
    const from = Number(e.target.value.split("-")[0]);
    const to = Number(e.target.value.split("-")[1]);

    setSelectedSegments((prev) => [...prev, { from, to }]);
  };
  return (
    <div className="mb-4">
      <h2 className="fw-bold mb-3 text-center">Game controls</h2>

      <Card className="shadow-sm">
        <Card.Body className="d-flex flex-column gap-3">
          {phase === SETUP_PHASE && (
            <>
              <p className="text-secondary mb-0">
                Study the complete network map. When you start the game, the
                connections will disappear and you will have to build your route
                from memory.
              </p>

              <div>
                Starting coins: <span className="fw-bold">20</span>
              </div>

              <Button variant="primary" onClick={handleStartGame}>
                Start the game
              </Button>
            </>
          )}

          {phase === PLANNING_PHASE && (
            <>
              <div>
                Time left: <span className="fw-bold">90 seconds</span>
              </div>

              <div>
                Coins: <span className="fw-bold">20</span>
              </div>

              {selectedSegments.map((segment, i) => {
                return (
                  <Card
                    key={`${segment.from}-${segment.to}-${i}`}
                    className="shadow-sm border-0 rounded-3"
                  >
                    <Card.Body className="d-flex align-items-center justify-content-between py-2 px-3 gap-2">
                      <div className="border-end pe-2 flex-shrink-0">
                        {i + 1}
                      </div>

                      <div className="d-flex align-items-center justify-content-center flex-grow-1 gap-2">
                        <span className="border rounded px-2 py-1 bg-light small fw-semibold  text-center">
                          {getStationName(network, segment.from)}
                        </span>
                        <Arrow size={15} className="text-secondary" />
                        <span className="border rounded px-2 py-1 bg-light small fw-semibold text-center">
                          {getStationName(network, segment.to)}
                        </span>
                      </div>

                      <div className="flex-shrink-0">
                        <Button variant="outline-danger" size="sm">
                          x
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                );
              })}

              <Form.Select onChange={handleChange} defaultValue="">
                <option value="" disabled>
                  Select a segment
                </option>

                {segments.map((segment) => (
                  <option
                    key={`${segment.from}-${segment.to}`}
                    value={`${segment.from}-${segment.to}`}
                  >
                    {getStationName(network, segment.from)} —{" "}
                    {getStationName(network, segment.to)}
                  </option>
                ))}
              </Form.Select>

              <Button variant="success">Submit route</Button>
            </>
          )}
        </Card.Body>
      </Card>
    </div>
  );
}

function SetupPhase({ network }) {
  return (
    <div className="mb-4">
      <h2 className="fw-bold mb-3">Underground network map</h2>

      <div className="d-grid gap-3">
        {network.linesStations.map((lineStation) => (
          <Card key={lineStation.line_id} className="shadow-sm">
            <Card.Body>
              <Row className="align-items-center">
                <Col md={3}>
                  <h5 className="text-center fw-bold mb-4">
                    {getLineName(network, lineStation.line_id)}
                  </h5>
                </Col>
                <Col md={9}>
                  <div className="d-flex align-items-center gap-2 flex-wrap">
                    {lineStation.station_ids.map((stationId, index) => (
                      <div
                        key={`${lineStation.lineId}-${stationId}`}
                        className="d-flex align-items-center gap-2"
                      >
                        <span className="border rounded px-2 py-1 bg-light small fw-semibold shadow-sm">
                          {getStationName(network, stationId)}
                        </span>

                        {index < lineStation.station_ids.length - 1 && (
                          <Arrow size={15} className="text-secondary" />
                        )}
                      </div>
                    ))}
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        ))}
      </div>
    </div>
  );
}

function PlanningPhase({ network }) {
  return (
    <div className="mb-4">
      <h2 className="fw-bold mb-3">Underground network map</h2>

      <Card className="shadow-sm">
        <Card.Body>
          <p className="text-secondary mb-3">
            The connections are now hidden. Check the list below and select the
            correct segment order on your right.
          </p>

          <div className="d-flex flex-wrap gap-2">
            {network.stations.map((station, i) => (
              <span
                key={`${station.id}`}
                className="border rounded px-2 py-1 bg-light small fw-semibold shadow-sm"
              >
                {station.name}
              </span>
            ))}
          </div>
        </Card.Body>
      </Card>
    </div>
  );
}

export default GamePage;
