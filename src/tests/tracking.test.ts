import { describe, expect, it } from "vitest";

import { buildSimulatedRoute } from "@/lib/domain/tracking";

describe("buildSimulatedRoute", () => {
  it("starts at the pickup coordinates", () => {
    const [first] = buildSimulatedRoute(9.0192, 38.7525);

    expect(first).toEqual({ latitude: 9.0192, longitude: 38.7525 });
  });

  it("returns a deterministic six-point route", () => {
    const first = buildSimulatedRoute(9.0192, 38.7525);
    const second = buildSimulatedRoute(9.0192, 38.7525);

    expect(first).toHaveLength(6);
    expect(second).toEqual(first);
  });

  it("keeps the route close to the pickup point", () => {
    const route = buildSimulatedRoute(9.0192, 38.7525);

    for (const point of route) {
      expect(Math.abs(point.latitude - 9.0192)).toBeLessThan(0.01);
      expect(Math.abs(point.longitude - 38.7525)).toBeLessThan(0.01);
    }
  });

  it("rejects invalid coordinates", () => {
    expect(buildSimulatedRoute(Number.NaN, 38.7525)).toEqual([]);
    expect(buildSimulatedRoute(9.0192, Number.POSITIVE_INFINITY)).toEqual([]);
  });
});
