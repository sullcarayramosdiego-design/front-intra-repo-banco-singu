import { BarChart3, Wallet, Users, Trophy } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface SidebarChild {
  label: string;
  href: string;
  /** Anchor hash para scroll interno dentro de la página */
  hash?: string;
}

export interface SidebarModule {
  key: string;
  label: string;
  icon: LucideIcon;
  /** Ruta base del módulo */
  href: string;
  /** Sub-secciones mostradas cuando el módulo está activo */
  children: SidebarChild[];
  /** Roles permitidos — undefined = todos los roles */
  roles?: string[];
}

export const SIDEBAR_MODULES: SidebarModule[] = [
  {
    key: "cartera",
    label: "Consola de Control",
    icon: BarChart3,
    href: "/cartera",
    children: [
      { label: "Composición de Clientes", href: "/cartera", hash: "composicion-clientes" },
      { label: "Análisis de Cartera",      href: "/cartera", hash: "analisis-cartera" },
    ],
  },
  {
    key: "transacciones",
    label: "Actividad Transaccional",
    icon: Wallet,
    href: "/transacciones",
    children: [
      { label: "Flujo de Transacciones",  href: "/transacciones", hash: "flujo-transacciones" },
      { label: "Historial de Movimientos", href: "/transacciones", hash: "historial-movimientos" },
    ],
  },
  {
    key: "riesgos",
    label: "Riesgo Crediticio",
    icon: Users,
    href: "/riesgos",
    children: [
      { label: "Mapa de Riesgo", href: "/riesgos", hash: "mapa-riesgo" },
    ],
  },
  {
    key: "desempeno",
    label: "Desempeño de Ejecutivos",
    icon: Trophy,
    href: "/desempeno",
    children: [
      { label: "Ranking de Ejecutivos", href: "/desempeno", hash: "ranking-desempeno" },
      { label: "Tabla de Resultados",   href: "/desempeno", hash: "tabla-ejecutivos" },
    ],
  },
];
