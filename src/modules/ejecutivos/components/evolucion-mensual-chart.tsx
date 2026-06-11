"use client";

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts";
import { TrendingUp } from "lucide-react";
import { DesempenioEvolucion } from "../types";

interface Props {
  data: DesempenioEvolucion[];
}

// Agrupar por periodo, pivot por zona
function pivotData(data: DesempenioEvolucion[]) {
  const zonas = [...new Set(data.map((d) => d.zona))];
  const periodos = [...new Set(data.map((d) => d.periodo))].sort();

  return {
    zonas,
    rows: periodos.map((periodo) => {
      const row: Record<string, number | string> = { periodo };
      zonas.forEach((zona) => {
        const match = data.find((d) => d.periodo === periodo && d.zona === zona);
        row[zona] = match?.cantidad_transacciones ?? 0;
      });
      return row;
    }),
  };
}

const ZONE_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    color?: string;
    dataKey?: string | number;
    value?: number;
  }>;
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-zinc-900/95 border border-zinc-700 rounded-xl p-3 shadow-2xl text-xs space-y-1.5 min-w-[160px]">
      <p className="font-semibold text-white">{label}</p>
      <div className="border-t border-zinc-700 mb-1" />
      {payload.map((p) => (
        <div key={p.dataKey} className="flex justify-between gap-3">
          <span style={{ color: p.color }}>{p.dataKey}</span>
          <span className="font-bold text-white">{Number(p.value).toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
};

export function EvolucionMensualChart({ data }: Props) {
  const { zonas, rows } = pivotData(data);

  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-700/60 bg-white dark:bg-zinc-900/80 p-5 space-y-3">
      <div>
        <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 text-base flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-sky-500" />
          Evolución Mensual por Zona
        </h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
          Tendencia de transacciones mensuales por zona geográfica
        </p>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={rows} margin={{ left: 0, right: 16, top: 4, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.12} />
          <XAxis
            dataKey="periodo"
            tick={{ fontSize: 10, fill: "#9ca3af" }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fill: "#9ca3af" }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => v.toLocaleString()}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            formatter={(value) => (
              <span className="text-xs text-zinc-400">{value}</span>
            )}
          />
          {zonas.map((zona, i) => (
            <Line
              key={zona}
              type="monotone"
              dataKey={zona}
              stroke={ZONE_COLORS[i % ZONE_COLORS.length]}
              strokeWidth={2.5}
              dot={{ r: 3, strokeWidth: 0 }}
              activeDot={{ r: 5 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
