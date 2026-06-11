"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, Cell,
} from "recharts";
import { DesempenioZona } from "../types";

interface Props {
  data: DesempenioZona[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-zinc-900/95 border border-zinc-700 rounded-xl p-3 shadow-2xl text-xs space-y-1.5">
      <p className="font-semibold text-white">{label}</p>
      <div className="border-t border-zinc-700 mb-1" />
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex justify-between gap-3">
          <span style={{ color: p.color }}>{p.name}</span>
          <span className="font-bold text-white">
            {p.dataKey === "monto_total"
              ? `$${(Number(p.value) / 1_000_000).toFixed(1)}M`
              : Number(p.value).toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
};

export function ZonaBarChart({ data }: Props) {
  // Separar zona y región en label
  const chartData = data.map((d) => ({
    ...d,
    label: `${d.zona.replace("Zona ", "")} · ${d.region}`,
    monto_millones: +(d.monto_total / 1_000_000).toFixed(2),
  }));

  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-700/60 bg-white dark:bg-zinc-900/80 p-5 space-y-3">
      <div>
        <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 text-base">
          🗺️ Transacciones por Zona y Región
        </h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Volumen de operaciones y monto gestionado por zona geográfica
        </p>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} margin={{ left: 0, right: 8, top: 4, bottom: 48 }}>
          <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.12} vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 9, fill: "#9ca3af" }}
            tickLine={false}
            axisLine={false}
            angle={-35}
            textAnchor="end"
            interval={0}
          />
          <YAxis
            yAxisId="left"
            tick={{ fontSize: 10, fill: "#9ca3af" }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => v.toLocaleString()}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fontSize: 10, fill: "#9ca3af" }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `$${v}M`}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
          <Legend
            formatter={(value) => (
              <span className="text-xs text-zinc-400">{value}</span>
            )}
          />
          <Bar
            yAxisId="left"
            dataKey="cantidad_transacciones"
            name="Transacciones"
            fill="#8b5cf6"
            radius={[4, 4, 0, 0]}
            maxBarSize={40}
          />
          <Bar
            yAxisId="right"
            dataKey="monto_millones"
            name="Monto (M)"
            fill="#06b6d4"
            radius={[4, 4, 0, 0]}
            maxBarSize={40}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
