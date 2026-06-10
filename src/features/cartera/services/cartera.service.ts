import { fetcher } from "@/lib/fetcher";
import { CarteraActivaItem, ClienteComposicionItem } from "../types";

export class CarteraService {
  static async getCarteraActiva(): Promise<CarteraActivaItem[]> {
    return fetcher<CarteraActivaItem[]>("/api/reportes/cartera-activa");
  }

  static async getComposicionClientes(): Promise<ClienteComposicionItem[]> {
    return fetcher<ClienteComposicionItem[]>("/api/reportes/composicion-clientes");
  }
}
