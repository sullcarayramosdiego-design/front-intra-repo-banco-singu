import { EjecutivosService } from "@/modules/ejecutivos/services/ejecutivos.service";
import { DesempenioDashboard } from "@/modules/ejecutivos/components/desempeno-dashboard";
import { Award } from "lucide-react";

export const unstable_instant = false;

export const metadata = {
  title: "Desempeño de Ejecutivos | Confianza",
  description:
    "Análisis de transacciones gestionadas por ejecutivo, zona y región. KPIs, gráficos de evolución y distribución por canal.",
};

export default async function DesempenoPage() {
  // Carga inicial en paralelo (SSR)
  const [ranking, kpis, porZona, evolucion, canales, catalogos] =
    await Promise.all([
      EjecutivosService.getDesempenioEjecutivos({}).catch(() => []),
      EjecutivosService.getKpis({}).catch(() => ({
        total_ejecutivos_activos: 0,
        total_transacciones: 0,
        monto_total_gestionado: 0,
        ticket_promedio: 0,
        tx_por_ejecutivo: 0,
        canales_usados: 0,
      })),
      EjecutivosService.getPorZona({}).catch(() => []),
      EjecutivosService.getEvolucion({}).catch(() => []),
      EjecutivosService.getCanales({}).catch(() => []),
      EjecutivosService.getCatalogos().catch(() => ({
        zonas: [],
        regiones: [],
        canales: [],
        ejecutivos: [],
      })),
    ]);

  return (
    <DesempenioDashboard
      initialData={{ ranking, kpis, porZona, evolucion, canales, catalogos }}
    />
  );
}
