import { useState, useEffect } from "react";
import {
  PLANNING_PHASE,
  PLANNING_TIME,
  SETUP_PHASE,
  STARTING_COINS,
} from "../../constants/game";
import dayjs from "dayjs";
import { Alert, Badge, Button, Card, Form } from "react-bootstrap";
import { getStationName } from "../../utils";
import ArrowIcon from "../icons/ArrowIcon";
import ResetIcon from "../icons/ResetIcon";
export default function GameControls({
  phase,
  network,
  segments,
  onSubmitRoute,
  game,
  gameControlsError,
  onStartGame,
  isSubmitting,
}) {
  const [selectedSegments, setSelectedSegments] = useState([]);
  const [selectedSegmentValue, setSelectedSegmentValue] = useState("");

  const [timeLeft, setTimeLeft] = useState(PLANNING_TIME);

  useEffect(() => {
    if (phase !== PLANNING_PHASE || !game?.startedAt) return;

    const updateTimer = () => {
      const elapsedTime = dayjs().diff(dayjs(game.startedAt), "second");
      const remainingTime = Math.max(PLANNING_TIME - elapsedTime, 0); // Cannot go below 0
      setTimeLeft(remainingTime);

      if (remainingTime === 0) {
        onSubmitRoute(selectedSegments);
        clearInterval(intervalId);
      }
    };
    const intervalId = setInterval(updateTimer, 1000);
    updateTimer();

    // Clean up
    return () => {
      clearInterval(intervalId);
    };
  }, [phase, game?.startedAt, selectedSegments, onSubmitRoute]);

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
                Starting coins:{" "}
                <span className="fw-bold">{STARTING_COINS}</span>
              </div>

              <Button variant="primary" onClick={onStartGame}>
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
                    Coins: <span className="fw-bold">{STARTING_COINS}</span>
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
                  <div>
                    <Button
                      variant="outline-secondary"
                      onClick={handleRemoveAllSegments}
                      className="flex-shrink-1"
                      size="sm"
                    >
                      <ResetIcon />
                    </Button>
                  </div>
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
                        <ArrowIcon size={15} className="text-secondary" />
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

              {gameControlsError && (
                <Alert variant="danger">{gameControlsError}</Alert>
              )}

              <Button
                variant="success"
                onClick={() => onSubmitRoute(selectedSegments)}
                disabled={isSubmitting}
              >
                Submit route
              </Button>
            </>
          )}
        </Card.Body>
      </Card>
    </div>
  );
}
