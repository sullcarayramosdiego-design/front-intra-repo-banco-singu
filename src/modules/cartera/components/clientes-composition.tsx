"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from "recharts";
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

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {/* Tarjeta de Resumen 1: Personas Naturales */}
      <Card className="bg-gradient-to-br from-card to-primary/5 border-border shadow-sm relative overflow-hidden">
        <div className="absolute right-[-10px] bottom-[-10px] opacity-[0.03] dark:opacity-[0.05]">
          <Users className="h-40 w-40" />
        </div>
        <CardHeader className="pb-2">
          <CardTitle className="text-muted-foreground text-xs font-semibold uppercase tracking-wider flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            Personas Naturales
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold font-mono text-zinc-900 dark:text-zinc-50">
            {naturalCount.toLocaleString("es-PE")}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Representan el <span className="font-semibold text-primary">{naturalPercentage}%</span> del total de clientes.
          </p>
          <div className="w-full bg-muted h-1.5 rounded-full mt-4 overflow-hidden">
            <div
              className="bg-primary h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${naturalPercentage}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Tarjeta de Resumen 2: Personas Jurídicas */}
      <Card className="bg-gradient-to-br from-card to-secondary/5 border-border shadow-sm relative overflow-hidden">
        <div className="absolute right-[-10px] bottom-[-10px] opacity-[0.03] dark:opacity-[0.05]">
          <Building className="h-40 w-40" />
        </div>
        <CardHeader className="pb-2">
          <CardTitle className="text-muted-foreground text-xs font-semibold uppercase tracking-wider flex items-center gap-2">
            <Building className="h-4 w-4 text-secondary" />
            Personas Jurídicas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold font-mono text-zinc-900 dark:text-zinc-50">
            {juridicaCount.toLocaleString("es-PE")}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Representan el <span className="font-semibold text-secondary">{juridicaPercentage}%</span> del total de clientes.
          </p>
          <div className="w-full bg-muted h-1.5 rounded-full mt-4 overflow-hidden">
            <div
              className="bg-secondary h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${juridicaPercentage}%` }}
            />
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
          <CardDescription>Clientes por segmento comercial (Clic para filtrar)</CardDescription>
        </CardHeader>
        <CardContent className="h-[180px]">
          {barData.length === 0 ? (
            <div className="flex h-full items-center justify-center text-zinc-500">No hay datos</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <BarChart data={barData} layout="vertical" margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 10 }} />
                <Tooltip
                  formatter={(value: any) => [value.toLocaleString("es-PE"), "Clientes"]}
                  contentStyle={{ backgroundColor: "rgba(10, 10, 10, 0.85)", borderColor: "#27272a", borderRadius: "8px", color: "#fff", fontSize: "11px" }}
                />
                <Bar 
                  dataKey="cantidad" 
                  radius={[0, 4, 4, 0]}
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={(data) => {
                    if (data && data.name) handleFilter('segmento', data.name);
                  }}
                >
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
