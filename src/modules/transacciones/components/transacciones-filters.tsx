"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Filter, Calendar, MonitorSmartphone, RefreshCcw } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

export function TransaccionesFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [periodo, setPeriodo] = useState("");
  const [canal, setCanal] = useState("");

  // Sincronizar estado local con la URL
  useEffect(() => {
    setPeriodo(searchParams.get("periodo") || "");
    setCanal(searchParams.get("canal") || "");
  }, [searchParams]);

  const applyFilters = () => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    
    if (periodo) current.set("periodo", periodo);
    else current.delete("periodo");

    if (canal) current.set("canal", canal);
    else current.delete("canal");

    const search = current.toString();
    const query = search ? `?${search}` : "";

    router.push(`/transacciones${query}`);
  };

  const clearFilters = () => {
    router.push(`/transacciones`);
  };

  return (
    <Card className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md border-zinc-150 dark:border-zinc-800 shadow-sm sticky top-24">
      <CardHeader className="pb-4 border-b border-border/50">
        <CardTitle className="text-zinc-850 dark:text-zinc-100 flex items-center gap-2 text-base font-bold">
          <Filter className="h-4 w-4 text-zinc-500" />
          Filtros de Transacciones
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 space-y-6">
        
        {/* Filtro de Periodo */}
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <Calendar className="h-3 w-3" />
            Periodo
          </label>
          <select 
            value={periodo}
            onChange={(e) => setPeriodo(e.target.value)}
            className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">Todos los periodos</option>
            <option value="2024-Q1">2024-Q1</option>
            <option value="2024-Q2">2024-Q2</option>
            <option value="2024-Q3">2024-Q3</option>
            <option value="2024-Q4">2024-Q4</option>
          </select>
        </div>

        {/* Filtro de Canal */}
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <MonitorSmartphone className="h-3 w-3" />
            Canal
          </label>
          <select 
            value={canal}
            onChange={(e) => setCanal(e.target.value)}
            className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">Todos los canales</option>
            <option value="AGENCIA">Agencia</option>
            <option value="APP">App Móvil</option>
            <option value="WEB">Banca Web</option>
            <option value="CAJERO">Cajero Automático</option>
            <option value="AGENTE">Agente Corresponsal</option>
          </select>
        </div>

        <div className="flex gap-2">
          <button 
            onClick={applyFilters}
            className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2 rounded-md text-sm font-medium transition-colors"
          >
            Aplicar
          </button>
          {(periodo || canal || searchParams.has('tipo')) && (
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
