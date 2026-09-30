import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * GET /api/telemetry
 *
 * Returns simulated real-time cyclone telemetry for Cyclone Dana-3.
 * All values are realistic for a severe cyclonic storm approaching the
 * Odisha coast via the Bay of Bengal.
 */
export async function GET() {
  const now = Date.now();
  const landfallEta = new Date(now + 14.5 * 3_600_000); // ~14.5 hrs from now

  return NextResponse.json({
    cyclone: {
      name: "Dana-3",
      category: "Severe Cyclonic Storm",
      windSpeedKmh: 145,
      gustSpeedKmh: 175,
      pressureHpa: 972,
      movementDirection: "NW",
      movementSpeedKmh: 18,
      stormSurgeMeters: 3.2,
    },
    position: {
      lat: 18.64,
      lng: 85.73,
      timestamp: new Date(now).toISOString(),
    },
    landfall: {
      eta: landfallEta.toISOString(),
      location: "Gopalpur coast, Odisha",
      lat: 19.26,
      lng: 84.94,
    },
    rainfall: {
      expectedMm: 220,
      durationHours: 36,
    },
    updatedAt: new Date(now).toISOString(),
  });
}
