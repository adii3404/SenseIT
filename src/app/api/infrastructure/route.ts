import { NextResponse } from "next/server";
import { db } from "@/db";
import { assets } from "@/db/schema";
import { desc } from "drizzle-orm";
import type { MapAsset } from "@/lib/types";

export const dynamic = "force-dynamic";

const FALLBACK: MapAsset[] = [
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

/**
 * GET /api/infrastructure
 *
 * Returns the list of vulnerable infrastructure assets within
 * the projected cyclone path, ordered by risk (highest first).
 */
export async function GET() {
  try {
    const rows = await db.select().from(assets).orderBy(desc(assets.risk));
    const mapped: MapAsset[] = rows.length
      ? rows.map((a) => ({
          ...a,
          kind: a.kind as MapAsset["kind"],
          severity: a.severity as MapAsset["severity"],
        }))
      : FALLBACK;
    return NextResponse.json(mapped);
  } catch (err) {
    console.error("[senseit] DB unavailable — using fallback", err);
    return NextResponse.json(FALLBACK);
  }
}
