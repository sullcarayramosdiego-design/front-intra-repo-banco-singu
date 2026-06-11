"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend, PieChart, Pie, LabelList } from "recharts";
import { ClienteComposicionItem } from "../types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Users, Building, Briefcase } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

interface ClientesCompositionProps {
  data: ClienteComposicionItem[];
}

export function ClientesComposition({ data }: ClientesCompositionProps) {
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

  // 1. Agrupar por Tipo de Persona (Natural vs Jurídica)
  const totalClientes = data.reduce((acc, curr) => acc + curr.cantidad_clientes, 0);
  
  const personaMap = data.reduce((acc, curr) => {
    const key = curr.tipo_persona?.toUpperCase() || "OTROS";
    acc[key] = (acc[key] || 0) + curr.cantidad_clientes;
    return acc;
  }, {} as Record<string, number>);

  const naturalCount = (personaMap["NATURAL"] || 0) + (personaMap["FISICA"] || 0) + (personaMap["FÍSICA"] || 0);
  const juridicaCount = (personaMap["JURIDICA"] || 0) + (personaMap["JURÍDICA"] || 0) + (personaMap["MORAL"] || 0);

  const naturalPercentage = totalClientes > 0 ? ((naturalCount / totalClientes) * 100).toFixed(1) : "0";
  const juridicaPercentage = totalClientes > 0 ? ((juridicaCount / totalClientes) * 100).toFixed(1) : "0";

  // 2. Agrupar por Segmento comercial para el gráfico de barras
  const segmentMap = data.reduce((acc, curr) => {
    const key = curr.segmento || "SIN SEGMENTO";
    acc[key] = (acc[key] || 0) + curr.cantidad_clientes;
    return acc;
  }, {} as Record<string, number>);

  const barData = Object.entries(segmentMap).map(([name, value]) => ({
    name,
    cantidad: value,
  })).sort((a, b) => b.cantidad - a.cantidad);

  const COLORS = [
    "var(--chart-1)",
    "var(--chart-2)",
    "var(--chart-3)",
    "var(--chart-4)",
    "var(--chart-5)",
    "var(--chart-1)",
  ];

  const activeSegmento = searchParams.get('segmento');

  const pieDataClientes = [
    { name: "Persona Natural", value: naturalCount, percentage: naturalPercentage, fill: "var(--chart-1)" },
    { name: "Persona Jurídica", value: juridicaCount, percentage: juridicaPercentage, fill: "var(--chart-2)" },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Gráfico 1: Tipo de Personería */}
      <Card className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md border-zinc-150 dark:border-zinc-800 md:col-span-1">
        <CardHeader className="pb-2">
          <CardTitle className="text-zinc-850 dark:text-zinc-100 flex items-center gap-2 text-base font-bold">
            <Users className="h-4 w-4 text-zinc-500" />
            Distribución por Tipo de Persona
          </CardTitle>
          <CardDescription>Proporción de clientes registrados por personería</CardDescription>
        </CardHeader>
        <CardContent className="h-[180px] flex items-center justify-between">
          <div className="h-full w-[50%]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieDataClientes}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={60}
                  paddingAngle={3}
                  dataKey="value"
                  label={(entry: any) => `${(Number(entry.percent) * 100).toFixed(1)}%`}
                >
                  {pieDataClientes.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any) => [value.toLocaleString("es-PE"), "Clientes"]}
                  contentStyle={{
                    backgroundColor: "var(--popover)",
                    borderColor: "var(--border)",
                    borderRadius: "var(--radius)",
                    fontSize: "11px",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                  }}
                  labelStyle={{ color: "var(--foreground)", fontWeight: "bold" }}
                  itemStyle={{ color: "var(--foreground)" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          {/* Leyenda Detallada */}
          <div className="flex flex-col gap-3 w-[50%] text-xs justify-center pl-4 border-l border-zinc-100 dark:border-zinc-800/60">
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 font-semibold text-zinc-800 dark:text-zinc-200">
                <span className="h-2 w-2 rounded-full bg-primary" />
                Personas Naturales
              </div>
              <div className="text-zinc-500 font-mono text-[11px] pl-3.5 mt-0.5">
                {naturalCount.toLocaleString("es-PE")} ({naturalPercentage}%)
              </div>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 font-semibold text-zinc-800 dark:text-zinc-200">
                <span className="h-2 w-2 rounded-full bg-secondary" />
                Personas Jurídicas
              </div>
              <div className="text-zinc-500 font-mono text-[11px] pl-3.5 mt-0.5">
                {juridicaCount.toLocaleString("es-PE")} ({juridicaPercentage}%)
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gráfico de Segmentación Comercial */}
      <Card className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md border-zinc-150 dark:border-zinc-800 md:col-span-1">
        <CardHeader className="pb-2">
          <CardTitle className="text-zinc-850 dark:text-zinc-100 flex items-center gap-2 text-base font-bold">
            <Briefcase className="h-4 w-4 text-zinc-500" />
            Segmentación de Clientes
          </CardTitle>
          <CardDescription>Clientes por segmento comercial</CardDescription>
        </CardHeader>
        <CardContent className="h-[180px]">
          {barData.length === 0 ? (
            <div className="flex h-full items-center justify-center text-zinc-500">No hay datos</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <BarChart data={barData} layout="vertical" margin={{ top: 5, right: 35, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 10 }} />
                <Tooltip
                  formatter={(value: any) => [value.toLocaleString("es-PE"), "Clientes"]}
                  contentStyle={{
                    backgroundColor: "var(--popover)",
                    borderColor: "var(--border)",
                    borderRadius: "var(--radius)",
                    fontSize: "11px",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                  }}
                  labelStyle={{ color: "var(--foreground)", fontWeight: "bold" }}
                  itemStyle={{ color: "var(--foreground)" }}
                />
                <Bar 
                  dataKey="cantidad" 
                  radius={[0, 4, 4, 0]}
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={(data) => {
                    if (data && data.name) handleFilter('segmento', data.name);
                  }}
                >
                  <LabelList 
                    dataKey="cantidad" 
                    position="right" 
                    formatter={(val: any) => Number(val).toLocaleString("es-PE")}
                    style={{ fontSize: '9px', fontWeight: 'semibold', fill: 'var(--foreground)' }}
                    offset={8}
                  />
                  {barData.map((entry, index) => {
                    const isActive = activeSegmento === entry.name;
                    const isFaded = activeSegmento && !isActive;
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
