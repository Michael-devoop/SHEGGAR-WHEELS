"use client";

import { useLeafletPointMap } from "./useLeafletPointMap";
import type { MapPoint } from "./types";

/** Pickup map for a listing, loaded only in the browser. */
export default function CarMap({ point }: { point: MapPoint }) {
  const mapRef = useLeafletPointMap({ point, variant: "pickup" });

  return (
    <div
      ref={mapRef}
      role="region"
      aria-label={`Map showing a sample pickup area for ${point.label}`}
      className="relative isolate z-0 h-[260px] w-full bg-surface-2 sm:h-[300px]"
    />
  );
}
