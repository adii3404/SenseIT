"use client";

import { useSenseIT } from "@/components/senseit-provider";
import { GovernmentLogin } from "@/components/login/government-login";
import { Sidebar, MobileHeader } from "@/components/sidebar";
import { CoastalMap } from "@/components/map/coastal-map";
import { StatusPanel } from "@/components/status-panel";
import { OverviewModal } from "@/components/modals/overview-modal";
import { ReportModal } from "@/components/modals/report-modal";
import { SettingsModal } from "@/components/modals/settings-modal";
import type { MapAsset } from "@/lib/types";

export function DashboardContent({
  apiKey,
  mapAssets,
  landfallIso,
  lastNotified,
}: {
  apiKey: string;
  mapAssets: MapAsset[];
  landfallIso: string;
  lastNotified: string | null;
}) {
  const { isAuthenticated, isAuthChecking } = useSenseIT();

  // Brief session check on first render
  if (isAuthChecking) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#0a192f] text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-400 border-t-transparent" />
          <p className="text-xs font-mono font-semibold tracking-widest text-slate-300 uppercase">
            Verifying Security Credentials…
          </p>
        </div>
      </div>
    );
  }

  // Not authenticated -> Show Official Government Authorized Login Window
  if (!isAuthenticated) {
    return <GovernmentLogin />;
  }

  // Authenticated -> Full Active Dashboard
  return (
    <div className="flex min-h-screen flex-col bg-gray-50 md:h-screen md:flex-row overflow-hidden">
      <Sidebar />
      <MobileHeader />

      <main className="relative flex min-h-0 flex-1 flex-col md:block">
        {/* Map — the comprehensive focus of the screen */}
        <div className="relative h-[58vh] min-h-[380px] w-full md:absolute md:inset-0 md:h-full">
          <CoastalMap apiKey={apiKey} assets={mapAssets} />
        </div>

        {/* Floating situation and action panel */}
        <div className="relative z-20 -mt-8 px-4 pb-6 md:absolute md:bottom-6 md:right-6 md:top-6 md:mt-0 md:w-[390px] md:px-0 md:pb-0 pointer-events-auto">
          <StatusPanel landfallIso={landfallIso} lastNotified={lastNotified} />
        </div>
      </main>

      {/* Global Modals for Overview (Gemini chat + crisis cards), Reports (PDF generator), Settings */}
      <OverviewModal />
      <ReportModal />
      <SettingsModal />
    </div>
  );
}
