export function getLineName(network, lineId) {
  const line = network?.lines?.find(
    (line) => Number(line.id) === Number(lineId),
  );

  return line?.name ?? "Unknown line";
}

export function getStationName(network, stationId) {
  const station = network?.stations?.find(
    (station) => Number(station.id) === Number(stationId),
  );

  return station?.name ?? "Unknown station";
}
