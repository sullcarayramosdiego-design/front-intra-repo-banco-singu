"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, Legend, LabelList } from "recharts";
import { ActividadTransaccionalItem } from "../types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/shared/ui/chart";
import { useRouter, useSearchParams } from "next/navigation";

interface TransaccionesChartProps {
  data: ActividadTransaccionalItem[];
}

const areaChartConfig = {
  monto: {
    label: "Monto Total",
    color: "var(--chart-1)"
  }
} as const satisfies ChartConfig;

const barChartConfig = {
  cantidad: {
    label: "Operaciones",
    color: "var(--chart-3)"
  }
} as const satisfies ChartConfig;

export function TransaccionesChart({ data }: TransaccionesChartProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleFilter = (key: string, value: string) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    if (current.get(key) === value) {
      current.delete(key);
    } else {
      current.set(key, value);
    }
    const search = current.toString();
    const query = search ? `?${search}` : "";
    router.push(`/transacciones${query}`);
  };

  const activePeriodo = searchParams.get('periodo');
  const activeCanal = searchParams.get('canal');

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
  const COLORS = [
    "var(--chart-1)",
    "var(--chart-2)",
    "var(--chart-3)",
    "var(--chart-4)",
    "var(--chart-5)",
  ];

  const formatCurrency = (value: number) => {
    if (value >= 1_000_000) return `S/ ${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `S/ ${(value / 1_000).toFixed(0)}K`;
    return `S/ ${value}`;
  };

  const formatNumber = (value: any) => {
    const num = Number(value);
    return isNaN(num) ? "" : num.toLocaleString("es-PE");
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
                <AreaChart 
                  data={trendData} 
                  margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
                  className="cursor-pointer"
                  onClick={(e: any) => {
                    if (e && e.activeLabel) {
                      handleFilter('periodo', e.activeLabel);
                    }
                  }}
                >
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
                  <Area 
                    type="monotone" 
                    dataKey="monto" 
                    stroke={areaChartConfig.monto.color} 
                    strokeWidth={2} 
                    fillOpacity={1} 
                    fill="url(#colorMonto)" 
                  />
                  {/* Para AreaChart podemos hacer clic en la gráfica en sí via AreaChart onClick si se quiere, 
                      pero aquí como es continua no es un Bar, se clickea en el dot. 
                      Para simplificar usaremos onClick sobre el AreaChart, recibiendo e.activeLabel */}
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
                  <Bar 
                    dataKey="cantidad" 
                    radius={[4, 4, 0, 0]}
                    className="cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={(data: any) => {
                      if (data && data.name) handleFilter('canal', data.name);
                    }}
                  >
                    <LabelList 
                      dataKey="cantidad" 
                      position="top" 
                      formatter={formatNumber}
                      style={{ fontSize: '10px', fontWeight: 'semibold', fill: 'var(--foreground)' }}
                      offset={8}
                    />
                    {canalData.map((entry, index) => {
                      const isActive = activeCanal === entry.name;
                      const isFaded = activeCanal && !isActive;
                      return (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={COLORS[index % COLORS.length]} 
                          opacity={isFaded ? 0.3 : 1}
                        />
                      );
                    })}
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
