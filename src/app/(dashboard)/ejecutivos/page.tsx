import { EjecutivosService } from "@/modules/ejecutivos/services/ejecutivos.service";
import { HashScrollHandler } from "@/shared/components/hash-scroll-handler";

import { RiesgoMap } from "@/modules/ejecutivos/components/riesgo-map";
import { EjecutivosTable } from "@/modules/ejecutivos/components/ejecutivos-table";
import { EjecutivosFilters } from "@/modules/ejecutivos/components/ejecutivos-filters";

export const revalidate = 30;

export default async function EjecutivosPage(props: any) {
  const searchParams = await props.searchParams;
  const regionParams = searchParams?.region as string | undefined;

  let [riesgoData, ejecutivosData] = await Promise.all([
    EjecutivosService.getMapaRiesgoCrediticio().catch(() => []),
    EjecutivosService.getDesempenioEjecutivos().catch(() => []),
  ]);

  if (regionParams) {
    riesgoData = riesgoData.filter((item) => item.region === regionParams);
    ejecutivosData = ejecutivosData.filter((item) => item.region === regionParams);
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 w-full px-4 md:px-6">
      <HashScrollHandler />

      {/* Sidebar de Filtros */}
      <div className="lg:col-span-1 lg:order-last">
        <EjecutivosFilters />
      </div>

      {/* Contenido Principal */}
      <div className="lg:col-span-3 space-y-6">
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
    </div>
  );
}
