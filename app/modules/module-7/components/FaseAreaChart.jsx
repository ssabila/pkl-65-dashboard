"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

export default function FaseAreaChart({ totalPerFase, activeFase }) {
  const data = ["fase1", "fase2", "fase3", "fase4"].map((f, i) => ({
    fase: `Fase ${i + 1}`,
    luas: totalPerFase[f],
    key: f,
  }));

  return (
    <ResponsiveContainer width="100%" height={110}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
        <XAxis dataKey="fase" tick={{ fontSize: 11 }} />
        <YAxis hide />
        <Tooltip formatter={(v) => `${v} km²`} />
        <Bar dataKey="luas" radius={[4, 4, 0, 0]}>
          {data.map((d) => (
            <Cell key={d.key} fill={d.key === activeFase ? "#1d4ed8" : "#93c5fd"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}