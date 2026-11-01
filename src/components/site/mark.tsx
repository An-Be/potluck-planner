// Potluck's mark: a lidded pot. Same shapes as src/app/icon.svg, every edge on
// an even coordinate of the 32 grid so it stays crisp at 16px.
// Inline SVG with currentColor so it inherits text color (next/image can't).
export function Mark({ size = 28 }: { size?: number }) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} fill="currentColor" aria-hidden="true">
      <rect x="14" y="6" width="4" height="2" />
      <rect x="6" y="8" width="20" height="4" />
      <rect x="8" y="14" width="16" height="12" />
      <rect x="2" y="16" width="6" height="4" />
      <rect x="24" y="16" width="6" height="4" />
    </svg>
  );
}
