"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, LabelList,
} from "recharts";
import { DesempenioEjecutivoItem } from "../types";

interface Props {
  data: DesempenioEjecutivoItem[];
}

const COLORS = [
  "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b",
  "#ef4444", "#6366f1", "#ec4899", "#14b8a6",
  "#f97316", "#a78bfa", "#34d399", "#fb923c",
];

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload as DesempenioEjecutivoItem;
  return (
    <div className="bg-zinc-900/95 border border-zinc-700 rounded-xl p-3 shadow-2xl text-xs space-y-1 min-w-[200px]">
      <p className="font-semibold text-white text-sm truncate max-w-[200px]">{d.nombre_ejecutivo}</p>
      <p className="text-zinc-400">{d.zona} · {d.region}</p>
      <div className="border-t border-zinc-700 my-1" />
      <div className="flex justify-between gap-4">
        <span className="text-zinc-400">Transacciones</span>
        <span className="text-violet-300 font-bold">{d.cantidad_transacciones.toLocaleString()}</span>
      </div>
      <div className="flex justify-between gap-4">
        <span className="text-zinc-400">Monto Total</span>
        <span className="text-cyan-300 font-bold">${(d.monto_total / 1000).toFixed(0)}K</span>
      </div>
      <div className="flex justify-between gap-4">
        <span className="text-zinc-400">Ticket Prom.</span>
        <span className="text-emerald-300 font-bold">${d.ticket_promedio.toFixed(0)}</span>
      </div>
    </div>
  );
};

export function RankingEjecutivosChart({ data }: Props) {
  const top = data.slice(0, 15);
  const chartData = top.map((d) => ({
    ...d,
    nombre_corto: d.nombre_ejecutivo.split(" ").slice(0, 2).join(" "),
  }));

  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-700/60 bg-white dark:bg-zinc-900/80 p-5 space-y-3">
      <div>
        <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 text-base">
          🏆 Top Ejecutivos por Transacciones
        </h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">Top 15 por volumen de operaciones</p>
      </div>

      <ResponsiveContainer width="100%" height={340}>
        <BarChart data={chartData} layout="vertical" margin={{ left: 8, right: 40, top: 4, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.15} horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 10, fill: "#9ca3af" }} tickLine={false} axisLine={false} />
          <YAxis
            type="category"
            dataKey="nombre_corto"
            width={110}
            tick={{ fontSize: 10, fill: "#9ca3af" }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
          <Bar dataKey="cantidad_transacciones" radius={[0, 4, 4, 0]} maxBarSize={18}>
            {chartData.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
            <LabelList
              dataKey="cantidad_transacciones"
              position="right"
              style={{ fontSize: 10, fill: "#9ca3af" }}
              formatter={(v: any) => Number(v).toLocaleString()}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
