"use client";

import type { MapAsset } from "@/lib/types";
import { GoogleMapClient } from "./google-map-client";
import { LeafletMap } from "./leaflet-map";
import { useSenseIT } from "@/components/senseit-provider";

/**
 * CoastalMap is the central real-time interactive mapping engine.
 *
 * It provides:
 * 1. Full interactive GIS Mapping (Real Satellite Imagery via Esri, Dark Tactical Radar, and OpenStreetMap).
 * 2. If a Google Maps API Key is active, it runs Google Maps with automatic error resilience.
 * 3. Never falls back to a dead static SVG — always provides a fully workable, zoomable, draggable real map.
 */
export function CoastalMap({
  apiKey,
  assets,
}: {
  apiKey: string;
  assets: MapAsset[];
}) {
  const { customGoogleMapsKey } = useSenseIT();
  const effectiveKey = customGoogleMapsKey || apiKey;

  // If key exists, run Google Maps with automatic error resilience (falls back to Leaflet if billing fails)
  if (effectiveKey) {
    return <GoogleMapClient apiKey={effectiveKey} assets={assets} />;
  }

  // Without an API key (e.g., on Netlify or public repo), render the full interactive Leaflet GIS map with Satellite & Street tiles
  return <LeafletMap assets={assets} />;
}

