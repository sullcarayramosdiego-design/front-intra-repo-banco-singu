import { fetcher } from "@/lib/fetcher";
import { ActividadTransaccionalItem } from "../types";

export class TransaccionesService {
  static async getActividadTransaccional(): Promise<ActividadTransaccionalItem[]> {
    return fetcher<ActividadTransaccionalItem[]>("/api/reportes/actividad-transaccional");
  }
}
