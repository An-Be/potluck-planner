// Cozy Cabin header art: a knit band, two rows of V stitches between rules.
const stitches = Array.from({ length: 30 }, (_, i) => i * 12 + 6);

export function Knit() {
  return (
    <svg viewBox="0 0 360 52" className="block h-auto w-full max-w-2xl self-center px-4" aria-hidden="true">
      <line x1="0" y1="8" x2="360" y2="8" strokeWidth="1.5" className="stroke-(--theme-art)" />
      <line x1="0" y1="44" x2="360" y2="44" strokeWidth="1.5" className="stroke-(--theme-art)" />
      {stitches.map((x, i) => (
        <g key={x} fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d={`M${x - 4} 14 L${x} 22 L${x + 4} 14`} className={i % 4 === 0 ? "stroke-(--theme-accent)" : "stroke-(--theme-art)"} />
          <path d={`M${x - 4} 28 L${x} 36 L${x + 4} 28`} className={i % 4 === 2 ? "stroke-(--theme-accent)" : "stroke-(--theme-art)"} />
        </g>
      ))}
    </svg>
  );
}
