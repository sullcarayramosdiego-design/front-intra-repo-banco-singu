"use client";

import { DesempenioKpis } from "../types";
import {
  Users, TrendingUp, DollarSign, Zap, BarChart2, Wifi,
} from "lucide-react";

interface Props {
  kpis: DesempenioKpis;
}

function fmt(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}
function fmtNum(n: number) {
  return n.toLocaleString("es-PE");
}

const CARDS = [
  {
    key: "total_ejecutivos_activos",
    label: "Ejecutivos Activos",
    icon: Users,
    color: "from-violet-500 to-purple-600",
    format: (v: number) => fmtNum(v),
    suffix: "ejecutivos",
  },
  {
    key: "total_transacciones",
    label: "Total Transacciones",
    icon: TrendingUp,
    color: "from-cyan-500 to-blue-600",
    format: (v: number) => fmtNum(v),
    suffix: "operaciones",
  },
  {
    key: "monto_total_gestionado",
    label: "Monto Gestionado",
    icon: DollarSign,
    color: "from-emerald-500 to-teal-600",
    format: (v: number) => fmt(v),
    suffix: "total",
  },
  {
    key: "ticket_promedio",
    label: "Ticket Promedio",
    icon: BarChart2,
    color: "from-amber-500 to-orange-600",
    format: (v: number) => fmt(v),
    suffix: "por tx",
  },
  {
    key: "tx_por_ejecutivo",
    label: "Tx por Ejecutivo",
    icon: Zap,
    color: "from-rose-500 to-pink-600",
    format: (v: number) => fmtNum(v),
    suffix: "promedio",
  },
  {
    key: "canales_usados",
    label: "Canales Activos",
    icon: Wifi,
    color: "from-sky-500 to-indigo-600",
    format: (v: number) => String(v),
    suffix: "canales",
  },
] as const;

export function DesempenoKpis({ kpis }: Props) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
      {CARDS.map(({ key, label, icon: Icon, color, format, suffix }) => {
        const value = kpis[key as keyof DesempenioKpis] as number;
        return (
          <div
            key={key}
            className="relative overflow-hidden rounded-xl border border-white/10 bg-white/5 dark:bg-zinc-900/60 backdrop-blur-sm p-4 group hover:scale-[1.02] transition-transform duration-200"
          >
            {/* Gradient orb */}
            <div
              className={`absolute -top-4 -right-4 h-16 w-16 rounded-full bg-gradient-to-br ${color} opacity-20 blur-xl group-hover:opacity-30 transition-opacity`}
            />
            <div className={`inline-flex p-2 rounded-lg bg-gradient-to-br ${color} mb-3`}>
              <Icon className="h-4 w-4 text-white" />
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">{label}</p>
            <p className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mt-0.5 tabular-nums">
              {format(value ?? 0)}
            </p>
            <p className="text-[10px] text-zinc-400 mt-0.5">{suffix}</p>
          </div>
        );
      })}
    </div>
  );
}
