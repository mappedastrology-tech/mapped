/** Small circular completion ring showing a percentage. Pure presentational. */
export default function CompletionRing({ pct, accent, size = 56 }: { pct: number; accent: string; size?: number }) {
  const cx = size / 2;
  const r = cx - Math.max(4, size * 0.09);
  const c = 2 * Math.PI * r;
  const stroke = Math.max(3.5, size * 0.08);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true" className="shrink-0">
      <circle cx={cx} cy={cx} r={r} fill="none" stroke="var(--border)" strokeWidth={stroke} />
      <circle cx={cx} cy={cx} r={r} fill="none" stroke={accent} strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={c} strokeDashoffset={c * (1 - Math.min(1, pct / 100))} transform={`rotate(-90 ${cx} ${cx})`} />
      <text x={cx} y={cx + size * 0.07} textAnchor="middle" fontSize={size * 0.24} fontWeight="800" fill="var(--foreground)">{pct}</text>
    </svg>
  );
}
