import { C } from "../data/constants";

export default function DonutChart({ data }) {
  const r = 52;
  const cx = 70;
  const cy = 70;
  const circ = 2 * Math.PI * r;
  let acc = 0;

  return (
    <svg viewBox="0 0 140 140" className="w-full" style={{ maxHeight: "140px" }}>
      {data.map((d, i) => {
        const dash = (d.value / 100) * circ;
        const gap = circ - dash;
        const offset = -acc * circ / 100 - circ * 0.25;
        acc += d.value;
        return (
          <circle
            key={i}
            cx={cx} cy={cy} r={r}
            fill="none"
            stroke={d.color}
            strokeWidth="18"
            strokeDasharray={`${dash} ${gap}`}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        );
      })}
      <text x={cx} y={cy - 6} textAnchor="middle" fontSize="20" fontWeight="700" fill={C.navy} fontFamily="sans-serif">
        38%
      </text>
      <text x={cx} y={cy + 12} textAnchor="middle" fontSize="9" fill={C.navy} fontFamily="sans-serif" opacity="0.7">
        Tergenang
      </text>
    </svg>
  );
}
