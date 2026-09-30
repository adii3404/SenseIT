"use client";

import dynamic from "next/dynamic";
import type { MapAsset } from "@/lib/types";
import { Map as MapIcon } from "lucide-react";

// Dynamically import LeafletMapInner with SSR disabled to ensure window/document are safely present
const DynamicLeafletMap = dynamic(
  () => import("./leaflet-map-inner").then((mod) => mod.LeafletMapInner),
  {
    ssr: false,
    loading: () => (
      <div className="relative h-full w-full bg-slate-900 grid place-items-center">
        <div className="flex flex-col items-center gap-3 text-slate-300">
          <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg animate-pulse">
            <MapIcon className="h-6 w-6" />
          </div>
          <p className="text-sm font-semibold tracking-wide text-white">
            Initializing Interactive Satellite GIS…
          </p>
          <span className="text-xs text-slate-400 font-mono">
            Gopalpur Coast · Bay of Bengal Sector
          </span>
        </div>
      </div>
    ),
  },
);

export function LeafletMap({ assets }: { assets: MapAsset[] }) {
  return <DynamicLeafletMap assets={assets} />;
}
