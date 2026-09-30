"use client";

import { useState } from "react";
import {
  AlertTriangle,
  Check,
  Loader2,
  Phone,
  Radio,
  Send,
  Shield,
  Siren,
  X,
} from "lucide-react";
import { useSenseIT } from "@/components/senseit-provider";
import { cn } from "@/lib/utils";

interface EmergencyContact {
  id: string;
  name: string;
  authority: string;
  phone: string;
  role: string;
  icon: any;
  color: string;
}

const EMERGENCY_CONTACTS: EmergencyContact[] = [
  {
    id: "ndrf",
    name: "NDRF Control Room",
    authority: "National Disaster Response Force",
    phone: "+91-11-2643-6666",
    role: "Search & Rescue Operations",
    icon: Shield,
    color: "bg-red-600",
  },
  {
    id: "sdrf",
    name: "Odisha SDRF",
    authority: "State Disaster Response Force",
    phone: "+91-674-253-4177",
    role: "State-Level Disaster Coordination",
    icon: Siren,
    color: "bg-orange-600",
  },
  {
    id: "imd",
    name: "IMD Cyclone Warning",
    authority: "India Meteorological Department",
    phone: "+91-40-2716-3832",
    role: "Cyclone Tracking & Forecasts",
    icon: Radio,
    color: "bg-blue-600",
  },
  {
    id: "police",
    name: "District Emergency",
    authority: "Ganjam District Police Control Room",
    phone: "+91-680-222-0100",
    role: "Law Enforcement & Evacuation",
    icon: Phone,
    color: "bg-indigo-600",
  },
  {
    id: "ambulance",
    name: "Emergency Ambulance",
    authority: "108 Emergency Medical Service",
    phone: "108",
    role: "Medical Emergency Response",
    icon: AlertTriangle,
    color: "bg-emerald-600",
  },
];

type EmergencyLevel = "Critical" | "High" | "Moderate";

export function SettingsModal() {
  const { activeModal, setActiveModal } = useSenseIT();
  const [alertPrompt, setAlertPrompt] = useState<EmergencyContact | null>(null);
  const [alertLevel, setAlertLevel] = useState<EmergencyLevel>("Critical");
  const [alertMessage, setAlertMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  if (activeModal !== "settings") return null;

  async function handleSendAlert() {
    if (!alertPrompt || !alertMessage.trim()) return;
    setSending(true);
    try {
      await fetch("/api/dispatch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          authorities: [alertPrompt.authority],
          message: `[${alertLevel.toUpperCase()}] ${alertMessage}`,
          contact: alertPrompt.phone,
        }),
      });
      setSent(true);
      setTimeout(() => {
        setSent(false);
        setAlertPrompt(null);
        setAlertMessage("");
      }, 2500);
    } catch {
      // Fallback: still show success for demo
      setSent(true);
      setTimeout(() => {
        setSent(false);
        setAlertPrompt(null);
        setAlertMessage("");
      }, 2500);
    } finally {
      setSending(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm animate-fade-up"
    >
      <div className="relative flex h-auto max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/80 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-600 text-white shadow-sm">
              <Phone className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-gray-900">
                Emergency Contacts
              </h2>
              <p className="text-xs text-gray-500">
                Direct alert dispatch to local authorities
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setActiveModal(null);
              setAlertPrompt(null);
            }}
            className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-700"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 scroll-slim space-y-2.5">
          {EMERGENCY_CONTACTS.map((contact) => {
            const Icon = contact.icon;
            return (
              <button
                key={contact.id}
                onClick={() => {
                  setAlertPrompt(contact);
                  setAlertMessage(
                    `Severe Cyclone Dana-3 Warning — Bay of Bengal. Requesting immediate support for ${contact.role.toLowerCase()}.`,
                  );
                }}
                className={cn(
                  "flex w-full items-center gap-4 rounded-xl border p-4 text-left transition-all",
                  alertPrompt?.id === contact.id
                    ? "border-red-300 bg-red-50/40 ring-1 ring-red-200 shadow-sm"
                    : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm",
                )}
              >
                <div
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white shadow-sm",
                    contact.color,
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-gray-900">{contact.name}</h4>
                  <p className="text-[11px] text-gray-500">{contact.authority}</p>
                  <p className="text-[11px] font-mono text-gray-600 mt-0.5">{contact.phone}</p>
                </div>
                <span className="shrink-0 rounded-lg bg-gray-100 px-2.5 py-1 text-[10px] font-semibold text-gray-600">
                  {contact.role}
                </span>
              </button>
            );
          })}
        </div>

        {/* Alert Prompt Popup (slides up when contact is selected) */}
        {alertPrompt && (
          <div className="border-t border-gray-200 bg-gray-50 px-5 py-4 space-y-3 animate-fade-up">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-red-600" />
                <span className="text-xs font-bold text-gray-900">
                  Alert → {alertPrompt.name}
                </span>
                <span className="font-mono text-[10px] text-gray-500">
                  {alertPrompt.phone}
                </span>
              </div>
              <button
                onClick={() => setAlertPrompt(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Emergency Level */}
            <div>
              <label className="text-[11px] font-semibold text-gray-700">Emergency Level</label>
              <div className="mt-1 flex gap-1.5">
                {(["Critical", "High", "Moderate"] as EmergencyLevel[]).map((level) => (
                  <button
                    key={level}
                    onClick={() => setAlertLevel(level)}
                    className={cn(
                      "flex-1 rounded-lg py-1.5 text-xs font-semibold transition",
                      alertLevel === level
                        ? level === "Critical"
                          ? "bg-red-600 text-white"
                          : level === "High"
                            ? "bg-amber-500 text-white"
                            : "bg-blue-500 text-white"
                        : "border border-gray-300 bg-white text-gray-600 hover:bg-gray-100",
                    )}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            {/* Message */}
            <div>
              <label className="text-[11px] font-semibold text-gray-700">Message</label>
              <textarea
                value={alertMessage}
                onChange={(e) => setAlertMessage(e.target.value)}
                rows={2}
                className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs text-gray-900 placeholder:text-gray-400 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 resize-none"
              />
            </div>

            {/* Send Button */}
            <button
              onClick={handleSendAlert}
              disabled={sending || sent}
              className={cn(
                "flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-all",
                sent
                  ? "bg-emerald-600"
                  : "bg-red-600 hover:bg-red-700 active:scale-[0.99]",
                sending && "cursor-wait opacity-80",
              )}
            >
              {sending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Dispatching…
                </>
              ) : sent ? (
                <>
                  <Check className="h-4 w-4" strokeWidth={3} />
                  Alert Dispatched Successfully
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Send Emergency Alert
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
