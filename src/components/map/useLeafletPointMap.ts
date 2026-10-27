"use client";

import { useEffect, useRef } from "react";
import type { Map as LeafletMap } from "leaflet";

import "leaflet/dist/leaflet.css";

import type { RoutePoint } from "@/lib/domain/tracking";

import type { MapPoint, MapVariant } from "./types";

const TILE_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
const EMPTY_ROUTE: readonly RoutePoint[] = [];

/**
 * Creates a Leaflet map inside the returned container ref.
 *
 * Leaflet touches `window` at import time, so it is imported inside the
 * effect and the map components are loaded with `ssr: false` by MapLoader.
 */
export function useLeafletPointMap({
  point,
  variant,
  route = EMPTY_ROUTE,
}: {
  point: MapPoint;
  variant: MapVariant;
  route?: readonly RoutePoint[];
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { latitude, longitude, label } = point;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let cancelled = false;
    let map: LeafletMap | undefined;
    let routeAnimation: number | undefined;

    void import("leaflet").then((L) => {
      if (cancelled) return;

      const styles = getComputedStyle(container);
      const action = styles.getPropertyValue("--color-action").trim() || "#0b0b0f";
      const accent = styles.getPropertyValue("--color-accent").trim() || "#f59e0b";
      const surface = styles.getPropertyValue("--color-bg").trim() || "#ffffff";
      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      map = L.map(container, {
        center: [latitude, longitude],
        zoom: variant === "trip" ? 16 : 15,
        scrollWheelZoom: false,
        dragging: !L.Browser.mobile,
        touchZoom: !L.Browser.mobile,
        doubleClickZoom: false,
        zoomAnimation: !reduceMotion,
        fadeAnimation: !reduceMotion,
      });

      L.tileLayer(TILE_URL, {
        maxZoom: 19,
        attribution: TILE_ATTRIBUTION,
      }).addTo(map);

      if (variant === "trip") {
        L.circle([latitude, longitude], {
          radius: 220,
          color: accent,
          weight: 1,
          opacity: 0.75,
          fillColor: accent,
          fillOpacity: 0.12,
          interactive: false,
        }).addTo(map);
      }

      const marker = L.circleMarker([latitude, longitude], {
        radius: 9,
        color: surface,
        weight: 3,
        fillColor: action,
        fillOpacity: 1,
      }).addTo(map);

      const popup = document.createElement("div");
      popup.className = "text-sm";
      const strong = document.createElement("strong");
      strong.textContent = label;
      const detail = document.createElement("span");
      detail.className = "mt-0.5 block text-xs text-zinc-600";
      detail.textContent = `${point.neighbourhood}, ${point.city}`;
      popup.append(strong, detail);
      marker.bindPopup(popup);

      if (route.length > 1) {
        L.polyline(
          route.map((entry): [number, number] => [
            entry.latitude,
            entry.longitude,
          ]),
          {
            color: action,
            weight: 3,
            opacity: 0.65,
            dashArray: "6 6",
            interactive: false,
          },
        ).addTo(map);

        if (!reduceMotion) {
          const routeMarker = L.circleMarker(
            [route[0].latitude, route[0].longitude],
            {
              radius: 7,
              color: surface,
              weight: 2,
              fillColor: accent,
              fillOpacity: 1,
            },
          ).addTo(map);

          let index = 0;
          routeAnimation = window.setInterval(() => {
            index = (index + 1) % route.length;
            routeMarker.setLatLng([
              route[index].latitude,
              route[index].longitude,
            ]);
          }, 1200);
        }
      }

      window.setTimeout(() => {
        if (!cancelled) map?.invalidateSize();
      }, 0);
    }).catch(() => {});

    return () => {
      cancelled = true;
      if (routeAnimation !== undefined) {
        window.clearInterval(routeAnimation);
      }
      map?.remove();
    };
  }, [
    latitude,
    longitude,
    label,
    point.neighbourhood,
    point.city,
    variant,
    route,
  ]);

  return containerRef;
}
