"use client";

import { useState, useRef, useEffect } from "react";
import {
  Check,
  ChevronDown,
  Filter,
  Globe,
  Layers,
  MapPin,
  Moon,
  Plus,
  Radio,
  RefreshCw,
  Satellite,
  Search,
  Sun,
  Train,
  X,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSenseIT, type MapTheme } from "@/components/senseit-provider";
import { KIND_META } from "@/lib/types";

export function MapToolbar() {
  const {
    searchQuery,
    setSearchQuery,
    assets,
    setSelectedAssetId,
    mapTheme,
    setMapTheme,
    showLegend,
    setShowLegend,
    refreshEmergencies,
    isRefreshing,
    severityFilter,
    setSeverityFilter,
  } = useSenseIT();

  const [menuOpen, setMenuOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const q = searchQuery.trim().toLowerCase();
  const matches = q
    ? assets.filter((a) => a.name.toLowerCase().includes(q) || a.ward.toLowerCase().includes(q))
    : [];

  const isExpanded = isHovered || isFocused || searchQuery.length > 0;

  return (
    <div className="absolute left-4 top-4 z-30 flex flex-col items-start gap-2">
      {/* Horizontal Container: Search + View Toggles + Plus Dropdown */}
      <div className="flex items-center gap-2">
        {/* Capsule Search Bar */}
        <div
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className={cn(
            "group relative flex items-center rounded-full border border-gray-200/80 bg-white/95 px-3.5 py-2 shadow-lg backdrop-blur-md transition-all duration-300 ease-out",
            isExpanded ? "w-72 sm:w-80 ring-2 ring-blue-500/20" : "w-40 sm:w-48",
          )}
        >
          <Search className="h-4 w-4 shrink-0 text-gray-400 group-hover:text-blue-600 transition-colors" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
            placeholder={isExpanded ? "Search hospitals, substations, wards…" : "Search…"}
            className="ml-2 w-full bg-transparent text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="rounded-full p-0.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Satellite Toggle */}
        <button
          onClick={() => setMapTheme(mapTheme === "satellite" ? "standard" : "satellite")}
          className={cn(
            "flex h-9 items-center gap-1.5 rounded-full border px-3 py-2 text-[11px] font-semibold shadow-lg backdrop-blur-md transition-all duration-200",
            mapTheme === "satellite"
              ? "border-blue-500 bg-blue-600 text-white hover:bg-blue-700"
              : "border-gray-200/80 bg-white/95 text-gray-700 hover:bg-gray-100 hover:text-blue-600",
          )}
          title="Toggle satellite view"
        >
          <Satellite className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Satellite</span>
        </button>

        {/* Transit/Dark Toggle */}
        <button
          onClick={() => setMapTheme(mapTheme === "dark" ? "standard" : "dark")}
          className={cn(
            "flex h-9 items-center gap-1.5 rounded-full border px-3 py-2 text-[11px] font-semibold shadow-lg backdrop-blur-md transition-all duration-200",
            mapTheme === "dark"
              ? "border-gray-600 bg-gray-800 text-white hover:bg-gray-700"
              : "border-gray-200/80 bg-white/95 text-gray-700 hover:bg-gray-100 hover:text-gray-900",
          )}
          title="Toggle radar/dark mode"
        >
          <Moon className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Radar</span>
        </button>

        {/* Plus (+) Menu Button */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-full border border-gray-200/80 bg-white/95 text-gray-700 shadow-lg backdrop-blur-md transition-all duration-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 active:scale-95",
              menuOpen && "bg-blue-600 text-white border-blue-600 hover:bg-blue-700 hover:text-white",
            )}
            title="Map Controls"
            aria-label="Map Options Menu"
          >
            <Plus
              className={cn(
                "h-4 w-4 transition-transform duration-200",
                menuOpen && "rotate-45",
              )}
            />
          </button>

          {/* Dropdown */}
          {menuOpen && (
            <div className="absolute left-0 mt-2 z-50 flex w-56 flex-col gap-1 rounded-2xl border border-gray-200/90 bg-white/95 p-2 shadow-2xl backdrop-blur-xl animate-fade-up">
              {/* Legend Toggle */}
              <button
                onClick={() => {
                  setShowLegend(!showLegend);
                  setMenuOpen(false);
                }}
                className={cn(
                  "flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition-all",
                  showLegend
                    ? "bg-blue-50 text-blue-700 font-semibold"
                    : "text-gray-700 hover:bg-gray-100",
                )}
              >
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-blue-600" />
                  <span>Map Legend</span>
                </div>
                <span className="text-[10px] uppercase font-bold text-gray-400">
                  {showLegend ? "Visible" : "Hidden"}
                </span>
              </button>

              {/* Refresh */}
              <button
                onClick={() => refreshEmergencies()}
                disabled={isRefreshing}
                className="flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition"
              >
                <div className="flex items-center gap-2">
                  <RefreshCw
                    className={cn(
                      "h-3.5 w-3.5 text-blue-600 transition-transform",
                      isRefreshing && "animate-spin",
                    )}
                  />
                  <span>Refresh Data</span>
                </div>
              </button>

              {/* Critical Only Filter */}
              <button
                onClick={() => {
                  setSeverityFilter(severityFilter === "all" ? "critical" : "all");
                  setMenuOpen(false);
                }}
                className={cn(
                  "flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition",
                  severityFilter === "critical"
                    ? "bg-red-50 text-red-700 font-semibold"
                    : "text-gray-700 hover:bg-gray-100",
                )}
              >
                <div className="flex items-center gap-2">
                  <Filter className="h-3.5 w-3.5 text-red-600" />
                  <span>Critical Only</span>
                </div>
                {severityFilter === "critical" && <Check className="h-3.5 w-3.5 text-red-600" />}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Live Search Dropdown */}
      {q && (
        <div className="w-72 sm:w-80 overflow-hidden rounded-2xl border border-gray-200 bg-white/95 p-1.5 shadow-2xl backdrop-blur-md animate-fade-up">
          {matches.length === 0 ? (
            <p className="px-3 py-2 text-xs text-gray-400">No matching infrastructure</p>
          ) : (
            matches.map((m) => (
              <button
                key={m.id}
                onClick={() => {
                  setSelectedAssetId(m.id);
                  setSearchQuery("");
                }}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left transition hover:bg-blue-50"
              >
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: KIND_META[m.kind].pinColor }}
                />
                <div className="flex-1 truncate">
                  <span className="block truncate text-xs font-bold text-gray-800">
                    {m.name}
                  </span>
                  <span className="block text-[10px] text-gray-400">
                    {m.ward} · {m.risk}% Risk
                  </span>
                </div>
              </button>
            ))
          )}
        </div>
      )}

      {/* Legend Panel */}
      {showLegend && (
        <div className="rounded-2xl border border-gray-200/90 bg-white/95 p-3 shadow-xl backdrop-blur-md animate-fade-up">
          <div className="mb-2 flex items-center justify-between border-b border-gray-100 pb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Legend
            </span>
            <button
              onClick={() => setShowLegend(false)}
              className="rounded-full p-0.5 text-gray-400 hover:text-gray-700"
              aria-label="Close Legend"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
          <div className="space-y-1.5 text-xs text-gray-600">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-[#EA4335] shadow-xs" />
              <span className="text-[11px] font-medium text-gray-700">Hospital / Medical</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-[#F9AB00] shadow-xs" />
              <span className="text-[11px] font-medium text-gray-700">Power Infrastructure</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-xs border-2 border-[#4285F4] bg-[#4285F4]/20" />
              <span className="text-[11px] font-medium text-gray-700">Flood zone</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
