"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import L from "leaflet";
import {
  Compass,
  Minus,
  Plus,
  RotateCcw,
  Sparkles,
  Waves,
} from "lucide-react";
import { FLOOD_ZONE, REGION } from "@/lib/geo";
import type { MapAsset } from "@/lib/types";
import { SEVERITY_STYLE, KIND_META } from "@/lib/types";
import { MapToolbar } from "./map-toolbar";
import { useSenseIT, type MapTheme } from "@/components/senseit-provider";

// Tile layer URLs for standard, dark, and satellite themes
const TILES: Record<
  MapTheme | "transit",
  {
    url: string;
    options: {
      attribution: string;
      maxZoom?: number;
      subdomains?: string;
    };
  }
> = {
  satellite: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    options: {
      attribution:
        "Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics, GIS Community",
      maxZoom: 19,
    },
  },
  dark: {
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    options: {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: "abcd",
      maxZoom: 20,
    },
  },
  standard: {
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    options: {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    },
  },
  transit: {
    url: "https://{s}.tiles.openrailwaymap.org/standard/{z}/{x}/{y}.png",
    options: {
      attribution:
        '&copy; <a href="https://www.openrailwaymap.org">OpenRailwayMap</a>',
      maxZoom: 19,
    },
  },
};

// Cyclone trajectory points (Bay of Bengal towards Gopalpur Coast)
const CYCLONE_TRACK: [number, number][] = [
  [18.25, 86.4],
  [18.55, 85.95],
  [18.85, 85.5],
  [19.12, 85.15],
  [19.312, 84.905],
];

// SVG Icon paths for custom markers
function getMarkerIconHtml(asset: MapAsset, isSelected: boolean) {
  const isCritical = asset.severity === "critical";
  const bg = isCritical
    ? "#dc2626"
    : asset.severity === "high"
    ? "#ea580c"
    : "#2563eb";
  const pulseClass = isCritical ? "animate-ping opacity-75" : "";

  let iconSvg = "";
  if (asset.kind === "medical") {
    iconSvg = `<svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/></svg>`;
  } else if (asset.kind === "power") {
    iconSvg = `<svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>`;
  } else if (asset.kind === "shelter") {
    iconSvg = `<svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>`;
  } else {
    iconSvg = `<svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>`;
  }

  return `
    <div class="relative flex items-center justify-center cursor-pointer select-none" style="transform: translate(-50%, -50%);">
      ${
        isCritical
          ? `<span class="absolute inline-flex h-11 w-11 rounded-full bg-red-400 opacity-60 ${pulseClass}"></span>`
          : ""
      }
      <div class="relative flex items-center gap-1.5 rounded-full px-2.5 py-1.5 shadow-xl border-2 ${
        isSelected ? "border-white ring-4 ring-blue-500 scale-110" : "border-white/90"
      } transition-transform duration-200" style="background-color: ${bg};">
        <span class="flex items-center justify-center">${iconSvg}</span>
        <span class="text-[11px] font-black tracking-tight text-white font-mono">${asset.risk}%</span>
      </div>
      <div class="absolute -bottom-1.5 w-2 h-2 rotate-45 border-r border-b border-white" style="background-color: ${bg};"></div>
    </div>
  `;
}

export function LeafletMapInner({ assets }: { assets: MapAsset[] }) {
  const {
    mapTheme,
    selectedAssetId,
    setSelectedAssetId,
    severityFilter,
    showTransit,
  } = useSenseIT();

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const baseLayerRef = useRef<L.TileLayer | null>(null);
  const transitLayerRef = useRef<L.TileLayer | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const overlaysLayerRef = useRef<L.LayerGroup | null>(null);

  // Filtered assets by severity
  const filteredAssets = useMemo(() => {
    if (severityFilter === "critical") {
      return assets.filter((a) => a.severity === "critical");
    }
    return assets;
  }, [assets, severityFilter]);

  // Selected asset
  const selected = assets.find((a) => a.id === selectedAssetId) ?? null;

  // 1. Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [REGION.center.lat, REGION.center.lng],
      zoom: REGION.zoom,
      zoomControl: false,
      attributionControl: false,
    });

    // Custom attribution control (bottom-left)
    L.control
      .attribution({
        position: "bottomleft",
        prefix:
          '<a href="https://leafletjs.com" target="_blank" rel="noopener">Leaflet</a> · SenseIT GIS',
      })
      .addTo(map);

    // Initial base layer
    const activeTile = TILES[mapTheme] || TILES.standard;
    const baseTile = L.tileLayer(activeTile.url, activeTile.options).addTo(map);
    baseLayerRef.current = baseTile;

    // Layer groups for markers and overlays
    const overlays = L.layerGroup().addTo(map);
    overlaysLayerRef.current = overlays;

    const markersGroup = L.layerGroup().addTo(map);
    markersLayerRef.current = markersGroup;

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // 2. Handle Base Layer Theme Switch (Satellite, Dark, Roadmap)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (baseLayerRef.current) {
      map.removeLayer(baseLayerRef.current);
    }

    const targetTile = TILES[mapTheme] || TILES.standard;
    const newBase = L.tileLayer(targetTile.url, targetTile.options).addTo(map);
    baseLayerRef.current = newBase;
  }, [mapTheme]);

  // 3. Handle Transit Overlay Toggle
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (showTransit) {
      if (!transitLayerRef.current) {
        transitLayerRef.current = L.tileLayer(
          TILES.transit.url,
          TILES.transit.options,
        );
      }
      transitLayerRef.current.addTo(map);
    } else if (transitLayerRef.current) {
      map.removeLayer(transitLayerRef.current);
      transitLayerRef.current = null;
    }
  }, [showTransit]);

  // 4. Render Flood Surge Polygon & Cyclone Track Overlays
  useEffect(() => {
    const overlays = overlaysLayerRef.current;
    if (!overlays) return;

    overlays.clearLayers();

    // Projected Storm Surge Zone (GeoJSON Polygon)
    const surgeLatLngs: [number, number][] = FLOOD_ZONE.map((p) => [
      p.lat,
      p.lng,
    ]);

    const surgePolygon = L.polygon(surgeLatLngs, {
      color: "#0284c7",
      weight: 2,
      dashArray: "6, 6",
      fillColor: "#0ea5e9",
      fillOpacity: 0.35,
    });
    surgePolygon.bindTooltip(
      '<div class="font-bold text-xs text-blue-900">🌊 Projected 3.2m Surge Contour<br/><span class="text-[10px] text-blue-700 font-normal">Immediate Inundation Boundary</span></div>',
      { sticky: true, opacity: 0.95 },
    );
    overlays.addLayer(surgePolygon);

    // Cyclone Trajectory Polyline
    const cyclonePath = L.polyline(CYCLONE_TRACK, {
      color: "#ef4444",
      weight: 3.5,
      dashArray: "8, 8",
      opacity: 0.9,
    });
    cyclonePath.bindTooltip(
      '<div class="font-bold text-xs text-red-900">🌀 Cyclone Dana-3 Landfall Track<br/><span class="text-[10px] text-red-700 font-normal">Category 4 · Sustained 145 km/h</span></div>',
      { sticky: true, opacity: 0.95 },
    );
    overlays.addLayer(cyclonePath);

    // Cyclone Eye Marker (current coordinates)
    const eyeCoord = CYCLONE_TRACK[0];
    const eyeIcon = L.divIcon({
      className: "cyclone-eye-icon",
      html: `
        <div class="relative flex items-center justify-center" style="transform: translate(-50%, -50%);">
          <span class="absolute inline-flex h-14 w-14 rounded-full bg-red-500 opacity-40 animate-ping"></span>
          <div class="relative flex h-8 w-8 items-center justify-center rounded-full bg-red-600 text-white shadow-2xl border-2 border-white animate-spin" style="animation-duration: 4s;">
            <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 3a9 9 0 109 9 9 9 0 00-9-9zm0 6a3 3 0 103 3 3 3 0 00-3-3z"/>
            </svg>
          </div>
        </div>
      `,
      iconSize: [0, 0],
    });
    const eyeMarker = L.marker(eyeCoord, { icon: eyeIcon });
    eyeMarker.bindPopup(
      `
      <div class="p-1 font-sans text-xs">
        <p class="font-black text-red-700 uppercase tracking-wider text-[11px]">Eye of Cyclone Dana-3</p>
        <p class="font-bold text-gray-900 mt-0.5">Sustained Winds: 145 km/h (Gusts: 175 km/h)</p>
        <p class="text-gray-600 text-[10px] mt-0.5">Central Pressure: 968 hPa · Speed: 14 km/h NW</p>
      </div>
      `,
      { closeButton: false },
    );
    overlays.addLayer(eyeMarker);
  }, []);

  // 5. Render Asset Markers
  useEffect(() => {
    const markersGroup = markersLayerRef.current;
    if (!markersGroup) return;

    markersGroup.clearLayers();

    filteredAssets.forEach((asset) => {
      const isSelected = asset.id === selectedAssetId;
      const customIcon = L.divIcon({
        className: "senseit-marker-icon",
        html: getMarkerIconHtml(asset, isSelected),
        iconSize: [0, 0],
      });

      const marker = L.marker([asset.lat, asset.lng], {
        icon: customIcon,
        zIndexOffset: isSelected ? 1000 : asset.severity === "critical" ? 500 : 100,
      });

      // Rich Tactical Popup
      const sevMeta = SEVERITY_STYLE[asset.severity];
      const kindMeta = KIND_META[asset.kind];
      const popupHtml = `
        <div class="min-w-[220px] max-w-[260px] p-1 font-sans">
          <div class="flex items-center justify-between border-b border-gray-100 pb-1.5 mb-1.5">
            <span class="text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${sevMeta.chip}">
              ${asset.severity} (${asset.risk}% Risk)
            </span>
            <span class="text-[10px] text-gray-400">${asset.ward}</span>
          </div>
          <h4 class="text-xs font-black text-gray-900 leading-snug">${asset.name}</h4>
          <p class="text-[11px] text-gray-600 mt-1 leading-relaxed">${asset.impactNote}</p>
          <div class="mt-2 pt-1.5 border-t border-gray-100 flex items-center justify-between text-[10px]">
            <span class="text-gray-500 font-medium">Population Impact:</span>
            <span class="font-bold text-gray-800">${asset.population.toLocaleString()}</span>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml, {
        closeButton: true,
        className: "senseit-tactical-popup",
        offset: [0, -20],
      });

      marker.on("click", () => {
        setSelectedAssetId(asset.id);
      });

      markersGroup.addLayer(marker);
    });
  }, [filteredAssets, selectedAssetId, setSelectedAssetId]);

  // 6. Fly to selected asset when selectedAssetId changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selected) return;

    map.flyTo([selected.lat, selected.lng], 14, {
      duration: 1.2,
      easeLinearity: 0.25,
    });
  }, [selected]);

  // Zoom and Reset Handlers
  const handleZoomIn = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomIn();
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomOut();
  };

  const handleReset = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(
        [REGION.center.lat, REGION.center.lng],
        REGION.zoom,
        { duration: 1 },
      );
    }
  };

  return (
    <div className="relative h-full w-full overflow-hidden bg-slate-900 select-none">
      {/* Dynamic Floating Capsule Search Bar + Controls */}
      <MapToolbar />

      {/* Real Interactive Leaflet GIS Map Canvas */}
      <div ref={mapContainerRef} className="h-full w-full z-10" />

      {/* Floating Tactical Map Controls (Right Side) */}
      <div className="absolute right-4 bottom-6 z-30 flex flex-col gap-2">
        <div className="flex flex-col rounded-xl border border-gray-200/80 bg-white/95 p-1 shadow-lg backdrop-blur-md">
          <button
            onClick={handleZoomIn}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-700 hover:bg-gray-100 hover:text-blue-600 transition"
            title="Zoom In"
            aria-label="Zoom in"
          >
            <Plus className="h-4 w-4" />
          </button>
          <div className="h-[1px] w-full bg-gray-100 my-0.5" />
          <button
            onClick={handleZoomOut}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-700 hover:bg-gray-100 hover:text-blue-600 transition"
            title="Zoom Out"
            aria-label="Zoom out"
          >
            <Minus className="h-4 w-4" />
          </button>
        </div>

        <button
          onClick={handleReset}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200/80 bg-white/95 text-gray-700 shadow-lg backdrop-blur-md hover:bg-gray-100 hover:text-blue-600 transition"
          title="Reset View to Gopalpur Coast"
          aria-label="Reset map view"
        >
          <RotateCcw className="h-4 w-4" />
        </button>

        <div
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200/80 bg-white/95 text-blue-600 shadow-lg backdrop-blur-md pointer-events-none"
          title="Compass Bearing: North"
        >
          <Compass className="h-4 w-4 animate-pulse" />
        </div>
      </div>

      {/* Live Radar GIS Telemetry Watermark Badge (Top Right) */}
      <div className="absolute top-4 right-4 z-20 hidden lg:flex items-center gap-2 rounded-full border border-blue-900/40 bg-slate-900/80 px-3 py-1.5 text-xs text-white backdrop-blur shadow-md">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span className="font-mono text-[11px] tracking-wide text-slate-300">
          GIS Hydrography · {mapTheme.toUpperCase()}
        </span>
      </div>
    </div>
  );
}
