"use client";

import { useState } from "react";
import {
  AlertTriangle,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  User,
  Sparkles,
} from "lucide-react";
import { useSenseIT } from "@/components/senseit-provider";

export function GovernmentLogin() {
  const { login } = useSenseIT();

  const [officerNameInput, setOfficerNameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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

    setIsLoading(true);

    // Validate authorized credentials:
    // Name: "Aditya Bhandari" (case-insensitive)
    // Password: "Admin-1234"
    setTimeout(() => {
      const isNameValid = trimmedName.toLowerCase() === "aditya bhandari";
      const isPassValid = trimmedPass === "Admin-1234";

      if (isNameValid && isPassValid) {
        login("Aditya Bhandari");
      } else {
        setIsLoading(false);
        if (!isNameValid && !isPassValid) {
          setErrorMsg("ACCESS DENIED: Invalid Officer Name and Passcode. Use the Hint buttons to fill valid credentials.");
        } else if (!isNameValid) {
          setErrorMsg("ACCESS DENIED: Officer identity not recognized. Click the Hint button to fill authorized officer name.");
        } else {
          setErrorMsg("ACCESS DENIED: Incorrect Security Passcode. Click the Hint button to fill passcode.");
        }
      }
    }, 350);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 text-gray-800 font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* ------------------------------------------------------------- */}
      {/* 1. Official Project Header                                    */}
      {/* ------------------------------------------------------------- */}
      <header className="bg-[#0b1b36] border-b border-blue-950 text-white px-4 py-3 sm:px-8 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Logo before name, then project titles */}
          <div className="flex items-center gap-3.5">
            <img
              src="/logo.png"
              alt="SenseIT Logo"
              className="h-10 w-auto object-contain rounded-md bg-white p-0.5 shadow-sm"
            />
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-black tracking-tight text-white">SenseIT</span>
                <span className="text-xs font-bold tracking-wider text-blue-300 uppercase">
                  DISASTER SURVEILLANCE MANAGEMENT
                </span>
              </div>
              <p className="text-[11px] text-slate-300 font-medium tracking-wide">
                Integrated Emergency Operations Network · Cyclone Surveillance Wing
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* ------------------------------------------------------------- */}
      {/* 2. Main Login Window                                          */}
      {/* ------------------------------------------------------------- */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md">
          {/* Clean Authorized Login Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            {/* Card Header with Logo and Titles in Centre */}
            <div className="bg-gradient-to-b from-[#0f244a] to-[#0a1935] p-6 text-white text-center border-b border-blue-900">
              <div className="mx-auto mb-3 flex items-center justify-center">
                <img
                  src="/logo.png"
                  alt="SenseIT"
                  className="h-16 w-auto object-contain rounded-xl bg-white p-1.5 shadow-md"
                />
              </div>

              <h2 className="text-2xl font-black tracking-tight text-white">
                SenseIT
              </h2>
              <p className="mt-1 text-xs font-bold tracking-wider text-blue-300 uppercase">
                DISASTER SURVEILLANCE MANAGEMENT
              </p>
              <p className="mt-1.5 text-[11.5px] text-slate-300 leading-snug">
                Integrated Emergency Operations Network · Cyclone Surveillance Wing
              </p>
            </div>

            {/* Form Body */}
            <div className="p-6 sm:p-7 space-y-4">
              {/* Error Alert */}
              {errorMsg && (
                <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-700 animate-fade-up">
                  <AlertTriangle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">{errorMsg}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* 1. Officer Name Field (EMPTY, DOES NOT DISPLAY NAME, ONLY HINT BUTTON ASIDE) */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-700">
                      Authorized Officer Name
                    </label>
                    {/* Hint Button Aside that fills name */}
                    <button
                      type="button"
                      onClick={() => setOfficerNameInput("Aditya Bhandari")}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded-md border border-blue-200 transition"
                      title="Click to fill authorized officer name"
                    >
                      <Sparkles className="h-3 w-3 text-blue-500" />
                      <span>Hint</span>
                    </button>
                  </div>

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
                </div>

                {/* 2. Security Passcode Field (EMPTY, HINT BUTTON ASIDE) */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-700">
                      Security Passcode
                    </label>
                    {/* Hint Button Aside that fills password */}
                    <button
                      type="button"
                      onClick={() => setPasswordInput("Admin-1234")}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-200 transition"
                      title="Click to fill security passcode"
                    >
                      <Sparkles className="h-3 w-3 text-emerald-600" />
                      <span>Hint</span>
                    </button>
                  </div>

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
                </div>

                {/* 3. Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#0b1b36] py-3 px-4 text-sm font-bold text-white shadow-md hover:bg-[#12284e] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 transition-all disabled:opacity-75 disabled:pointer-events-none mt-2"
                >
                  {isLoading ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      <span>Verifying Credentials…</span>
                    </>
                  ) : (
                    <span>Enter Portal</span>
                  )}
                </button>
              </form>

              {/* Notice */}
              <div className="border-t border-gray-200 pt-4 text-center">
                <p className="text-[11px] text-gray-600 font-medium">
                  Authorized Personnel Access Only · Incident Command Network
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ------------------------------------------------------------- */}
      {/* 3. Footer                                                     */}
      {/* ------------------------------------------------------------- */}
      <footer className="bg-white border-t border-gray-200 py-3 px-4 text-center text-xs text-gray-600">
        <p className="text-[11px]">
          SenseIT · DISASTER SURVEILLANCE MANAGEMENT · Integrated Emergency Operations Network
        </p>
      </footer>
    </div>
  );
}
