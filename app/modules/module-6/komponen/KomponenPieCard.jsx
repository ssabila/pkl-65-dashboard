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
 
  // Custom HTML Tooltip handler: renders as an HTML element outside canvas to prevent any clipping
  const customTooltipHandler = (context) => {
    const { chart, tooltip } = context;
    const parent = chart.canvas.parentNode;
    if (!parent) return;

    let tooltipEl = parent.querySelector(".m6-pie-html-tooltip");

    if (!tooltipEl) {
      tooltipEl = document.createElement("div");
      tooltipEl.className = "m6-pie-html-tooltip";
      parent.appendChild(tooltipEl);
    }

    // Hide if inactive
    if (tooltip.opacity === 0) {
      tooltipEl.style.opacity = "0";
      tooltipEl.style.visibility = "hidden";
      return;
    }

    // Populate content
    if (tooltip.dataPoints && tooltip.dataPoints.length > 0) {
      const point = tooltip.dataPoints[0];
      const label = point.label;
      const rawVal = Number(point.raw) || 0;
      const total = point.dataset.data.reduce(
        (sum, val) => sum + (Number(val) || 0),
        0
      );
      const pct = total > 0 ? ((rawVal / total) * 100).toFixed(1) : "0.0";
      const color =
        Array.isArray(point.dataset.backgroundColor)
          ? point.dataset.backgroundColor[point.dataIndex]
          : point.dataset.backgroundColor;

      tooltipEl.innerHTML = `
        <div class="m6-pie-tooltip-title">${label}</div>
        <div class="m6-pie-tooltip-body">
          <span class="m6-pie-tooltip-dot" style="background-color: ${color}"></span>
          <span>Skor: <b>${rawVal.toFixed(2)}</b> <span style="opacity: 0.85">(${pct}%)</span></span>
        </div>
      `;
    }

    // Dynamic positioning based on hover coordinates
    const posX = tooltip.caretX;
    const posY = tooltip.caretY;

    tooltipEl.style.opacity = "1";
    tooltipEl.style.visibility = "visible";
    tooltipEl.style.left = `${posX}px`;
    tooltipEl.style.top = `${posY}px`;

    let translateX = "-50%";
    let translateY = "-100%";
    let offsetY = -8;

    if (posX < 45) {
      translateX = "-10%";
    } else if (posX > 155) {
      translateX = "-90%";
    }

    if (posY < 40) {
      translateY = "0%";
      offsetY = 10;
    }

    tooltipEl.style.transform = `translate(${translateX}, ${translateY}) translateY(${offsetY}px)`;
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: false,
        external: customTooltipHandler,
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
