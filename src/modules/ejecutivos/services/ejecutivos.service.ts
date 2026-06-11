import { fetcher } from "@/lib/fetcher";
import {
  DesempenioEjecutivoItem,
  DesempenioKpis,
  DesempenioZona,
  DesempenioEvolucion,
  DesempenioCanal,
  DesempenioCatalogos,
  DesempenioFilters,
} from "../types";

function buildQuery(filters: DesempenioFilters = {}): string {
  const params = new URLSearchParams();
  if (filters.zona)         params.set("zona", filters.zona);
  if (filters.region)       params.set("region", filters.region);
  if (filters.canal)        params.set("canal", filters.canal);
  if (filters.top)          params.set("top", filters.top);
  if (filters.ejecutivo_id) params.set("ejecutivo_id", filters.ejecutivo_id);
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export class EjecutivosService {
  /** Ranking ejecutivos por transacciones (con filtros) */
  static async getDesempenioEjecutivos(
    filters: DesempenioFilters = {}
  ): Promise<DesempenioEjecutivoItem[]> {
    return fetcher<DesempenioEjecutivoItem[]>(
      `/api/reportes/desempeno-ejecutivos${buildQuery(filters)}`
    );
  }

  /** KPIs resumen */
  static async getKpis(filters: DesempenioFilters = {}): Promise<DesempenioKpis> {
    return fetcher<DesempenioKpis>(
      `/api/reportes/desempeno/kpis${buildQuery(filters)}`
    );
  }

  /** Transacciones agrupadas por zona */
  static async getPorZona(
    filters: Pick<DesempenioFilters, "canal" | "region"> = {}
  ): Promise<DesempenioZona[]> {
    return fetcher<DesempenioZona[]>(
      `/api/reportes/desempeno/por-zona${buildQuery(filters)}`
    );
  }

  /** Evolución mensual por zona */
  static async getEvolucion(
    filters: DesempenioFilters = {}
  ): Promise<DesempenioEvolucion[]> {
    return fetcher<DesempenioEvolucion[]>(
      `/api/reportes/desempeno/evolucion${buildQuery(filters)}`
    );
  }

  /** Distribución por canal */
  static async getCanales(
    filters: Pick<DesempenioFilters, "zona" | "region"> = {}
  ): Promise<DesempenioCanal[]> {
    return fetcher<DesempenioCanal[]>(
      `/api/reportes/desempeno/canales${buildQuery(filters)}`
    );
  }

  /** Catálogos de filtros */
  static async getCatalogos(): Promise<DesempenioCatalogos> {
    return fetcher<DesempenioCatalogos>(`/api/reportes/desempeno/catalogos`);
  }
}
