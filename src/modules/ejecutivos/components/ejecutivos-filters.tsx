"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Filter, MapPin, RefreshCcw } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

export function EjecutivosFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [region, setRegion] = useState("");

  // Sincronizar estado local con la URL
  useEffect(() => {
    setRegion(searchParams.get("region") || "");
  }, [searchParams]);

  const applyFilters = () => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    
    if (region) current.set("region", region);
    else current.delete("region");

    const search = current.toString();
    const query = search ? `?${search}` : "";

    router.push(`/ejecutivos${query}`);
  };

  const clearFilters = () => {
    router.push(`/ejecutivos`);
  };

  return (
    <Card className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md border-zinc-150 dark:border-zinc-800 shadow-sm sticky top-24">
      <CardHeader className="pb-4 border-b border-border/50">
        <CardTitle className="text-zinc-850 dark:text-zinc-100 flex items-center gap-2 text-base font-bold">
          <Filter className="h-4 w-4 text-zinc-500" />
          Filtros de Ejecutivos
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 space-y-6">
        
        {/* Filtro de Región */}
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <MapPin className="h-3 w-3" />
            Región
          </label>
          <select 
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">Todas las regiones</option>
            <option value="NORTE">Norte</option>
            <option value="SUR">Sur</option>
            <option value="CENTRO">Centro</option>
            <option value="LIMA">Lima</option>
          </select>
        </div>

        <div className="flex gap-2">
          <button 
            onClick={applyFilters}
            className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2 rounded-md text-sm font-medium transition-colors"
          >
            Aplicar
          </button>
          {searchParams.has('region') && (
            <button 
              onClick={clearFilters}
              className="bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-zinc-700 h-9 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center"
              title="Limpiar todos los filtros"
            >
              <RefreshCcw className="h-4 w-4" />
            </button>
          )}
        </div>

      </CardContent>
    </Card>
  );
}
