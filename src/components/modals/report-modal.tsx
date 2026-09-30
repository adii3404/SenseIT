"use client";

import { useState } from "react";
import {
  Check,
  CheckSquare,
  Download,
  FileCheck2,
  FileText,
  Loader2,
  Plus,
  Square,
  UserCheck,
  X,
} from "lucide-react";
import { jsPDF } from "jspdf";
import { useSenseIT } from "@/components/senseit-provider";
import { cn } from "@/lib/utils";

interface ReportCrisis {
  id: string;
  name: string;
  kind: string;
  location: string;
  level: "Critical" | "High" | "Moderate";
  riskScore: number;
  responsiblePerson: string;
  impactDesc: string;
  actionRequired: string;
}

const DEFAULT_CRISES: ReportCrisis[] = [
  {
    id: "substation",
    name: "Coastal Substation Alpha Surge Flooding",
    kind: "Power Grid",
    location: "Ward 4 Coast",
    level: "Critical",
    riskScore: 92,
    responsiblePerson: "Eng. A. Mohanty (Grid Operations)",
    impactDesc: "3.2m surge will flood transformer switchyard. 48,000 lose power.",
    actionRequired: "Deploy sandbags; isolate relay lines; lock breaker vaults.",
  },
  {
    id: "hospital",
    name: "City General Hospital Power Exhaustion",
    kind: "Healthcare",
    location: "Ward 4 North",
    level: "Critical",
    riskScore: 90,
    responsiblePerson: "Dr. S. Rao (Chief Medical Officer)",
    impactDesc: "120 ICU beds. Generator: 18hrs without fuel replenishment.",
    actionRequired: "Dispatch 2,500L diesel fuel convoy; high-alert trauma teams.",
  },
  {
    id: "clinic",
    name: "Ward 4 Riverside Clinic Inundation",
    kind: "Healthcare",
    location: "Ward 4 Riverside",
    level: "Critical",
    riskScore: 88,
    responsiblePerson: "Officer V. Das (Disaster Management)",
    impactDesc: "Inside 1.8m surge flood contour. Ground floor flooding guaranteed.",
    actionRequired: "Evacuate before 04:00 hrs; transfer 14 in-patients.",
  },
  {
    id: "relay",
    name: "Grid Relay Station B Wind Exposure",
    kind: "Power Grid",
    location: "Ward 2 Upland",
    level: "High",
    riskScore: 65,
    responsiblePerson: "Cmdr. R. Patnaik (NDRF)",
    impactDesc: "145 km/h gusts + sea-spray threaten insulator flashover.",
    actionRequired: "Stage repair trucks and spare insulator units at Ward 2 depot.",
  },
];

export function ReportModal() {
  const { activeModal, setActiveModal, telemetry } = useSenseIT();
  const [crises, setCrises] = useState<ReportCrisis[]>(DEFAULT_CRISES);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    new Set(DEFAULT_CRISES.map((c) => c.id)),
  );
  const [generating, setGenerating] = useState(false);
  const [success, setSuccess] = useState(false);

  // Add Crisis form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCrisis, setNewCrisis] = useState({
    name: "",
    kind: "Infrastructure",
    location: "",
    level: "High" as "Critical" | "High" | "Moderate",
    riskScore: 70,
    responsiblePerson: "",
    impactDesc: "",
    actionRequired: "",
  });

  if (activeModal !== "reports") return null;

  const allSelected = selectedIds.size === crises.length;

  function toggleAll() {
    if (allSelected) setSelectedIds(new Set());
    else setSelectedIds(new Set(crises.map((c) => c.id)));
  }

  function toggleOne(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function addCrisis() {
    const id = `custom-${Date.now()}`;
    const crisis: ReportCrisis = { id, ...newCrisis };
    setCrises((prev) => [...prev, crisis]);
    setSelectedIds((prev) => new Set([...prev, id]));
    setNewCrisis({
      name: "",
      kind: "Infrastructure",
      location: "",
      level: "High",
      riskScore: 70,
      responsiblePerson: "",
      impactDesc: "",
      actionRequired: "",
    });
    setShowAddForm(false);
  }

  function generatePDF() {
    setGenerating(true);
    setSuccess(false);

    try {
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const selectedCrises = crises.filter((c) => selectedIds.has(c.id));
      const now = new Date();
      const dateStr = now.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
      const timeStr = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", timeZoneName: "short" });

      // Header Banner
      doc.setFillColor(15, 23, 42);
      doc.rect(0, 0, 210, 36, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.text("SENSEIT — CYCLONE VULNERABILITY FORECASTER", 14, 16);
      doc.setFontSize(9.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(203, 213, 225);
      doc.text("OFFICIAL INCIDENT SITUATION REPORT · SEVERE CYCLONIC STORM DANA-3", 14, 23);
      doc.text(`Generated: ${dateStr} at ${timeStr} · Bay of Bengal`, 14, 29);

      // Red accent line
      doc.setFillColor(239, 68, 68);
      doc.rect(0, 36, 210, 2, "F");

      // Telemetry section
      let y = 46;
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(14, y, 182, 30, 2, 2, "FD");
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(30, 41, 59);
      doc.text("1. METEOROLOGICAL TELEMETRY", 18, y + 7);
      doc.setFontSize(8.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(71, 85, 105);
      doc.text(`• Active System: Severe Cyclone Dana-3 (Bay of Bengal)`, 18, y + 13);
      doc.text(`• Wind Speed: ${telemetry?.cyclone.windSpeedKmh ?? 145} km/h (Gusts: 165 km/h)`, 18, y + 18);
      doc.text(`• Landfall Zone: Gopalpur Coast, Odisha · ETA: 14.5 Hours`, 18, y + 23);
      y += 38;

      // Crises section
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(30, 41, 59);
      doc.text(`2. VULNERABILITY AUDIT (${selectedCrises.length} INCIDENTS)`, 14, y);
      y += 6;

      selectedCrises.forEach((crisis, index) => {
        if (y > 245) { doc.addPage(); y = 20; }

        doc.setDrawColor(203, 213, 225);
        doc.roundedRect(14, y, 182, 38, 2, 2, "D");
        doc.setFontSize(9.5);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(15, 23, 42);
        doc.text(`${index + 1}. ${crisis.name}`, 18, y + 6);

        // Badge
        doc.setFillColor(crisis.level === "Critical" ? 254 : 254, crisis.level === "Critical" ? 226 : 243, crisis.level === "Critical" ? 226 : 199);
        doc.roundedRect(154, y + 2, 38, 6, 1, 1, "F");
        doc.setFontSize(8);
        doc.setTextColor(crisis.level === "Critical" ? 185 : 180, crisis.level === "Critical" ? 28 : 83, crisis.level === "Critical" ? 28 : 9);
        doc.text(`${crisis.level.toUpperCase()} · ${crisis.riskScore}%`, 156, y + 6.5);

        doc.setFontSize(8.5);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(100, 116, 139);
        doc.text(`Location: ${crisis.location}`, 18, y + 12);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(30, 41, 59);
        doc.text(`Responsible: ${crisis.responsiblePerson}`, 18, y + 17);

        doc.setFont("helvetica", "normal");
        doc.setTextColor(71, 85, 105);
        const splitDesc = doc.splitTextToSize(`Impact: ${crisis.impactDesc}`, 174);
        doc.text(splitDesc, 18, y + 23);

        doc.setFont("helvetica", "bold");
        doc.setTextColor(29, 78, 216);
        const splitAction = doc.splitTextToSize(`Protocol: ${crisis.actionRequired}`, 174);
        doc.text(splitAction, 18, y + 33);
        y += 44;
      });

      // Footer
      if (y > 250) { doc.addPage(); y = 20; }
      doc.setDrawColor(226, 232, 240);
      doc.line(14, y + 4, 196, y + 4);
      doc.setFontSize(8);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(148, 163, 184);
      doc.text("SenseIT Automated Disaster Intelligence Framework · Confidential Operational Dispatch", 14, y + 11);
      doc.text(`Verification: AEG-${Math.floor(100000 + Math.random() * 900000)} · Bay of Bengal Emergency`, 14, y + 16);

      doc.save("SenseIT_Vulnerability_Report_Dana3.pdf");
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("[senseit-report] PDF generation failed", err);
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm animate-fade-up"
    >
      <div className="relative flex h-[90vh] max-h-[820px] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/80 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-gray-900">
                Vulnerability Report
              </h2>
              <p className="text-xs text-gray-500">
                Select crises and generate an official PDF report.
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveModal(null)}
            className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-700"
            aria-label="Close reports"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-1 flex-col overflow-y-auto p-5 scroll-slim space-y-3">
          {/* Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200 bg-gray-50/70 p-3">
            <div className="flex items-center gap-2">
              <button
                onClick={toggleAll}
                className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm transition hover:bg-gray-100"
              >
                {allSelected ? (
                  <CheckSquare className="h-4 w-4 text-blue-600" />
                ) : (
                  <Square className="h-4 w-4 text-gray-400" />
                )}
                <span>{allSelected ? "Deselect All" : "Select All"}</span>
              </button>
              <span className="text-xs text-gray-500">
                {selectedIds.size}/{crises.length} selected
              </span>
            </div>

            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-1.5 rounded-lg border border-blue-300 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 shadow-sm transition hover:bg-blue-100"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Crisis
            </button>
          </div>

          {/* Add Crisis Form */}
          {showAddForm && (
            <div className="rounded-xl border border-blue-200 bg-blue-50/30 p-4 space-y-3 animate-fade-up">
              <h4 className="text-xs font-bold text-gray-900">New Crisis Entry</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-gray-700">Name</label>
                  <input
                    value={newCrisis.name}
                    onChange={(e) => setNewCrisis({ ...newCrisis, name: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs focus:border-blue-500 focus:outline-none"
                    placeholder="e.g. Coastal Bridge Collapse Risk"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-gray-700">Location</label>
                  <input
                    value={newCrisis.location}
                    onChange={(e) => setNewCrisis({ ...newCrisis, location: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs focus:border-blue-500 focus:outline-none"
                    placeholder="e.g. Ward 3 South"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-gray-700">Level</label>
                  <select
                    value={newCrisis.level}
                    onChange={(e) => setNewCrisis({ ...newCrisis, level: e.target.value as any })}
                    className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs focus:outline-none"
                  >
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Moderate">Moderate</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-gray-700">Risk Score</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={newCrisis.riskScore}
                    onChange={(e) => setNewCrisis({ ...newCrisis, riskScore: parseInt(e.target.value) || 0 })}
                    className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-gray-700">Responsible Person</label>
                  <input
                    value={newCrisis.responsiblePerson}
                    onChange={(e) => setNewCrisis({ ...newCrisis, responsiblePerson: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs focus:outline-none"
                    placeholder="e.g. Cmdr. Name"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-gray-700">Type</label>
                  <input
                    value={newCrisis.kind}
                    onChange={(e) => setNewCrisis({ ...newCrisis, kind: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs focus:outline-none"
                    placeholder="e.g. Infrastructure"
                  />
                </div>
              </div>
              <div>
                <label className="text-[11px] font-semibold text-gray-700">Impact Description</label>
                <textarea
                  value={newCrisis.impactDesc}
                  onChange={(e) => setNewCrisis({ ...newCrisis, impactDesc: e.target.value })}
                  rows={2}
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs focus:outline-none resize-none"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-gray-700">Action Required</label>
                <textarea
                  value={newCrisis.actionRequired}
                  onChange={(e) => setNewCrisis({ ...newCrisis, actionRequired: e.target.value })}
                  rows={2}
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs focus:outline-none resize-none"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={addCrisis}
                  disabled={!newCrisis.name.trim()}
                  className="flex-1 rounded-lg bg-blue-600 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition"
                >
                  Add to Report
                </button>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Crisis List */}
          <div className="space-y-2.5">
            {crises.map((crisis) => {
              const isChecked = selectedIds.has(crisis.id);
              return (
                <div
                  key={crisis.id}
                  onClick={() => toggleOne(crisis.id)}
                  className={cn(
                    "cursor-pointer rounded-xl border p-3.5 transition-all",
                    isChecked
                      ? "border-blue-300 bg-blue-50/20 shadow-sm ring-1 ring-blue-200"
                      : "border-gray-200 bg-white opacity-60 hover:opacity-100 hover:border-gray-300",
                  )}
                >
                  <div className="flex items-start gap-3">
                    <button
                      type="button"
                      aria-label={`Select ${crisis.name}`}
                      className={cn(
                        "mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md border transition-colors",
                        isChecked
                          ? "border-blue-600 bg-blue-600 text-white"
                          : "border-gray-300 bg-white",
                      )}
                    >
                      <Check className="h-3.5 w-3.5" strokeWidth={3} />
                    </button>

                    <div className="flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-gray-900">{crisis.name}</h4>
                          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600">
                            {crisis.kind}
                          </span>
                        </div>
                        <span
                          className={cn(
                            "rounded-full border px-2.5 py-0.5 text-[10px] font-semibold",
                            crisis.level === "Critical"
                              ? "border-red-200 bg-red-50 text-red-700"
                              : crisis.level === "High"
                                ? "border-amber-200 bg-amber-50 text-amber-700"
                                : "border-blue-200 bg-blue-50 text-blue-700",
                          )}
                        >
                          {crisis.level} · {crisis.riskScore}%
                        </span>
                      </div>

                      <div className="mt-1.5 grid grid-cols-1 gap-1.5 text-xs sm:grid-cols-2">
                        <div className="text-gray-600">
                          <span className="font-semibold text-gray-800">Where:</span> {crisis.location}
                        </div>
                        <div className="flex items-center gap-1 text-gray-600">
                          <UserCheck className="h-3 w-3 text-blue-600 shrink-0" />
                          <span className="truncate">{crisis.responsiblePerson}</span>
                        </div>
                      </div>

                      <p className="mt-1.5 text-xs text-gray-500">{crisis.impactDesc}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50 px-6 py-4">
          <div className="text-xs text-gray-500">
            {success ? (
              <span className="flex items-center gap-1.5 font-medium text-emerald-600">
                <FileCheck2 className="h-4 w-4" /> PDF downloaded!
              </span>
            ) : (
              <span>SenseIT standard format with directives.</span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveModal(null)}
              className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={generatePDF}
              disabled={generating || selectedIds.size === 0}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-50"
            >
              {generating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating…
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Download PDF ({selectedIds.size})
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
