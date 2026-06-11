"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { CarteraActivaItem } from "../types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/shared/ui/chart";
import { useRouter, useSearchParams } from "next/navigation";

interface CarteraChartsProps {
  data: CarteraActivaItem[];
}

const pieChartConfig = {
  CREDITO_PERSONAL: { label: "Crédito Personal", color: "var(--chart-1)" },
  TARJETA_CREDITO:  { label: "Tarjeta de Crédito", color: "var(--chart-2)" },
  HIPOTECARIO:      { label: "Hipotecario", color: "var(--chart-3)" },
  CREDITO_AUTO:     { label: "Crédito Auto", color: "var(--chart-4)" },
  CREDITO_PYME:     { label: "Crédito PYME", color: "var(--chart-5)" },
  CUENTA_AHORRO:    { label: "Cuenta Ahorro", color: "var(--chart-1)" },
  OTROS:            { label: "Otros", color: "var(--chart-5)" }
} as const satisfies ChartConfig;

const barChartConfig = {
  monto: {
    label: "Saldo Administrado",
    color: "var(--chart-1)"
  }
} as const satisfies ChartConfig;

export function CarteraCharts({ data }: CarteraChartsProps) {
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
    router.push(`/cartera${query}`);
  };

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

  const activeProducto = searchParams.get('producto');
  const activeRegion = searchParams.get('region');

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Gráfico de Distribución por Tipo de Producto */}
      <Card className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md border-zinc-150 dark:border-zinc-800">
        <CardHeader>
          <CardTitle className="text-zinc-850 dark:text-zinc-100">Composición del Portafolio</CardTitle>
          <CardDescription>Distribución de cartera activa por tipo de producto (Clic para filtrar)</CardDescription>
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
                    {pieData.map((entry, index) => {
                      const isActive = activeProducto === entry.keyName;
                      const isFaded = activeProducto && !isActive;
                      return (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={pieChartConfig[entry.keyName as keyof typeof pieChartConfig]?.color || "var(--chart-5)"} 
                          className="cursor-pointer hover:opacity-80 transition-opacity"
                          opacity={isFaded ? 0.3 : 1}
                          onClick={() => handleFilter('producto', entry.keyName)}
                        />
                      );
                    })}
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
                    wrapperStyle={{ fontSize: "11px", cursor: "pointer" }} 
                    onClick={(e: any) => {
                      if(e && e.payload && e.payload.keyName) {
                        handleFilter('producto', e.payload.keyName);
                      }
                    }}
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
          <CardDescription>Monto administrado agrupado por región comercial (Clic para filtrar)</CardDescription>
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
                  <Bar 
                    dataKey="monto" 
                    radius={[4, 4, 0, 0]} 
                    className="cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={(data: any) => {
                      if (data && data.name) handleFilter('region', data.name);
                    }}
                  >
                    {barData.map((entry, index) => {
                      const isActive = activeRegion === entry.name;
                      const isFaded = activeRegion && !isActive;
                      return (
                        <Cell 
                          key={`cell-${index}`} 
                          fill="var(--chart-1)"
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
