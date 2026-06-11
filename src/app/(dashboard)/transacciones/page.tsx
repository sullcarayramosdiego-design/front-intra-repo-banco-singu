import { TransaccionesService } from "@/modules/transacciones/services/transacciones.service";
import { HashScrollHandler } from "@/shared/components/hash-scroll-handler";

import { TransaccionesChart } from "@/modules/transacciones/components/transacciones-chart";
import { TransaccionesTable } from "@/modules/transacciones/components/transacciones-table";
import { TransaccionesFilters } from "@/modules/transacciones/components/transacciones-filters";
import { TransaccionesKpis } from "@/modules/transacciones/components/transacciones-kpis";

export const revalidate = 30;

export default async function TransaccionesPage(props: any) {
  // Await searchParams for Next.js 15+ compatibility
  const searchParams = await props.searchParams;
  const periodoParams = searchParams?.periodo as string | undefined;
  const canalParams = searchParams?.canal as string | undefined;

  const allTransacciones = await TransaccionesService.getActividadTransaccional().catch(() => []);

  const uniqueCanales = Array.from(new Set(allTransacciones.map((item) => item.canal).filter(Boolean))).sort();
  const uniquePeriodos = Array.from(new Set(allTransacciones.map((item) => item.periodo).filter(Boolean))).sort((a, b) => b.localeCompare(a));

  let transaccionesData = allTransacciones;

  if (periodoParams) {
    transaccionesData = transaccionesData.filter((item) => item.periodo === periodoParams);
  }
  if (canalParams) {
    transaccionesData = transaccionesData.filter((item) => item.canal === canalParams);
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-4rem-2rem)] -m-3 md:-m-4">
      <HashScrollHandler />

      {/* Sidebar de Filtros */}
      <aside className="w-full lg:w-80 border-b lg:border-b-0 lg:border-l border-border/50 bg-zinc-50/30 dark:bg-zinc-900/10 p-6 shrink-0 lg:order-last">
        <TransaccionesFilters periods={uniquePeriodos} channels={uniqueCanales} />
      </aside>

      {/* Contenido Principal */}
      <div className="flex-1 p-4 md:p-6 space-y-6 min-w-0">
        <TransaccionesKpis data={transaccionesData} />

        <div id="flujo-transacciones" className="scroll-mt-4">
          <TransaccionesChart data={transaccionesData} />
        </div>

        <div id="historial-movimientos" className="space-y-2 scroll-mt-4">
          <h4 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 px-1">
            Histórico de Transacciones
          </h4>
          <TransaccionesTable data={transaccionesData} />
        </div>
      </div>
    </div>
  );
}
