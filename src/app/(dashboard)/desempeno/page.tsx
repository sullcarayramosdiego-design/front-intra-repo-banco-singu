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
      })),
    ]);

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem-2rem)] -m-3 md:-m-4">
      <div className="flex-1 p-4 md:p-6 space-y-6 min-w-0">
        {/* Header */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600">
              <Award className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                Desempeño de Ejecutivos
              </h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Transacciones gestionadas por ejecutivo, zona y región
              </p>
            </div>
          </div>
        </div>

        {/* Dashboard interactivo (Client Component) */}
        <DesempenioDashboard
          initialData={{ ranking, kpis, porZona, evolucion, canales, catalogos }}
        />
      </div>
    </div>
  );
}
