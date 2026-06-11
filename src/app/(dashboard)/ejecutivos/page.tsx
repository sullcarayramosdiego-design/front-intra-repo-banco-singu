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

  const uniqueRegions = Array.from(new Set([
    ...riesgoData.map((item) => item.region),
    ...ejecutivosData.map((item) => item.region)
  ].filter(Boolean))).sort();

  if (regionParams) {
    riesgoData = riesgoData.filter((item) => item.region === regionParams);
    ejecutivosData = ejecutivosData.filter((item) => item.region === regionParams);
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-4rem-2rem)] -m-3 md:-m-4">
      <HashScrollHandler />

      {/* Sidebar de Filtros */}
      <aside className="w-full lg:w-80 border-b lg:border-b-0 lg:border-l border-border/50 bg-zinc-50/30 dark:bg-zinc-900/10 p-6 shrink-0 lg:order-last">
        <EjecutivosFilters regions={uniqueRegions} />
      </aside>

      {/* Contenido Principal */}
      <div className="flex-1 p-4 md:p-6 space-y-6 min-w-0">
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
