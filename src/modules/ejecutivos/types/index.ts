// ─── Tipos base ───────────────────────────────────────────────────────────────

export interface DesempenioEjecutivoItem {
  ejecutivo_id: number;
  nombre_ejecutivo: string;
  zona: string;
  region: string;
  sucursal_nombre: string;
  cantidad_transacciones: number;
  monto_total: number;
  monto_credito: number;
  monto_debito: number;
  tx_credito: number;
  tx_debito: number;
  ticket_promedio: number;
}

export interface DesempenioKpis {
  total_ejecutivos_activos: number;
  total_transacciones: number;
  monto_total_gestionado: number;
  ticket_promedio: number;
  tx_por_ejecutivo: number;
  canales_usados: number;
}

export interface DesempenioZona {
  zona: string;
  region: string;
  cantidad_transacciones: number;
  monto_total: number;
  total_ejecutivos: number;
  ticket_promedio: number;
}

export interface DesempenioEvolucion {
  periodo: string;       // "YYYY-MM"
  zona: string;
  cantidad_transacciones: number;
  monto_total: number;
  ejecutivos_activos: number;
}

export interface DesempenioCanal {
  canal: string;
  cantidad_transacciones: number;
  monto_total: number;
  porcentaje: number;
}

export interface DesempenioCatalogos {
  zonas: string[];
  regiones: string[];
  canales: string[];
  ejecutivos: { id: number; nombre: string }[];
}

export interface DesempenioFilters {
  zona?: string;
  region?: string;
  canal?: string;
  top?: string;
  ejecutivo_id?: string;
}
