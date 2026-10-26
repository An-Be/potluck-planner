// Holiday Classic header art: a gold garland with hanging ornaments.
// Colors come from the theme's properties (art and accent), so it follows
// light and dark mode with the rest of the theme.
const ornaments = [
  { x: 30, y: 15, r: 6, accent: true },
  { x: 80, y: 26, r: 5, accent: false },
  { x: 130, y: 31, r: 7, accent: true },
  { x: 180, y: 28, r: 5, accent: false },
  { x: 230, y: 31, r: 7, accent: true },
  { x: 280, y: 26, r: 5, accent: false },
  { x: 330, y: 15, r: 6, accent: true },
];

export function Garland() {
  return (
    <svg viewBox="0 0 360 52" className="block h-auto w-full max-w-2xl self-center px-4" aria-hidden="true">
      <path d="M0 6 Q180 46 360 6" fill="none" strokeWidth="1.5" className="stroke-(--theme-art)" />
      {ornaments.map((o) => (
        <g key={o.x}>
          <line x1={o.x} y1={o.y - 4} x2={o.x} y2={o.y + 4} strokeWidth="1.5" className="stroke-(--theme-art)" />
          <rect x={o.x - 2} y={o.y + 3} width="4" height="3" className="fill-(--theme-art)" />
          <circle cx={o.x} cy={o.y + 6 + o.r} r={o.r} className={o.accent ? "fill-(--theme-accent)" : "fill-(--theme-art)"} />
        </g>
      ))}
    </svg>
  );
}
