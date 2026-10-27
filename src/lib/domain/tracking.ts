export type RoutePoint = {
  latitude: number;
  longitude: number;
};

const ROUTE_OFFSETS: readonly (readonly [number, number])[] = [
  [0, 0],
  [0.0016, 0.0011],
  [0.003, 0.0027],
  [0.0048, 0.0039],
  [0.0036, 0.0056],
  [0.0014, 0.0049],
];

function roundCoordinate(value: number): number {
  return Number(value.toFixed(6));
}

export function buildSimulatedRoute(
  latitude: number,
  longitude: number,
): RoutePoint[] {
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return [];
  }

  return ROUTE_OFFSETS.map(([latitudeOffset, longitudeOffset]) => ({
    latitude: roundCoordinate(latitude + latitudeOffset),
    longitude: roundCoordinate(longitude + longitudeOffset),
  }));
}
