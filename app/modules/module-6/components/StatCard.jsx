/**
 * Stat summary card used in the Wilayah tab.
 * Displays a label + large value with optional color variant.
 */
export default function StatCard({ label, value, variant }) {
  return (
    <div className={`m6-stat-card ${variant ? `m6-stat-card--${variant}` : ""}`}>
      <div className="m6-stat-card__label">{label}</div>
      <div className="m6-stat-card__value">{value}</div>
    </div>
  );
}
