"use client";

import { DesempenioCatalogos, DesempenioFilters } from "../types";
import { Filter, RotateCcw } from "lucide-react";

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
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-zinc-200 dark:border-zinc-700/60 bg-white dark:bg-zinc-900/80 px-4 py-3">
      <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400 mr-1">
        <Filter className="h-3.5 w-3.5" />
        <span className="text-xs font-medium">Filtros</span>
      </div>

      {/* Zona */}
      <select
        value={filters.zona ?? ""}
        onChange={(e) => set("zona", e.target.value)}
        className="text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-2.5 py-1.5 text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
      >
        <option value="">Todas las zonas</option>
        {catalogos.zonas.map((z) => (
          <option key={z} value={z}>{z}</option>
        ))}
      </select>

      {/* Región */}
      <select
        value={filters.region ?? ""}
        onChange={(e) => set("region", e.target.value)}
        className="text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-2.5 py-1.5 text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
      >
        <option value="">Todas las regiones</option>
        {catalogos.regiones.map((r) => (
          <option key={r} value={r}>{r}</option>
        ))}
      </select>

      {/* Canal */}
      <select
        value={filters.canal ?? ""}
        onChange={(e) => set("canal", e.target.value)}
        className="text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-2.5 py-1.5 text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
      >
        <option value="">Todos los canales</option>
        {catalogos.canales.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>

      {/* Top N */}
      <select
        value={filters.top ?? "20"}
        onChange={(e) => set("top", e.target.value)}
        className="text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-2.5 py-1.5 text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
      >
        {TOP_OPTIONS.map((t) => (
          <option key={t} value={t}>Top {t}</option>
        ))}
      </select>

      {/* Reset */}
      {hasFilters && (
        <button
          onClick={reset}
          className="flex items-center gap-1 text-xs text-rose-500 hover:text-rose-400 transition-colors ml-auto"
        >
          <RotateCcw className="h-3 w-3" />
          Limpiar
        </button>
      )}
    </div>
  );
}
