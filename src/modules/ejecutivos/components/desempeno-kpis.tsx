"use client";

import { DesempenioKpis } from "../types";
import {
  Users, TrendingUp, Coins, Zap, BarChart2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";

interface Props {
  kpis: DesempenioKpis;
}

function fmt(n: number) {
  if (n >= 1_000_000) return `S/ ${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `S/ ${(n / 1_000).toFixed(0)}K`;
  return `S/ ${n.toFixed(0)}`;
}
function fmtNum(n: number) {
  return n.toLocaleString("es-PE");
}

const CARDS = [
  {
    key: "total_ejecutivos_activos",
    label: "Ejecutivos Activos",
    icon: Users,
    iconColor: "text-violet-500",
    format: (v: number) => fmtNum(v),
    suffix: "ejecutivos",
  },
  {
    key: "total_transacciones",
    label: "Total Transacciones",
    icon: TrendingUp,
    iconColor: "text-blue-500",
    format: (v: number) => fmtNum(v),
    suffix: "operaciones",
  },
  {
    key: "monto_total_gestionado",
    label: "Monto Gestionado",
    icon: Coins,
    iconColor: "text-emerald-500",
    format: (v: number) => fmt(v),
    suffix: "total",
  },
  {
    key: "ticket_promedio",
    label: "Ticket Promedio",
    icon: BarChart2,
    iconColor: "text-amber-500",
    format: (v: number) => fmt(v),
    suffix: "por tx",
  },
  {
    key: "tx_por_ejecutivo",
    label: "Tx por Ejecutivo",
    icon: Zap,
    iconColor: "text-rose-500",
    format: (v: number) => fmtNum(v),
    suffix: "promedio",
  },
] as const;

export function DesempenoKpis({ kpis }: Props) {
  return (
    <div className="grid gap-5 grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
      {CARDS.map(({ key, label, icon: Icon, iconColor, format, suffix }) => {
        const value = kpis[key as keyof DesempenioKpis] as number;
        return (
          <Card
            key={key}
            className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md border-zinc-150 dark:border-zinc-800 shadow-sm transition-all hover:scale-[1.01]"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                {label}
              </CardTitle>
              <Icon className={`h-4 w-4 ${iconColor}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-black font-mono text-zinc-850 dark:text-zinc-100">
                {format(value ?? 0)}
              </div>
              <p className="text-[10px] text-zinc-400 mt-0.5">{suffix}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
