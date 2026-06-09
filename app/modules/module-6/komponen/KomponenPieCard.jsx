"use client";

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip as ChartTooltip,
  Legend,
} from "chart.js";
import { Pie } from "react-chartjs-2";

ChartJS.register(ArcElement, ChartTooltip, Legend);

// Pie chart color palette matching screenshot
const PIE_COLORS = [
  "#2c3e50", // dark navy
  "#5a6d7e", // steel gray
  "#7f8c8d", // medium gray
  "#e67e22", // orange
  "#f1c40f", // yellow
  "#95a5a6", // light gray
  "#34495e", // dark blue-gray
  "#bdc3c7", // silver
];

/**
 * A card with a pie chart and legend showing sub-component breakdown.
 * Used for Hazard, Exposure, and Vulnerability composition.
 */
export default function KomponenPieCard({ title, mainLabel, components }) {
  const labels = components.map((c) => c.label);
  const values = components.map((c) => c.value);
  const colors = components.map((_, i) => PIE_COLORS[i % PIE_COLORS.length]);

  const chartData = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: colors,
        borderColor: "#fff",
        borderWidth: 2,
        hoverOffset: 8,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "rgba(26, 35, 50, 0.92)",
        titleColor: "#fff",
        bodyColor: "#fff",
        cornerRadius: 8,
        padding: 10,
        callbacks: {
          label: (ctx) => {
            return ` ${ctx.label}: ${(ctx.raw * 100).toFixed(1)}%`;
          },
        },
      },
    },
  };

  return (
    <div className="m6-komp-card-wrapper">
      <div className="m6-komp-card">
        <div className="m6-komp-card-inner">
          <h3 className="m6-komp-card__title">{title}</h3>
          <div className="m6-komp-card__chart">
            <Pie data={chartData} options={options} />
          </div>
          <span className="m6-komp-card__main-label">{mainLabel}</span>
          <ul className="m6-komp-card__legend">
            {components.map((c, i) => (
              <li key={c.key} className="m6-komp-card__legend-item">
                <span
                  className="m6-komp-card__legend-dot"
                  style={{ background: colors[i] }}
                />
                {c.label}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
