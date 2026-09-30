/** Shared types for API responses consumed by the SenseIT frontend. */

export interface CycloneTelemetry {
  cyclone: {
    name: string;
    category: string;
    windSpeedKmh: number;
    gustSpeedKmh: number;
    pressureHpa: number;
    movementDirection: string;
    movementSpeedKmh: number;
    stormSurgeMeters: number;
  };
  position: {
    lat: number;
    lng: number;
    timestamp: string;
  };
  landfall: {
    eta: string;
    location: string;
    lat: number;
    lng: number;
  };
  rainfall: {
    expectedMm: number;
    durationHours: number;
  };
  updatedAt: string;
}

export interface ActionItem {
  id: string;
  label: string;
  tag: string;
}

export interface AiAnalysis {
  impactSummary: string;
  actions: ActionItem[];
  generatedAt: string;
  model: string;
}
