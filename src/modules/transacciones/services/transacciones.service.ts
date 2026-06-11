import { fetcher } from "@/lib/fetcher";
import { ActividadTransaccionalResponse } from "../types";

interface TransaccionFilters {
  periodo?: string;
  canal?: string;
  sucursal?: string;
  tipo?: string;
}

export class TransaccionesService {
  static async getActividadTransaccional(filters?: TransaccionFilters): Promise<ActividadTransaccionalResponse> {
    const query = filters ? "?" + new URLSearchParams(filters as any).toString() : "";
    return fetcher<ActividadTransaccionalResponse>(`/api/reportes/actividad-transaccional${query}`);
  }
}
