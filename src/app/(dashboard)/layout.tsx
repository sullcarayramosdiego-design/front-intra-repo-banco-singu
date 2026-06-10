"use client";

import { useState, useEffect, Suspense } from "react";
import { useSession } from "next-auth/react";
import { signOut } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  Landmark,
  BarChart3,
  TrendingUp,
  Wallet,
  Users,
  Settings,
  ChevronRight,
  ChevronsUpDown,
  User,
  Shield,
  LogOut,
  Sun,
  Moon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarInset,
  SidebarTrigger,
  SidebarMenuSkeleton,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuShortcut,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";

function DashboardSidebarContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeTab = searchParams.get("tab") || "cartera";

  const [openMenus, setOpenMenus] = useState<{ [key: string]: boolean }>({
    cartera: activeTab === "cartera",
    transacciones: activeTab === "transacciones",
    ejecutivos: activeTab === "ejecutivos",
  });

  const toggleMenu = (key: string) => {
    setOpenMenus((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleParentClick = (key: string, tab: string) => {
    toggleMenu(key);
    router.push(`/?tab=${tab}`);
  };

  useEffect(() => {
    setOpenMenus((prev) => ({
      ...prev,
      [activeTab]: true,
    }));
  }, [activeTab]);

  return (
    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupLabel className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest px-2.5 mb-2 group-data-[collapsible=icon]:hidden">
          Módulos Analíticos
        </SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {/* Consola de Control - Cartera y Clientes */}
            <SidebarMenuItem>
              <SidebarMenuButton
                isActive={activeTab === "cartera"}
                onClick={() => handleParentClick("cartera", "cartera")}
                className="w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-lg cursor-pointer"
              >
                <BarChart3 className="h-4 w-4 shrink-0" />
                <span className="group-data-[collapsible=icon]:hidden">Consola de Control</span>
                <ChevronRight className={cn(
                  "ml-auto h-3 w-3 group-data-[collapsible=icon]:hidden opacity-60 transition-transform",
                  openMenus["cartera"] && "rotate-90"
                )} />
              </SidebarMenuButton>
              {openMenus["cartera"] && (
                <SidebarMenuSub className="group-data-[collapsible=icon]:hidden">
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton
                      render={<Link href="/?tab=cartera#composicion-clientes" />}
                      className="text-xs text-zinc-550 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-150"
                    >
                      <span>Composición de Clientes</span>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton
                      render={<Link href="/?tab=cartera#analisis-cartera" />}
                      className="text-xs text-zinc-550 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-150"
                    >
                      <span>Análisis de Cartera</span>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton
                      render={<Link href="/?tab=cartera#detalle-cartera" />}
                      className="text-xs text-zinc-550 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-150"
                    >
                      <span>Detalle de Cartera Activa</span>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                </SidebarMenuSub>
              )}
            </SidebarMenuItem>

            {/* Actividad Transaccional */}
            <SidebarMenuItem>
              <SidebarMenuButton
                isActive={activeTab === "transacciones"}
                onClick={() => handleParentClick("transacciones", "transacciones")}
                className="w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-lg cursor-pointer"
              >
                <Wallet className="h-4 w-4 shrink-0" />
                <span className="group-data-[collapsible=icon]:hidden">Actividad Transaccional</span>
                <ChevronRight className={cn(
                  "ml-auto h-3 w-3 group-data-[collapsible=icon]:hidden opacity-60 transition-transform",
                  openMenus["transacciones"] && "rotate-90"
                )} />
              </SidebarMenuButton>
              {openMenus["transacciones"] && (
                <SidebarMenuSub className="group-data-[collapsible=icon]:hidden">
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton
                      render={<Link href="/?tab=transacciones#flujo-transacciones" />}
                      className="text-xs text-zinc-550 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-150"
                    >
                      <span>Flujo de Transacciones</span>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton
                      render={<Link href="/?tab=transacciones#historial-movimientos" />}
                      className="text-xs text-zinc-550 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-150"
                    >
                      <span>Historial de Movimientos</span>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                </SidebarMenuSub>
              )}
            </SidebarMenuItem>

            {/* Ejecutivos y Riesgo - Collapsible submenu */}
            <SidebarMenuItem>
              <SidebarMenuButton
                isActive={activeTab === "ejecutivos"}
                onClick={() => handleParentClick("ejecutivos", "ejecutivos")}
                className="w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-lg cursor-pointer"
              >
                <Users className="h-4 w-4 shrink-0" />
                <span className="group-data-[collapsible=icon]:hidden">Ejecutivos y Riesgo</span>
                <ChevronRight className={cn(
                  "ml-auto h-3 w-3 group-data-[collapsible=icon]:hidden opacity-65 transition-transform",
                  openMenus["ejecutivos"] && "rotate-90"
                )} />
              </SidebarMenuButton>
              {openMenus["ejecutivos"] && (
                <SidebarMenuSub className="group-data-[collapsible=icon]:hidden">
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton
                      render={<Link href="/?tab=ejecutivos#mapa-riesgo" />}
                      className="text-xs text-zinc-550 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-150"
                    >
                      <span>Mapa de Riesgo</span>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton
                      render={<Link href="/?tab=ejecutivos#desempenio-ejecutivos" />}
                      className="text-xs text-zinc-550 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-150"
                    >
                      <span>Desempeño de Ejecutivos</span>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                </SidebarMenuSub>
              )}
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
  );
}

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { data: session } = useSession();
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } else {
      const isDark = document.documentElement.classList.contains('dark');
      setTheme(isDark ? 'dark' : 'light');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-zinc-50 dark:bg-[#07070a] font-sans transition-colors duration-200">
        <Sidebar collapsible="icon" className="border-r border-zinc-200/50 dark:border-zinc-800/50">
          {/* Logo / Header Dropdown */}
          <SidebarHeader className="p-2">
            <SidebarMenu>
              <SidebarMenuItem>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <SidebarMenuButton
                        size="lg"
                        className="w-full data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                      >
                        <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-zinc-950 text-sky-400 border border-zinc-800 shrink-0">
                          <Landmark className="h-4 w-4" />
                        </div>
                        <div className="grid flex-grow-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                          <span className="truncate font-semibold text-zinc-900 dark:text-zinc-50">
                            Banco Singular
                          </span>
                          <span className="truncate text-[10px] text-zinc-400 font-semibold tracking-wider uppercase mt-1">
                            Intranet Corporativa
                          </span>
                        </div>
                        <ChevronsUpDown className="ml-auto size-4 group-data-[collapsible=icon]:hidden text-zinc-400" />
                      </SidebarMenuButton>
                    }
                  />
                  <DropdownMenuContent
                    className="w-(--anchor-width) min-w-56 rounded-lg"
                    align="start"
                    side="bottom"
                    sideOffset={4}
                  >
                    <DropdownMenuGroup>
                      <DropdownMenuLabel className="text-xs text-muted-foreground">
                        Entidades Financieras
                      </DropdownMenuLabel>
                      <DropdownMenuItem className="gap-2 p-2">
                        <div className="flex size-6 items-center justify-center rounded-sm border">
                          <Landmark className="size-4 text-sky-400" />
                        </div>
                        Banco Singular
                        <DropdownMenuShortcut>Prod</DropdownMenuShortcut>
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarHeader>

          <Suspense fallback={
            <div className="px-2 py-4 space-y-3">
              <SidebarMenuSkeleton showIcon />
              <SidebarMenuSkeleton showIcon />
              <SidebarMenuSkeleton showIcon />
            </div>
          }>
            <DashboardSidebarContent />
          </Suspense>

          {/* Sidebar Footer with Dropdown Trigger */}
          <SidebarFooter className="p-2 border-t border-zinc-200/50 dark:border-zinc-800/50">
            <SidebarMenu>
              <SidebarMenuItem>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <SidebarMenuButton
                        size="lg"
                        className="w-full data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                      >
                        <div className="flex aspect-square size-8 items-center justify-center rounded-full bg-primary/10 text-primary dark:bg-zinc-800 dark:text-zinc-200 shrink-0">
                          <User className="size-4" />
                        </div>
                        <div className="grid flex-grow-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                          <span className="truncate font-semibold text-zinc-900 dark:text-zinc-50">
                            {session?.user?.name || "Usuario Confianza"}
                          </span>
                          <span className="truncate text-xs text-zinc-500 dark:text-zinc-405">
                            {session?.user?.email || "usuario@singular.pe"}
                          </span>
                        </div>
                        <ChevronsUpDown className="ml-auto size-4 group-data-[collapsible=icon]:hidden text-zinc-400" />
                      </SidebarMenuButton>
                    }
                  />
                  <DropdownMenuContent
                    className="w-(--anchor-width) min-w-56 rounded-lg"
                    align="start"
                    side="top"
                    sideOffset={4}
                  >
                    <DropdownMenuGroup>
                      <DropdownMenuLabel className="p-2 flex items-center justify-between gap-4">
                        <div className="flex flex-col gap-1.5 min-w-0">
                          <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 leading-none truncate">
                            {session?.user?.name || "Usuario Confianza"}
                          </span>
                          <span className="text-xs text-zinc-500 dark:text-zinc-400 leading-none truncate">
                            {session?.user?.email || "usuario@singular.pe"}
                          </span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {session?.user?.roles?.map((role) => (
                              <span
                                key={role}
                                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/50"
                              >
                                <Shield className="h-2.5 w-2.5" />
                                {role}
                              </span>
                            ))}
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={toggleTheme}
                          className="h-8 w-8 text-zinc-650 dark:text-zinc-350 border border-zinc-200 dark:border-zinc-800 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 cursor-pointer shrink-0"
                          title={theme === 'dark' ? 'Activar modo claro' : 'Activar modo oscuro'}
                        >
                          {theme === 'dark' ? (
                            <Sun className="h-4 w-4" />
                          ) : (
                            <Moon className="h-4 w-4" />
                          )}
                        </Button>
                      </DropdownMenuLabel>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="cursor-pointer gap-2 p-2 text-zinc-500 hover:text-red-650 dark:text-zinc-400 dark:hover:text-red-400 focus:bg-red-50 dark:focus:bg-red-950/20"
                      onClick={() => signOut({ callbackUrl: "/login" })}
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Cerrar Sesión</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        {/* Main Content Area */}
        <SidebarInset className="flex-1 flex flex-col min-w-0 bg-zinc-50 dark:bg-[#07070a]">
          {/* Top Navbar */}
          <header className="flex h-16 items-center justify-between border-b border-zinc-200 dark:border-zinc-900 bg-white/50 dark:bg-[#07070a]/50 backdrop-blur-md px-6 z-10 shrink-0">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-650 dark:text-zinc-350 hover:bg-zinc-100 dark:hover:bg-zinc-900" />
              <h2 className="text-sm font-bold text-zinc-800 dark:text-zinc-250 flex items-center gap-2">
                <span>Portal de Control Directivo</span>
                <span className="text-[10px] font-normal px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-500 dark:bg-zinc-850 dark:text-zinc-400">
                  PRODUCCIÓN
                </span>
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-xs text-zinc-450 dark:text-zinc-500 font-medium hidden sm:block">
                Corte Actual: {new Date().toLocaleDateString("es-PE")}
              </div>
            </div>
          </header>

          {/* Content Area */}
          <main className="flex-grow overflow-y-auto p-3 md:p-4">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
