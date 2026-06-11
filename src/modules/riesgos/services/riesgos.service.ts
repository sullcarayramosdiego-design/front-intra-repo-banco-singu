import { fetcher } from "@/lib/fetcher";
import { RiesgoCrediticioItem } from "../types";

export class RiesgosService {
  static async getMapaRiesgoCrediticio(): Promise<RiesgoCrediticioItem[]> {
    return fetcher<RiesgoCrediticioItem[]>("/api/reportes/mapa-riesgo");
  }
}
