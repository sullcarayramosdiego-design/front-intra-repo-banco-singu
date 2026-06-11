"use client";

import { DesempenioCatalogos, DesempenioFilters } from "../types";
import { Filter, MapPin, Map, Share2, Award, RotateCcw } from "lucide-react";

interface Props {
  catalogos: DesempenioCatalogos;
  filters: DesempenioFilters;
  onChange: (f: DesempenioFilters) => void;
}

const TOP_OPTIONS = ["10", "15", "20", "30"];

export function DesempenoFiltersBar({ catalogos, filters, onChange }: Props) {
  const set = (key: keyof DesempenioFilters, value: string) =>
    onChange({ ...filters, [key]: value || undefined });

  const reset = () => onChange({});

  const hasFilters = Object.values(filters).some(Boolean);

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
          value={filters.zona ?? ""}
          onChange={(e) => set("zona", e.target.value)}
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
          value={filters.region ?? ""}
          onChange={(e) => set("region", e.target.value)}
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

      {/* Canal */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <Share2 className="h-3 w-3 text-zinc-550" />
          Canal
        </label>
        <select
          value={filters.canal ?? ""}
          onChange={(e) => set("canal", e.target.value)}
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
          value={filters.top ?? "20"}
          onChange={(e) => set("top", e.target.value)}
          className="w-full h-9 rounded-md border border-input bg-white/50 dark:bg-zinc-900/50 px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 text-zinc-850 dark:text-zinc-150"
        >
          {TOP_OPTIONS.map((t) => (
            <option key={t} value={t} className="bg-white dark:bg-zinc-900 text-black dark:text-white">
              Top {t}
            </option>
          ))}
        </select>
      </div>

      {hasFilters && (
        <div className="pt-2">
          <button
            onClick={reset}
            className="w-full bg-zinc-200 dark:bg-zinc-800 text-zinc-650 dark:text-zinc-350 hover:bg-zinc-300 dark:hover:bg-zinc-700 h-9 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="h-4 w-4" />
            Limpiar Filtros
          </button>
        </div>
      )}
    </div>
  );
}
