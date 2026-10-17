/** Hero illustration: a terrace of Irish Georgian doorways, one mid-restoration. Offline SVG. */
export function HeroArt() {
  const doors = ["#0d6656", "#c7a86d", "#8f2f22", "#063f36", "#0d6656"];
  return (
    <svg viewBox="0 0 560 460" className="h-full w-full" role="img" aria-label="Illustration of a row of Irish Georgian houses, one being refurbished">
      <rect width="560" height="460" fill="#ddf3e8" />
      <circle cx="450" cy="90" r="46" fill="#f8faf8" />
      <rect x="0" y="420" width="560" height="40" fill="#cfd8d3" />
      {doors.map((c, i) => {
        const x = i * 112;
        const vacant = i === 2;
        return (
          <g key={i} transform={`translate(${x} 110)`}>
            <rect width="112" height="310" fill={i % 2 ? "#a65a43" : "#9a5b45"} />
            <rect x="-2" y="-8" width="116" height="10" fill="#5d6b65" />
            {[30, 110].map((wy) => (
              <g key={wy}>
                <rect x="22" y={wy} width="28" height="48" fill={vacant ? "#65736d" : "#17322b"} />
                <rect x="62" y={wy} width="28" height="48" fill={vacant ? "#65736d" : "#17322b"} />
                {!vacant && <line x1="36" y1={wy} x2="36" y2={wy + 48} stroke="#f8faf8" strokeWidth="2" />}
                {!vacant && <line x1="76" y1={wy} x2="76" y2={wy + 48} stroke="#f8faf8" strokeWidth="2" />}
              </g>
            ))}
            <path d="M30 310 V226 a26 26 0 0 1 52 0 V310 Z" fill="#f8faf8" />
            <path d="M36 310 V226 a20 20 0 0 1 40 0 V310 Z" fill={c} />
            <path d="M40 226 a16 16 0 0 1 32 0 Z" fill="#fff" opacity="0.6" />
            {vacant && (
              <g>
                <rect x="-6" y="10" width="124" height="230" fill="none" stroke="#c7a86d" strokeWidth="4" strokeDasharray="2 0" />
                {[10, 70, 130, 190].map((sy) => (
                  <line key={sy} x1="-6" y1={sy} x2="118" y2={sy} stroke="#c7a86d" strokeWidth="3" />
                ))}
                {[0, 56, 112].map((sx) => (
                  <line key={sx} x1={sx} y1="10" x2={sx} y2="240" stroke="#c7a86d" strokeWidth="3" />
                ))}
              </g>
            )}
          </g>
        );
      })}
      <g transform="translate(24 24)">
        <rect width="196" height="64" rx="16" fill="#ffffff" />
        <text x="16" y="26" fontFamily="var(--font-manrope), sans-serif" fontSize="11" fontWeight="600" fill="#65736d" letterSpacing="1">ILLUSTRATIVE PROJECT</text>
        <text x="16" y="48" fontFamily="var(--font-manrope), sans-serif" fontSize="16" fontWeight="700" fill="#063f36">Vacant → refurbished</text>
      </g>
    </svg>
  );
}
