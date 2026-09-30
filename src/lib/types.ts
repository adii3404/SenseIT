export type AssetKind = "medical" | "power";
export type Severity = "critical" | "high" | "moderate";

export interface MapAsset {
  id: number;
  name: string;
  kind: AssetKind;
  ward: string;
  risk: number;
  severity: Severity;
  impactNote: string;
  population: number;
  lat: number;
  lng: number;
}

export interface LatLng {
  lat: number;
  lng: number;
}

export const KIND_META: Record<
  AssetKind,
  { label: string; vulnerableLabel: string; pinColor: string; accentText: string }
> = {
  medical: {
    label: "Hospital",
    vulnerableLabel: "Vulnerable hospital",
    pinColor: "#EA4335",
    accentText: "text-red-600",
  },
  power: {
    label: "Power grid",
    vulnerableLabel: "At-risk power grid",
    pinColor: "#F9AB00",
    accentText: "text-amber-600",
  },
};

export const SEVERITY_STYLE: Record<Severity, { chip: string; label: string }> = {
  critical: { chip: "bg-red-50 text-red-700 border-red-200", label: "Critical risk" },
  high: { chip: "bg-amber-50 text-amber-700 border-amber-200", label: "High risk" },
  moderate: { chip: "bg-yellow-50 text-yellow-700 border-yellow-200", label: "Moderate risk" },
};
