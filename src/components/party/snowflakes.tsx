// Winter Wonderland header art: a scatter of six-armed snowflakes.
// Positions are fixed (no randomness), so server and client render the same.
const flakes = [
  { x: 24, y: 16, r: 7 },
  { x: 70, y: 34, r: 4 },
  { x: 112, y: 14, r: 9 },
  { x: 160, y: 36, r: 5 },
  { x: 205, y: 18, r: 7 },
  { x: 250, y: 38, r: 4 },
  { x: 292, y: 16, r: 8 },
  { x: 336, y: 34, r: 5 },
];

const arms = [0, 60, 120];

export function Snowflakes() {
  return (
    <svg viewBox="0 0 360 52" className="block h-auto w-full max-w-2xl self-center px-4" aria-hidden="true">
      {flakes.map((f, i) => (
        <g key={f.x} transform={`translate(${f.x} ${f.y})`} strokeWidth="1.5" strokeLinecap="round" className={i % 3 === 0 ? "stroke-(--theme-accent)" : "stroke-(--theme-art)"}>
          {arms.map((a) => (
            <line key={a} x1={0} y1={-f.r} x2={0} y2={f.r} transform={`rotate(${a})`} />
          ))}
        </g>
      ))}
    </svg>
  );
}
