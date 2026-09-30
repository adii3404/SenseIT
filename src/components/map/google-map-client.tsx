"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import {
  GoogleMap,
  InfoWindowF,
  MarkerF,
  PolygonF,
  useJsApiLoader,
} from "@react-google-maps/api";
import {
  AlertCircle,
  Compass,
  Map as MapIcon,
  Minus,
  Plus,
  RotateCcw,
  X,
} from "lucide-react";
import { FLOOD_ZONE, REGION } from "@/lib/geo";
import type { MapAsset } from "@/lib/types";
import { SEVERITY_STYLE, KIND_META } from "@/lib/types";
import { pinDataUrl } from "./map-pin";
import { MapToolbar } from "./map-toolbar";
import { useSenseIT } from "@/components/senseit-provider";
import { FallbackMap } from "./fallback-map";

/** Dark Tactical Radar style for emergency operations */
const DARK_RADAR_STYLES: google.maps.MapTypeStyle[] = [
  { elementType: "geometry", stylers: [{ color: "#111827" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#111827" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#9ca3af" }] },
  { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#d1d5db" }] },
  { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#6b7280" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#1f2937" }] },
  { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#4b5563" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#1f2937" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#111827" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#9ca3af" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#374151" }] },
  { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#1f2937" }] },
  { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#f3f4f6" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#030712" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#3b82f6" }] },
  { featureType: "water", elementType: "labels.text.stroke", stylers: [{ color: "#030712" }] },
];

/** Standard clean styling with subtle oceanic emphasis */
const STANDARD_STYLES: google.maps.MapTypeStyle[] = [
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#c9e2ff" }] },
  { featureType: "landscape.natural", elementType: "geometry", stylers: [{ color: "#f1f5f9" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#dcfce7" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#fed7aa" }] },
];

export function GoogleMapClient({
  apiKey,
  assets,
}: {
  apiKey: string;
  assets: MapAsset[];
}) {
  const {
    mapTheme,
    selectedAssetId,
    setSelectedAssetId,
    severityFilter,
  } = useSenseIT();

  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);
  const [authError, setAuthError] = useState(false);
  const [showNotice, setShowNotice] = useState(true);

  // Catch Google Maps authentication or billing failure
  useEffect(() => {
    const originalFailure = (window as unknown as { gm_authFailure?: () => void }).gm_authFailure;
    (window as unknown as { gm_authFailure?: () => void }).gm_authFailure = () => {
      console.warn("[senseit] Google Maps API requires billing to be enabled. Using fallback map.");
      setAuthError(true);
      if (typeof originalFailure === "function") originalFailure();
    };
  }, []);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey,
    id: "senseit-map-loader",
  });

  // Filter assets by critical severity if filter active
  const filteredAssets = useMemo(() => {
    let list = assets;
    if (severityFilter === "critical") {
      list = list.filter((a) => a.severity === "critical");
    }
    return list;
  }, [assets, severityFilter]);

  // Selected asset
  const selected = assets.find((a) => a.id === selectedAssetId) ?? null;

  // Pan to selected asset when selectedAssetId changes
  useEffect(() => {
    if (mapInstance && selected) {
      mapInstance.panTo({ lat: selected.lat, lng: selected.lng });
      if (mapInstance.getZoom()! < 13) {
        mapInstance.setZoom(14);
      }
    }
  }, [mapInstance, selected]);

  // Handle map instance load
  const onMapLoad = useCallback((map: google.maps.Map) => {
    setMapInstance(map);
  }, []);

  const onMapUnmount = useCallback(() => {
    setMapInstance(null);
  }, []);

  // Map type resolution
  const mapTypeId = mapTheme === "satellite" ? "hybrid" : "roadmap";
  const styles = mapTheme === "dark" ? DARK_RADAR_STYLES : STANDARD_STYLES;

  // Zoom handlers
  const handleZoomIn = () => {
    if (mapInstance) {
      mapInstance.setZoom((mapInstance.getZoom() ?? REGION.zoom) + 1);
    }
  };

  const handleZoomOut = () => {
    if (mapInstance) {
      mapInstance.setZoom((mapInstance.getZoom() ?? REGION.zoom) - 1);
    }
  };

  const handleReset = () => {
    if (mapInstance) {
      mapInstance.panTo(REGION.center);
      mapInstance.setZoom(REGION.zoom);
    }
  };

  // If Google Maps key requires billing or encounters loadError, fallback gracefully
  if (authError || loadError) {
    return (
      <div className="relative h-full w-full">
        <FallbackMap assets={assets} />
        {showNotice && (
          <div className="absolute top-16 right-4 z-40 max-w-sm rounded-2xl border border-blue-200 bg-white/95 p-3.5 shadow-xl backdrop-blur animate-fade-up">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-blue-600 shrink-0" />
                <p className="text-xs font-bold text-gray-900">
                  Google Cloud Notice
                </p>
              </div>
              <button
                onClick={() => setShowNotice(false)}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Dismiss notice"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <p className="mt-1.5 text-[11px] text-gray-600 leading-relaxed">
              Your Google Cloud API Key is linked. If Google Maps prompts for billing in your Cloud Console,
              SenseIT automatically maintains full interactive situational map tracking.
            </p>
          </div>
        )}
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="absolute inset-0 grid place-items-center bg-slate-900">
        <div className="flex flex-col items-center gap-3 text-slate-300">
          <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg">
            <MapIcon className="h-6 w-6 animate-pulse" />
          </div>
          <p className="text-sm font-semibold tracking-wide">
            Initializing Google Maps Hydrography…
          </p>
          <span className="text-xs text-slate-500">Bay of Bengal Sector · Gopalpur Coast</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* Dynamic Floating Capsule Search Bar + Connected Plus Dropdown */}
      <MapToolbar />

      {/* Real Interactive Google Map */}
      <GoogleMap
        mapContainerClassName="absolute inset-0 h-full w-full"
        center={REGION.center}
        zoom={REGION.zoom}
        onLoad={onMapLoad}
        onUnmount={onMapUnmount}
        mapTypeId={mapTypeId}
        options={{
          styles: mapTheme === "satellite" ? undefined : styles,
          disableDefaultUI: true,
          zoomControl: false,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
          clickableIcons: false,
          gestureHandling: "greedy",
        }}
      >
        {/* Cyclone Projected Flood Zone Polygon */}
        <PolygonF
          paths={FLOOD_ZONE}
          options={{
            fillColor: mapTheme === "dark" ? "#38bdf8" : "#4285f4",
            fillOpacity: mapTheme === "dark" ? 0.28 : 0.22,
            strokeColor: mapTheme === "dark" ? "#38bdf8" : "#2563eb",
            strokeWeight: 2.5,
            strokeOpacity: 0.9,
            clickable: true,
          }}
        />

        {/* Dynamic Markers for Exposed Infrastructure */}
        {filteredAssets.map((a) => (
          <MarkerF
            key={a.id}
            position={{ lat: a.lat, lng: a.lng }}
            title={`${a.name} (${SEVERITY_STYLE[a.severity].label})`}
            icon={{
              url: pinDataUrl(a.kind),
              scaledSize: new google.maps.Size(36, 40),
              anchor: new google.maps.Point(18, 40),
            }}
            onClick={() => {
              setSelectedAssetId(a.id);
            }}
          />
        ))}

        {/* Interactive InfoWindow for Active Asset */}
        {selected && (
          <InfoWindowF
            position={{ lat: selected.lat, lng: selected.lng }}
            options={{
              pixelOffset: new google.maps.Size(0, -42),
              maxWidth: 290,
            }}
            onCloseClick={() => setSelectedAssetId(null)}
          >
            <div className="p-1">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-bold text-gray-900 leading-tight">
                  {selected.name}
                </p>
              </div>

              <div className="mt-1.5 flex items-center gap-1.5">
                <span
                  className={`inline-block rounded-md border px-2 py-0.5 text-[10px] font-bold ${SEVERITY_STYLE[selected.severity].chip}`}
                >
                  {SEVERITY_STYLE[selected.severity].label} · {selected.risk}%
                </span>
                <span className="rounded-md bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-600">
                  {KIND_META[selected.kind].label}
                </span>
              </div>

              <p className="mt-2 text-xs leading-relaxed text-gray-600">
                {selected.impactNote}
              </p>

              <div className="mt-2.5 border-t border-gray-100 pt-2 text-[11px] text-gray-500 flex justify-between items-center font-medium">
                <span>{selected.ward}</span>
                <span>{selected.population.toLocaleString("en-IN")} people</span>
              </div>
            </div>
          </InfoWindowF>
        )}
      </GoogleMap>

      {/* Custom Bottom-Left Zoom & Situation Controls */}
      <div className="absolute bottom-6 left-4 z-30 flex flex-col items-center gap-1.5 overflow-hidden rounded-2xl bg-white/95 p-1 shadow-lg backdrop-blur-md border border-gray-200/80">
        <button
          onClick={handleZoomIn}
          className="grid h-9 w-9 place-items-center rounded-xl text-gray-700 transition hover:bg-gray-100 active:scale-95"
          title="Zoom in"
          aria-label="Zoom in"
        >
          <Plus className="h-4 w-4" />
        </button>
        <button
          onClick={handleReset}
          className="grid h-8 w-9 place-items-center rounded-lg text-gray-500 transition hover:bg-gray-100 text-[10px] font-bold"
          title="Reset to Bay of Bengal"
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={handleZoomOut}
          className="grid h-9 w-9 place-items-center rounded-xl text-gray-700 transition hover:bg-gray-100 active:scale-95"
          title="Zoom out"
          aria-label="Zoom out"
        >
          <Minus className="h-4 w-4" />
        </button>
      </div>

      {/* Attribution & Google Maps Live Indicator */}
      <div className="absolute bottom-4 right-4 z-20 flex items-center gap-2 rounded-full border border-gray-200/80 bg-white/90 px-3 py-1 text-[11px] font-semibold text-gray-700 shadow-sm backdrop-blur">
        <Compass className="h-3.5 w-3.5 text-blue-600 animate-spin" style={{ animationDuration: "12s" }} />
        <span>Google Maps Active · {mapTheme.toUpperCase()}</span>
      </div>
    </div>
  );
}
