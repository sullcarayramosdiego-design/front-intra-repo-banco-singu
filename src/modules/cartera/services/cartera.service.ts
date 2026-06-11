import { fetcher } from "@/lib/fetcher";
import { CarteraActivaItem, ClienteComposicionItem } from "../types";

interface CarteraFilters {
  region?: string;
  segmento?: string;
  producto?: string;
}

export class CarteraService {
  static async getCarteraActiva(filters?: CarteraFilters): Promise<CarteraActivaItem[]> {
    const query = filters ? "?" + new URLSearchParams(filters as any).toString() : "";
    return fetcher<CarteraActivaItem[]>(`/api/reportes/cartera-activa${query}`);
  }

  static async getComposicionClientes(filters?: CarteraFilters): Promise<ClienteComposicionItem[]> {
    const query = filters ? "?" + new URLSearchParams(filters as any).toString() : "";
    return fetcher<ClienteComposicionItem[]>(`/api/reportes/composicion-clientes${query}`);
  }
}
