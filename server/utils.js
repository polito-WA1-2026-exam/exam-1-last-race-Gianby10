export function createSegments(linesStations) {
  const segments = [];

  linesStations.forEach((line) => {
    for (let i = 0; i < line.station_ids.length - 1; i++) {
      // From
      const a = line.station_ids[i];
      // To
      const b = line.station_ids[i + 1];

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
          lines: [line.line_id],
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
        line_id: lineId,
        station_ids: stations // sort stops' id by stop order
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
    for (let i = 0; i < line.station_ids.length - 1; i++) {
      const currentStation = line.station_ids[i];
      // This is after the current station
      const nextStation = line.station_ids[i + 1];

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
