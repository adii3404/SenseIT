import { Cross, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AssetKind } from "@/lib/types";
import { KIND_META } from "@/lib/types";

const GLYPH = { medical: Cross, power: Zap } as const;
const GLYPH_COLOR: Record<AssetKind, string> = {
  medical: "text-white",
  power: "text-yellow-900",
};

/**
 * Classic Google Maps-style teardrop pin, built with pure CSS shapes.
 * A rotated rounded square forms the pointer; the icon sits in the white core.
 */
export function MapPin({
  kind,
  selected = false,
  dimmed = false,
  delay = 0,
}: {
  kind: AssetKind;
  selected?: boolean;
  dimmed?: boolean;
  delay?: number;
}) {
  const color = KIND_META[kind].pinColor;
  const Glyph = GLYPH[kind];

  return (
    <span
      className={cn(
        "relative block origin-bottom animate-pin-drop transition-all duration-200",
        selected ? "scale-125" : "hover:scale-110",
        dimmed && "opacity-25 grayscale-[0.4]",
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* soft halo when selected */}
      {selected && (
        <span
          className="absolute left-1/2 top-1/2 h-9 w-9 -translate-x-1/2 -translate-y-[56%] animate-soft-ping rounded-full"
          style={{ backgroundColor: `${color}55` }}
        />
      )}
      {/* teardrop body */}
      <span
        className="block h-8 w-8 rotate-45 rounded-[50%_50%_50%_0] shadow-[0_3px_6px_rgba(0,0,0,0.35)]"
        style={{ backgroundColor: color }}
      />
      {/* white core with glyph */}
      <span className="absolute left-1/2 top-[7px] grid h-[18px] w-[18px] -translate-x-1/2 place-items-center rounded-full bg-white">
        <Glyph className={cn("h-3 w-3", GLYPH_COLOR[kind])} strokeWidth={2.8} />
      </span>
      {/* ground shadow */}
      <span className="absolute left-1/2 top-full h-[5px] w-[14px] -translate-x-1/2 -translate-y-[2px] rounded-full bg-black/20 blur-[2px]" />
    </span>
  );
}

/** Builds an SVG data-URL pin for native Google Markers. */
export function pinDataUrl(kind: AssetKind): string {
  const color = KIND_META[kind].pinColor;
  const glyph =
    kind === "medical"
      ? `<rect x="10.4" y="4.4" width="3.2" height="9.6" rx="0.8" fill="#fff"/><rect x="4.4" y="7.6" width="9.6" height="3.2" rx="0.8" fill="#fff"/>`
      : `<path d="M12.9 3.6 6.6 10.9h3.6l-1.1 6.5 6.3-7.3h-3.6l1.1-6.5z" fill="#713F12"/>`;
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="44" viewBox="0 0 24 26">` +
    `<path d="M12 1C7 1 3 5 3 10c0 6.5 9 15 9 15s9-8.5 9-15c0-5-4-9-9-9z" fill="${color}" stroke="#ffffff" stroke-opacity="0.25"/>` +
    `<circle cx="12" cy="10" r="5.4" fill="#ffffff"/>` +
    `<g transform="translate(0,0)">${glyph}</g></svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}
