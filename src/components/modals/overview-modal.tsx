"use client";

import { useState, useRef, useEffect } from "react";
import {
  Bot,
  Hospital,
  Loader2,
  Send,
  ShieldAlert,
  Sparkles,
  User,
  X,
  Zap,
  AlertTriangle,
} from "lucide-react";
import { useSenseIT } from "@/components/senseit-provider";
import { cn } from "@/lib/utils";

interface ChatMessage {
  id: string;
  sender: "user" | "gemini";
  text: string;
  timestamp: string;
}

const CRISIS_ITEMS = [
  {
    id: "substation",
    title: "Coastal Substation Alpha",
    type: "Power Infrastructure",
    risk: 92,
    icon: Zap,
    desc: "3.2m surge threatens switchyard. 48,000 residents lose power.",
    image: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=400&h=200&fit=crop",
  },
  {
    id: "hospital",
    title: "City General Hospital",
    type: "Critical Medical",
    risk: 90,
    icon: Hospital,
    desc: "Diesel generator capacity: 18 hours. Fuel convoy needed pre-landfall.",
    image: "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=400&h=200&fit=crop",
  },
  {
    id: "clinic",
    title: "Ward 4 Riverside Clinic",
    type: "Health Center",
    risk: 88,
    icon: ShieldAlert,
    desc: "Inside 1.8m flood contour. 14 patients require evacuation.",
    image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400&h=200&fit=crop",
  },
  {
    id: "relay",
    title: "Grid Relay Station B",
    type: "High-Voltage Relay",
    risk: 65,
    icon: AlertTriangle,
    desc: "145 km/h winds risk insulator flashover on secondary corridor.",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=200&fit=crop",
  },
];

const SUGGESTIONS = [
  "Hospital backup power?",
  "Substation flood defense?",
  "Evacuation timeline?",
  "Surge height estimate?",
];

export function OverviewModal() {
  const { activeModal, setActiveModal, telemetry } = useSenseIT();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      sender: "gemini",
      text: "SenseIT active. Cyclone Dana-3 telemetry loaded. How can I assist?",
      timestamp: "Just now",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  if (activeModal !== "overview") return null;

  async function handleSend(textToSend?: string) {
    const query = (textToSend ?? input).trim();
    if (!query || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: query }),
      });

      const data = await res.json();
      const aiReply =
        data.reply || "Prioritize coastal substation defense and stage hospital fuel reserves.";

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: "gemini",
          text: aiReply,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: "gemini",
          text: "Connection degraded. Priority: Deploy sandbags at Coastal Substation Alpha.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm animate-fade-up"
    >
      <div className="relative flex h-[92vh] max-h-[880px] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
        {/* Clean Header — Only cyclone info + close */}
        <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/80 px-6 py-3.5">
          <h2 className="text-base font-bold tracking-tight text-gray-900">
            Cyclone Dana-3 · Bay of Bengal Coast · Sustained winds:{" "}
            {telemetry?.cyclone.windSpeedKmh ?? 145} km/h
          </h2>
          <button
            onClick={() => setActiveModal(null)}
            className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-700"
            aria-label="Close overview"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex flex-1 flex-col overflow-y-auto p-5 scroll-slim space-y-5">
          {/* Crisis Cards Grid with Photos */}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {CRISIS_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  className="group rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm transition-all hover:border-red-200 hover:shadow-md"
                >
                  {/* Photo */}
                  <div className="relative h-28 w-full overflow-hidden bg-gray-100">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                    <span
                      className={cn(
                        "absolute top-2 right-2 rounded-md px-2 py-0.5 text-[10px] font-bold",
                        item.risk >= 85
                          ? "bg-red-600 text-white"
                          : "bg-amber-500 text-white",
                      )}
                    >
                      {item.risk}% RISK
                    </span>
                  </div>

                  {/* Content */}
                  <div className="p-3.5">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-700">
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-gray-900 leading-snug">
                          {item.title}
                        </h4>
                        <span className="text-[10px] font-medium text-gray-400">
                          {item.type}
                        </span>
                      </div>
                    </div>
                    <p className="mt-2 text-xs text-gray-600 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* SenseIT AI Chat Section */}
          <div className="rounded-xl border border-blue-100 bg-gradient-to-b from-blue-50/40 to-white p-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-blue-100 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900">SenseIT</h4>
                  <p className="text-[10px] text-gray-500">Gemini AI · Crisis Advisor</p>
                </div>
              </div>
              <span className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
                Online
              </span>
            </div>

            {/* Quick Chips */}
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {SUGGESTIONS.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(s)}
                  className="rounded-full border border-gray-200 bg-white px-2.5 py-1 text-[11px] font-medium text-gray-600 transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Chat Messages */}
            <div className="mt-2.5 max-h-48 min-h-[100px] overflow-y-auto space-y-2 rounded-lg border border-gray-100 bg-white p-2.5 scroll-slim text-xs">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={cn(
                    "flex gap-2",
                    m.sender === "user" ? "justify-end" : "justify-start",
                  )}
                >
                  {m.sender === "gemini" && (
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                      <Bot className="h-3.5 w-3.5" />
                    </div>
                  )}
                  <div
                    className={cn(
                      "max-w-[80%] rounded-xl px-3 py-2 text-xs leading-relaxed",
                      m.sender === "user"
                        ? "bg-blue-600 text-white rounded-br-none"
                        : "bg-gray-100 text-gray-800 rounded-bl-none",
                    )}
                  >
                    <p className="whitespace-pre-line">{m.text}</p>
                    <span
                      className={cn(
                        "mt-0.5 block text-[9px]",
                        m.sender === "user" ? "text-blue-200" : "text-gray-400",
                      )}
                    >
                      {m.timestamp}
                    </span>
                  </div>
                  {m.sender === "user" && (
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-200 text-gray-700">
                      <User className="h-3.5 w-3.5" />
                    </div>
                  )}
                </div>
              ))}

              {loading && (
                <div className="flex items-center gap-2 text-xs text-blue-600">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>SenseIT is analyzing…</span>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Chat Input */}
            <div className="mt-2.5 flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Ask SenseIT anything..."
                className="flex-1 rounded-full border border-gray-300 bg-white px-4 py-2.5 text-xs text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
              />
              <button
                onClick={() => handleSend()}
                disabled={loading || !input.trim()}
                className="flex items-center gap-1.5 rounded-full bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-blue-700 disabled:opacity-50"
              >
                <Send className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
