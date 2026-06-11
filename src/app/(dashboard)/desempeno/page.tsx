import { EjecutivosService } from "@/modules/ejecutivos/services/ejecutivos.service";
import { HashScrollHandler } from "@/shared/components/hash-scroll-handler";
import { EjecutivosTable } from "@/modules/ejecutivos/components/ejecutivos-table";
import { Award } from "lucide-react";

export const revalidate = 30;

export const metadata = {
  title: "Desempeño de Ejecutivos | Confianza",
  description: "Ranking y análisis de desempeño de los ejecutivos por región y zona.",
};

export default async function DesempenoPage() {
  const ejecutivosData = await EjecutivosService.getDesempenioEjecutivos().catch(
    () => []
  );

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem-2rem)] -m-3 md:-m-4">
      <HashScrollHandler />

      <div className="flex-1 p-4 md:p-6 space-y-6 min-w-0">
        {/* Encabezado de sección */}
        <div id="ranking-desempeno" className="scroll-mt-4 space-y-1">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-amber-500" />
            <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
              Ranking de Desempeño de Ejecutivos
            </h1>
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Clasificación de ejecutivos por monto transaccionado y número de operaciones por región y zona.
          </p>
        </div>

        {/* Tabla de Ejecutivos */}
        <div id="tabla-ejecutivos" className="scroll-mt-4">
          <EjecutivosTable data={ejecutivosData} />
        </div>
      </div>
    </div>
  );
}
