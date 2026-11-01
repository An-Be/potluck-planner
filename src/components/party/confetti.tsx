// New Year's Eve header art: tossed confetti in gold and ink.
// Fixed positions and angles (no randomness), so server and client match.
const bits = [
  { x: 18, y: 14, a: 20, k: "rect" },
  { x: 46, y: 34, a: -35, k: "dot" },
  { x: 74, y: 18, a: 60, k: "rect" },
  { x: 102, y: 38, a: 10, k: "rect" },
  { x: 128, y: 12, a: -15, k: "dot" },
  { x: 156, y: 30, a: 45, k: "rect" },
  { x: 184, y: 16, a: -50, k: "rect" },
  { x: 212, y: 36, a: 25, k: "dot" },
  { x: 238, y: 14, a: -20, k: "rect" },
  { x: 266, y: 32, a: 70, k: "rect" },
  { x: 292, y: 18, a: 5, k: "dot" },
  { x: 318, y: 38, a: -40, k: "rect" },
  { x: 344, y: 16, a: 35, k: "rect" },
] as const;

export function Confetti() {
  return (
    <svg viewBox="0 0 360 52" className="block h-auto w-full max-w-2xl self-center px-4" aria-hidden="true">
      {bits.map((b, i) => {
        const fill = i % 3 === 1 ? "fill-ink" : i % 2 === 0 ? "fill-(--theme-accent)" : "fill-(--theme-art)";
        return b.k === "dot" ? (
          <circle key={b.x} cx={b.x} cy={b.y} r="2.5" className={fill} />
        ) : (
          <rect key={b.x} x={b.x - 5} y={b.y - 1.5} width="10" height="3" transform={`rotate(${b.a} ${b.x} ${b.y})`} className={fill} />
        );
      })}
    </svg>
  );
}
