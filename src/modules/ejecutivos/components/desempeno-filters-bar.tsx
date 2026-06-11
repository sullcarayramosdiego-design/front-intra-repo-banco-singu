"use client";

import { useState, useEffect } from "react";
import { DesempenioCatalogos, DesempenioFilters } from "../types";
import { Filter, MapPin, Map, Share2, Award, RotateCcw, User } from "lucide-react";

interface Props {
  catalogos: DesempenioCatalogos;
  filters: DesempenioFilters;
  onChange: (f: DesempenioFilters) => void;
}

const TOP_OPTIONS = ["10", "15", "20", "30"];

export function DesempenoFiltersBar({ catalogos, filters, onChange }: Props) {
  const [localFilters, setLocalFilters] = useState<DesempenioFilters>(filters);

  // Sync local state when parent filters change (e.g. initial load or reset)
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const setLocal = (key: keyof DesempenioFilters, value: string) => {
    setLocalFilters((prev) => ({ ...prev, [key]: value || undefined }));
  };

  const handleApply = () => {
    onChange(localFilters);
  };

  const reset = () => {
    setLocalFilters({});
    onChange({});
  };

  const hasFiltersApplied = Object.values(filters).some(Boolean);

  return (
    <div className="space-y-6 lg:sticky lg:top-6">
      <div className="pb-4 border-b border-border/50 flex items-center gap-2">
        <Filter className="h-4 w-4 text-zinc-500" />
        <h3 className="text-zinc-850 dark:text-zinc-100 text-sm font-bold uppercase tracking-wider">
          Filtros de Desempeño
        </h3>
      </div>

      {/* Zona */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <Map className="h-3 w-3 text-zinc-550" />
          Zona
        </label>
        <select
          value={localFilters.zona ?? ""}
          onChange={(e) => setLocal("zona", e.target.value)}
          className="w-full h-9 rounded-md border border-input bg-white/50 dark:bg-zinc-900/50 px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 text-zinc-850 dark:text-zinc-150"
        >
          <option value="" className="bg-white dark:bg-zinc-900 text-black dark:text-white">Todas las zonas</option>
          {catalogos.zonas.map((z) => (
            <option key={z} value={z} className="bg-white dark:bg-zinc-900 text-black dark:text-white">
              {z}
            </option>
          ))}
        </select>
      </div>

      {/* Región */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <MapPin className="h-3 w-3 text-zinc-550" />
          Región
        </label>
        <select
          value={localFilters.region ?? ""}
          onChange={(e) => setLocal("region", e.target.value)}
          className="w-full h-9 rounded-md border border-input bg-white/50 dark:bg-zinc-900/50 px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 text-zinc-850 dark:text-zinc-150"
        >
          <option value="" className="bg-white dark:bg-zinc-900 text-black dark:text-white">Todas las regiones</option>
          {catalogos.regiones.map((r) => (
            <option key={r} value={r} className="bg-white dark:bg-zinc-900 text-black dark:text-white">
              {r}
            </option>
          ))}
        </select>
      </div>

      {/* Ejecutivo */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <User className="h-3 w-3 text-zinc-550" />
          Ejecutivo
        </label>
        <select
          value={localFilters.ejecutivo_id ?? ""}
          onChange={(e) => setLocal("ejecutivo_id", e.target.value)}
          className="w-full h-9 rounded-md border border-input bg-white/50 dark:bg-zinc-900/50 px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 text-zinc-850 dark:text-zinc-150"
        >
          <option value="" className="bg-white dark:bg-zinc-900 text-black dark:text-white">Todos los ejecutivos</option>
          {catalogos.ejecutivos?.map((e) => (
            <option key={e.id} value={String(e.id)} className="bg-white dark:bg-zinc-900 text-black dark:text-white">
              {e.nombre}
            </option>
          ))}
        </select>
      </div>

      {/* Canal */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <Share2 className="h-3 w-3 text-zinc-550" />
          Canal
        </label>
        <select
          value={localFilters.canal ?? ""}
          onChange={(e) => setLocal("canal", e.target.value)}
          className="w-full h-9 rounded-md border border-input bg-white/50 dark:bg-zinc-900/50 px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 text-zinc-850 dark:text-zinc-150"
        >
          <option value="" className="bg-white dark:bg-zinc-900 text-black dark:text-white">Todos los canales</option>
          {catalogos.canales.map((c) => (
            <option key={c} value={c} className="bg-white dark:bg-zinc-900 text-black dark:text-white">
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Top N */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <Award className="h-3 w-3 text-zinc-550" />
          Mostrar Ejecutivos
        </label>
        <select
          value={localFilters.top ?? "20"}
          onChange={(e) => setLocal("top", e.target.value)}
          className="w-full h-9 rounded-md border border-input bg-white/50 dark:bg-zinc-900/50 px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 text-zinc-850 dark:text-zinc-150"
        >
          {TOP_OPTIONS.map((t) => (
            <option key={t} value={t} className="bg-white dark:bg-zinc-900 text-black dark:text-white">
              Top {t}
            </option>
          ))}
        </select>
      </div>

      <div className="pt-4 space-y-2">
        <button
          onClick={handleApply}
          className="w-full bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 h-9 px-3 py-2 rounded-md text-sm font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
        >
          <Filter className="h-4 w-4" />
          Aplicar Filtros
        </button>

        {hasFiltersApplied && (
          <button
            onClick={reset}
            className="w-full bg-zinc-200 dark:bg-zinc-800 text-zinc-650 dark:text-zinc-350 hover:bg-zinc-300 dark:hover:bg-zinc-700 h-9 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="h-4 w-4" />
            Limpiar Filtros
          </button>
        )}
      </div>
    </div>
  );
}
