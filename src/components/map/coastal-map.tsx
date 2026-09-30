"use client";

import type { MapAsset } from "@/lib/types";
import { GoogleMapClient } from "./google-map-client";
import { FallbackMap } from "./fallback-map";
import { useSenseIT } from "@/components/senseit-provider";

/**
 * Renders the Google Maps API by default when an API key is available.
 * Falls back to the illustrated canvas map only if no key is set.
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

  // Always try Google Maps when key exists — let the component handle billing errors internally
  if (effectiveKey) {
    return <GoogleMapClient apiKey={effectiveKey} assets={assets} />;
  }
  return <FallbackMap assets={assets} />;
}
