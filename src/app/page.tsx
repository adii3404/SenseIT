import { db } from "@/db";
import { assets, dispatches } from "@/db/schema";
import { desc } from "drizzle-orm";
import { Sidebar, MobileHeader } from "@/components/sidebar";
import { CoastalMap } from "@/components/map/coastal-map";
import { StatusPanel } from "@/components/status-panel";
import { SenseITProvider } from "@/components/senseit-provider";
import { OverviewModal } from "@/components/modals/overview-modal";
import { ReportModal } from "@/components/modals/report-modal";
import { SettingsModal } from "@/components/modals/settings-modal";
import type { MapAsset } from "@/lib/types";

export const dynamic = "force-dynamic";

/** Fallbacks keep the product usable while the DB is still seeding. */
const FALLBACK_ASSETS: MapAsset[] = [
  {
    id: 1,
    name: "City General Hospital",
    kind: "medical",
    ward: "Ward 4 Coast",
    risk: 92,
    severity: "critical",
    impactNote:
      "Serves 48,000 residents. Backup generator covers about 18 hours if the Coastal Substation fails.",
    population: 48000,
    lat: 19.312,
    lng: 84.905,
  },
  {
    id: 2,
    name: "Ward 4 Riverside Clinic",
    kind: "medical",
    ward: "Ward 4 Riverside",
    risk: 88,
    severity: "critical",
    impactNote:
      "Single-story facility inside the projected flood zone. Patient transfer to City General is recommended tonight.",
    population: 9200,
    lat: 19.296,
    lng: 84.918,
  },
  {
    id: 3,
    name: "Coastal Substation Alpha",
    kind: "power",
    ward: "Ward 4 North",
    risk: 85,
    severity: "high",
    impactNote:
      "Feeds City General Hospital. A 3.2 m storm surge is likely to flood the switchyard.",
    population: 48000,
    lat: 19.289,
    lng: 84.912,
  },
  {
    id: 4,
    name: "Grid Relay Station B",
    kind: "power",
    ward: "Ward 2 Upland",
    risk: 63,
    severity: "high",
    impactNote:
      "Secondary feeder for Ward 4. Wind and salt spray may trip the line during landfall.",
    population: 21000,
    lat: 19.325,
    lng: 84.895,
  },
];

async function loadData() {
  try {
    const [assetRows, dispatchRows] = await Promise.all([
      db.select().from(assets).orderBy(desc(assets.risk)),
      db.select().from(dispatches).orderBy(desc(dispatches.createdAt)).limit(1),
    ]);
    return {
      assets: assetRows.length
        ? assetRows.map((a) => ({
            ...a,
            kind: a.kind as MapAsset["kind"],
            severity: a.severity as MapAsset["severity"],
          }))
        : FALLBACK_ASSETS,
      lastNotified: dispatchRows[0]?.createdAt?.toISOString() ?? null,
    };
  } catch (err) {
    console.error("[senseit] DB unavailable — using fallback dataset", err);
    return { assets: FALLBACK_ASSETS, lastNotified: null as string | null };
  }
}

export default async function LiveMapPage() {
  const { assets: mapAssets, lastNotified } = await loadData();
  const landfallIso = new Date(Date.now() + 14.5 * 3_600_000).toISOString();
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";

  return (
    <SenseITProvider initialAssets={mapAssets} initialLandfallIso={landfallIso}>
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
    </SenseITProvider>
  );
}
