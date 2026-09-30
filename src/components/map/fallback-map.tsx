"use client";

import { useMemo, useState } from "react";
import { Compass, Maximize2, Minus, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { project, FLOOD_ZONE } from "@/lib/geo";
import type { MapAsset } from "@/lib/types";
import { KIND_META, SEVERITY_STYLE } from "@/lib/types";
import { MapPin } from "./map-pin";
import { MapToolbar } from "./map-toolbar";
import { useSenseIT } from "@/components/senseit-provider";

/* Coastline (single source used for land fill + beach stripe) */
const COAST =
  "M486,0 C462,84 520,152 604,214 C672,264 762,306 800,372 C824,414 770,520 664,612 C604,662 560,684 548,700";
const LAND = `${COAST} L0,700 L0,0 Z`;

const LOCAL_V = [62, 147, 232, 317, 470, 555, 640, 725];
const LOCAL_H = [110, 200, 300, 410, 480, 575, 660];

const BLOCKS: [number, number, number, number][] = [
  [256, 224, 44, 30], [308, 224, 36, 42], [256, 266, 30, 42], [312, 278, 42, 30],
  [206, 266, 34, 44], [256, 320, 44, 26], [316, 322, 32, 24],
  [522, 348, 36, 26], [566, 348, 30, 40], [522, 382, 28, 32], [600, 392, 34, 30],
  [408, 420, 42, 38], [366, 470, 36, 30], [420, 570, 46, 34],
];

export function FallbackMap({ assets }: { assets: MapAsset[] }) {
  const {
    searchQuery,
    selectedAssetId,
    setSelectedAssetId,
    mapTheme,
    severityFilter,
  } = useSenseIT();

  const [zoom, setZoom] = useState(1);

  const q = searchQuery.trim().toLowerCase();
  const matches = useMemo(
    () => (q ? assets.filter((a) => a.name.toLowerCase().includes(q)) : []),
    [q, assets],
  );

  const displayedAssets = useMemo(() => {
    if (severityFilter === "critical") {
      return assets.filter((a) => a.severity === "critical");
    }
    return assets;
  }, [assets, severityFilter]);

  const isDimmed = (a: MapAsset) => q.length > 0 && !matches.some((m) => m.id === a.id);
  const selected = assets.find((a) => a.id === selectedAssetId) ?? null;

  const floodPoints = FLOOD_ZONE.map((p) => {
    const { x, y } = project(p.lat, p.lng);
    return `${x},${y}`;
  }).join(" ");

  const zoomIn = () => setZoom((z) => Math.min(2.2, +(z + 0.25).toFixed(2)));
  const zoomOut = () => setZoom((z) => Math.max(1, +(z - 0.25).toFixed(2)));
  const resetZoom = () => setZoom(1);

  // Theme colors
  const themeConfig = {
    standard: {
      sea: "#AADAFF",
      land: "#F3F1ED",
      blocks: "#E9E7E3",
      parks: "#CDE6AC",
      roads: "#DADADA",
      roadsInner: "#FFFFFF",
      highway: "#E8A33D",
      highwayInner: "#F6BC5C",
      beach: "#F5EBC6",
      floodFill: "rgba(66,133,244,0.18)",
      floodStroke: "#4285F4",
      labelStroke: "#FFFFFF",
      labelFill: "#5F6368",
    },
    dark: {
      sea: "#0A111E",
      land: "#111B2B",
      blocks: "#182438",
      parks: "#122E22",
      roads: "#1F314A",
      roadsInner: "#2A4160",
      highway: "#B45309",
      highwayInner: "#F59E0B",
      beach: "#2B3C53",
      floodFill: "rgba(56,189,248,0.22)",
      floodStroke: "#38BDF8",
      labelStroke: "#0A111E",
      labelFill: "#E2E8F0",
    },
    satellite: {
      sea: "#0B2239",
      land: "#213227",
      blocks: "#2D4233",
      parks: "#1B4D2E",
      roads: "#3F566C",
      roadsInner: "#526E88",
      highway: "#D97706",
      highwayInner: "#FBBF24",
      beach: "#78654B",
      floodFill: "rgba(14,165,233,0.25)",
      floodStroke: "#0EA5E9",
      labelStroke: "#0B2239",
      labelFill: "#F1F5F9",
    },
  }[mapTheme];

  return (
    <div
      className="absolute inset-0 overflow-hidden transition-colors duration-500"
      style={{ backgroundColor: themeConfig.sea }}
    >
      {/* Dynamic Floating Capsule Search Bar + Plus Menu (Replaces old static Legend) */}
      <MapToolbar />

      {/* ======== map scene (zoomable & pannable) ======== */}
      <div
        className="absolute inset-0 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] origin-center"
        style={{ transform: `scale(${zoom})` }}
      >
        <svg
          viewBox="0 0 1000 700"
          preserveAspectRatio="xMidYMid slice"
          className="absolute inset-0 h-full w-full"
        >
          <defs>
            <clipPath id="landClip">
              <path d={LAND} />
            </clipPath>
          </defs>

          {/* land */}
          <path d={LAND} fill={themeConfig.land} />

          {/* land-detailing, clipped to coastline */}
          <g clipPath="url(#landClip)">
            {/* city blocks */}
            <g fill={themeConfig.blocks}>
              {BLOCKS.map(([x, y, w, h], i) => (
                <rect key={i} x={x} y={y} width={w} height={h} rx="3" />
              ))}
            </g>

            {/* parks */}
            <g fill={themeConfig.parks}>
              <rect x="150" y="450" width="110" height="72" rx="8" />
              <rect x="440" y="152" width="104" height="64" rx="8" />
              <rect x="610" y="430" width="96" height="58" rx="8" />
            </g>
            {/* inland lagoon */}
            <ellipse cx="240" cy="120" rx="66" ry="34" fill={themeConfig.sea} />

            {/* local streets */}
            <g stroke={themeConfig.roads} strokeWidth="7">
              {LOCAL_V.map((x) => (
                <line key={`cv${x}`} x1={x} y1="0" x2={x} y2="700" />
              ))}
              {LOCAL_H.map((y) => (
                <line key={`ch${y}`} x1="0" y1={y} x2="1000" y2={y} />
              ))}
            </g>
            <g stroke={themeConfig.roadsInner} strokeWidth="5">
              {LOCAL_V.map((x) => (
                <line key={`lv${x}`} x1={x} y1="0" x2={x} y2="700" />
              ))}
              {LOCAL_H.map((y) => (
                <line key={`lh${y}`} x1="0" y1={y} x2="1000" y2={y} />
              ))}
            </g>

            {/* arterial roads */}
            <g stroke={themeConfig.roads} strokeWidth="10">
              <line x1="390" y1="0" x2="390" y2="700" />
              <line x1="0" y1="355" x2="1000" y2="355" />
              <line x1="0" y1="520" x2="1000" y2="520" />
            </g>
            <g stroke={themeConfig.roadsInner} strokeWidth="8">
              <line x1="390" y1="0" x2="390" y2="700" />
              <line x1="0" y1="355" x2="1000" y2="355" />
              <line x1="0" y1="520" x2="1000" y2="520" />
            </g>

            {/* coastal road */}
            <path
              d="M420,30 C470,120 560,180 640,250 C720,320 750,400 700,500 C660,580 600,640 560,700"
              fill="none" stroke={themeConfig.roads} strokeWidth="9"
            />
            <path
              d="M420,30 C470,120 560,180 640,250 C720,320 750,400 700,500 C660,580 600,640 560,700"
              fill="none" stroke={themeConfig.roadsInner} strokeWidth="7"
            />

            {/* highway NH-16 */}
            <path
              d="M-20,648 C170,578 268,500 358,398 C430,318 548,262 648,196 C700,162 736,148 764,134"
              fill="none" stroke={themeConfig.highway} strokeWidth="11"
            />
            <path
              d="M-20,648 C170,578 268,500 358,398 C430,318 548,262 648,196 C700,162 736,148 764,134"
              fill="none" stroke={themeConfig.highwayInner} strokeWidth="8"
            />
          </g>

          {/* beach stripe */}
          <path d={COAST} fill="none" stroke={themeConfig.beach} strokeWidth="11" opacity="0.85" />

          {/* ======== projected flood zone ======== */}
          <polygon
            points={floodPoints}
            fill={themeConfig.floodFill}
            stroke={themeConfig.floodStroke}
            strokeWidth="2.5"
            strokeLinejoin="round"
          />

          {/* ======== labels (haloed) ======== */}
          <g
            fontFamily="var(--font-sans)"
            style={{ paintOrder: "stroke" }}
            stroke={themeConfig.labelStroke}
            strokeWidth="4"
            strokeLinejoin="round"
          >
            <text x="330" y="348" fontSize="17" fontWeight="600" fill={themeConfig.labelFill} textAnchor="middle" letterSpacing="4">
              GOPALPUR
            </text>
            <text x="120" y="300" fontSize="13" fontWeight="500" fill={themeConfig.labelFill} letterSpacing="2.5">
              BERHAMPUR
            </text>
            <text x="210" y="490" fontSize="12" fontWeight="500" fill={themeConfig.labelFill} letterSpacing="2">
              WARD 4 SOUTH
            </text>
            <text x="340" y="240" fontSize="12" fontWeight="500" fill={themeConfig.labelFill} letterSpacing="2">
              WARD 4 NORTH
            </text>
            <text x="750" y="600" fontSize="18" fontWeight="600" fill={mapTheme === "dark" ? "#64748B" : "#4285F4"} letterSpacing="4">
              BAY OF BENGAL
            </text>
          </g>
        </svg>

        {/* ======== HTML markers on top of SVG ======== */}
        {displayedAssets.map((a, i) => {
          const { x, y } = project(a.lat, a.lng);
          const leftPct = (x / 1000) * 100;
          const topPct = (y / 700) * 100;
          const isSelected = a.id === selectedAssetId;

          return (
            <button
              key={a.id}
              onClick={() => setSelectedAssetId(isSelected ? null : a.id)}
              aria-label={`${a.name} — ${a.severity}`}
              className="absolute z-10 -translate-x-1/2 -translate-y-full transition-transform hover:scale-110 focus:outline-none"
              style={{ left: `${leftPct}%`, top: `${topPct}%` }}
            >
              <MapPin kind={a.kind} selected={isSelected} dimmed={isDimmed(a)} delay={i * 120} />
            </button>
          );
        })}

        {/* pin info card */}
        {selected && (
          <div
            className="absolute z-20 w-60 animate-fade-up"
            style={{
              left: `${Math.min(78, project(selected.lat, selected.lng).x / 10 + 3.5)}%`,
              top: `${project(selected.lat, selected.lng).y / 7}%`,
              transform: "translateY(-55%)",
            }}
          >
            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-xl">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-bold leading-snug text-gray-900">
                  {selected.name}
                </p>
                <button
                  onClick={() => setSelectedAssetId(null)}
                  className="rounded-full p-1 text-gray-400 hover:bg-gray-100"
                  aria-label="Close"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="mt-1.5 flex items-center gap-1.5">
                <span
                  className={cn(
                    "rounded-full border px-2 py-0.5 text-[10px] font-semibold",
                    SEVERITY_STYLE[selected.severity].chip,
                  )}
                >
                  {SEVERITY_STYLE[selected.severity].label} · {selected.risk}%
                </span>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-gray-600">
                {selected.impactNote}
              </p>
              <p className="mt-2.5 border-t border-gray-100 pt-2 text-[11px] text-gray-400 font-medium">
                Serves {selected.population.toLocaleString("en-IN")} people · {selected.ward}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* zoom & situation controls */}
      <div className="absolute bottom-6 left-4 z-30 flex flex-col items-center gap-1.5 overflow-hidden rounded-2xl bg-white/95 p-1 shadow-lg backdrop-blur-md border border-gray-200/80">
        <button
          onClick={zoomIn}
          disabled={zoom >= 2.2}
          className="grid h-9 w-9 place-items-center rounded-xl text-gray-700 transition hover:bg-gray-100 disabled:opacity-30 active:scale-95"
          title="Zoom in"
          aria-label="Zoom in"
        >
          <Plus className="h-4 w-4" />
        </button>
        <button
          onClick={resetZoom}
          className="grid h-8 w-9 place-items-center rounded-lg text-gray-500 transition hover:bg-gray-100 text-[10px] font-bold"
          title="Reset Zoom"
        >
          {Math.round(zoom * 100)}%
        </button>
        <button
          onClick={zoomOut}
          disabled={zoom <= 1}
          className="grid h-9 w-9 place-items-center rounded-xl text-gray-700 transition hover:bg-gray-100 disabled:opacity-30 active:scale-95"
          title="Zoom out"
          aria-label="Zoom out"
        >
          <Minus className="h-4 w-4" />
        </button>
      </div>

      {/* attribution & mode indicator */}
      <div className="absolute bottom-4 right-4 z-20 flex items-center gap-2 rounded-full border border-gray-200/80 bg-white/90 px-3 py-1 text-[11px] font-medium text-gray-600 shadow-sm backdrop-blur">
        <Compass className="h-3 w-3 text-blue-600" />
        <span>SenseIT Live Coastal Hydrography · {mapTheme.toUpperCase()}</span>
      </div>
    </div>
  );
}
