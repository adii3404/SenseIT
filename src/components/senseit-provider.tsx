"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
  type Dispatch,
  type SetStateAction,
} from "react";
import type { MapAsset } from "@/lib/types";
import type { CycloneTelemetry, AiAnalysis } from "@/lib/api-types";

/* ------------------------------------------------------------------ */
/*  Context shape                                                     */
/* ------------------------------------------------------------------ */

export type ModalType = "overview" | "reports" | "settings" | null;
export type MapTheme = "standard" | "dark" | "satellite";
export type MapEngine = "canvas" | "google";

interface SenseITContextValue {
  /** Live cyclone telemetry. null while loading. */
  telemetry: CycloneTelemetry | null;
  /** Vulnerable infrastructure assets. Empty array while loading. */
  assets: MapAsset[];
  /** Gemini-generated AI analysis. null while loading. */
  analysis: AiAnalysis | null;
  /** Whether the analysis is currently being fetched. */
  analysisLoading: boolean;
  /** Landfall ETA as ISO string (comes from telemetry or server-side fallback). */
  landfallIso: string;
  /** Re-trigger AI analysis (useful after data refresh). */
  refreshAnalysis: () => void;

  /** Active modal popup: overview, reports, settings, or null */
  activeModal: ModalType;
  setActiveModal: (m: ModalType) => void;

  /** Whether left sidebar is collapsed to maximize map */
  sidebarCollapsed: boolean;
  setSidebarCollapsed: Dispatch<SetStateAction<boolean>>;

  /** Whether right status/crisis panel is collapsed to maximize map */
  panelCollapsed: boolean;
  setPanelCollapsed: Dispatch<SetStateAction<boolean>>;

  /** Map styling theme */
  mapTheme: MapTheme;
  setMapTheme: (t: MapTheme) => void;

  /** Active map rendering engine: canvas hydrography vs Google Maps */
  mapEngine: MapEngine;
  setMapEngine: (engine: MapEngine) => void;

  /** Billing error status for Google Maps key */
  hasBillingNotice: boolean;
  setHasBillingNotice: (notice: boolean) => void;

  /** Toggleable map legend */
  showLegend: boolean;
  setShowLegend: Dispatch<SetStateAction<boolean>>;

  /** Search query from capsule search bar */
  searchQuery: string;
  setSearchQuery: (q: string) => void;

  /** Currently selected asset on map or card */
  selectedAssetId: number | null;
  setSelectedAssetId: (id: number | null) => void;

  /** Re-fetch telemetry & infrastructure data manually */
  refreshEmergencies: () => Promise<void>;
  isRefreshing: boolean;

  /** In-memory or persisted Google Maps API key */
  customGoogleMapsKey: string;
  setCustomGoogleMapsKey: (k: string) => void;

  /** Filter emergency alerts: all vs critical only */
  severityFilter: "all" | "critical";
  setSeverityFilter: (f: "all" | "critical") => void;
}

const SenseITContext = createContext<SenseITContextValue | null>(null);

export function useSenseIT(): SenseITContextValue {
  const ctx = useContext(SenseITContext);
  if (!ctx) throw new Error("useSenseIT must be used within <SenseITProvider>");
  return ctx;
}

/* ------------------------------------------------------------------ */
/*  Provider                                                          */
/* ------------------------------------------------------------------ */

export function SenseITProvider({
  initialAssets,
  initialLandfallIso,
  children,
}: {
  initialAssets: MapAsset[];
  initialLandfallIso: string;
  children: ReactNode;
}) {
  const [telemetry, setTelemetry] = useState<CycloneTelemetry | null>(null);
  const [assets, setAssets] = useState<MapAsset[]>(initialAssets);
  const [analysis, setAnalysis] = useState<AiAnalysis | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);

  // UI state
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [panelCollapsed, setPanelCollapsed] = useState(false);
  const [mapTheme, setMapTheme] = useState<MapTheme>("standard");
  const [mapEngine, setMapEngine] = useState<MapEngine>("canvas");
  const [hasBillingNotice, setHasBillingNotice] = useState(false);
  const [showLegend, setShowLegend] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAssetId, setSelectedAssetId] = useState<number | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [customGoogleMapsKey, setCustomGoogleMapsKey] = useState("");
  const [severityFilter, setSeverityFilter] = useState<"all" | "critical">("all");

  // Load custom google maps key from storage if present
  useEffect(() => {
    try {
      const storedKey = window.localStorage.getItem("senseit_google_maps_key");
      if (storedKey) setCustomGoogleMapsKey(storedKey);
    } catch {}

    const handleBillingError = () => {
      setHasBillingNotice(true);
      setMapEngine("canvas");
    };

    window.addEventListener("senseit_maps_billing_error", handleBillingError);
    return () => window.removeEventListener("senseit_maps_billing_error", handleBillingError);
  }, []);

  const updateMapsKey = useCallback((k: string) => {
    setCustomGoogleMapsKey(k);
    try {
      if (k) window.localStorage.setItem("senseit_google_maps_key", k);
      else window.localStorage.removeItem("senseit_google_maps_key");
    } catch {}
  }, []);

  /* ------ Fetch telemetry ------ */
  const fetchTelemetry = useCallback(async () => {
    try {
      const res = await fetch("/api/telemetry");
      if (!res.ok) return;
      const data = (await res.json()) as CycloneTelemetry;
      setTelemetry(data);
    } catch (err) {
      console.error("[senseit] telemetry fetch failed", err);
    }
  }, []);

  /* ------ Fetch infrastructure ------ */
  const fetchInfrastructure = useCallback(async () => {
    try {
      const res = await fetch("/api/infrastructure");
      if (!res.ok) return;
      const data = (await res.json()) as MapAsset[];
      if (data.length > 0) setAssets(data);
    } catch (err) {
      console.error("[senseit] infrastructure fetch failed", err);
    }
  }, []);

  useEffect(() => {
    fetchTelemetry();
    fetchInfrastructure();
  }, [fetchTelemetry, fetchInfrastructure]);

  /* ------ Trigger AI analysis when both datasets are ready ------ */
  const runAnalysis = useCallback(
    async (t: CycloneTelemetry, a: MapAsset[]) => {
      setAnalysisLoading(true);
      try {
        const res = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            telemetry: t,
            infrastructure: a.map(({ name, kind, ward, risk, severity, lat, lng }) => ({
              name, kind, ward, risk, severity, lat, lng,
            })),
          }),
        });
        if (!res.ok) throw new Error("analyze failed");
        const data = (await res.json()) as AiAnalysis;
        setAnalysis(data);
      } catch (err) {
        console.error("[senseit] analysis fetch failed", err);
      } finally {
        setAnalysisLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (telemetry && assets.length > 0) {
      runAnalysis(telemetry, assets);
    }
  }, [telemetry, assets, runAnalysis]);

  const refreshAnalysis = useCallback(() => {
    if (telemetry && assets.length > 0) {
      runAnalysis(telemetry, assets);
    }
  }, [telemetry, assets, runAnalysis]);

  const refreshEmergencies = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([fetchTelemetry(), fetchInfrastructure()]);
      if (telemetry && assets.length > 0) {
        await runAnalysis(telemetry, assets);
      }
    } finally {
      setTimeout(() => setIsRefreshing(false), 600);
    }
  }, [fetchTelemetry, fetchInfrastructure, telemetry, assets, runAnalysis]);

  const landfallIso = telemetry?.landfall.eta ?? initialLandfallIso;

  return (
    <SenseITContext.Provider
      value={{
        telemetry,
        assets,
        analysis,
        analysisLoading,
        landfallIso,
        refreshAnalysis,

        activeModal,
        setActiveModal,
        sidebarCollapsed,
        setSidebarCollapsed,
        panelCollapsed,
        setPanelCollapsed,
        mapTheme,
        setMapTheme,
        mapEngine,
        setMapEngine,
        hasBillingNotice,
        setHasBillingNotice,
        showLegend,
        setShowLegend,
        searchQuery,
        setSearchQuery,
        selectedAssetId,
        setSelectedAssetId,
        refreshEmergencies,
        isRefreshing,
        customGoogleMapsKey,
        setCustomGoogleMapsKey: updateMapsKey,
        severityFilter,
        setSeverityFilter,
      }}
    >
      {children}
    </SenseITContext.Provider>
  );
}
