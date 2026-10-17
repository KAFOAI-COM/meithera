import { cn } from "@/lib/utils";

type Variant = "facade" | "street" | "interior" | "plan";

/**
 * Illustrative property artwork (SVG, offline). Deliberately stylised — the demonstration
 * properties are fictional, so no real photographs or addresses are shown.
 */
export function PropertyArt({
  palette,
  kind = "terrace",
  variant = "facade",
  className,
  label,
}: {
  palette: { door: string; brick: string; sky: string };
  kind?: "terrace" | "apartment";
  variant?: Variant;
  className?: string;
  label?: string;
}) {
  const { door, brick, sky } = palette;
  return (
    <svg viewBox="0 0 400 260" className={cn("block h-full w-full", className)} role="img" aria-label={label ?? "Illustration of a fictional property"} preserveAspectRatio="xMidYMid slice">
      <rect width="400" height="260" fill={sky} />
      {variant === "interior" ? (
        <Interior door={door} />
      ) : variant === "plan" ? (
        <Plan door={door} />
      ) : kind === "apartment" ? (
        <Apartment door={door} brick={brick} street={variant === "street"} />
      ) : (
        <Terrace door={door} brick={brick} street={variant === "street"} />
      )}
    </svg>
  );
}

function Door({ x, y, color, w = 34, h = 70 }: { x: number; y: number; color: string; w?: number; h?: number }) {
  const r = w / 2;
  return (
    <g>
      <path d={`M${x - 5} ${y + h} V${y + r} a${r + 5} ${r + 5} 0 0 1 ${w + 10} 0 V${y + h} Z`} fill="#f8faf8" opacity="0.9" />
      <path d={`M${x} ${y + h} V${y + r} a${r} ${r} 0 0 1 ${w} 0 V${y + h} Z`} fill={color} />
      <path d={`M${x + 3} ${y + r} a${r - 3} ${r - 3} 0 0 1 ${w - 6} 0 Z`} fill="#fff" opacity="0.55" />
      <line x1={x + r} y1={y + r - 1} x2={x + r} y2={y + 4} stroke={color} strokeWidth="1.5" />
      <circle cx={x + w - 8} cy={y + r + 28} r="2" fill="#c7a86d" />
    </g>
  );
}

function Win({ x, y, w = 40, h = 52 }: { x: number; y: number; w?: number; h?: number }) {
  return (
    <g>
      <rect x={x - 3} y={y - 3} width={w + 6} height={h + 6} fill="#f8faf8" opacity="0.85" />
      <rect x={x} y={y} width={w} height={h} fill="#17322b" />
      <line x1={x + w / 2} y1={y} x2={x + w / 2} y2={y + h} stroke="#f8faf8" strokeWidth="2" />
      <line x1={x} y1={y + h / 2} x2={x + w} y2={y + h / 2} stroke="#f8faf8" strokeWidth="2" />
      <rect x={x - 5} y={y + h + 3} width={w + 10} height="4" fill="#e2e8e4" />
    </g>
  );
}

function Terrace({ door, brick, street }: { door: string; brick: string; street: boolean }) {
  const houses = street ? [-120, 20, 160, 300] : [70];
  const w = street ? 140 : 260;
  return (
    <g>
      <rect x="0" y="232" width="400" height="28" fill="#cfd8d3" />
      <rect x="0" y="228" width="400" height="6" fill="#b9c4be" />
      {houses.map((hx, i) => {
        const doorColor = street && i !== 1 ? ["#0d6656", "#c7a86d", "#063f36", "#8f2f22"][i % 4] : door;
        const scale = w / 260;
        return (
          <g key={hx} transform={`translate(${hx} ${street ? 40 : 18}) scale(${scale})`}>
            <rect x="0" y="0" width="260" height="214" fill={brick} />
            <rect x="0" y="0" width="260" height="10" fill="#4a3a33" opacity="0.5" />
            <rect x="-6" y="-8" width="272" height="10" fill="#5d6b65" />
            <Win x={30} y={30} />
            <Win x={110} y={30} />
            <Win x={190} y={30} />
            <Win x={30} y={110} />
            <Win x={190} y={110} />
            <Door x={113} y={130} color={doorColor} />
            <rect x="100" y="200" width="60" height="6" fill="#e2e8e4" />
            <rect x="94" y="206" width="72" height="8" fill="#d2dad5" />
          </g>
        );
      })}
    </g>
  );
}

function Apartment({ door, brick, street }: { door: string; brick: string; street: boolean }) {
  return (
    <g>
      <rect x="0" y="232" width="400" height="28" fill="#cfd8d3" />
      <g transform={street ? "translate(20 10) scale(0.9)" : "translate(60 0)"}>
        <rect x="0" y="20" width="280" height="214" fill={brick} />
        {[0, 1, 2].map((row) =>
          [0, 1, 2, 3].map((col) => <Win key={`${row}-${col}`} x={22 + col * 66} y={38 + row * 60} w={38} h={36} />),
        )}
        <rect x="110" y="196" width="60" height="38" fill={door} />
        <rect x="104" y="190" width="72" height="6" fill="#063f36" />
      </g>
      {street ? <rect x="290" y="80" width="110" height="154" fill="#c9c1b2" /> : null}
    </g>
  );
}

function Interior({ door }: { door: string }) {
  return (
    <g>
      <rect x="0" y="180" width="400" height="80" fill="#e6d9c3" />
      {Array.from({ length: 10 }).map((_, i) => (
        <line key={i} x1={i * 44} y1="180" x2={i * 44 - 30} y2="260" stroke="#d6c6aa" strokeWidth="2" />
      ))}
      <rect x="40" y="40" width="120" height="110" fill="#ffffff" stroke="#e2e8e4" strokeWidth="6" />
      <line x1="100" y1="40" x2="100" y2="150" stroke="#e2e8e4" strokeWidth="4" />
      <rect x="220" y="120" width="150" height="60" rx="12" fill={door} />
      <rect x="230" y="100" width="130" height="30" rx="10" fill={door} opacity="0.8" />
      <rect x="250" y="40" width="70" height="40" fill="#c7a86d" opacity="0.6" />
      <circle cx="285" cy="22" r="10" fill="#f8faf8" stroke="#c7a86d" strokeWidth="3" />
    </g>
  );
}

function Plan({ door }: { door: string }) {
  return (
    <g fill="none" stroke="#063f36" strokeWidth="4">
      <rect x="60" y="30" width="280" height="200" fill="#ffffff" />
      <line x1="200" y1="30" x2="200" y2="140" />
      <line x1="60" y1="140" x2="260" y2="140" />
      <line x1="260" y1="140" x2="260" y2="230" />
      <path d="M200 100 a30 30 0 0 1 30 30" stroke={door} />
      <g fill="#65736d" stroke="none" fontFamily="sans-serif" fontSize="12">
        <text x="100" y="90">Bedroom 1</text>
        <text x="245" y="90">Bedroom 2</text>
        <text x="120" y="190">Living / kitchen</text>
        <text x="275" y="190">Bath</text>
      </g>
    </g>
  );
}
