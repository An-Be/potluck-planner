// Thanksgiving header art: falling leaves in rust and gold.
// Fixed positions and angles (no randomness), so server and client match.
const leaves = [
  { x: 22, y: 18, a: -30, s: 1 },
  { x: 64, y: 34, a: 40, s: 0.8 },
  { x: 104, y: 16, a: 110, s: 1.1 },
  { x: 146, y: 36, a: -70, s: 0.85 },
  { x: 188, y: 18, a: 15, s: 1 },
  { x: 230, y: 34, a: 150, s: 0.9 },
  { x: 272, y: 16, a: -45, s: 1.1 },
  { x: 312, y: 36, a: 75, s: 0.8 },
  { x: 346, y: 20, a: -110, s: 0.95 },
];

export function Leaves() {
  return (
    <svg viewBox="0 0 360 52" className="block h-auto w-full max-w-2xl self-center px-4" aria-hidden="true">
      {leaves.map((l, i) => (
        <g key={l.x} transform={`translate(${l.x} ${l.y}) rotate(${l.a}) scale(${l.s})`}>
          <path d="M0 -9 C7 -5 7 4 0 9 C-7 4 -7 -5 0 -9 Z" className={i % 2 === 0 ? "fill-(--theme-accent)" : "fill-(--theme-art)"} />
          <line x1="0" y1="-7" x2="0" y2="12" strokeWidth="1" strokeLinecap="round" className="stroke-(--theme-tint)" />
        </g>
      ))}
    </svg>
  );
}
