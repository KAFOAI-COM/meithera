/**
 * Chart palette — validated with the dataviz six-checks validator against the white card surface
 * (lightness band, chroma floor, CVD ΔE ≥ 8, normal-vision ΔE ≥ 15, contrast ≥ 3:1 — all PASS).
 * Colour follows the entity: each demonstration home keeps its hue everywhere, regardless of filters.
 */
export const SERIES = ["#118C6E", "#C28A2A", "#3C6EAF", "#A8453A"] as const;

export const HOME_COLOR: Record<string, string> = {
  "prop-d8": SERIES[0],
  "prop-cork": SERIES[1],
  "prop-galway": SERIES[2],
  "prop-limerick": SERIES[3],
};

export function homeColor(propertyId: string, index = 0) {
  return HOME_COLOR[propertyId] ?? SERIES[Math.min(index, SERIES.length - 1)];
}

/** Two states of the same measure: realised (solid) and projected (lighter step of the same hue). */
export const REALISED = SERIES[0];
export const PROJECTED = "#9ED3C2";
export const GRID = "#E2E8E4";
export const AXIS_TEXT = "#65736D";
