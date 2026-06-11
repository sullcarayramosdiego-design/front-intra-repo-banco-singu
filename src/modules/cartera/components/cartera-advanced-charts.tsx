"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell, LabelList } from "recharts";
import { CarteraActivaItem } from "../types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Map } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

interface CarteraAdvancedChartsProps {
  data: CarteraActivaItem[];
}

export function CarteraAdvancedCharts({ data }: CarteraAdvancedChartsProps) {
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
    acc[region][product] = (acc[region][product] || 0) + Math.abs(curr.saldo_total);
    
    return acc;
  }, {} as Record<string, any>);

  const products = Array.from(productsSet);
  const chartData = Object.values(groupedByRegion).map((item: any) => {
    const total = products.reduce((sum, product) => sum + (item[product] || 0), 0);
    return {
      ...item,
      total,
    };
  });

  const formatShortCurrency = (value: any) => {
    const num = Number(value);
    if (isNaN(num)) return "";
    if (num >= 1_000_000) return `S/ ${(num / 1_000_000).toFixed(1)}M`;
    if (num >= 1_000) return `S/ ${(num / 1_000).toFixed(0)}K`;
    return `S/ ${num}`;
  };

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

  const activeRegion = searchParams.get('region');
  const activeProducto = searchParams.get('producto');

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
          <div className="h-[300px] w-full">
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
                  contentStyle={{
                    backgroundColor: "var(--popover)",
                    borderColor: "var(--border)",
                    borderRadius: "var(--radius)",
                    fontSize: "12px",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                  }}
                  labelStyle={{ color: "var(--foreground)", fontWeight: "bold" }}
                  itemStyle={{ color: "var(--foreground)" }}
                />
                <Legend 
                  wrapperStyle={{ fontSize: '12px', paddingTop: '20px', cursor: 'pointer' }}
                  onClick={(e) => {
                    if (e && e.dataKey) {
                      handleFilter('producto', String(e.dataKey));
                    }
                  }}
                />
                
                {products.map((product, index) => {
                  const isLast = index === products.length - 1;
                  const isFadedProduct = activeProducto && activeProducto !== product;
                  return (
                    <Bar 
                      key={product} 
                      dataKey={product} 
                      stackId="a" 
                      fill={COLORS[index % COLORS.length]}
                      radius={index === products.length - 1 ? [4, 4, 0, 0] as [number, number, number, number] : [0, 0, 0, 0] as [number, number, number, number]} 
                      className="cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={(data: any) => {
                        if (data && data.region) {
                          // Al hacer clic filtramos por la región de esa barra
                          handleFilter('region', data.region);
                        }
                      }}
                    >
                      {isLast && (
                        <LabelList 
                          dataKey="total" 
                          position="top" 
                          formatter={formatShortCurrency}
                          style={{ fontSize: '10px', fontWeight: 'semibold', fill: 'var(--foreground)' }}
                          offset={8}
                        />
                      )}
                      {chartData.map((entry, dataIndex) => {
                        const isActiveRegion = activeRegion === entry.region;
                        const isFadedRegion = activeRegion && !isActiveRegion;
                        const opacity = (isFadedProduct || isFadedRegion) ? 0.3 : 1;
                        
                        return (
                          <Cell 
                            key={`cell-${dataIndex}`} 
                            fill={COLORS[index % COLORS.length]} 
                            opacity={opacity}
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
  );
}
