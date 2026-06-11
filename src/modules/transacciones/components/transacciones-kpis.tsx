"use client";

import { Activity, ArrowUpRight, ArrowDownRight, Scale, Coins } from "lucide-react";
import { ActividadTransaccionalItem } from "../types";
import { Card, CardContent } from "@/shared/ui/card";

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
    <div className="grid gap-4 grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
      {/* CARD 1: Total Operaciones */}
      <Card className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md border-zinc-150 dark:border-zinc-800 hover:shadow-md transition-all">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold tracking-wider text-zinc-500 uppercase">
              Operaciones
            </p>
            <h3 className="text-xl font-bold text-zinc-850 dark:text-zinc-100 font-mono">
              {formatNumber(totalOperaciones)}
            </h3>
            <p className="text-[10px] text-zinc-400">Total transacciones</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <Activity className="w-5 h-5" />
          </div>
        </CardContent>
      </Card>

      {/* CARD 2: Ingresos */}
      <Card className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md border-zinc-150 dark:border-zinc-800 hover:shadow-md transition-all">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold tracking-wider text-zinc-500 uppercase">
              Abonos (Ingresos)
            </p>
            <h3 className="text-xl font-bold text-emerald-600 dark:text-emerald-400 font-mono">
              {formatCurrency(totalIngresos)}
            </h3>
            <p className="text-[10px] text-zinc-400">Depósitos, pagos y trf.</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <ArrowUpRight className="w-5 h-5" />
          </div>
        </CardContent>
      </Card>

      {/* CARD 3: Egresos */}
      <Card className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md border-zinc-150 dark:border-zinc-800 hover:shadow-md transition-all">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold tracking-wider text-zinc-500 uppercase">
              Cargos (Egresos)
            </p>
            <h3 className="text-xl font-bold text-red-600 dark:text-red-400 font-mono">
              {formatCurrency(totalEgresos)}
            </h3>
            <p className="text-[10px] text-zinc-400">Retiros, comisiones y cargos</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-600 dark:text-red-400">
            <ArrowDownRight className="w-5 h-5" />
          </div>
        </CardContent>
      </Card>

      {/* CARD 4: Balance Neto */}
      <Card className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md border-zinc-150 dark:border-zinc-800 hover:shadow-md transition-all">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold tracking-wider text-zinc-500 uppercase">
              Flujo Neto
            </p>
            <h3
              className={`text-xl font-bold font-mono ${
                balanceNeto >= 0
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-amber-600 dark:text-amber-500"
              }`}
            >
              {formatCurrency(balanceNeto)}
            </h3>
            <p className="text-[10px] text-zinc-400">
              {balanceNeto >= 0 ? "Superávit neto de flujo" : "Déficit neto de flujo"}
            </p>
          </div>
          <div
            className={`w-10 h-10 rounded-xl border flex items-center justify-center ${
              balanceNeto >= 0
                ? "bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400"
                : "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400"
            }`}
          >
            <Scale className="w-5 h-5" />
          </div>
        </CardContent>
      </Card>

      {/* CARD 5: Ticket Promedio */}
      <Card className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md border-zinc-150 dark:border-zinc-800 hover:shadow-md transition-all col-span-2 md:col-span-1">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold tracking-wider text-zinc-500 uppercase">
              Ticket Promedio
            </p>
            <h3 className="text-xl font-bold text-indigo-600 dark:text-indigo-400 font-mono">
              {formatCurrency(montoPromedio)}
            </h3>
            <p className="text-[10px] text-zinc-400">Por transacción individual</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <Coins className="w-5 h-5" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
