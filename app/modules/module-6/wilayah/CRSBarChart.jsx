"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip as ChartTooltip,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { getTopCRS } from "../data";

ChartJS.register(CategoryScale, LinearScale, BarElement, ChartTooltip);

/**
 * Horizontal bar chart ranking kabupaten/kota by CRS value.
 * Dynamically updates based on province filter.
 */
export default function CRSBarChart({ data }) {
  const topData = getTopCRS(data, 10);

  const chartData = {
    labels: topData.map((d) =>
      d.WADMKK.replace("Kabupaten ", "Kab. ").replace("Kota ", "Kota ")
    ),
    datasets: [
      {
        label: "Nama Wilayah",
        data: topData.map((d) => d.norm_crs * 100),
        backgroundColor: topData.map((d) => {
          switch (d.status_crs) {
            case "Sangat Tinggi":
              return "rgba(142, 36, 36, 0.75)";
            case "Tinggi":
              return "rgba(107, 158, 207, 0.85)";
            case "Sedang":
              return "rgba(107, 158, 207, 0.65)";
            default:
              return "rgba(107, 158, 207, 0.5)";
          }
        }),
        borderRadius: 4,
        borderSkipped: false,
        barThickness: 18,
        maxBarThickness: 22,
      },
    ],
  };

  const options = {
    indexAxis: "y",
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "rgba(26, 35, 50, 0.92)",
        titleColor: "#fff",
        bodyColor: "#fff",
        cornerRadius: 8,
        padding: 10,
        callbacks: {
          title: (items) => {
            const idx = items[0].dataIndex;
            return topData[idx].WADMKK;
          },
          label: (item) => {
            const idx = item.dataIndex;
            return [
              `CRS: ${item.raw.toFixed(1)}%`,
              `Status: ${topData[idx].status_crs}`,
              `Provinsi: ${topData[idx].WADMPP}`,
            ];
          },
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        max: 100,
        grid: {
          color: "rgba(26, 35, 50, 0.06)",
        },
        ticks: {
          color: "#5a5f6f",
          font: { size: 10 },
          callback: (v) => `${v}%`,
        },
      },
      y: {
        grid: { display: false },
        ticks: {
          color: "#3a4a5c",
          font: { size: 10, weight: "500" },
          padding: 4,
        },
      },
    },
    layout: {
      padding: { right: 6, left: 0 },
    },
  };

  return <Bar data={chartData} options={options} />;
}
