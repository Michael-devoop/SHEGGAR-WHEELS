"use client";

import { useMemo } from "react";

import { buildSimulatedRoute } from "@/lib/domain/tracking";

import { useLeafletPointMap } from "./useLeafletPointMap";
import type { MapPoint } from "./types";

/** Pickup area map for an active trip, loaded only in the browser. */
export default function TripMap({
  point,
  simulate = false,
}: {
  point: MapPoint;
  simulate?: boolean;
}) {
  const route = useMemo(
    () =>
      simulate ? buildSimulatedRoute(point.latitude, point.longitude) : [],
    [simulate, point.latitude, point.longitude],
  );
  const mapRef = useLeafletPointMap({ point, variant: "trip", route });

  return (
    <div
      ref={mapRef}
      role="region"
      aria-label={`Map showing the pickup and return area for ${point.label}.${
        simulate ? " The moving marker is a simulation, not live GPS." : ""
      }`}
      className="relative isolate z-0 h-[240px] w-full bg-surface-2 sm:h-[280px]"
    />
  );
}
