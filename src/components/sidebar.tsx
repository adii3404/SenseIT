"use client";

import {
  AlertCircle,
  FileText,
  LayoutDashboard,
  LogOut,
  Map,
  MoreHorizontal,
  PanelLeftClose,
  PanelLeftOpen,
  Phone,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSenseIT, type ModalType } from "@/components/senseit-provider";

export function Sidebar() {
  const {
    activeModal,
    setActiveModal,
    sidebarCollapsed,
    setSidebarCollapsed,
    officerName,
    logout,
  } = useSenseIT();

  const navItems: { label: string; icon: any; modal: ModalType; isMap?: boolean }[] = [
    { label: "Overview", icon: LayoutDashboard, modal: "overview" },
    { label: "Live Map", icon: Map, modal: null, isMap: true },
    { label: "Reports", icon: FileText, modal: "reports" },
    { label: "Emergency", icon: Phone, modal: "settings" },
  ];

  /* -------- Collapsed: thin icon rail with tooltips -------- */
  if (sidebarCollapsed) {
    return (
      <aside className="hidden md:flex w-14 shrink-0 flex-col items-center border-r border-gray-200 bg-white py-3 transition-all duration-300">
        {/* Logo at top of collapsed rail */}
        <div className="mb-2 p-1">
          <img
            src="/logo.png"
            alt="SenseIT"
            className="h-8 w-auto object-contain rounded"
          />
        </div>

        {/* Expand Button */}
        <button
          onClick={() => setSidebarCollapsed(false)}
          className="mb-4 flex h-9 w-9 items-center justify-center rounded-xl text-gray-500 hover:bg-gray-100 hover:text-blue-600 transition"
          title="Expand Navigation"
          aria-label="Expand sidebar"
        >
          <PanelLeftOpen className="h-4 w-4" />
        </button>

        {/* Icon-only nav with tooltips */}
        <nav className="flex flex-1 flex-col items-center gap-1.5">
          {navItems.map(({ label, icon: Icon, modal, isMap }) => {
            const isActive = isMap ? activeModal === null : activeModal === modal;
            return (
              <div key={label} className="relative group">
                <button
                  onClick={() => {
                    if (modal) setActiveModal(modal);
                    else setActiveModal(null);
                  }}
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-xl transition-all",
                    isActive
                      ? "bg-blue-50 text-blue-600 shadow-xs"
                      : "text-gray-400 hover:bg-gray-100 hover:text-gray-700",
                  )}
                  aria-label={label}
                >
                  <Icon className="h-[18px] w-[18px]" />
                </button>
                {/* Tooltip */}
                <span className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-2.5 whitespace-nowrap rounded-lg bg-gray-900 px-2.5 py-1 text-[11px] font-semibold text-white opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100 z-50">
                  {label}
                </span>
              </div>
            );
          })}
        </nav>

        {/* User avatar and Sign Out in collapsed mode */}
        <div className="mt-auto pt-3 border-t border-gray-200 flex flex-col items-center gap-2">
          <div className="relative group">
            <div className="grid h-9 w-9 place-items-center rounded-full bg-slate-900 text-xs font-bold text-white shadow-xs">
              AB
            </div>
            {/* Tooltip */}
            <span className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-2.5 whitespace-nowrap rounded-lg bg-gray-900 px-2.5 py-1 text-[11px] font-semibold text-white opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100 z-50">
              {officerName || "Aditya Bhandari"} (Admin)
            </span>
          </div>

          <div className="relative group">
            <button
              onClick={logout}
              className="flex h-9 w-9 items-center justify-center rounded-xl text-red-500 hover:bg-red-50 hover:text-red-700 transition"
              title="Sign Out"
              aria-label="Sign Out"
            >
              <LogOut className="h-4 w-4" />
            </button>
            {/* Tooltip */}
            <span className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-2.5 whitespace-nowrap rounded-lg bg-gray-900 px-2.5 py-1 text-[11px] font-semibold text-white opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100 z-50">
              Sign Out
            </span>
          </div>
        </div>
      </aside>
    );
  }

  /* -------- Expanded: full sidebar -------- */
  return (
    <aside className="relative hidden w-64 shrink-0 flex-col border-r border-gray-200 bg-white md:flex lg:w-72 transition-all duration-300">
      {/* Brand Header with Logo upside the sidebar */}
      <div className="flex items-start justify-between p-4 border-b border-gray-100">
        <div className="flex items-start gap-3">
          <img
            src="/logo.png"
            alt="SenseIT Logo"
            className="h-10 w-auto object-contain rounded-md shrink-0 mt-0.5"
          />
          <div>
            <p className="text-base font-black tracking-tight text-gray-900 leading-tight">SenseIT</p>
            <p className="mt-0.5 text-[10px] font-bold tracking-wider text-blue-700 uppercase leading-snug">
              DISASTER SURVEILLANCE MANAGEMENT
            </p>
          </div>
        </div>

        <button
          onClick={() => setSidebarCollapsed(true)}
          className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition shrink-0 mt-0.5"
          title="Collapse navigation"
          aria-label="Collapse sidebar"
        >
          <PanelLeftClose className="h-4 w-4" />
        </button>
      </div>

      {/* Navigation — no "Open" text, darker prominent buttons */}
      <nav className="flex-1 space-y-1.5 px-3">
        {navItems.map(({ label, icon: Icon, modal, isMap }) => {
          const isActive = isMap ? activeModal === null : activeModal === modal;
          return (
            <button
              key={label}
              onClick={() => {
                if (modal) setActiveModal(modal);
                else setActiveModal(null);
              }}
              className={cn(
                "group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-all",
                isActive
                  ? "bg-blue-50 font-bold text-blue-700 shadow-xs"
                  : "font-semibold text-gray-700 hover:bg-gray-100 hover:text-gray-900",
              )}
            >
              <Icon
                className={cn(
                  "h-[18px] w-[18px] shrink-0 transition-transform group-hover:scale-105",
                  isActive ? "text-blue-600" : "text-gray-500 group-hover:text-gray-700",
                )}
              />
              <span className="flex-1 truncate">{label}</span>
            </button>
          );
        })}
      </nav>

      {/* Admin User Profile with Sign Out */}
      <div className="border-t border-gray-200 p-3">
        <div className="flex items-center gap-2.5 rounded-xl p-2 bg-slate-50 border border-slate-200/80">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-slate-900 to-blue-900 text-xs font-bold text-white shadow-xs">
            AB
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-bold text-gray-900">
              {officerName || "Aditya Bhandari"}
            </p>
            <p className="truncate text-[10px] font-medium text-emerald-700 flex items-center gap-1">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Authorized Admin
            </p>
          </div>
          <button
            onClick={logout}
            className="flex items-center justify-center h-8 w-8 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition"
            title="Sign Out"
            aria-label="Sign Out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}

/** Compact top bar shown only on small screens. */
export function MobileHeader() {
  const { activeModal, setActiveModal, officerName, logout } = useSenseIT();

  const navItems: { label: string; icon: any; modal: ModalType; isMap?: boolean }[] = [
    { label: "Overview", icon: LayoutDashboard, modal: "overview" },
    { label: "Live Map", icon: Map, modal: null, isMap: true },
    { label: "Reports", icon: FileText, modal: "reports" },
    { label: "Emergency", icon: Phone, modal: "settings" },
  ];

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-3 md:hidden">
      <div className="flex items-center gap-2">
        <img
          src="/logo.png"
          alt="SenseIT Logo"
          className="h-7 w-auto object-contain rounded"
        />
        <div className="flex items-baseline gap-1">
          <span className="text-sm font-black tracking-tight text-gray-900">SenseIT</span>
          <span className="text-[9px] font-bold text-blue-700 uppercase">SURVEILLANCE</span>
        </div>
      </div>
      <nav className="flex items-center gap-1">
        {navItems.map(({ label, icon: Icon, modal, isMap }) => {
          const isActive = isMap ? activeModal === null : activeModal === modal;
          return (
            <button
              key={label}
              onClick={() => {
                if (modal) setActiveModal(modal);
                else setActiveModal(null);
              }}
              aria-label={label}
              className={cn(
                "grid h-9 w-9 place-items-center rounded-lg transition",
                isActive ? "bg-blue-50 text-blue-600" : "text-gray-400 hover:text-gray-700",
              )}
            >
              <Icon className="h-[18px] w-[18px]" />
            </button>
          );
        })}

        <button
          onClick={logout}
          aria-label="Sign Out"
          title="Sign Out"
          className="grid h-9 w-9 place-items-center rounded-lg text-red-500 hover:bg-red-50 hover:text-red-700 transition ml-1 border border-red-200"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </nav>
    </header>
  );
}
