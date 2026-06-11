import { fetcher } from "@/lib/fetcher";
import { CarteraService } from "@/modules/cartera/services/cartera.service";
import { HashScrollHandler } from "@/shared/components/hash-scroll-handler";

import { ClientesComposition } from "@/modules/cartera/components/clientes-composition";
import { CarteraCharts } from "@/modules/cartera/components/cartera-charts";
import { CarteraFilters } from "@/modules/cartera/components/cartera-filters";
import { CarteraAdvancedCharts } from "@/modules/cartera/components/cartera-advanced-charts";

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Wallet, Users, Landmark, TrendingUp } from "lucide-react";

interface ResumenDashboard {
  total_clientes: number;
  total_cuentas_activas: number;
  cartera_total_saldo: number;
  total_transacciones: number;
}

export const revalidate = 30;

export default async function CarteraPage() {
  const [resumen, carteraData, clientesData] = await Promise.all([
    fetcher<ResumenDashboard>("/api/reportes/resumen").catch(() => ({
      total_clientes: 0,
      total_cuentas_activas: 0,
      cartera_total_saldo: 0,
      total_transacciones: 0,
    })),
    CarteraService.getCarteraActiva().catch(() => []),
    CarteraService.getComposicionClientes().catch(() => []),
  ]);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("es-PE", {
      style: "currency",
      currency: "PEN",
      maximumFractionDigits: 0,
    }).format(value);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 w-full px-4 md:px-6">
      <HashScrollHandler />

      {/* Sidebar de Filtros (Ocupa 1 columna en pantallas grandes) */}
      <div className="lg:col-span-1">
        <CarteraFilters />
      </div>

      {/* Contenido Principal (Ocupa 3 columnas) */}
      <div className="lg:col-span-3 space-y-6">
        {/* KPIs */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md border-zinc-150 dark:border-zinc-800 shadow-sm transition-all hover:scale-[1.01]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                Cartera Administrada
              </CardTitle>
              <Wallet className="h-4 w-4 text-sky-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-black font-mono text-zinc-850 dark:text-zinc-100">
                {formatCurrency(resumen.cartera_total_saldo)}
              </div>
              <p className="text-[10px] text-zinc-400 mt-0.5">Saldo absoluto consolidado</p>
            </CardContent>
          </Card>

          <Card className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md border-zinc-150 dark:border-zinc-800 shadow-sm transition-all hover:scale-[1.01]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                Clientes Únicos
              </CardTitle>
              <Users className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-black font-mono text-zinc-850 dark:text-zinc-100">
                {resumen.total_clientes.toLocaleString()}
              </div>
              <p className="text-[10px] text-zinc-400 mt-0.5">Personas Naturales y Jurídicas</p>
            </CardContent>
          </Card>

          <Card className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md border-zinc-150 dark:border-zinc-800 shadow-sm transition-all hover:scale-[1.01]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                Cuentas Activas
              </CardTitle>
              <Landmark className="h-4 w-4 text-indigo-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-black font-mono text-zinc-850 dark:text-zinc-100">
                {resumen.total_cuentas_activas.toLocaleString()}
              </div>
              <p className="text-[10px] text-zinc-400 mt-0.5">Cuentas con saldo e ingresos</p>
            </CardContent>
          </Card>

          <Card className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md border-zinc-150 dark:border-zinc-800 shadow-sm transition-all hover:scale-[1.01]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                Movimientos Registrados
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-violet-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-black font-mono text-zinc-850 dark:text-zinc-100">
                {resumen.total_transacciones.toLocaleString()}
              </div>
              <p className="text-[10px] text-zinc-400 mt-0.5">Transacciones acumuladas en el año</p>
            </CardContent>
          </Card>
        </div>

        {/* Secciones */}
        <div id="composicion-clientes" className="scroll-mt-4">
          <ClientesComposition data={clientesData} />
        </div>
        <div id="analisis-cartera" className="scroll-mt-4">
          <CarteraCharts data={carteraData} />
        </div>
        <div id="detalle-cartera" className="space-y-2 scroll-mt-4">
          <CarteraAdvancedCharts data={carteraData} />
        </div>
      </div>
    </div>
  );
}
