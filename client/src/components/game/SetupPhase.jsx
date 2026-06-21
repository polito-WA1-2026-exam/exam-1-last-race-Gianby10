import { Card, Col, Row } from "react-bootstrap";
import { getLineName, getStationName } from "../../utils.js";
import ArrowIcon from "../../components/icons/ArrowIcon.jsx";
export default function SetupPhase({ network }) {
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
                        key={`${index}-${stationId}`}
                        className="d-flex align-items-center gap-2"
                      >
                        <span className="border rounded px-2 py-1 bg-light small fw-semibold shadow-sm">
                          {getStationName(network, stationId)}
                        </span>

                        {index < lineStation.station_ids.length - 1 && (
                          <ArrowIcon size={15} className="text-secondary" />
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
