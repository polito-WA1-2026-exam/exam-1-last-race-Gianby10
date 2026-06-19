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
