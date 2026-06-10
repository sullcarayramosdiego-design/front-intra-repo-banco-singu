import { redirect } from "next/navigation";

/**
 * La raíz "/" redirige al módulo por defecto: Consola de Control.
 * Cada módulo analítico tiene su propia ruta real bajo (dashboard).
 */
export default function RootDashboardPage() {
  redirect("/cartera");
}
