import { Alert, Badge, Button, Card, Col, Row } from "react-bootstrap";
import { getStationName } from "../../utils";
import { useState } from "react";
import ArrowIcon from "../icons/ArrowIcon";

export default function ExecutionPhase({
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
              <div className="d-flex align-items-center gap-3">
                <span className="border rounded px-3 py-2 bg-light fw-semibold text-center">
                  {getStationName(network, segment.from)}
                </span>
                <ArrowIcon size={20} className="text-secondary" />
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
