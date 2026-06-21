import { Card } from "react-bootstrap";
import { RouteRules } from "../GamePhases";
export default function PlanningPhase({ network }) {
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
