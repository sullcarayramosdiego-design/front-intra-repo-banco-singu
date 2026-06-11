import { TransaccionesService } from "@/modules/transacciones/services/transacciones.service";
import { HashScrollHandler } from "@/shared/components/hash-scroll-handler";

import { TransaccionesChart } from "@/modules/transacciones/components/transacciones-chart";
import { TransaccionesFilters } from "@/modules/transacciones/components/transacciones-filters";
import { TransaccionesKpis } from "@/modules/transacciones/components/transacciones-kpis";

export const revalidate = 30;

export default async function TransaccionesPage(props: any) {
  // Await searchParams for Next.js 15+ compatibility
  const searchParams = await props.searchParams;
  const periodoParams = searchParams?.periodo as string | undefined;
  const canalParams = searchParams?.canal as string | undefined;
  const sucursalParams = searchParams?.sucursal as string | undefined;
  const tipoParams = searchParams?.tipo as string | undefined;

  const queryParts: Record<string, string> = {};
  if (periodoParams) queryParts.periodo = periodoParams;
  if (canalParams) queryParts.canal = canalParams;
  if (sucursalParams) queryParts.sucursal = sucursalParams;
  if (tipoParams) queryParts.tipo = tipoParams;

  const response = await TransaccionesService.getActividadTransaccional(queryParts).catch(() => null);

  const isArray = Array.isArray(response);
  const transaccionesData = isArray 
    ? (response as any) 
    : (response?.items || []);
    
  const uniqueCanales = isArray 
    ? Array.from(new Set((response as any).map((item: any) => item.canal).filter(Boolean))).sort() as string[]
    : (response?.canales || []);

  const uniquePeriodos = isArray
    ? Array.from(new Set((response as any).map((item: any) => item.periodo).filter(Boolean))).sort((a: any, b: any) => b.localeCompare(a)) as string[]
    : (response?.periodos || []);

  const uniqueSucursales = isArray ? [] : (response?.sucursales || []);
  const uniqueTipos = isArray ? [] : (response?.tipos || []);

  // Filtrado local en el Server Component
  let filteredData = transaccionesData;
  if (periodoParams) {
    filteredData = filteredData.filter((item: any) => item.periodo === periodoParams);
  }
  if (canalParams) {
    filteredData = filteredData.filter((item: any) => item.canal === canalParams);
  }
  if (tipoParams) {
    filteredData = filteredData.filter((item: any) => item.tipo_movimiento === tipoParams);
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-4rem-2rem)] -m-3 md:-m-4">
      <HashScrollHandler />

      {/* Sidebar de Filtros */}
      <aside className="w-full lg:w-80 border-b lg:border-b-0 lg:border-l border-border/50 bg-zinc-50/30 dark:bg-zinc-900/10 p-6 shrink-0 lg:order-last">
        <TransaccionesFilters 
          periods={uniquePeriodos} 
          channels={uniqueCanales} 
          branches={uniqueSucursales} 
          types={uniqueTipos} 
        />
      </aside>

      {/* Contenido Principal */}
      <div className="flex-1 p-4 md:p-6 space-y-6 min-w-0">
        <TransaccionesKpis data={filteredData} />

        <div id="flujo-transacciones" className="scroll-mt-4">
          <TransaccionesChart data={filteredData} />
        </div>
      </div>
    </div>
  );
}
