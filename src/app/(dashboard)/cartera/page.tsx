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
  cartera_positivo_saldo: number;
  cartera_negativo_saldo: number;
  total_transacciones: number;
}

export const revalidate = 30;

export default async function CarteraPage(props: any) {
  // Await searchParams for Next.js 15+ compatibility
  const searchParams = await props.searchParams;
  const regionParams = searchParams?.region as string | undefined;
  const segmentoParams = searchParams?.segmento as string | undefined;
  const productoParams = searchParams?.producto as string | undefined;

  const queryParts: Record<string, string> = {};
  if (regionParams) queryParts.region = regionParams;
  if (segmentoParams) queryParts.segmento = segmentoParams;
  if (productoParams) queryParts.producto = productoParams;

  const queryString = new URLSearchParams(queryParts).toString();
  const resumenUrl = queryString ? `/api/reportes/resumen?${queryString}` : "/api/reportes/resumen";

  const [resumen, carteraData, clientesData] = await Promise.all([
    fetcher<ResumenDashboard>(resumenUrl).catch(() => ({
      total_clientes: 0,
      total_cuentas_activas: 0,
      cartera_total_saldo: 0,
      cartera_positivo_saldo: 0,
      cartera_negativo_saldo: 0,
      total_transacciones: 0,
    })),
    CarteraService.getCarteraActiva(queryParts).catch(() => []),
    CarteraService.getComposicionClientes(queryParts).catch(() => []),
  ]);

  // Aplicar filtros locales (Client-Side filtering en el Server Component)
  let filteredCartera = carteraData;
  if (regionParams) {
    filteredCartera = filteredCartera.filter((item) => item.region === regionParams);
  }
  if (productoParams) {
    filteredCartera = filteredCartera.filter((item) => item.tipo_producto === productoParams);
  }

  let filteredClientes = clientesData;
  if (segmentoParams) {
    filteredClientes = filteredClientes.filter((item) => item.segmento === segmentoParams);
  }

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("es-PE", {
      style: "currency",
      currency: "PEN",
      maximumFractionDigits: 0,
    }).format(value);

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-4rem-2rem)] -m-3 md:-m-4">
      <HashScrollHandler />

      {/* Sidebar de Filtros */}
      <aside className="w-full lg:w-80 border-b lg:border-b-0 lg:border-l border-border/50 bg-zinc-50/30 dark:bg-zinc-900/10 p-6 shrink-0 lg:order-last">
        <CarteraFilters />
      </aside>

      {/* Contenido Principal */}
      <div className="flex-1 p-4 md:p-6 space-y-6 min-w-0">
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
              <div className="flex gap-1.5 items-center text-[10px] text-zinc-400 mt-1 font-mono">
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">(+) {formatCurrency(resumen.cartera_positivo_saldo)}</span>
                <span className="text-zinc-300 dark:text-zinc-700">|</span>
                <span className="text-rose-600 dark:text-rose-400 font-semibold">(-) {formatCurrency(resumen.cartera_negativo_saldo)}</span>
              </div>
              <p className="text-[10px] text-zinc-400 mt-1.5">Saldo absoluto consolidado</p>
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
          <ClientesComposition data={filteredClientes} />
        </div>
        <div id="analisis-cartera" className="grid gap-6 lg:grid-cols-2 scroll-mt-4">
          <CarteraCharts data={filteredCartera} />
          <CarteraAdvancedCharts data={filteredCartera} />
        </div>
      </div>
    </div>
  );
}
