import { fetcher } from "@/lib/fetcher";
import { DesempenioEjecutivoItem, RiesgoCrediticioItem } from "../types";

export class EjecutivosService {
  static async getDesempenioEjecutivos(): Promise<DesempenioEjecutivoItem[]> {
    return fetcher<DesempenioEjecutivoItem[]>("/api/reportes/desempeno-ejecutivos");
  }

  static async getMapaRiesgoCrediticio(): Promise<RiesgoCrediticioItem[]> {
    return fetcher<RiesgoCrediticioItem[]>("/api/reportes/mapa-riesgo");
  }
}
