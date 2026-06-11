"use client";


import { Filter, MapPin, Briefcase, RefreshCcw, Landmark } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

const REGIONS = ["Centro", "Lima Metropolitana", "Norte", "Oriente", "Sur"];
const SEGMENTS = ["EMPRESARIAL", "PREMIER", "PYME", "RETAIL"];
const PRODUCTS = [
  "CUENTA_AHORRO",
  "CUENTA_CORRIENTE",
  "CREDITO_PERSONAL",
  "TARJETA_CREDITO",
  "HIPOTECARIO",
  "CREDITO_AUTO",
  "CREDITO_PYME",
  "INVERSION",
  "SEGURO",
  "TARJETA_DEBITO"
];

export function CarteraFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [region, setRegion] = useState("");
  const [segmento, setSegmento] = useState("");
  const [producto, setProducto] = useState("");

  // Sincronizar estado local con la URL
  useEffect(() => {
    setRegion(searchParams.get("region") || "");
    setSegmento(searchParams.get("segmento") || "");
    setProducto(searchParams.get("producto") || "");
  }, [searchParams]);

  const applyFilters = () => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    
    if (region) current.set("region", region);
    else current.delete("region");

    if (segmento) current.set("segmento", segmento);
    else current.delete("segmento");

    if (producto) current.set("producto", producto);
    else current.delete("producto");

    const search = current.toString();
    const query = search ? `?${search}` : "";

    router.push(`/cartera${query}`);
  };

  const clearFilters = () => {
    router.push(`/cartera`);
  };

  return (
    <div className="space-y-6 lg:sticky lg:top-6">
      <div className="pb-4 border-b border-border/50 flex items-center gap-2">
        <Filter className="h-4 w-4 text-zinc-500" />
        <h3 className="text-zinc-850 dark:text-zinc-100 text-sm font-bold uppercase tracking-wider">
          Filtros de Cartera
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
          {REGIONS.map((r) => (
            <option key={r} value={r} className="bg-white dark:bg-zinc-900 text-black dark:text-white">
              {r}
            </option>
          ))}
        </select>
      </div>

      {/* Filtro de Segmento */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <Briefcase className="h-3 w-3" />
          Segmento
        </label>
        <select 
          value={segmento}
          onChange={(e) => setSegmento(e.target.value)}
          className="w-full h-9 rounded-md border border-input bg-white/50 dark:bg-zinc-900/50 px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 text-zinc-850 dark:text-zinc-150"
        >
          <option value="" className="bg-white dark:bg-zinc-900 text-black dark:text-white">Todos los segmentos</option>
          {SEGMENTS.map((s) => {
            const segmentLabels: Record<string, string> = {
              RETAIL: "Retail / Personas",
              PYME: "Pyme",
              EMPRESARIAL: "Empresarial",
              PREMIER: "Premier",
            };
            return (
              <option key={s} value={s} className="bg-white dark:bg-zinc-900 text-black dark:text-white">
                {segmentLabels[s.toUpperCase()] || s}
              </option>
            );
          })}
        </select>
      </div>

      {/* Filtro de Tipo de Producto */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <Landmark className="h-3 w-3" />
          Tipo de Producto
        </label>
        <select 
          value={producto}
          onChange={(e) => setProducto(e.target.value)}
          className="w-full h-9 rounded-md border border-input bg-white/50 dark:bg-zinc-900/50 px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 text-zinc-850 dark:text-zinc-150"
        >
          <option value="" className="bg-white dark:bg-zinc-900 text-black dark:text-white">Todos los productos</option>
          {PRODUCTS.map((p) => {
            const productLabels: Record<string, string> = {
              CREDITO_PERSONAL: "Crédito Personal",
              TARJETA_CREDITO: "Tarjeta de Crédito",
              HIPOTECARIO: "Hipotecario",
              CREDITO_AUTO: "Crédito Auto",
              CREDITO_PYME: "Crédito PYME",
              CUENTA_AHORRO: "Cuenta de Ahorros",
              CUENTA_CORRIENTE: "Cuenta Corriente",
              INVERSION: "Inversión",
              SEGURO: "Seguro",
              TARJETA_DEBITO: "Tarjeta de Débito",
              OTROS: "Otros",
            };
            return (
              <option key={p} value={p} className="bg-white dark:bg-zinc-900 text-black dark:text-white">
                {productLabels[p.toUpperCase()] || p.replace(/_/g, " ")}
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
        {(region || segmento || producto || searchParams.has('producto')) && (
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
