export interface ActividadTransaccionalItem {
  periodo: string;
  canal: string;
  tipo_movimiento?: string;
  cantidad_transacciones: number;
  monto_total: number;
}

export interface ActividadTransaccionalResponse {
  items: ActividadTransaccionalItem[];
  canales: string[];
  periodos: string[];
  sucursales: string[];
  tipos: string[];
}
