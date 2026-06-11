import { RiesgosService } from "@/modules/riesgos/services/riesgos.service";
import { HashScrollHandler } from "@/shared/components/hash-scroll-handler";
import { RiesgoMap } from "@/modules/riesgos/components/riesgo-map";
import { RiesgosFilters } from "@/modules/riesgos/components/riesgos-filters";

export const revalidate = 30;

export default async function RiesgosPage(props: any) {
  const searchParams = await props.searchParams;
  const regionParams = searchParams?.region as string | undefined;

  let riesgoData = await RiesgosService.getMapaRiesgoCrediticio().catch(() => []);

  const uniqueRegions = Array.from(
    new Set(riesgoData.map((item) => item.region).filter(Boolean))
  ).sort();

  if (regionParams) {
    riesgoData = riesgoData.filter((item) => item.region === regionParams);
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-4rem-2rem)] -m-3 md:-m-4">
      <HashScrollHandler />

      {/* Sidebar de Filtros */}
      <aside className="w-full lg:w-80 border-b lg:border-b-0 lg:border-l border-border/50 bg-zinc-50/30 dark:bg-zinc-900/10 p-6 shrink-0 lg:order-last">
        <RiesgosFilters regions={uniqueRegions} />
      </aside>

      {/* Contenido Principal — solo Mapa de Riesgo */}
      <div className="flex-1 p-4 md:p-6 min-w-0">
        <div id="mapa-riesgo" className="scroll-mt-4">
          <RiesgoMap data={riesgoData} />
        </div>
      </div>
    </div>
  );
}
