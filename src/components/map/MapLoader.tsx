"use client";

import dynamic from "next/dynamic";

import AddressFallback from "./AddressFallback";
import type { MapPoint, MapVariant } from "./types";

const CarMap = dynamic(() => import("./CarMap"), {
  ssr: false,
  loading: () => <MapSkeleton label="Loading pickup map…" />,
});

const TripMap = dynamic(() => import("./TripMap"), {
  ssr: false,
  loading: () => <MapSkeleton label="Loading trip map…" variant="trip" />,
});

function MapSkeleton({
  label,
  variant = "pickup",
}: {
  label: string;
  variant?: MapVariant;
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`grid w-full place-items-center bg-surface-2 ${
        variant === "trip" ? "h-[240px] sm:h-[280px]" : "h-[260px] sm:h-[300px]"
      }`}
    >
      <span className="sr-only">{label}</span>
      <span
        aria-hidden="true"
        className="size-7 animate-spin rounded-full border-2 border-border border-t-ink"
      />
    </div>
  );
}

/**
 * Browser-only Leaflet wrapper.
 *
 * Both maps are imported with `ssr: false` because Leaflet reads `window` on
 * import. The address block is rendered outside the dynamic chunk, so it is
 * present even before the map loads, when JavaScript is unavailable, or when
 * the tile server cannot be reached.
 */
export default function MapLoader({
  point,
  variant = "pickup",
  simulate = false,
  className = "",
}: {
  point: MapPoint;
  variant?: MapVariant;
  simulate?: boolean;
  className?: string;
}) {
  const valid =
    Number.isFinite(point.latitude) &&
    Number.isFinite(point.longitude) &&
    Math.abs(point.latitude) <= 90 &&
    Math.abs(point.longitude) <= 180;

  if (!valid) {
    return (
      <div className={className}>
        <AddressFallback point={point} compact />
      </div>
    );
  }

  return (
    <div
      className={`overflow-hidden rounded-lg border border-border bg-surface ${className}`}
    >
      {variant === "trip" ? (
        <TripMap point={point} simulate={simulate} />
      ) : (
        <CarMap point={point} />
      )}
      <AddressFallback point={point} />
    </div>
  );
}
