"use client";

import { Activity, ArrowUpRight, ArrowDownRight, Scale, Coins } from "lucide-react";
import { ActividadTransaccionalItem } from "../types";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";

interface TransaccionesKpisProps {
  data: ActividadTransaccionalItem[];
}

export function TransaccionesKpis({ data }: TransaccionesKpisProps) {
  // 1. Calcular Cantidad Total de Operaciones
  const totalOperaciones = data.reduce(
    (sum, item) => sum + Number(item.cantidad_transacciones || 0),
    0
  );

  // 2. Calcular Volumen de Ingresos (Abonos): DEPOSITO, PAGO, TRANSFERENCIA (monto positivo)
  const totalIngresos = data
    .filter((item) =>
      ["DEPOSITO", "PAGO", "TRANSFERENCIA"].includes(item.tipo_movimiento || "")
    )
    .reduce((sum, item) => sum + Number(item.monto_total || 0), 0);

  // 3. Calcular Volumen de Egresos (Cargos): RETIRO, CARGO, COMISION (monto negativo, mostrar absoluto)
  const totalEgresos = data
    .filter((item) =>
      ["RETIRO", "CARGO", "COMISION"].includes(item.tipo_movimiento || "")
    )
    .reduce((sum, item) => sum + Math.abs(Number(item.monto_total || 0)), 0);

  // 4. Balance Neto (Ingresos - Egresos)
  const balanceNeto = data.reduce((sum, item) => sum + Number(item.monto_total || 0), 0);

  // 5. Monto Promedio por Operación (Monto absoluto total / Operaciones totales)
  const totalAbsMonto = data.reduce(
    (sum, item) => sum + Math.abs(Number(item.monto_total || 0)),
    0
  );
  const montoPromedio = totalOperaciones > 0 ? totalAbsMonto / totalOperaciones : 0;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-PE", {
      style: "currency",
      currency: "PEN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return value.toLocaleString("es-PE");
  };

  return (
    <div className="grid gap-5 grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
      {/* CARD 1: Total Operaciones */}
      <Card className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md border-zinc-150 dark:border-zinc-800 shadow-sm transition-all hover:scale-[1.01]">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
            Operaciones
          </CardTitle>
          <Activity className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-black font-mono text-zinc-850 dark:text-zinc-100">
            {formatNumber(totalOperaciones)}
          </div>
          <p className="text-[10px] text-zinc-400 mt-0.5">Total transacciones</p>
        </CardContent>
      </Card>

      {/* CARD 2: Ingresos */}
      <Card className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md border-zinc-150 dark:border-zinc-800 shadow-sm transition-all hover:scale-[1.01]">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
            Abonos (Ingresos)
          </CardTitle>
          <ArrowUpRight className="h-4 w-4 text-emerald-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">
            {formatCurrency(totalIngresos)}
          </div>
          <p className="text-[10px] text-zinc-400 mt-0.5">Depósitos, pagos y trf.</p>
        </CardContent>
      </Card>

      {/* CARD 3: Egresos */}
      <Card className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md border-zinc-150 dark:border-zinc-800 shadow-sm transition-all hover:scale-[1.01]">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
            Cargos (Egresos)
          </CardTitle>
          <ArrowDownRight className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-black font-mono text-red-600 dark:text-red-400">
            {formatCurrency(totalEgresos)}
          </div>
          <p className="text-[10px] text-zinc-400 mt-0.5">Retiros, comisiones y cargos</p>
        </CardContent>
      </Card>

      {/* CARD 4: Balance Neto */}
      <Card className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md border-zinc-150 dark:border-zinc-800 shadow-sm transition-all hover:scale-[1.01]">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
            Flujo Neto
          </CardTitle>
          <Scale className={`h-4 w-4 ${balanceNeto >= 0 ? "text-blue-500" : "text-amber-500"}`} />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-black font-mono ${
            balanceNeto >= 0 ? "text-blue-600 dark:text-blue-400" : "text-amber-600 dark:text-amber-500"
          }`}>
            {formatCurrency(balanceNeto)}
          </div>
          <p className="text-[10px] text-zinc-400 mt-0.5">
            {balanceNeto >= 0 ? "Superávit neto de flujo" : "Déficit neto de flujo"}
          </p>
        </CardContent>
      </Card>

      {/* CARD 5: Ticket Promedio */}
      <Card className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md border-zinc-150 dark:border-zinc-800 shadow-sm transition-all hover:scale-[1.01] col-span-2 md:col-span-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
            Ticket Promedio
          </CardTitle>
          <Coins className="h-4 w-4 text-indigo-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-black font-mono text-indigo-600 dark:text-indigo-400">
            {formatCurrency(montoPromedio)}
          </div>
          <p className="text-[10px] text-zinc-400 mt-0.5">Por transacción individual</p>
        </CardContent>
      </Card>
    </div>
  );
}
