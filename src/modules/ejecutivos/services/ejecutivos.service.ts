import { fetcher } from "@/lib/fetcher";
import { DesempenioEjecutivoItem } from "../types";

export class EjecutivosService {
  static async getDesempenioEjecutivos(): Promise<DesempenioEjecutivoItem[]> {
    return fetcher<DesempenioEjecutivoItem[]>("/api/reportes/desempeno-ejecutivos");
  }
}
