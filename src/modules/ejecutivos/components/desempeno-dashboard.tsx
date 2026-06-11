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
import { Loader2 } from "lucide-react";

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
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ServerData>(initialData);

  const fetchAll = useCallback(async (f: DesempenioFilters) => {
    setLoading(true);
    try {
      const [ranking, kpis, porZona, evolucion, canales] = await Promise.all([
        EjecutivosService.getDesempenioEjecutivos(f).catch(() => []),
        EjecutivosService.getKpis(f).catch(() => EMPTY_KPIS),
        EjecutivosService.getPorZona(f).catch(() => []),
        EjecutivosService.getEvolucion(f).catch(() => []),
        EjecutivosService.getCanales(f).catch(() => []),
      ]);
      setData((prev) => ({ ...prev, ranking, kpis, porZona, evolucion, canales }));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll(filters);
  }, [filters, fetchAll]);

  return (
    <div className="space-y-5">
      {/* Filtros */}
      <DesempenoFiltersBar
        catalogos={data.catalogos}
        filters={filters}
        onChange={setFilters}
      />

      {/* Loader overlay sutil */}
      {loading && (
        <div className="flex items-center justify-center gap-2 text-zinc-400 text-sm py-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Actualizando datos…</span>
        </div>
      )}

      {/* KPIs */}
      <DesempenoKpis kpis={data.kpis} />

      {/* Fila 1: Ranking + Canal */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
        <div className="xl:col-span-3">
          <RankingEjecutivosChart data={data.ranking} />
        </div>
        <div className="xl:col-span-2">
          <CanalDonutChart data={data.canales} />
        </div>
      </div>

      {/* Fila 2: Evolución + Zona */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <EvolucionMensualChart data={data.evolucion} />
        <ZonaBarChart data={data.porZona} />
      </div>
    </div>
  );
}
