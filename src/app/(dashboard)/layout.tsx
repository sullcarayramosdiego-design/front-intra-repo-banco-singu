"use client";

import { useState, useEffect, Suspense } from "react";
import { useSession } from "next-auth/react";
import { signOut } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  Landmark,
  ChevronRight,
  ChevronsUpDown,
  User,
  Shield,
  LogOut,
  Sun,
  Moon,
} from "lucide-react";
import { Button } from "@/shared/ui/button";
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
} from "@/shared/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuShortcut,
  DropdownMenuGroup,
} from "@/shared/ui/dropdown-menu";
import { SIDEBAR_MODULES } from "@/navigation/sidebar-config";

function DashboardSidebarContent() {
  const pathname = usePathname();
  const router = useRouter();

  // El módulo activo es el cuya href coincide con el inicio del pathname
  const activeKey = SIDEBAR_MODULES.find((m) => pathname.startsWith(m.href))?.key ?? SIDEBAR_MODULES[0].key;

  const [openMenus, setOpenMenus] = useState<{ [key: string]: boolean }>(() =>
    Object.fromEntries(SIDEBAR_MODULES.map((m) => [m.key, m.key === activeKey]))
  );

  const toggleMenu = (key: string) => {
    setOpenMenus((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleParentClick = (key: string, href: string) => {
    toggleMenu(key);
    router.push(href);
  };

  // Sync open state when pathname changes (navegación externa)
  useEffect(() => {
    setOpenMenus((prev) => ({ ...prev, [activeKey]: true }));
  }, [activeKey]);

  return (
    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupLabel className="text-[10px] font-bold uppercase tracking-widest px-2.5 mb-2 group-data-[collapsible=icon]:hidden opacity-60 text-sidebar-foreground">
          Módulos Analíticos
        </SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {SIDEBAR_MODULES.map((mod) => {
              const Icon = mod.icon;
              const isActive = activeKey === mod.key;
              const isOpen = openMenus[mod.key];

              return (
                <SidebarMenuItem key={mod.key}>
                  <SidebarMenuButton
                    isActive={isActive}
                    onClick={() => handleParentClick(mod.key, mod.href)}
                    className="w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-lg cursor-pointer"
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="group-data-[collapsible=icon]:hidden">{mod.label}</span>
                    <ChevronRight
                      className={cn(
                        "ml-auto h-3 w-3 group-data-[collapsible=icon]:hidden opacity-60 transition-transform duration-200",
                        isOpen && "rotate-90"
                      )}
                    />
                  </SidebarMenuButton>

                  {isOpen && (
                    <SidebarMenuSub className="group-data-[collapsible=icon]:hidden">
                      {mod.children.map((child) => (
                        <SidebarMenuSubItem key={child.label}>
                          <SidebarMenuSubButton
                            render={
                              <Link
                                href={child.hash ? `${child.href}#${child.hash}` : child.href}
                              />
                            }
                            className="text-xs text-sidebar-foreground/70 hover:text-sidebar-foreground"
                          >
                            <span>{child.label}</span>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  )}
                </SidebarMenuItem>
              );
            })}
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
      <div className="flex min-h-screen w-full bg-background font-sans transition-colors duration-200">
        <Sidebar collapsible="icon" className="border-r border-border/50">
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
                        <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-secondary text-primary-foreground border border-secondary/80 shrink-0">
                          <Landmark className="h-4 w-4" />
                        </div>
                        <div className="grid flex-grow-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                          <span className="truncate font-semibold text-sidebar-foreground">
                            Banco Singular
                          </span>
                          <span className="truncate text-[10px] font-semibold tracking-wider uppercase mt-1 text-sidebar-foreground/60">
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
                        <div className="flex size-6 items-center justify-center rounded-sm border border-border">
                          <Landmark className="size-4 text-primary" />
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
          <SidebarFooter className="p-2 border-t border-border/50">
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
                          <span className="truncate font-semibold text-sidebar-foreground">
                            {session?.user?.name || "Usuario Confianza"}
                          </span>
                          <span className="truncate text-xs text-sidebar-foreground/60">
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
                                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-medium bg-risk-normal/15 text-risk-normal border border-risk-normal/30"
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

            {/* Versión */}
            <p className="group-data-[collapsible=icon]:hidden text-center text-[10px] text-sidebar-foreground/30 pt-1 pb-0.5">
              Version v0.1.0
            </p>
          </SidebarFooter>


        </Sidebar>

        {/* Main Content Area */}
        <SidebarInset className="flex-1 flex flex-col min-w-0 bg-background">
          {/* Top Navbar */}
          <header className="flex h-16 items-center justify-between border-b border-border bg-card/50 backdrop-blur-md px-6 z-10 shrink-0">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="p-1.5 rounded-lg border border-border text-muted-foreground hover:bg-muted" />
              <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                <span>Portal de Control Directivo</span>
                <span className="text-[10px] font-normal px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
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
