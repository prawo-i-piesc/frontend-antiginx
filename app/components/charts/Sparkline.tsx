import { VIZ } from "@/app/components/charts/tokens";

const WIDTH = 72;
const HEIGHT = 20;
const PAD = 3;

/**
 * A row's risk history at a glance, on the same 0–100 scale in every row so
 * rows compare. A picture only: the row prints the figures it summarises.
 */
export default function Sparkline({ values }: { values: readonly number[] }) {
  if (values.length === 0) return null;

  const step = values.length > 1 ? (WIDTH - PAD * 2) / (values.length - 1) : 0;
  const points = values.map((value, index) => {
    const x = values.length > 1 ? PAD + index * step : WIDTH / 2;
    const y = PAD + (1 - Math.min(Math.max(value, 0), 100) / 100) * (HEIGHT - PAD * 2);
    return [x, y] as const;
  });
  const [lastX, lastY] = points[points.length - 1];

  return (
    <svg width={WIDTH} height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`} aria-hidden="true" className="block overflow-visible">
      <line x1={0} x2={WIDTH} y1={HEIGHT - PAD} y2={HEIGHT - PAD} stroke={VIZ.grid} strokeWidth={1} />
      {points.length > 1 ? (
        <polyline
          points={points.map(([x, y]) => `${x},${y}`).join(" ")}
          fill="none"
          stroke={VIZ.accent}
          strokeWidth={1.5}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      ) : null}
      <circle cx={lastX} cy={lastY} r={2.5} fill={VIZ.accent} stroke={VIZ.ring} strokeWidth={1.5} />
    </svg>
  );
}
