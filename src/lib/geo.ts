import type { LatLng } from "./types";

/** Map viewport — Gopalpur coastline, Bay of Bengal. */
export const REGION = {
  latMin: 19.24,
  latMax: 19.36,
  lngMin: 84.86,
  lngMax: 84.96,
  center: { lat: 19.3, lng: 84.91 } as LatLng,
  zoom: 13,
};

/** Projected storm-surge flood zone (real coordinates). */
export const FLOOD_ZONE: LatLng[] = [
  { lat: 19.345, lng: 84.903 },
  { lat: 19.338, lng: 84.907 },
  { lat: 19.322, lng: 84.922 },
  { lat: 19.3, lng: 84.928 },
  { lat: 19.276, lng: 84.928 },
  { lat: 19.256, lng: 84.915 },
  { lat: 19.262, lng: 84.902 },
  { lat: 19.286, lng: 84.909 },
  { lat: 19.309, lng: 84.913 },
  { lat: 19.331, lng: 84.898 },
];

const W = 1000;
const H = 700;

/** Projects real lat/lng into the illustrated fallback map's viewBox. */
export function project(lat: number, lng: number): { x: number; y: number } {
  return {
    x: ((lng - REGION.lngMin) / (REGION.lngMax - REGION.lngMin)) * W,
    y: ((REGION.latMax - lat) / (REGION.latMax - REGION.latMin)) * H,
  };
}

/** Human-friendly landfall phrasing, e.g. "Thursday around 6:40 AM". */
export function formatLandfall(iso: string): { relative: string; absolute: string } {
  const target = new Date(iso);
  const diffMs = Math.max(0, target.getTime() - Date.now());
  const hours = Math.floor(diffMs / 3_600_000);
  const minutes = Math.round((diffMs % 3_600_000) / 60_000);

  const relative =
    hours >= 1
      ? `Expected in about ${hours} hours${minutes >= 45 ? " and a half" : ""}`
      : `Expected in ${Math.max(1, minutes)} minutes`;

  const absolute = target.toLocaleDateString("en-US", {
    weekday: "long",
    hour: "numeric",
    minute: "2-digit",
  });

  return { relative, absolute: `Landfall ${absolute}` };
}
