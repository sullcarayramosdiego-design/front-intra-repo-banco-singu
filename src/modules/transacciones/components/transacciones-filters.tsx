"use client";


import { Filter, Calendar, MonitorSmartphone, RefreshCcw } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

interface TransaccionesFiltersProps {
  periods?: string[];
  channels?: string[];
}

export function TransaccionesFilters({ periods = [], channels = [] }: TransaccionesFiltersProps) {
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
    <div className="space-y-6 lg:sticky lg:top-6">
      <div className="pb-4 border-b border-border/50 flex items-center gap-2">
        <Filter className="h-4 w-4 text-zinc-500" />
        <h3 className="text-zinc-850 dark:text-zinc-100 text-sm font-bold uppercase tracking-wider">
          Filtros de Transacciones
        </h3>
      </div>
      
      {/* Filtro de Periodo */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <Calendar className="h-3 w-3" />
          Periodo
        </label>
        <select 
          value={periodo}
          onChange={(e) => setPeriodo(e.target.value)}
          className="w-full h-9 rounded-md border border-input bg-white/50 dark:bg-zinc-900/50 px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 text-zinc-850 dark:text-zinc-150"
        >
          <option value="" className="bg-white dark:bg-zinc-900 text-black dark:text-white">Todos los periodos</option>
          {periods.map((p) => (
            <option key={p} value={p} className="bg-white dark:bg-zinc-900 text-black dark:text-white">
              {p}
            </option>
          ))}
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
          className="w-full h-9 rounded-md border border-input bg-white/50 dark:bg-zinc-900/50 px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 text-zinc-850 dark:text-zinc-150"
        >
          <option value="" className="bg-white dark:bg-zinc-900 text-black dark:text-white">Todos los canales</option>
          {channels.map((c) => {
            const channelLabels: Record<string, string> = {
              ATM: "Cajero Automático (ATM)",
              SUCURSAL: "Sucursal",
              SUC: "Sucursal (SUC)",
              CALL_CENTER: "Call Center",
              WEB: "Banca Web",
              APP_MOVIL: "App Móvil",
            };
            return (
              <option key={c} value={c} className="bg-white dark:bg-zinc-900 text-black dark:text-white">
                {channelLabels[c.toUpperCase()] || c}
              </option>
            );
          })}
        </select>
      </div>

      <div className="flex gap-2 pt-2">
        <button 
          onClick={applyFilters}
          className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer"
        >
          Aplicar
        </button>
        {(periodo || canal || searchParams.has('tipo')) && (
          <button 
            onClick={clearFilters}
            className="bg-zinc-200 dark:bg-zinc-800 text-zinc-650 dark:text-zinc-350 hover:bg-zinc-300 dark:hover:bg-zinc-700 h-9 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center cursor-pointer"
            title="Limpiar todos los filtros"
          >
            <RefreshCcw className="h-4 w-4" />
          </button>
        )}
      </div>

    </div>
  );
}
