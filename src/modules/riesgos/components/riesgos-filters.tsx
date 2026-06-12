"use client";

import { Filter, MapPin, RefreshCcw } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useTransition } from "react";

interface RiesgosFiltersProps {
  regions?: string[];
}

export function RiesgosFilters({ regions = [] }: RiesgosFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

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

    startTransition(() => {
      router.push(`/riesgos${query}`);
    });
  };

  const clearFilters = () => {
    startTransition(() => {
      router.push(`/riesgos`);
    });
  };

  return (
    <div className="space-y-6 lg:sticky lg:top-6">
      <div className="pb-4 border-b border-border/50 flex items-center gap-2">
        <Filter className="h-4 w-4 text-zinc-500" />
        <h3 className="text-zinc-850 dark:text-zinc-100 text-sm font-bold uppercase tracking-wider">
          Filtros de Riesgo
        </h3>
      </div>

      {/* Filtro de Región */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <MapPin className="h-3 w-3" />
          Región
        </label>
        <select
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          className="w-full h-9 rounded-md border border-input bg-white/50 dark:bg-zinc-900/50 px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 text-zinc-850 dark:text-zinc-150"
        >
          <option value="" className="bg-white dark:bg-zinc-900 text-black dark:text-white">Todas las regiones</option>
          {regions.map((r) => (
            <option key={r} value={r} className="bg-white dark:bg-zinc-900 text-black dark:text-white">
              {r}
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-2 pt-2">
        <button
          onClick={applyFilters}
          className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer"
        >
          Aplicar
        </button>
        {searchParams.has('region') && (
          <button
            onClick={clearFilters}
            className="bg-zinc-200 dark:bg-zinc-800 text-zinc-650 dark:text-zinc-350 hover:bg-zinc-300 dark:hover:bg-zinc-700 h-9 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center cursor-pointer"
            title="Limpiar todos los filtros"
          >
            <RefreshCcw className="h-4 w-4" />
          </button>
        )}
      </div>

      {isPending && (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/30 backdrop-blur-[1.5px]">
          <div className="flex flex-col items-center gap-3 bg-white/95 dark:bg-zinc-900/95 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-2xl">
            <div className="relative w-10 h-10 flex items-center justify-center">
              <div className="absolute inset-0 border-3 border-t-violet-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin" style={{ animationDuration: '0.8s' }} />
              <div className="absolute inset-1 border-3 border-t-transparent border-r-emerald-500 border-b-transparent border-l-transparent rounded-full animate-spin" style={{ animationDuration: '0.6s', animationDirection: 'reverse' }} />
            </div>
            <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Actualizando riesgos...
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
