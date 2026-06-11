"use client";

import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { Share2 } from "lucide-react";
import { DesempenioCanal } from "../types";

interface Props {
  data: DesempenioCanal[];
}

const COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: DesempenioCanal }> }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  return (
    <div className="bg-zinc-900/95 border border-zinc-700 rounded-xl p-3 shadow-2xl text-xs space-y-1.5">
      <p className="font-semibold text-white">{d.canal}</p>
      <div className="flex justify-between gap-4">
        <span className="text-zinc-400">Transacciones</span>
        <span className="text-violet-300 font-bold">{d.cantidad_transacciones.toLocaleString()}</span>
      </div>
      <div className="flex justify-between gap-4">
        <span className="text-zinc-400">Participación</span>
        <span className="text-cyan-300 font-bold">{d.porcentaje}%</span>
      </div>
      <div className="flex justify-between gap-4">
        <span className="text-zinc-400">Monto</span>
        <span className="text-emerald-300 font-bold">S/ {(d.monto_total / 1_000_000).toFixed(2)}M</span>
      </div>
    </div>
  );
};

interface CustomLabelProps {
  cx?: number;
  cy?: number;
  midAngle?: number;
  innerRadius?: number;
  outerRadius?: number;
  percent?: number;
}

const CustomLabel = ({ cx = 0, cy = 0, midAngle = 0, innerRadius = 0, outerRadius = 0, percent = 0 }: CustomLabelProps) => {
  if (percent < 0.05) return null;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.55;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={700}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export function CanalDonutChart({ data }: Props) {
  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-700/60 bg-white dark:bg-zinc-900/80 p-5 space-y-3">
      <div>
        <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 text-base flex items-center gap-2">
          <Share2 className="h-4 w-4 text-emerald-500" />
          Distribución por Canal
        </h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Participación de cada canal en el total de operaciones</p>
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={65}
            outerRadius={105}
            dataKey="cantidad_transacciones"
            nameKey="canal"
            labelLine={false}
            label={<CustomLabel />}
            strokeWidth={2}
            stroke="transparent"
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            formatter={(value) => (
              <span className="text-xs text-zinc-400">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
