"use client";

import { useEffect, useState, useRef } from "react";
import {
  AlertTriangle,
  BellRing,
  Check,
  Clock,
  Hospital,
  Loader2,
  PanelRightClose,
  PanelRightOpen,
  Plus,
  Shield,
  ShieldAlert,
  Sparkles,
  Wind,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatLandfall } from "@/lib/geo";
import { useSenseIT } from "@/components/senseit-provider";
import type { ActionItem } from "@/lib/api-types";

const DEFAULT_ACTIONS: ActionItem[] = [
  { id: "sandbags", label: "Deploy sandbags to Coastal Substation", tag: "Power grid" },
  { id: "generator", label: "Alert City Hospital generator team", tag: "Hospital" },
  { id: "shelter", label: "Open Ward 4 community shelter", tag: "Shelter" },
];

const DEFAULT_SUMMARY =
  "Projected storm surge will flood Coastal Substation. If grid fails, City Hospital loses primary power within hours. Ward 4 families should move to the community shelter.";

const EMERGENCY_ALERTS = [
  {
    id: 3,
    title: "Coastal Substation Alpha",
    risk: 92,
    severity: "CRITICAL",
    desc: "3.2m surge — switchyard perimeter breach likely.",
    icon: Zap,
  },
  {
    id: 1,
    title: "City General Hospital",
    risk: 90,
    severity: "CRITICAL",
    desc: "Grid cut imminent. Generator runtime: 18hrs.",
    icon: Hospital,
  },
  {
    id: 2,
    title: "Ward 4 Riverside Clinic",
    risk: 88,
    severity: "CRITICAL",
    desc: "Inside 1.8m flood contour. Evacuation required.",
    icon: ShieldAlert,
  },
  {
    id: 4,
    title: "Grid Relay Station B",
    risk: 65,
    severity: "HIGH RISK",
    desc: "145 km/h winds risk insulator flashover.",
    icon: AlertTriangle,
  },
];

type NotifyState = "idle" | "sending" | "sent";

export function StatusPanel({
  landfallIso,
  lastNotified,
}: {
  landfallIso: string;
  lastNotified: string | null;
}) {
  const {
    telemetry,
    analysis,
    analysisLoading,
    landfallIso: liveLandfall,
    panelCollapsed,
    setPanelCollapsed,
    selectedAssetId,
    setSelectedAssetId,
    setActiveModal,
  } = useSenseIT();

  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [state, setState] = useState<NotifyState>(lastNotified ? "sent" : "idle");
  const [sentAt, setSentAt] = useState<string | null>(lastNotified);

  const activeLandfallIso = liveLandfall ?? landfallIso;
  const actions = analysis?.actions?.length ? analysis.actions : DEFAULT_ACTIONS;
  const impactSummary = analysis?.impactSummary ?? DEFAULT_SUMMARY;

  // Restore checklist
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("senseit-actions");
      if (saved) setChecked(new Set(JSON.parse(saved) as string[]));
    } catch {}
  }, []);

  function toggle(id: string) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      try {
        window.localStorage.setItem("senseit-actions", JSON.stringify([...next]));
      } catch {}
      return next;
    });
  }

  async function notify() {
    if (state === "sending") return;
    setState("sending");
    try {
      const actionMessage = actions.map((a) => a.label).join("; ");
      const [res] = await Promise.all([
        fetch("/api/dispatch", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            authorities: ["NDRF", "Municipal Ward Office", "Local Authorities"],
            message: `Severe Cyclone Warning — Bay of Bengal. ${impactSummary} Actions: ${actionMessage}`,
          }),
        }),
        new Promise((r) => setTimeout(r, 1500)),
      ]);
      if (!res.ok) throw new Error("failed");
      const json = (await res.json()) as { at: string };
      setSentAt(json.at);
      setState("sent");
    } catch {
      setState("idle");
    }
  }

  const { relative, absolute } = formatLandfall(activeLandfallIso);
  const done = checked.size;

  const windLine = telemetry
    ? `${telemetry.cyclone.windSpeedKmh} km/h · ${telemetry.landfall.location}`
    : "145 km/h · Gopalpur coast";

  // Collapsed — minimal reopen button
  if (panelCollapsed) {
    return (
      <div className="fixed right-3 top-4 z-40">
        <button
          onClick={() => setPanelCollapsed(false)}
          className="flex h-10 items-center gap-2 rounded-full border border-gray-200 bg-white/95 px-3.5 py-2 text-xs font-bold text-gray-800 shadow-xl backdrop-blur transition-all hover:bg-gray-50 hover:shadow-2xl active:scale-95"
          title="Open Situation Panel"
        >
          <PanelRightOpen className="h-4 w-4 text-red-600" />
          <span>Alerts (4)</span>
          <span className="flex h-2 w-2 rounded-full bg-red-500 animate-pulse" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col rounded-2xl border border-gray-200/90 bg-white shadow-[0_16px_50px_-12px_rgba(0,0,0,0.18)] backdrop-blur-md transition-all">
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3 bg-gray-50/70 rounded-t-2xl">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-2.5 py-0.5 text-[11px] font-bold text-red-700">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-600" />
          LIVE
        </span>
        <button
          onClick={() => setPanelCollapsed(true)}
          className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-200 hover:text-gray-700 transition"
          title="Collapse panel"
          aria-label="Collapse situation panel"
        >
          <PanelRightClose className="h-4 w-4" />
        </button>
      </div>

      <div className="scroll-slim flex-1 space-y-4 overflow-y-auto p-4">
        {/* Current Status */}
        <section>
          <h1 className="text-lg font-black leading-tight tracking-tight text-gray-900">
            Cyclone {telemetry?.cyclone.name ?? "Dana-3"}
          </h1>
          <p className="mt-1.5 flex items-center gap-1.5 text-xs text-gray-600">
            <Clock className="h-3.5 w-3.5 text-gray-400" />
            <span className="font-bold text-gray-900">{relative}</span> · {absolute}
          </p>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-gray-500">
            <Wind className="h-3.5 w-3.5 text-gray-400" />
            {windLine}
          </p>
        </section>

        {/* Emergency Alerts — clean cards, no animation */}
        <section className="space-y-2">
          {EMERGENCY_ALERTS.map((item) => {
            const Icon = item.icon;
            const isSelected = item.id === selectedAssetId;
            return (
              <div
                key={item.id}
                onClick={() => setSelectedAssetId(isSelected ? null : item.id)}
                className={cn(
                  "cursor-pointer rounded-xl border p-3 transition-all",
                  isSelected
                    ? "border-red-400 bg-red-50/60 shadow-sm ring-1 ring-red-300"
                    : "border-gray-200 bg-white hover:border-red-200 hover:shadow-xs",
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-700">
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <h3 className="text-xs font-bold text-gray-900">{item.title}</h3>
                  </div>
                  <span
                    className={cn(
                      "rounded-md px-1.5 py-0.5 text-[9px] font-bold shrink-0",
                      item.severity === "CRITICAL"
                        ? "bg-red-100 text-red-800"
                        : "bg-amber-100 text-amber-800",
                    )}
                  >
                    {item.risk}%
                  </span>
                </div>
                <p className="mt-1.5 text-[11px] text-gray-600 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </section>

        {/* AI Impact Summary */}
        <section className="rounded-xl bg-gray-50 p-3 border border-gray-100">
          <div className="flex items-center gap-2 mb-1.5">
            <Sparkles className="h-3.5 w-3.5 text-blue-600" />
            <h2 className="text-xs font-bold text-gray-900">AI Analysis</h2>
            {analysisLoading && <Loader2 className="h-3 w-3 animate-spin text-blue-500" />}
          </div>
          <p className="text-[11px] leading-relaxed text-gray-600">
            {renderSummary(impactSummary)}
          </p>
        </section>

        {/* Actions Checklist — no header, just progress + items */}
        <section>
          <div className="h-1 overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-blue-600 transition-all duration-500"
              style={{ width: `${(done / actions.length) * 100}%` }}
            />
          </div>
          <ul className="mt-2 space-y-1.5">
            {actions.map((item) => {
              const isDone = checked.has(item.id);
              return (
                <li key={item.id}>
                  <button
                    onClick={() => toggle(item.id)}
                    className={cn(
                      "flex w-full items-start gap-2.5 rounded-xl border p-2.5 text-left transition-all",
                      isDone
                        ? "border-gray-100 bg-gray-50"
                        : "border-gray-200 bg-white hover:border-blue-200 hover:bg-blue-50/30",
                    )}
                  >
                    <span
                      className={cn(
                        "mt-0.5 grid h-4.5 w-4.5 shrink-0 place-items-center rounded-md border transition-colors",
                        isDone
                          ? "border-blue-600 bg-blue-600 text-white"
                          : "border-gray-300 bg-white text-transparent",
                      )}
                    >
                      <Check className="h-3 w-3" strokeWidth={3} />
                    </span>
                    <span className="flex-1">
                      <span
                        className={cn(
                          "block text-xs leading-snug",
                          isDone ? "text-gray-400 line-through" : "text-gray-800 font-medium",
                        )}
                      >
                        {item.label}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>

        {/* Add Crisis Button */}
        <button
          onClick={() => setActiveModal("reports")}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-gray-300 py-2.5 text-xs font-semibold text-gray-500 transition hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/30"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Crisis / Generate Report
        </button>
      </div>

      {/* Dispatch Button */}
      <div className="border-t border-gray-100 p-4 bg-white rounded-b-2xl">
        <button
          onClick={notify}
          disabled={state === "sending"}
          className={cn(
            "flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-xs font-bold text-white shadow-sm transition-all",
            state === "sent"
              ? "bg-emerald-600 hover:bg-emerald-700"
              : "bg-blue-600 hover:bg-blue-700 active:scale-[0.99]",
            state === "sending" && "cursor-wait opacity-80",
          )}
        >
          {state === "sending" ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Broadcasting…
            </>
          ) : state === "sent" ? (
            <>
              <Check className="h-4 w-4" strokeWidth={3} />
              Dispatched
            </>
          ) : (
            <>
              <BellRing className="h-4 w-4" />
              Notify Authorities
            </>
          )}
        </button>
        <p className="mt-1.5 flex items-center justify-center gap-1 text-center text-[10px] text-gray-400">
          <Shield className="h-3 w-3" />
          {sentAt
            ? `Sent ${new Date(sentAt).toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit",
              })}`
            : "SMS, sirens & radio alerts"}
        </p>
      </div>
    </div>
  );
}

function renderSummary(text: string) {
  const highlights = [
    "Coastal Substation",
    "Coastal Substation Alpha",
    "City Hospital",
    "City General Hospital",
    "Ward 4 Riverside Clinic",
    "Grid Relay Station B",
    "Ward 4",
  ];
  const escaped = highlights
    .sort((a, b) => b.length - a.length)
    .map((h) => h.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const regex = new RegExp(`(${escaped.join("|")})`, "gi");
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part) ? (
      <span key={i} className="font-bold text-gray-900">{part}</span>
    ) : (
      part
    ),
  );
}
