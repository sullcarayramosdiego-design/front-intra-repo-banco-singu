import { BarChart3, Wallet, Users } from "lucide-react";
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
      { label: "Detalle de Cartera",       href: "/cartera", hash: "detalle-cartera" },
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
    key: "ejecutivos",
    label: "Ejecutivos y Riesgo",
    icon: Users,
    href: "/ejecutivos",
    children: [
      { label: "Mapa de Riesgo",          href: "/ejecutivos", hash: "mapa-riesgo" },
      { label: "Desempeño de Ejecutivos", href: "/ejecutivos", hash: "desempenio-ejecutivos" },
    ],
  },
];
