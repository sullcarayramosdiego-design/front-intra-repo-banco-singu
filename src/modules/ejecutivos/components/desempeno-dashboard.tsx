"use client";

import { useState, useEffect, useCallback } from "react";
import { EjecutivosService } from "../services/ejecutivos.service";
import {
  DesempenioEjecutivoItem, DesempenioKpis, DesempenioZona,
  DesempenioEvolucion, DesempenioCanal, DesempenioCatalogos,
  DesempenioFilters,
} from "../types";
import { DesempenoKpis } from "./desempeno-kpis";
import { RankingEjecutivosChart } from "./ranking-ejecutivos-chart";
import { CanalDonutChart } from "./canal-donut-chart";
import { EvolucionMensualChart } from "./evolucion-mensual-chart";
import { ZonaBarChart } from "./zona-bar-chart";
import { DesempenoFiltersBar } from "./desempeno-filters-bar";
import { HashScrollHandler } from "@/shared/components/hash-scroll-handler";

interface ServerData {
  ranking: DesempenioEjecutivoItem[];
  kpis: DesempenioKpis;
  porZona: DesempenioZona[];
  evolucion: DesempenioEvolucion[];
  canales: DesempenioCanal[];
  catalogos: DesempenioCatalogos;
}

interface Props {
  initialData: ServerData;
}

const EMPTY_KPIS: DesempenioKpis = {
  total_ejecutivos_activos: 0,
  total_transacciones: 0,
  monto_total_gestionado: 0,
  ticket_promedio: 0,
  tx_por_ejecutivo: 0,
  canales_usados: 0,
};

export function DesempenioDashboard({ initialData }: Props) {
  const [filters, setFilters] = useState<DesempenioFilters>({});
  const [data, setData] = useState<ServerData>(initialData);
  const [isLoading, setIsLoading] = useState(false);

  const fetchAll = useCallback(async (f: DesempenioFilters) => {
    setIsLoading(true);
    try {
      const [ranking, kpis, porZona, evolucion, canales] = await Promise.all([
        EjecutivosService.getDesempenioEjecutivos(f).catch((err) => {
          console.warn("[Dashboard] Error fetching ranking:", err);
          return null;
        }),
        EjecutivosService.getKpis(f).catch((err) => {
          console.warn("[Dashboard] Error fetching kpis:", err);
          return null;
        }),
        EjecutivosService.getPorZona(f).catch((err) => {
          console.warn("[Dashboard] Error fetching porZona:", err);
          return null;
        }),
        EjecutivosService.getEvolucion(f).catch((err) => {
          console.warn("[Dashboard] Error fetching evolucion:", err);
          return null;
        }),
        EjecutivosService.getCanales(f).catch((err) => {
          console.warn("[Dashboard] Error fetching canales:", err);
          return null;
        }),
      ]);

      setData((prev) => ({
        ...prev,
        ranking: ranking !== null ? ranking : prev.ranking,
        kpis: kpis !== null ? kpis : prev.kpis,
        porZona: porZona !== null ? porZona : prev.porZona,
        evolucion: evolucion !== null ? evolucion : prev.evolucion,
        canales: canales !== null ? canales : prev.canales,
      }));
    } catch (error) {
      console.error("[Dashboard] Unexpected error in fetchAll:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);


  const handleSelectFilter = useCallback((key: keyof DesempenioFilters, value: string) => {
    setFilters((prev) => {
      const newFilters = { ...prev };
      if (newFilters[key] === value) {
        delete newFilters[key];
      } else {
        newFilters[key] = value;
      }
      return newFilters;
    });
  }, []);

  const handleSelectZonaRegion = useCallback((zona: string, region: string) => {
    setFilters((prev) => {
      const newFilters = { ...prev };
      if (newFilters.zona === zona && newFilters.region === region) {
        delete newFilters.zona;
        delete newFilters.region;
      } else {
        newFilters.zona = zona;
        newFilters.region = region;
      }
      return newFilters;
    });
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchAll(filters);
  }, [filters, fetchAll]);

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-4rem-2rem)] -m-3 md:-m-4">
      <HashScrollHandler />

      {/* Sidebar de Filtros */}
      <aside className="w-full lg:w-80 border-b lg:border-b-0 lg:border-l border-border/50 bg-zinc-50/30 dark:bg-zinc-900/10 p-6 shrink-0 lg:order-last">
        <DesempenoFiltersBar
          catalogos={data.catalogos}
          filters={filters}
          onChange={setFilters}
        />
      </aside>

      {/* Contenido Principal */}
      <div className="flex-1 p-4 md:p-6 space-y-6 min-w-0 relative">
        {isLoading && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/30 dark:bg-black/40 backdrop-blur-[1.5px] rounded-xl transition-all duration-300">
            <div className="flex flex-col items-center gap-3 bg-white/95 dark:bg-zinc-900/95 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-2xl">
              <div className="relative w-10 h-10 flex items-center justify-center">
                <div className="absolute inset-0 border-3 border-t-violet-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin" style={{ animationDuration: '0.8s' }} />
                <div className="absolute inset-1 border-3 border-t-transparent border-r-emerald-500 border-b-transparent border-l-transparent rounded-full animate-spin" style={{ animationDuration: '0.6s', animationDirection: 'reverse' }} />
              </div>
              <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Actualizando gráficos...
              </span>
            </div>
          </div>
        )}

        {/* KPIs */}
        <DesempenoKpis kpis={data.kpis} />

        {/* Fila 1: Ranking + Canal */}
        <div id="ranking-desempeno" className="grid grid-cols-1 xl:grid-cols-5 gap-6 scroll-mt-4">
          <div className="xl:col-span-3">
            <RankingEjecutivosChart
              data={data.ranking}
              activeEjecutivoId={filters.ejecutivo_id}
              onSelectEjecutivo={(id) => handleSelectFilter("ejecutivo_id", String(id))}
            />
          </div>
          <div className="xl:col-span-2">
            <CanalDonutChart
              data={data.canales}
              activeCanal={filters.canal}
              onSelectCanal={(canal) => handleSelectFilter("canal", canal)}
            />
          </div>
        </div>

        {/* Fila 2: Evolución + Zona */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <EvolucionMensualChart
            data={data.evolucion}
            activeZona={filters.zona}
            onSelectZona={(zona) => handleSelectFilter("zona", zona)}
          />
          <ZonaBarChart
            data={data.porZona}
            activeZona={filters.zona}
            activeRegion={filters.region}
            onSelectZonaRegion={handleSelectZonaRegion}
          />
        </div>
      </div>
    </div>
  );
}
