import { TransaccionesService } from "@/modules/transacciones/services/transacciones.service";
import { HashScrollHandler } from "@/shared/components/hash-scroll-handler";

import { TransaccionesChart } from "@/modules/transacciones/components/transacciones-chart";
import { TransaccionesTable } from "@/modules/transacciones/components/transacciones-table";

export const revalidate = 30;

export default async function TransaccionesPage() {
  const transaccionesData = await TransaccionesService.getActividadTransaccional().catch(() => []);

  return (
    <div className="space-y-6 w-full px-4 md:px-6">
      <HashScrollHandler />

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
  );
}
