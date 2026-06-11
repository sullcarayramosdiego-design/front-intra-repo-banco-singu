import { TransaccionesService } from "@/modules/transacciones/services/transacciones.service";
import { HashScrollHandler } from "@/shared/components/hash-scroll-handler";

import { TransaccionesChart } from "@/modules/transacciones/components/transacciones-chart";
import { TransaccionesTable } from "@/modules/transacciones/components/transacciones-table";
import { TransaccionesFilters } from "@/modules/transacciones/components/transacciones-filters";

export const revalidate = 30;

export default async function TransaccionesPage(props: any) {
  // Await searchParams for Next.js 15+ compatibility
  const searchParams = await props.searchParams;
  const periodoParams = searchParams?.periodo as string | undefined;
  const canalParams = searchParams?.canal as string | undefined;

  let transaccionesData = await TransaccionesService.getActividadTransaccional().catch(() => []);

  if (periodoParams) {
    transaccionesData = transaccionesData.filter((item) => item.periodo === periodoParams);
  }
  if (canalParams) {
    transaccionesData = transaccionesData.filter((item) => item.canal === canalParams);
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 w-full px-4 md:px-6">
      <HashScrollHandler />

      {/* Sidebar de Filtros */}
      <div className="lg:col-span-1 lg:order-last">
        <TransaccionesFilters />
      </div>

      {/* Contenido Principal */}
      <div className="lg:col-span-3 space-y-6">
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
