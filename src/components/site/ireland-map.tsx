/**
 * Schematic map of Ireland with area-centroid pins (equirectangular projection).
 * Coordinates come from the property's PostGIS geography point; never a building location.
 */
const BOUNDS = { minLng: -10.7, maxLng: -5.4, minLat: 51.35, maxLat: 55.45 };
const W = 220, H = 280;

const project = (lat: number, lng: number) => ({
  x: ((lng - BOUNDS.minLng) / (BOUNDS.maxLng - BOUNDS.minLng)) * W,
  y: ((BOUNDS.maxLat - lat) / (BOUNDS.maxLat - BOUNDS.minLat)) * H,
});

// Coarse outline of the island of Ireland (lng, lat), simplified for illustration.
const OUTLINE: [number, number][] = [
  [-6.2, 55.25], [-7.3, 55.38], [-8.3, 55.15], [-8.6, 54.75], [-8.2, 54.45], [-9.0, 54.3], [-10.0, 54.2], [-9.9, 53.9],
  [-10.2, 53.5], [-9.6, 53.2], [-9.0, 53.15], [-9.6, 52.6], [-10.4, 52.15], [-10.2, 51.8], [-9.6, 51.55], [-8.5, 51.6],
  [-7.6, 51.95], [-6.4, 52.18], [-6.15, 52.75], [-6.05, 53.3], [-6.3, 53.7], [-6.05, 54.05], [-5.5, 54.35], [-5.7, 54.8], [-6.2, 55.25],
];

export function IrelandMap({ points }: { points: { id: string; label: string; lat: number; lng: number }[] }) {
  const d = OUTLINE.map(([lng, lat], i) => {
    const p = project(lat, lng);
    return `${i ? "L" : "M"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
  }).join(" ") + " Z";
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Map of Ireland showing illustrative property areas">
      <path d={d} fill="#ddf3e8" stroke="#0d6656" strokeWidth="1.5" strokeLinejoin="round" />
      {points.map((pt) => {
        const p = project(pt.lat, pt.lng);
        return (
          <g key={pt.id}>
            <circle cx={p.x} cy={p.y} r="10" fill="#c7a86d" opacity="0.3" />
            <circle cx={p.x} cy={p.y} r="4.5" fill="#063f36" stroke="#fff" strokeWidth="1.5" />
            <text x={p.x + 8} y={p.y - 6} fontSize="10" fontWeight="600" fill="#172521" fontFamily="var(--font-manrope), sans-serif">{pt.label}</text>
          </g>
        );
      })}
    </svg>
  );
}
