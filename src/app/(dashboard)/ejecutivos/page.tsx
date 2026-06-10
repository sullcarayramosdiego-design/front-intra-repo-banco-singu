import { EjecutivosService } from "@/modules/ejecutivos/services/ejecutivos.service";
import { HashScrollHandler } from "@/shared/components/hash-scroll-handler";

import { RiesgoMap } from "@/modules/ejecutivos/components/riesgo-map";
import { EjecutivosTable } from "@/modules/ejecutivos/components/ejecutivos-table";

export const revalidate = 30;

export default async function EjecutivosPage() {
  const [riesgoData, ejecutivosData] = await Promise.all([
    EjecutivosService.getMapaRiesgoCrediticio().catch(() => []),
    EjecutivosService.getDesempenioEjecutivos().catch(() => []),
  ]);

  return (
    <div className="space-y-6 w-full px-4 md:px-6">
      <HashScrollHandler />

      <div id="mapa-riesgo" className="scroll-mt-4">
        <RiesgoMap data={riesgoData} />
      </div>

      <div id="desempenio-ejecutivos" className="space-y-2 scroll-mt-4">
        <h4 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 px-1">
          Ranking de Desempeño de Ejecutivos
        </h4>
        <EjecutivosTable data={ejecutivosData} />
      </div>
    </div>
  );
}
