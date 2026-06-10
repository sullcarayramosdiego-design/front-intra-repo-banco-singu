"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, Legend } from "recharts";
import { ActividadTransaccionalItem } from "../types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";

interface TransaccionesChartProps {
  data: ActividadTransaccionalItem[];
}

const areaChartConfig = {
  monto: {
    label: "Monto Total",
    color: "#6366f1"
  }
} as const satisfies ChartConfig;

const barChartConfig = {
  cantidad: {
    label: "Operaciones",
    color: "#06b6d4"
  }
} as const satisfies ChartConfig;

export function TransaccionesChart({ data }: TransaccionesChartProps) {
  // 1. Agrupar por Periodo (Tendencia Temporal)
  const periodMap = data.reduce((acc, curr) => {
    const period = curr.periodo || "DESCONOCIDO";
    acc[period] = acc[period] || { periodo: period, monto: 0, cantidad: 0 };
    acc[period].monto += Number(curr.monto_total || 0);
    acc[period].cantidad += Number(curr.cantidad_transacciones || 0);
    return acc;
  }, {} as Record<string, { periodo: string; monto: number; cantidad: number }>);

  // Ordenar periodos ascendentemente para la tendencia lineal
  const trendData = Object.values(periodMap).sort((a, b) => a.periodo.localeCompare(b.periodo));

  // 2. Agrupar por Canal (Desglose por Canal de Atención)
  const canalMap = data.reduce((acc, curr) => {
    const canal = curr.canal || "OTROS";
    acc[canal] = (acc[canal] || 0) + Number(curr.cantidad_transacciones || 0);
    return acc;
  }, {} as Record<string, number>);

  const canalData = Object.entries(canalMap).map(([name, value]) => ({
    name,
    cantidad: value,
  })).sort((a, b) => b.cantidad - a.cantidad);

  // Colores para canales
  const COLORS = ["#6366f1", "#06b6d4", "#10b981", "#f59e0b", "#ec4899"];

  const formatCurrency = (value: number) => {
    if (value >= 1_000_000) return `S/ ${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `S/ ${(value / 1_000).toFixed(0)}K`;
    return `S/ ${value}`;
  };

  const formatNumber = (value: number) => {
    return value.toLocaleString();
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Gráfico 1: Evolución del Monto Transaccionado (Tendencia) */}
      <Card className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md border-zinc-150 dark:border-zinc-800">
        <CardHeader>
          <CardTitle className="text-zinc-850 dark:text-zinc-100">Tendencia de Monto Transaccional</CardTitle>
          <CardDescription>Evolución del volumen monetario total transaccionado por mes/trimestre</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          {trendData.length === 0 ? (
            <div className="flex h-full items-center justify-center text-zinc-500">No hay datos de tendencias</div>
          ) : (
            <ChartContainer config={areaChartConfig} className="h-full w-full aspect-auto">
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <AreaChart data={trendData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorMonto" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={areaChartConfig.monto.color} stopOpacity={0.4} />
                      <stop offset="95%" stopColor={areaChartConfig.monto.color} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} vertical={false} />
                  <XAxis dataKey="periodo" tick={{ fontSize: 11 }} />
                  <YAxis tickFormatter={formatCurrency} tick={{ fontSize: 11 }} />
                  <ChartTooltip
                    cursor={{ stroke: areaChartConfig.monto.color, strokeWidth: 1 }}
                    content={
                      <ChartTooltipContent 
                        labelClassName="font-bold text-xs font-mono"
                        formatter={(value) => [formatCurrency(Number(value)), "Monto Total"]}
                      />
                    }
                  />
                  <Area type="monotone" dataKey="monto" stroke={areaChartConfig.monto.color} strokeWidth={2} fillOpacity={1} fill="url(#colorMonto)" />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      {/* Gráfico 2: Cantidad de Transacciones por Canal */}
      <Card className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md border-zinc-150 dark:border-zinc-800">
        <CardHeader>
          <CardTitle className="text-zinc-850 dark:text-zinc-100">Uso de Canales de Atención</CardTitle>
          <CardDescription>Cantidad de operaciones realizadas según canal transaccional</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          {canalData.length === 0 ? (
            <div className="flex h-full items-center justify-center text-zinc-500">No hay datos de canales</div>
          ) : (
            <ChartContainer config={barChartConfig} className="h-full w-full aspect-auto">
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <BarChart data={canalData} margin={{ top: 20, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tickFormatter={formatNumber} tick={{ fontSize: 11 }} />
                  <ChartTooltip
                    cursor={{ fill: "rgba(0,0,0,0.02)" }}
                    content={
                      <ChartTooltipContent 
                        labelClassName="font-bold text-xs"
                        formatter={(value) => [formatNumber(Number(value)), "Transacciones"]}
                      />
                    }
                  />
                  <Bar dataKey="cantidad" radius={[4, 4, 0, 0]}>
                    {canalData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
