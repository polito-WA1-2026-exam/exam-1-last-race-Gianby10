import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Container,
  Dropdown,
  Form,
  ProgressBar,
  Row,
  Spinner,
} from "react-bootstrap";
import {
  getFullNetwork,
  getNetworkSegments,
  startNewGame,
  validateGame,
} from "../api";
import Arrow from "../components/Arrow";
import {
  PhaseOne,
  PhaseTwo,
  PhaseThree,
  PhaseFour,
  RouteRules,
} from "../components/GamePhases";
import { Link, useNavigate } from "react-router";
import ResetIcon from "../components/ResetIcon";
import dayjs from "dayjs";

const SETUP_PHASE = "setup";
const PLANNING_PHASE = "planning";
const EXECUTION_PHASE = "execution";
const RESULT_PHASE = "result";

const getLineName = (network, lineId) => {
  const line = network.lines.find((v) => v.id === lineId);
  return line.name;
};

const getStationName = (network, stationId) => {
  const station = network.stations.find((v) => +v.id === +stationId);
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
  const [events, setEvents] = useState([]);
  const [finalScore, setFinalScore] = useState(0);
  const [isRouteValid, setIsRouteValid] = useState(true);

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

  const handleSubmitRoute = async () => {
    if (!submittedRef.current) {
      submittedRef.current = true;
      try {
        const validatedGameResponse = await validateGame(
          game.id,
          selectedSegmentsRef.current,
        );
        if (validatedGameResponse.isRouteValid) {
          setEvents(validatedGameResponse.events);
          setFinalScore(validatedGameResponse.finalScore);
          setIsRouteValid(true);
          setPhase(EXECUTION_PHASE);
        } else {
          setFinalScore(0);
          setIsRouteValid(false);
          setPhase(RESULT_PHASE);
        }
      } catch (error) {
        setError("Cannot proceed to execution phase");
      }
    }
  };

  const handlePlayAgain = () => {
    setPhase(SETUP_PHASE);
    setEvents(null);
    setFinalScore(null);
    setIsRouteValid(null);
  };

  const submittedRef = useRef(false);
  const selectedSegmentsRef = useRef([]);
  const [game, setGame] = useState(null);

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

      {!error && (
        <Row className="g-4">
          {phase === SETUP_PHASE && (
            <Col md={8}>
              <SetupPhase network={network} />
            </Col>
          )}
          {phase === PLANNING_PHASE && (
            <Col md={8}>
              <PlanningPhase network={network} />
            </Col>
          )}
          {(phase === SETUP_PHASE || phase === PLANNING_PHASE) && (
            <Col md={4}>
              <GameControls
                phase={phase}
                setPhase={setPhase}
                network={network}
                segments={segments}
                setSegments={setSegments}
                setError={setError}
                handleSubmitRoute={handleSubmitRoute}
                selectedSegmentsRef={selectedSegmentsRef}
                submittedRef={submittedRef}
                game={game}
                setGame={setGame}
              />
            </Col>
          )}
          {phase === EXECUTION_PHASE && (
            <Col>
              <ExecutionPhase
                network={network}
                events={events}
                finalScore={finalScore}
                isRouteValid={isRouteValid}
                onFinish={() => setPhase(RESULT_PHASE)}
              />
            </Col>
          )}
          {phase === RESULT_PHASE && (
            <Col>
              <ResultPhase
                finalScore={finalScore}
                isRouteValid={isRouteValid}
                handlePlayAgain={handlePlayAgain}
              />
            </Col>
          )}
        </Row>
      )}
    </>
  );
}

const PLANNING_TIME = 90;

function GameControls({
  phase,
  network,
  setPhase,
  segments,
  setSegments,
  setError,
  handleSubmitRoute,
  submittedRef,
  selectedSegmentsRef,
  game,
  setGame,
}) {
  const [selectedSegments, setSelectedSegments] = useState([]);
  const [selectedSegmentValue, setSelectedSegmentValue] = useState("");

  const [timeLeft, setTimeLeft] = useState(PLANNING_TIME);

  useEffect(() => {
    if (phase !== PLANNING_PHASE || !game.startedAt) return;
    submittedRef.current = false;

    const intervalId = setInterval(() => {
      const elapsedTime = dayjs().diff(dayjs(game.startedAt), "second");
      const remainingTime = Math.max(PLANNING_TIME - elapsedTime, 0); // Cannot go below 0
      setTimeLeft(remainingTime);

      if (remainingTime === 0 && !submittedRef.current) {
        submittedRef.current = true;
        handleSubmitRoute();
        clearInterval(intervalId);
      }
    }, 1000);

    // Clean up
    return () => {
      clearInterval(intervalId);
    };
  }, [phase, game?.startedAt]);

  useEffect(() => {
    selectedSegmentsRef.current = selectedSegments;
  }, [selectedSegments]);

  const handleStartGame = () => {
    startNewGame()
      .then((data) => {
        setGame({
          id: data.game_id,
          startStationId: Number(data.start_station_id),
          destinationStationId: Number(data.destination_station_id),
          startedAt: data.started_at,
        });
        setPhase(PLANNING_PHASE);
      })
      .catch((e) => {
        setError(e.message);
      });
  };

  const handleChange = (e) => {
    const from = Number(e.target.value.split("-")[0]);
    const to = Number(e.target.value.split("-")[1]);

    setSelectedSegments((prev) => [...prev, { from, to }]);
    setSelectedSegmentValue("");
  };

  const handleRemoveSegment = (i) => {
    setSelectedSegments((prev) => prev.slice(0, i));
  };

  const handleRemoveAllSegments = () => {
    setSelectedSegments([]);
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
              <div className="d-flex flex-row gap-2 justify-content-between">
                <div>
                  <div>
                    Time left:{" "}
                    <span className="fw-bold">{timeLeft} seconds</span>
                  </div>

                  <div>
                    Coins: <span className="fw-bold">20</span>
                  </div>

                  <div>
                    Starting station:{" "}
                    <span className="fw-bold">
                      {game?.startStationId &&
                        getStationName(network, game.startStationId)}
                    </span>
                  </div>

                  <div>
                    Destination station:{" "}
                    <span className="fw-bold">
                      {game?.destinationStationId &&
                        getStationName(network, game.destinationStationId)}
                    </span>
                  </div>
                </div>
                {selectedSegments.length > 0 && (
                  <Button
                    variant="outline-secondary"
                    onClick={handleRemoveAllSegments}
                    className=""
                    size="sm"
                  >
                    <ResetIcon />
                  </Button>
                )}
              </div>

              {selectedSegments.map((segment, i) => {
                return (
                  <Card
                    key={`${segment.from}-${segment.to}`}
                    className="shadow-sm border-0 rounded-3"
                  >
                    <Card.Body className="d-flex align-items-center justify-content-between py-2 px-3 gap-2">
                      <div className="border-end pe-2 flex-shrink-0">
                        <Badge>{i + 1}</Badge>
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

                      <Button
                        variant="outline-danger"
                        size="sm"
                        className="flex-shrink-0"
                        onClick={() => handleRemoveSegment(i)}
                      >
                        x
                      </Button>
                    </Card.Body>
                  </Card>
                );
              })}

              <Form.Select onChange={handleChange} value={selectedSegmentValue}>
                <option value="" disabled>
                  Select a segment
                </option>
                {/* First I filter for already selected segments, then what is returned, I map to the option of the drtopdown */}
                {segments
                  .filter((segment) => {
                    // IF one of the segments we want to render is already present in selectedSegments, we skip it. .some returns bool, so if the item is present it returns true, but to use it fwith filter we invert the bool value so that the item is skipped
                    return !selectedSegments.some(
                      (s) => s.to === segment.to && s.from === segment.from,
                    );
                  })
                  .map((segment) => (
                    <option
                      key={`${segment.from}-${segment.to}`}
                      value={`${segment.from}-${segment.to}`}
                    >
                      {getStationName(network, segment.from)} —{" "}
                      {getStationName(network, segment.to)}
                    </option>
                  ))}
              </Form.Select>

              <Button variant="success" onClick={handleSubmitRoute}>
                Submit route
              </Button>
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
      <Card className="shadow-sm mt-3">
        <Card.Body>
          <h3 className="mb-3 text-center">Route rules</h3>
          <RouteRules />
        </Card.Body>
      </Card>
    </div>
  );
}

function ExecutionPhase({
  network,
  isRouteValid,
  events,
  finalScore,
  onFinish,
}) {
  const [currentEventIndex, setCurrentEventIndex] = useState(0);
  if (!events) {
    return <Alert variant="danger"> Execution data is not available. </Alert>;
  }

  if (!isRouteValid) {
    return <Alert variant="danger"> The selected route is not valid. </Alert>;
  }
  if (!Array.isArray(events) || events.length === 0) {
    return (
      <Alert variant="warning"> No events are available for this route. </Alert>
    );
  }
  const currentItem = events[currentEventIndex];
  const { segment, drawnEvent } = currentItem;
  const isLastEvent = currentEventIndex === events.length - 1;

  const handleNextEvent = () => {
    if (!isLastEvent) {
      setCurrentEventIndex((previousIndex) => previousIndex + 1);
    }
  };
  return (
    <div className="mb-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h2 className="fw-bold mb-1">Route execution</h2>
          <p className="text-secondary mb-0">
            Discover the event associated with each segment.
          </p>
        </div>
        <Badge bg="primary" className="fs-6">
          Segment {currentEventIndex + 1} / {events.length}
        </Badge>
      </div>

      <Card className="shadow-sm">
        <Card.Body className="p-4">
          <Row className="g-4 align-items-center">
            <Col md={5}>
              <h5 className="fw-bold mb-3">Segment</h5>
              <div className="d-flex align-items-center justify-content-center gap-3">
                <span className="border rounded px-3 py-2 bg-light fw-semibold text-center">
                  {getStationName(network, segment.from)}
                </span>
                <Arrow size={20} className="text-secondary" />
                <span className="border rounded px-3 py-2 bg-light fw-semibold text-center">
                  {getStationName(network, segment.to)}
                </span>
              </div>
            </Col>
            <Col md={4}>
              <h5 className="fw-bold mb-3">Event</h5>
              <div className="fw-bold fs-5 mb-2"> {drawnEvent.name} </div>
              <p className="text-secondary mb-0">{drawnEvent.description}</p>
            </Col>
            <Col md={3}>
              <h5 className="fw-bold mb-3">Effect</h5>
              <Badge
                bg={
                  drawnEvent.points_worth > 0
                    ? "success"
                    : drawnEvent.points_worth < 0
                      ? "danger"
                      : "secondary"
                }
                className="fs-5"
              >
                {drawnEvent.points_worth > 0 ? "+" : ""}
                {drawnEvent.points_worth}
              </Badge>
            </Col>
          </Row>
          <div className="d-flex justify-content-between align-items-center mt-4">
            <div>
              {isLastEvent && (
                <span className="fs-5">
                  Final score:
                  <span className="fw-bold">{finalScore}</span>
                </span>
              )}
            </div>
            {!isLastEvent ? (
              <Button variant="primary" onClick={handleNextEvent}>
                Next segment
              </Button>
            ) : (
              <Button variant="success" onClick={onFinish}>
                Finish game
              </Button>
            )}
          </div>
        </Card.Body>
      </Card>
    </div>
  );
}

function ResultPhase({ isRouteValid, finalScore, handlePlayAgain }) {
  const resultVariant = isRouteValid ? "success" : "danger";
  const navigate = useNavigate();
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
              <h3 className="fw-bold mb-3">You reached the destination!</h3>
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
                starting station to the destination.
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
            <Button as={Link} to="/leaderboard" variant="outline-secondary">
              View leaderboard
            </Button>
            <Button
              to="/game"
              variant="outline-secondary"
              onClick={handlePlayAgain}
            >
              Play again
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

export default GamePage;
