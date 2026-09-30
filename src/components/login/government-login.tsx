"use client";

import { useState, useEffect } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Eye,
  EyeOff,
  Globe2,
  KeyRound,
  Lock,
  Radio,
  Shield,
  ShieldAlert,
  ShieldCheck,
  User,
} from "lucide-react";
import { useSenseIT } from "@/components/senseit-provider";

export function GovernmentLogin() {
  const { login } = useSenseIT();

  const [officerNameInput, setOfficerNameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [certified, setCertified] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState("");

  // Live IST / UTC clock for governmental authenticity
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }) +
          " " +
          now.toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: true,
          }) +
          " IST"
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const trimmedName = officerNameInput.trim();
    const trimmedPass = passwordInput.trim();

    if (!trimmedName) {
      setErrorMsg("Please enter your Authorized Officer Name.");
      return;
    }

    if (!trimmedPass) {
      setErrorMsg("Please enter your Security Passcode.");
      return;
    }

    if (!certified) {
      setErrorMsg("You must certify your authorized emergency status before entering.");
      return;
    }

    setIsLoading(true);

    // Validate authorized credentials:
    // Name: "Aditya Bhandari" (case-insensitive)
    // Password: "Admin-1234"
    setTimeout(() => {
      const isNameValid = trimmedName.toLowerCase() === "aditya bhandari";
      const isPassValid = trimmedPass === "Admin-1234";

      if (isNameValid && isPassValid) {
        // Authenticated! Format proper display name
        login("Aditya Bhandari");
      } else {
        setIsLoading(false);
        if (!isNameValid && !isPassValid) {
          setErrorMsg("ACCESS DENIED: Invalid Officer Name and Passcode. Please check hints below.");
        } else if (!isNameValid) {
          setErrorMsg("ACCESS DENIED: Officer identity not recognized in Security Registry. Hint: Aditya Bhandari");
        } else {
          setErrorMsg("ACCESS DENIED: Incorrect Security Passcode. Hint: Admin-1234");
        }
      }
    }, 400);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f0f4f8] text-gray-800 font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* ------------------------------------------------------------- */}
      {/* 1. National Flag Tricolor Accent Header                        */}
      {/* ------------------------------------------------------------- */}
      <div className="h-1.5 w-full flex">
        <div className="w-1/3 bg-[#FF9933]" />
        <div className="w-1/3 bg-white" />
        <div className="w-1/3 bg-[#138808]" />
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 2. Official Government Portal Header                          */}
      {/* ------------------------------------------------------------- */}
      <header className="bg-[#0a192f] border-b border-[#1e3a5f] text-white px-4 py-3 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          {/* Official Emblem & Authority */}
          <div className="flex items-center gap-3.5">
            {/* National Crest Emblem SVG */}
            <div className="h-12 w-12 rounded-lg bg-gradient-to-b from-[#1b3a6b] to-[#0d2242] border border-blue-400/30 flex items-center justify-center p-1.5 shadow-md shrink-0">
              <svg viewBox="0 0 100 100" className="h-full w-full text-amber-400" fill="currentColor">
                <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="4" />
                <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" />
                <circle cx="50" cy="50" r="16" fill="none" stroke="currentColor" strokeWidth="3" />
                {/* Ashoka Chakra Spokes */}
                {[0, 15, 30, 45, 60, 75, 90, 105, 120, 135, 150, 165, 180, 195, 210, 225, 240, 255, 270, 285, 300, 315, 330, 345].map((deg) => (
                  <line
                    key={deg}
                    x1="50"
                    y1="50"
                    x2={50 + 16 * Math.cos((deg * Math.PI) / 180)}
                    y2={50 + 16 * Math.sin((deg * Math.PI) / 180)}
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                ))}
                {/* Stylized lion crest crown */}
                <path d="M42 22 L50 14 L58 22 L54 28 L46 28 Z" fill="currentColor" />
                <path d="M30 30 L50 20 L70 30 L66 38 L34 38 Z" fill="currentColor" opacity="0.8" />
              </svg>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <p className="text-[11px] font-bold tracking-widest text-amber-400 uppercase">
                  भारत सरकार · GOVERNMENT OF INDIA
                </p>
                <span className="hidden sm:inline-block h-3 w-px bg-blue-400/30" />
                <p className="hidden sm:inline text-[11px] font-semibold text-slate-300">
                  Ministry of Earth Sciences
                </p>
              </div>
              <h1 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2">
                National Disaster Management Authority (NDMA)
              </h1>
              <p className="text-[11px] text-slate-300 font-medium">
                Integrated Emergency Operations Network · Cyclone Surveillance Wing
              </p>
            </div>
          </div>

          {/* Secure Live Terminal Badges */}
          <div className="flex items-center gap-4 text-xs font-mono self-start md:self-auto border-t md:border-t-0 border-blue-900/50 pt-2 md:pt-0">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#10243e] border border-blue-500/30 text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-semibold text-[11px]">PORTAL ACTIVE // NIC-SECURE</span>
            </div>
            <div className="hidden lg:block text-right text-[11px] text-slate-300">
              <p className="text-amber-300/90 font-bold">{currentTime || "LIVE CLOCK"}</p>
              <p className="text-[10px] text-slate-400">RESTRICTED // LEVEL-4 CLEARANCE</p>
            </div>
          </div>
        </div>
      </header>

      {/* ------------------------------------------------------------- */}
      {/* 3. Security Warning Marquee / Advisory Strip                   */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-[#1e293b] border-b border-slate-700/60 px-4 py-1.5 text-xs text-slate-200">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-3.5 w-3.5 text-amber-400 shrink-0" />
            <span className="font-bold text-amber-400 tracking-wider text-[11px] uppercase">
              CONFIDENTIAL DISASTER SURVEILLANCE SYSTEM
            </span>
            <span className="hidden sm:inline text-slate-300">|</span>
            <span className="hidden sm:inline text-[11px] text-slate-300">
              Bay of Bengal Cyclone Dana-3 Active Monitoring Cell
            </span>
          </div>
          <div className="hidden md:flex items-center gap-1.5 text-[11px] text-slate-400 font-mono">
            <Lock className="h-3 w-3 text-emerald-400" />
            <span>TLS 1.3 / SHA-256 ENCRYPTED</span>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 4. Main Authentication Window                                 */}
      {/* ------------------------------------------------------------- */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md">
          {/* Official Government Card Container */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-300 overflow-hidden">
            {/* Card Header */}
            <div className="bg-gradient-to-r from-[#0f284e] to-[#1a3d6d] p-6 text-white text-center relative border-b-2 border-amber-400">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 border border-white/20 shadow-inner">
                <ShieldCheck className="h-8 w-8 text-amber-400" />
              </div>

              <h2 className="text-xl font-black tracking-tight text-white">
                SenseIT Command Center
              </h2>
              <p className="mt-1 text-xs text-blue-200 font-medium">
                Cyclone Vulnerability Forecaster & Infrastructure Exposure Grid
              </p>

              <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-amber-400/20 px-3 py-1 text-[11px] font-bold text-amber-300 border border-amber-400/30">
                <Lock className="h-3 w-3" />
                <span>AUTHORIZED OFFICER ACCESS ONLY</span>
              </div>
            </div>

            {/* Form Body */}
            <div className="p-6 sm:p-7 space-y-5">
              {/* Error Message */}
              {errorMsg && (
                <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-700 animate-fade-up">
                  <AlertTriangle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <p className="font-bold text-red-800">Authentication Failed</p>
                    <p className="text-red-700 leading-relaxed">{errorMsg}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* 1. Officer Name Field (EMPTY BY DEFAULT, HINT PROVIDED) */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5 flex items-center justify-between">
                    <span>Authorized Officer Name</span>
                    <span className="text-[10px] font-semibold text-blue-700 lowercase font-mono">
                      (service-registry)
                    </span>
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                      <User className="h-4 w-4" />
                    </div>
                    <input
                      type="text"
                      value={officerNameInput}
                      onChange={(e) => setOfficerNameInput(e.target.value)}
                      placeholder="Enter authorized officer name"
                      autoComplete="off"
                      className="block w-full rounded-xl border border-gray-300 bg-gray-50/50 py-2.5 pl-10 pr-3.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
                    />
                  </div>

                  {/* Hint for Officer Name */}
                  <div className="mt-1.5 flex items-center justify-between rounded-lg bg-blue-50/80 px-2.5 py-1.5 border border-blue-100 text-[11px] text-blue-800">
                    <span className="font-semibold flex items-center gap-1">
                      <span>💡 Hint:</span>
                      <span className="font-mono font-bold text-blue-900">Aditya Bhandari</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setOfficerNameInput("Aditya Bhandari")}
                      className="text-[10px] font-bold text-blue-700 hover:text-blue-900 hover:underline uppercase tracking-tight"
                    >
                      Use Hint
                    </button>
                  </div>
                </div>

                {/* 2. Password Field (EMPTY BY DEFAULT, HINT PROVIDED) */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5 flex items-center justify-between">
                    <span>Security Passcode</span>
                    <span className="text-[10px] font-semibold text-gray-500">
                      Level-4 Security
                    </span>
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                      <KeyRound className="h-4 w-4" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      placeholder="Enter security passcode"
                      className="block w-full rounded-xl border border-gray-300 bg-gray-50/50 py-2.5 pl-10 pr-10 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-400 hover:text-gray-600 transition"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>

                  {/* Hint for Password */}
                  <div className="mt-1.5 flex items-center justify-between rounded-lg bg-emerald-50/80 px-2.5 py-1.5 border border-emerald-100 text-[11px] text-emerald-800">
                    <span className="font-semibold flex items-center gap-1">
                      <span>💡 Passcode Hint:</span>
                      <span className="font-mono font-bold text-emerald-950">Admin-1234</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setPasswordInput("Admin-1234")}
                      className="text-[10px] font-bold text-emerald-700 hover:text-emerald-900 hover:underline uppercase tracking-tight"
                    >
                      Use Hint
                    </button>
                  </div>
                </div>

                {/* 3. Statutory Undertaking / Certification Checkbox */}
                <div className="pt-1">
                  <label className="flex items-start gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={certified}
                      onChange={(e) => setCertified(e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-[11px] text-gray-600 leading-snug">
                      I certify that I am an authorized officer on official cyclone surveillance duty.
                      I accept regulatory oversight under Section 51 of the Disaster Management Act.
                    </span>
                  </label>
                </div>

                {/* 4. Authenticate & Enter Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#0f284e] py-3 px-4 text-sm font-bold text-white shadow-md hover:bg-[#16396e] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 transition-all disabled:opacity-75 disabled:pointer-events-none mt-2"
                >
                  {isLoading ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      <span>Verifying Officer Credentials…</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="h-4 w-4 text-amber-400" />
                      <span>Authenticate & Enter SenseIT</span>
                    </>
                  )}
                </button>
              </form>

              {/* Legal Warning Notice */}
              <div className="border-t border-gray-200 pt-4 text-center">
                <p className="text-[10px] text-gray-600 font-medium leading-relaxed">
                  Notice: All access attempts and operational dispatch activities are timestamped and archived by the National Emergency Operations Center (EOC).
                </p>
                <div className="mt-2.5 flex items-center justify-center gap-4 text-[10px] font-mono text-gray-600">
                  <span>SSL: 256-BIT</span>
                  <span>•</span>
                  <span>EOC HELPLINE: 1070</span>
                  <span>•</span>
                  <span>NIC SECURE</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Help Assistance */}
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-600">
              Need authorized credential clearance? Contact District Emergency Operations Center (DEOC) at{" "}
              <span className="font-semibold text-gray-800">1077 (Toll-Free)</span>
            </p>
          </div>
        </div>
      </main>

      {/* ------------------------------------------------------------- */}
      {/* 5. Official Government Portal Footer                          */}
      {/* ------------------------------------------------------------- */}
      <footer className="bg-white border-t border-gray-200 py-3.5 px-4 text-center text-xs text-gray-600">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-[11px]">
            © 2026 National Disaster Management Authority (NDMA) · Government of India
          </p>
          <p className="text-[11px] text-gray-600">
            Hosted by National Informatics Centre (NIC) · Ministry of Electronics & IT
          </p>
        </div>
      </footer>
    </div>
  );
}
