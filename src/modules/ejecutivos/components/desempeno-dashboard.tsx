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

  const fetchAll = useCallback(async (f: DesempenioFilters) => {
    try {
      const [ranking, kpis, porZona, evolucion, canales] = await Promise.all([
        EjecutivosService.getDesempenioEjecutivos(f).catch(() => []),
        EjecutivosService.getKpis(f).catch(() => EMPTY_KPIS),
        EjecutivosService.getPorZona(f).catch(() => []),
        EjecutivosService.getEvolucion(f).catch(() => []),
        EjecutivosService.getCanales(f).catch(() => []),
      ]);
      setData((prev) => ({ ...prev, ranking, kpis, porZona, evolucion, canales }));
    } catch {
      // Silently catch api failures
    }
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
      <div className="flex-1 p-4 md:p-6 space-y-6 min-w-0">

        {/* KPIs */}
        <DesempenoKpis kpis={data.kpis} />

        {/* Fila 1: Ranking + Canal */}
        <div id="ranking-desempeno" className="grid grid-cols-1 xl:grid-cols-5 gap-6 scroll-mt-4">
          <div className="xl:col-span-3">
            <RankingEjecutivosChart data={data.ranking} />
          </div>
          <div className="xl:col-span-2">
            <CanalDonutChart data={data.canales} />
          </div>
        </div>

        {/* Fila 2: Evolución + Zona */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <EvolucionMensualChart data={data.evolucion} />
          <ZonaBarChart data={data.porZona} />
        </div>
      </div>
    </div>
  );
}
