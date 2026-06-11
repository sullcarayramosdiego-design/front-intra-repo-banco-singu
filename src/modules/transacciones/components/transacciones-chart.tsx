"use client";

import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  Cell, 
  Legend, 
  LabelList, 
  PieChart, 
  Pie,
  Tooltip
} from "recharts";
import { ActividadTransaccionalItem } from "../types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/shared/ui/chart";
import { useRouter, useSearchParams } from "next/navigation";
import { TrendingUp, Activity, Smartphone, CreditCard } from "lucide-react";

interface TransaccionesChartProps {
  data: ActividadTransaccionalItem[];
}

const chartConfig = {
  monto: {
    label: "Monto Total",
    color: "var(--chart-1)"
  },
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

  // Ordenar periodos ascendentemente para las tendencias temporales
  const trendData = Object.values(periodMap).sort((a, b) => a.periodo.localeCompare(b.periodo));

  // 1.5. Agrupar por Periodo y Tipo de Movimiento (Composición por tipo de operación)
  const moveTypesSet = new Set<string>();
  const periodMapWithTypes = data.reduce((acc, curr) => {
    const period = curr.periodo || "DESCONOCIDO";
    const type = curr.tipo_movimiento || "OTROS";
    moveTypesSet.add(type);
    
    if (!acc[period]) {
      acc[period] = { periodo: period };
    }
    
    acc[period][type] = (Number(acc[period][type]) || 0) + Number(curr.cantidad_transacciones || 0);
    return acc;
  }, {} as Record<string, Record<string, number | string>>);

  const moveTypes = Array.from(moveTypesSet).sort();
  const compositionChartData = Object.values(periodMapWithTypes).sort((a, b) => String(a.periodo).localeCompare(String(b.periodo)));

  const TYPE_COLORS: Record<string, string> = {
    DEPOSITO: "var(--risk-normal)",       // Verde semántico
    RETIRO: "var(--risk-deficiente)",    // Rojo semántico
    PAGO: "var(--chart-1)",              // Azul Principal
    TRANSFERENCIA: "var(--chart-3)",     // Celeste vibrante
    CARGO: "var(--risk-cpp)",            // Ámbar
    COMISION: "var(--chart-4)",          // Azul pizarra
    OTROS: "var(--chart-5)",             // Gris Plata
  };

  // 2. Agrupar Cantidad por Canal
  const canalMap = data.reduce((acc, curr) => {
    const canal = curr.canal || "OTROS";
    acc[canal] = (acc[canal] || 0) + Number(curr.cantidad_transacciones || 0);
    return acc;
  }, {} as Record<string, number>);

  const totalOperaciones = Object.values(canalMap).reduce((sum, val) => sum + val, 0);

  const canalData = Object.entries(canalMap).map(([name, value]) => ({
    name,
    value,
    percentage: totalOperaciones > 0 ? ((value / totalOperaciones) * 100).toFixed(1) : "0",
  })).sort((a, b) => b.value - a.value);

  // 3. Agrupar Monto por Canal
  const canalMontoMap = data.reduce((acc, curr) => {
    const canal = curr.canal || "OTROS";
    acc[canal] = (acc[canal] || 0) + Number(curr.monto_total || 0);
    return acc;
  }, {} as Record<string, number>);

  const canalMontoData = Object.entries(canalMontoMap).map(([name, value]) => ({
    name,
    monto: value,
  })).sort((a, b) => b.monto - a.monto);

  // Colores para los canales (harmónicos)
  const COLORS = [
    "var(--chart-1)",
    "var(--chart-2)",
    "var(--chart-3)",
    "var(--chart-4)",
    "var(--chart-5)",
    "var(--chart-1)", // fallback
  ];

  const formatCurrency = (value: unknown) => {
    const num = Number(value);
    if (isNaN(num)) return "";
    if (num >= 1_000_000) return `S/ ${(num / 1_000_000).toFixed(1)}M`;
    if (num >= 1_000) return `S/ ${(num / 1_000).toFixed(0)}K`;
    return `S/ ${num}`;
  };

  const formatDetailedCurrency = (value: unknown) => {
    const num = Number(value);
    if (isNaN(num)) return "";
    return new Intl.NumberFormat("es-PE", {
      style: "currency",
      currency: "PEN",
      maximumFractionDigits: 0,
    }).format(num);
  };

  const formatNumber = (value: unknown) => {
    const num = Number(value);
    return isNaN(num) ? "" : num.toLocaleString("es-PE");
  };

  return (
    <div className="space-y-6">
      {/* Fila 1: Tendencias Temporales */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Gráfico 1: Evolución del Monto Transaccionado */}
        <Card className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md border-zinc-150 dark:border-zinc-800 transition-all hover:scale-[1.005]">
          <CardHeader className="pb-2">
            <CardTitle className="text-zinc-850 dark:text-zinc-100 flex items-center gap-2 text-base font-bold">
              <TrendingUp className="h-4 w-4 text-sky-500" />
              Tendencia de Monto Transaccional
            </CardTitle>
            <CardDescription>Evolución del volumen monetario total transaccionado por mes</CardDescription>
          </CardHeader>
          <CardContent className="h-[280px]">
            {trendData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-zinc-500">No hay datos de tendencias</div>
            ) : (
              <ChartContainer config={chartConfig} className="h-full w-full aspect-auto">
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                  <AreaChart 
                    data={trendData} 
                    margin={{ top: 15, right: 10, left: 10, bottom: 0 }}
                    className="cursor-pointer"
                    onClick={(e: unknown) => {
                      const ev = e as { activeLabel?: string };
                      if (ev && ev.activeLabel) {
                        handleFilter('periodo', ev.activeLabel);
                      }
                    }}
                  >
                    <defs>
                      <linearGradient id="colorMonto" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} vertical={false} />
                    <XAxis dataKey="periodo" tick={{ fontSize: 11 }} />
                    <YAxis tickFormatter={formatCurrency} tick={{ fontSize: 11 }} />
                    <ChartTooltip
                      cursor={{ stroke: "var(--chart-1)", strokeWidth: 1 }}
                      content={
                        <ChartTooltipContent 
                          labelClassName="font-bold text-xs font-mono"
                          formatter={(value) => [formatDetailedCurrency(Number(value)), "Monto Total"]}
                        />
                      }
                    />
                    <Area 
                      type="monotone" 
                      dataKey="monto" 
                      stroke="var(--chart-1)" 
                      strokeWidth={2} 
                      fillOpacity={1} 
                      fill="url(#colorMonto)" 
                    >
                      {trendData.map((entry, index) => {
                        const isActive = activePeriodo === entry.periodo;
                        const isFaded = activePeriodo && !isActive;
                        return (
                          <Cell 
                            key={`cell-${index}`} 
                            opacity={isFaded ? 0.35 : 1}
                          />
                        );
                      })}
                    </Area>
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        {/* Gráfico 2: Composición de Operaciones por Tipo */}
        <Card className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md border-zinc-150 dark:border-zinc-800 transition-all hover:scale-[1.005]">
          <CardHeader className="pb-2">
            <CardTitle className="text-zinc-850 dark:text-zinc-100 flex items-center gap-2 text-base font-bold">
              <Activity className="h-4 w-4 text-violet-500" />
              Composición de Operaciones
            </CardTitle>
            <CardDescription>Cantidad de transacciones registradas por tipo de movimiento y mes</CardDescription>
          </CardHeader>
          <CardContent className="h-[280px]">
            {compositionChartData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-zinc-500">No hay datos de operaciones</div>
            ) : (
              <div className="h-full w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={compositionChartData} 
                    margin={{ top: 15, right: 10, left: 10, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} vertical={false} />
                    <XAxis dataKey="periodo" tick={{ fontSize: 11 }} />
                    <YAxis tickFormatter={formatNumber} tick={{ fontSize: 11 }} />
                    <Tooltip
                      formatter={(value: unknown, name: unknown) => [formatNumber(Number(value)), String(name)]}
                      contentStyle={{
                        backgroundColor: "var(--popover)",
                        borderColor: "var(--border)",
                        borderRadius: "var(--radius)",
                        fontSize: "11px",
                        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                      }}
                      labelClassName="font-bold text-xs"
                    />
                    <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                    {moveTypes.map((type, index) => {
                      const isLast = index === moveTypes.length - 1;
                      return (
                        <Bar 
                          key={type} 
                          dataKey={type} 
                          stackId="a" 
                          fill={TYPE_COLORS[type] || COLORS[index % COLORS.length]}
                          radius={isLast ? [4, 4, 0, 0] as [number, number, number, number] : [0, 0, 0, 0] as [number, number, number, number]}
                          className="cursor-pointer hover:opacity-85 transition-opacity"
                          onClick={(entryData: unknown) => {
                            const ed = entryData as { periodo?: string };
                            if (ed && ed.periodo) handleFilter('periodo', ed.periodo);
                          }}
                        >
                          {compositionChartData.map((entry, dataIndex) => {
                            const isActive = activePeriodo === entry.periodo;
                            const isFaded = activePeriodo && !isActive;
                            return (
                              <Cell 
                                key={`cell-${dataIndex}`} 
                                opacity={isFaded ? 0.35 : 1}
                              />
                            );
                          })}
                        </Bar>
                      );
                    })}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Fila 2: Distribución y Montos por Canal */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Gráfico 3: Distribución Porcentual por Canal (Operaciones) */}
        <Card className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md border-zinc-150 dark:border-zinc-800 transition-all hover:scale-[1.005]">
          <CardHeader className="pb-2">
            <CardTitle className="text-zinc-850 dark:text-zinc-100 flex items-center gap-2 text-base font-bold">
              <Smartphone className="h-4 w-4 text-emerald-500" />
              Participación de Canales
            </CardTitle>
            <CardDescription>Proporción del total de operaciones realizadas según canal</CardDescription>
          </CardHeader>
          <CardContent className="h-[280px] flex items-center justify-between">
            {canalData.length === 0 ? (
              <div className="flex h-full w-full items-center justify-center text-zinc-500">No hay datos de participación</div>
            ) : (
              <>
                <div className="h-full w-[45%]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={canalData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={75}
                        paddingAngle={3}
                        dataKey="value"
                        nameKey="name"
                        label={(entry: unknown) => `${(Number((entry as { percent: number }).percent) * 100).toFixed(0)}%`}
                      >
                        {canalData.map((entry, index) => {
                          const isActive = activeCanal === entry.name;
                          const isFaded = activeCanal && !isActive;
                          return (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={COLORS[index % COLORS.length]} 
                              className="cursor-pointer hover:opacity-85 transition-opacity"
                              opacity={isFaded ? 0.3 : 1}
                              onClick={() => handleFilter('canal', entry.name)}
                            />
                          );
                        })}
                      </Pie>
                      <ChartTooltip
                        formatter={(value: unknown) => [formatNumber(Number(value)), "Operaciones"]}
                        contentStyle={{
                          backgroundColor: "var(--popover)",
                          borderColor: "var(--border)",
                          borderRadius: "var(--radius)",
                          fontSize: "11px",
                          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                {/* Leyenda Transacciones por Canal */}
                <div className="flex flex-col gap-2 w-[55%] text-xs justify-center pl-4 border-l border-zinc-100 dark:border-zinc-800/60 max-h-full overflow-y-auto">
                  {canalData.map((entry, index) => {
                    const isActive = activeCanal === entry.name;
                    const isFaded = activeCanal && !isActive;
                    return (
                      <div 
                        key={entry.name} 
                        className={`flex flex-col cursor-pointer hover:opacity-80 transition-all ${isFaded ? 'opacity-40' : ''}`}
                        onClick={() => handleFilter('canal', entry.name)}
                      >
                        <div className="flex items-center gap-1.5 font-semibold text-zinc-800 dark:text-zinc-200">
                          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                          {entry.name}
                        </div>
                        <div className="text-zinc-500 font-mono text-[10px] pl-3.5 mt-0.5">
                          {formatNumber(entry.value)} op. ({entry.percentage}%)
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Gráfico 4: Monto Total Transaccionado por Canal */}
        <Card className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md border-zinc-150 dark:border-zinc-800 transition-all hover:scale-[1.005]">
          <CardHeader className="pb-2">
            <CardTitle className="text-zinc-850 dark:text-zinc-100 flex items-center gap-2 text-base font-bold">
              <CreditCard className="h-4 w-4 text-amber-500" />
              Monto Transaccionado por Canal
            </CardTitle>
            <CardDescription>Volumen monetario total procesado en cada canal de atención</CardDescription>
          </CardHeader>
          <CardContent className="h-[280px]">
            {canalMontoData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-zinc-500">No hay datos monetarios por canal</div>
            ) : (
              <ChartContainer config={chartConfig} className="h-full w-full aspect-auto">
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                  <BarChart 
                    data={canalMontoData} 
                    layout="vertical"
                    margin={{ top: 10, right: 30, left: 10, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} horizontal={false} />
                    <XAxis type="number" tickFormatter={formatCurrency} tick={{ fontSize: 11 }} />
                    <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 10 }} />
                    <ChartTooltip
                      cursor={{ fill: "rgba(0,0,0,0.02)" }}
                      content={
                        <ChartTooltipContent 
                          labelClassName="font-bold text-xs"
                          formatter={(value) => [formatDetailedCurrency(Number(value)), "Monto Canalizado"]}
                        />
                      }
                    />
                    <Bar 
                      dataKey="monto" 
                      radius={[0, 4, 4, 0]}
                      className="cursor-pointer hover:opacity-85 transition-opacity"
                      onClick={(data: unknown) => {
                        const d = data as { name?: string };
                        if (d && d.name) handleFilter('canal', d.name);
                      }}
                    >
                      <LabelList 
                        dataKey="monto" 
                        position="right" 
                        formatter={formatCurrency}
                        style={{ fontSize: '9px', fontWeight: 'semibold', fill: 'var(--foreground)' }}
                        offset={8}
                      />
                      {canalMontoData.map((entry, index) => {
                        const isActive = activeCanal === entry.name;
                        const isFaded = activeCanal && !isActive;
                        return (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={COLORS[index % COLORS.length]} 
                            opacity={isFaded ? 0.35 : 1}
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
    </div>
  );
}
