"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { CarteraActivaItem } from "../types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Map } from "lucide-react";

interface CarteraAdvancedChartsProps {
  data: CarteraActivaItem[];
}

export function CarteraAdvancedCharts({ data }: CarteraAdvancedChartsProps) {
  // Transformar data: agrupar por región y poner el saldo de cada producto como propiedad
  // ej: { region: 'LIMA', 'CREDITO_PERSONAL': 1000, 'TARJETA_CREDITO': 500 }
  
  const regionsSet = new Set<string>();
  const productsSet = new Set<string>();
  
  const groupedByRegion = data.reduce((acc, curr) => {
    const region = curr.region || "SIN REGION";
    const product = curr.tipo_producto || "OTROS";
    
    regionsSet.add(region);
    productsSet.add(product);
    
    if (!acc[region]) {
      acc[region] = { region };
    }
    
    // Sumar saldo_total (podría haber múltiples registros para la misma combinación si la query lo permite)
    acc[region][product] = (acc[region][product] || 0) + curr.saldo_total;
    
    return acc;
  }, {} as Record<string, any>);

  const chartData = Object.values(groupedByRegion);
  const products = Array.from(productsSet);

  const COLORS = [
    "#3b82f6", // blue-500
    "#10b981", // emerald-500
    "#f59e0b", // amber-500
    "#ef4444", // red-500
    "#8b5cf6", // violet-500
    "#06b6d4", // cyan-500
  ];

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("es-PE", {
      style: "currency",
      currency: "PEN",
      maximumFractionDigits: 0,
    }).format(value);

  return (
    <Card className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md border-zinc-150 dark:border-zinc-800">
      <CardHeader>
        <CardTitle className="text-zinc-850 dark:text-zinc-100 flex items-center gap-2 text-base font-bold">
          <Map className="h-4 w-4 text-zinc-500" />
          Saldo de Cartera Activa por Producto y Región
        </CardTitle>
        <CardDescription>
          Distribución del saldo total consolidado
        </CardDescription>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="flex h-[300px] items-center justify-center text-zinc-500">
            No hay datos para mostrar
          </div>
        ) : (
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 40, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="region" tick={{ fontSize: 12 }} />
                <YAxis 
                  tickFormatter={(value) => `S/ ${value / 1000}k`} 
                  tick={{ fontSize: 12 }} 
                />
                <Tooltip 
                  formatter={(value: any, name: any) => [formatCurrency(Number(value)), name]}
                  contentStyle={{ backgroundColor: "rgba(10, 10, 10, 0.85)", borderColor: "#27272a", borderRadius: "8px", color: "#fff" }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
                
                {products.map((product, index) => (
                  <Bar 
                    key={product} 
                    dataKey={product} 
                    stackId="a" 
                    fill={COLORS[index % COLORS.length]} 
                    radius={index === products.length - 1 ? [4, 4, 0, 0] as [number, number, number, number] : [0, 0, 0, 0] as [number, number, number, number]} 
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
