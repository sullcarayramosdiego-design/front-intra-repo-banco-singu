"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { CarteraActivaItem } from "../types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";

interface CarteraChartsProps {
  data: CarteraActivaItem[];
}

const pieChartConfig = {
  CREDITO_PERSONAL: { label: "Crédito Personal", color: "#6366f1" },
  TARJETA_CREDITO: { label: "Tarjeta de Crédito", color: "#3b82f6" },
  HIPOTECARIO: { label: "Hipotecario", color: "#10b981" },
  CREDITO_AUTO: { label: "Crédito Auto", color: "#f59e0b" },
  CREDITO_PYME: { label: "Crédito PYME", color: "#ec4899" },
  CUENTA_AHORRO: { label: "Cuenta Ahorro", color: "#8b5cf6" },
  OTROS: { label: "Otros", color: "#94a3b8" }
} as const satisfies ChartConfig;

const barChartConfig = {
  monto: {
    label: "Saldo Administrado",
    color: "#0284c7"
  }
} as const satisfies ChartConfig;

export function CarteraCharts({ data }: CarteraChartsProps) {
  // 1. Agrupar saldos por Tipo de Producto para el Pie Chart (usando valor absoluto para fines de visualización de saldo positivo)
  const productTypeMap = data.reduce((acc, curr) => {
    const type = curr.tipo_producto || "OTROS";
    acc[type] = (acc[type] || 0) + Math.abs(curr.saldo_total);
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(productTypeMap).map(([name, value]) => ({
    name: name.replace(/_/g, " "),
    value: Math.round(value),
    keyName: name, // para mapear al config
    fill: `var(--color-${name})`
  }));

  // 2. Agrupar saldos por Región para el Bar Chart
  const regionMap = data.reduce((acc, curr) => {
    const region = curr.region || "OTRA";
    acc[region] = (acc[region] || 0) + Math.abs(curr.saldo_total);
    return acc;
  }, {} as Record<string, number>);

  const barData = Object.entries(regionMap).map(([name, value]) => ({
    name,
    monto: Math.round(value),
  })).sort((a, b) => b.monto - a.monto);

  const formatCurrency = (value: number) => {
    if (value >= 1_000_000) return `S/ ${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `S/ ${(value / 1_000).toFixed(0)}K`;
    return `S/ ${value}`;
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Gráfico de Distribución por Tipo de Producto */}
      <Card className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md border-zinc-150 dark:border-zinc-800">
        <CardHeader>
          <CardTitle className="text-zinc-850 dark:text-zinc-100">Composición del Portafolio</CardTitle>
          <CardDescription>Distribución de cartera activa por tipo de producto (saldo absoluto)</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          {pieData.length === 0 ? (
            <div className="flex h-full items-center justify-center text-zinc-500">No hay datos disponibles</div>
          ) : (
            <ChartContainer config={pieChartConfig} className="h-full w-full aspect-auto">
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                    nameKey="name"
                  >
                    {pieData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={pieChartConfig[entry.keyName as keyof typeof pieChartConfig]?.color || "#94a3b8"} 
                      />
                    ))}
                  </Pie>
                  <ChartTooltip
                    cursor={false}
                    content={
                      <ChartTooltipContent 
                        hideLabel 
                        formatter={(value) => formatCurrency(Number(value))}
                      />
                    }
                  />
                  <Legend 
                    layout="horizontal" 
                    verticalAlign="bottom" 
                    align="center" 
                    iconType="circle" 
                    wrapperStyle={{ fontSize: "11px" }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      {/* Gráfico de Distribución por Región */}
      <Card className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md border-zinc-150 dark:border-zinc-800">
        <CardHeader>
          <CardTitle className="text-zinc-850 dark:text-zinc-100">Distribución Geográfica</CardTitle>
          <CardDescription>Monto administrado agrupado por región comercial</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          {barData.length === 0 ? (
            <div className="flex h-full items-center justify-center text-zinc-500">No hay datos disponibles</div>
          ) : (
            <ChartContainer config={barChartConfig} className="h-full w-full aspect-auto">
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <BarChart data={barData} margin={{ top: 20, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tickFormatter={formatCurrency} tick={{ fontSize: 11 }} />
                  <ChartTooltip
                    cursor={{ fill: "rgba(0,0,0,0.03)" }}
                    content={
                      <ChartTooltipContent 
                        labelClassName="font-bold text-xs"
                        formatter={(value) => [formatCurrency(Number(value)), "Saldo Total"]}
                      />
                    }
                  />
                  <Bar dataKey="monto" fill={barChartConfig.monto.color} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
