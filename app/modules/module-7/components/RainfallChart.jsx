"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";

export default function RainfallChart({ aceh, sumut, sumbar }) {
  // gabungkan 3 series berdasarkan tanggal
  const dateSet = new Set([
    ...aceh.map((d) => d.Tanggal),
    ...sumut.map((d) => d.Tanggal),
    ...sumbar.map((d) => d.Tanggal),
  ]);

  const byDate = (rows) => new Map(rows.map((r) => [r.Tanggal, r.Curah_Hujan_mm]));
  const acehMap = byDate(aceh);
  const sumutMap = byDate(sumut);
  const sumbarMap = byDate(sumbar);

  const merged = Array.from(dateSet)
    .sort()
    .map((tanggal) => ({
      tanggal: tanggal?.slice(5), // MM-DD saja biar ringkas
      Aceh: acehMap.get(tanggal) ?? null,
      "Sumatera Utara": sumutMap.get(tanggal) ?? null,
      "Sumatera Barat": sumbarMap.get(tanggal) ?? null,
    }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={merged} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="tanggal" tick={{ fontSize: 12 }} interval={4} />
        <YAxis tick={{ fontSize: 12 }} label={{ value: "mm", angle: -90, position: "insideLeft" }} />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="Aceh" stroke="#f2810b" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="Sumatera Utara" stroke="#3b82f6" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="Sumatera Barat" stroke="#16a34a" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}