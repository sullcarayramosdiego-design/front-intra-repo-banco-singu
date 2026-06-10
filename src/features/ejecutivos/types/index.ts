export interface DesempenioEjecutivoItem {
  ejecutivo_id: number;
  nombre_ejecutivo: string;
  zona: string;
  region: string;
  cantidad_transacciones: number;
  monto_total_transacciones: number;
}

export interface RiesgoCrediticioItem {
  zona: string;
  region: string;
  clasificacion_cartera: "NORMAL" | "CPP" | "DEFICIENTE" | "DUDOSO" | "PERDIDA" | string;
  saldo_total: number;
  total_cuentas: number;
  saldo_promedio: number;
  transacciones_volumen: number;
  transacciones_monto: number;
}
