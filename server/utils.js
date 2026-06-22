import { getEvents } from "./games-dao.js";

export function createSegments(linesStations) {
  const segments = [];

  linesStations.forEach((line) => {
    for (let i = 0; i < line.stationIds.length - 1; i++) {
      // From
      const a = line.stationIds[i];
      // To
      const b = line.stationIds[i + 1];

      // Order them
      const from = Math.min(a, b);
      const to = Math.max(a, b);

      const alreadyExists = segments.some(
        (segment) => segment.from === from && segment.to === to,
      );

      if (!alreadyExists) {
        segments.push({
          from,
          to,
          lines: [line.lineId],
        });
      } else {
        // Add the other line to the lines array
        const existing = segments
          .find((segment) => segment.from === from && segment.to === to)
          .lines.push(line);
      }
    }
  });
  return segments;
}

export function groupStationsByLine(linesStationsRow) {
  const map = new Map();

  // I use map to group lines, so all elements of line_id 1 are together, ecc...
  linesStationsRow.forEach((l) => {
    if (!map.has(l.line_id)) {
      // If map doesn't already have an entry with this line id, then I create it as an empty array
      map.set(l.line_id, []);
    }

    map.get(l.line_id).push({
      // for each line id, I push the object with station id and stop order
      stationId: l.station_id,
      stopOrder: l.stop_order,
    });
  });

  return Array.from(map.entries()).map(
    // for each entry in the map I get the lineid and stations
    ([lineId, stations]) => {
      return {
        lineId: lineId,
        stationIds: stations // sort stops' id by stop order
          .sort((a, b) => a.stopOrder - b.stopOrder)
          .map((stop) => stop.stationId),
      };
    },
  );
}

function buildGraph(linesStations) {
  const graph = {}; // Every station will have the list of all the nearby stations

  // One line at a time
  for (const line of linesStations) {
    for (let i = 0; i < line.stationIds.length - 1; i++) {
      const currentStation = line.stationIds[i];
      // This is after the current station
      const nextStation = line.stationIds[i + 1];

      if (!graph[currentStation]) {
        // If station is not already in the graph, we initialize the associated array
        graph[currentStation] = [];
      }

      if (!graph[nextStation]) {
        // If station is not already in the graph, we initialize the associated array
        graph[nextStation] = [];
      }

      // push the next station in the object
      graph[currentStation].push(nextStation);
      graph[nextStation].push(currentStation);
    }
  }
  return graph;
}

function getDistances(graph, startStationId) {
  // https://www.geeksforgeeks.org/javascript/bfs-using-javascript/
  const distances = {
    [startStationId]: 0, // Start station has distance 0 from itself
  };

  const queue = [startStationId]; // We use BFS to calculate the distances, and at gfirst the queue contains only the starting station

  while (queue.length > 0) {
    // loop until there are stations to check
    const currentStation = queue.shift(); // Remove and get the first element of the queue (array)

    graph[currentStation].forEach((neighbor) => {
      // Check every station connected to the current station
      if (!distances[neighbor]) {
        // If there is no distance, that station has not been checked yet
        distances[neighbor] = distances[currentStation] + 1; // save the distance
        queue.push(neighbor); // add neighbor to the queue, so that next we check the neighbors of the neighbor
      }
    });
  }

  return distances;
}

function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

export function getStartAndDestinationStationIds(linesStations) {
  const graph = buildGraph(linesStations);
  const stationIds = Object.keys(graph).map(Number); // Get stationIds, as number

  let startStationId;
  let validDestinations = [];

  // loop until the selected starting station has at least a destination that is three segmenets or more far
  do {
    startStationId = getRandomElement(stationIds); // Select random station

    const distances = getDistances(graph, startStationId); // compute the distances of that station

    validDestinations = stationIds.filter(
      (stationId) => distances[stationId] >= 3,
    ); // valid destionations has all the destinations which are 3 or more segments far from the start
  } while (validDestinations.length === 0);

  const destinationStationId = getRandomElement(validDestinations); // Of those valid destinations, pick one at random

  return [startStationId, destinationStationId];
}

export async function drawEventsFromSegments(events, segments) {
  return segments.map((segment) => {
    const drawnEvent = events[Math.floor(Math.random() * events.length)];
    return {
      segment,
      drawnEvent,
    };
  });
}

export function validateRoute(
  selectedSegments,
  linesStations,
  startStationId,
  destinationStationId,
) {
  if (!Array.isArray(selectedSegments) || selectedSegments.length === 0) {
    return false;
  }

  // Start from the start station
  let currentStationId = Number(startStationId);
  // Remember used segments
  const usedSegments = new Set();

  // For each segment of the selectedSegments
  for (const segment of selectedSegments) {
    const from = Number(segment.from);
    const to = Number(segment.to);

    if (!Number.isInteger(from) || !Number.isInteger(to)) {
      return false;
    }

    // Check that the segment really exist
    const segmentExists = linesStations.some((line) => {
      const stationIds = line.stationIds.map(Number);

      for (let i = 0; i < stationIds.length - 1; i++) {
        // For each station of the line I check if the segment exists
        const stationA = stationIds[i];
        const stationB = stationIds[i + 1];

        if (
          (stationA === from && stationB === to) ||
          (stationA === to && stationB === from)
        ) {
          return true;
        }
      }

      return false;
    });

    if (!segmentExists) {
      // Invalid route if the segment doesn't exist
      return false;
    }

    const segmentKey = [from, to].sort((a, b) => a - b).join("-"); // Create unique key to consider 1->2 and 2->1 the same

    if (usedSegments.has(segmentKey)) {
      // If a segment is used more than once, then the route is not valid
      return false;
    }

    usedSegments.add(segmentKey);
    // Check contiguity of stations
    if (currentStationId === from) {
      currentStationId = to;
    } else if (currentStationId === to) {
      currentStationId = from;
    } else {
      return false;
    }
  }

  // Check that the final station is the dest station
  if (currentStationId !== Number(destinationStationId)) {
    return false;
  }

  return true;
}
