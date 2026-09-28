import { C } from "../data/constants";

export default function DonutChart({ data }) {
  const r = 52;
  const cx = 70;
  const cy = 70;
  const circ = 2 * Math.PI * r;
  let acc = 0;

  return (
    <svg viewBox="0 0 140 140" className="w-full" style={{ maxHeight: "140px" }}>
      {/* Definisi animasi draw-in khusus untuk SVG ini */}
      <style>
        {`
          @keyframes drawIn {
            from { stroke-dashoffset: ${circ}; }
          }
          .anim-draw {
            animation: drawIn 1.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
        `}
      </style>
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
            style={{ strokeDashoffset: offset }}
            strokeLinecap="round"
            className="anim-draw"
          />
        );
      })}
    </svg>
  );
}
