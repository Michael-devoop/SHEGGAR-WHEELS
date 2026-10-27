import { ExternalLink, MapPin } from "lucide-react";

import type { MapPoint } from "./types";

/**
 * Static address details shown under every map, and used alone when the
 * coordinates are missing. Leaflet needs JavaScript and a third-party tile
 * server, so the pickup address must still be readable without either.
 */
export default function AddressFallback({
  point,
  compact = false,
}: {
  point: MapPoint;
  compact?: boolean;
}) {
  const { latitude, longitude, label, neighbourhood, city } = point;
  const hasCoordinates =
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    Math.abs(latitude) <= 90 &&
    Math.abs(longitude) <= 180;
  const directions = hasCoordinates
    ? `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=16/${latitude}/${longitude}`
    : null;

  return (
    <div
      className={
        compact
          ? "flex items-start gap-3 rounded-lg border border-border bg-surface p-4"
          : "flex flex-wrap items-start gap-3 border-t border-border bg-surface p-4"
      }
    >
      <MapPin aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-ink-muted" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-ink">{label}</p>
        <p className="mt-0.5 text-sm text-ink-muted">
          {neighbourhood}, {city}
        </p>
        <p className="mt-1 text-xs tabular-nums text-ink-muted">
          {hasCoordinates
            ? `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
            : "Coordinates unavailable"}
        </p>
      </div>
      {directions ? (
        <a
          href={directions}
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-11 items-center gap-1.5 rounded-md px-2 text-sm font-medium text-ink transition-colors hover:bg-surface-2"
        >
          OpenStreetMap
          <ExternalLink aria-hidden="true" className="size-3.5" />
        </a>
      ) : null}
    </div>
  );
}
