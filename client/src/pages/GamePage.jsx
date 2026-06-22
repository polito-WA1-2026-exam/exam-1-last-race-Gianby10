import { useEffect, useRef, useState } from "react";
import { Alert, Col, Row, Spinner } from "react-bootstrap";

import { Navigate } from "react-router";

import ResultPhase from "../components/game/ResultPhase";
import ExecutionPhase from "../components/game/ExecutionPhase";
import SetupPhase from "../components/game/SetupPhase";
import PlanningPhase from "../components/game/PlanningPhase";
import GameControls from "../components/game/GameControls";
import {
  EXECUTION_PHASE,
  PLANNING_PHASE,
  RESULT_PHASE,
  SETUP_PHASE,
} from "../constants/game.js";

import {
  getFullNetwork,
  getNetworkSegments,
  startNewGame,
  validateGame,
} from "../api.js";

function GamePage({ user }) {
  const [phase, setPhase] = useState(SETUP_PHASE);

  const [network, setNetwork] = useState(null);
  const [segments, setSegments] = useState([]);
  const [events, setEvents] = useState([]);
  const [finalScore, setFinalScore] = useState(0);
  const [isRouteValid, setIsRouteValid] = useState(null);
  const [gameControlsError, setGameControlsError] = useState(null);
  const [game, setGame] = useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submittedRef = useRef(false);

  useEffect(() => {
    if (!user) return;
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
  }, [user]);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const handleSubmitRoute = async (selectedSegments) => {
    if (submittedRef.current) {
      return;
    }
    setGameControlsError(null);

    if (!game?.id) {
      setGameControlsError("Game data is not available");
      return;
    }

    submittedRef.current = true;
    setIsSubmitting(true);
    try {
      const validatedGameResponse = await validateGame(
        game.id,
        selectedSegments,
      );
      setFinalScore(validatedGameResponse.finalScore ?? 0);
      setIsRouteValid(validatedGameResponse.isRouteValid);
      if (validatedGameResponse.isRouteValid) {
        setEvents(validatedGameResponse.events ?? []);
        setPhase(EXECUTION_PHASE);
      } else {
        setEvents([]);
        setPhase(RESULT_PHASE);
      }
    } catch (error) {
      submittedRef.current = false;
      setError("Cannot proceed to execution phase");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartGame = () => {
    startNewGame()
      .then((data) => {
        setGame({
          id: data.gameId,
          startStationId: Number(data.startStationId),
          destinationStationId: Number(data.destinationStationId),
          startedAt: data.startedAt,
        });
        setPhase(PLANNING_PHASE);
      })
      .catch((e) => {
        setError(e.message);
      });
  };

  const handlePlayAgain = () => {
    setPhase(SETUP_PHASE);
    setEvents([]);
    setFinalScore(null);
    setIsRouteValid(null);
    setGame(null);
    submittedRef.current = false;
    setError("");
  };

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
                network={network}
                segments={segments}
                onSubmitRoute={handleSubmitRoute}
                game={game}
                gameControlsError={gameControlsError}
                onStartGame={handleStartGame}
                isSubmitting={isSubmitting}
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

export default GamePage;
