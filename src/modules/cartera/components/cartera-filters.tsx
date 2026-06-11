"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Filter, MapPin, Briefcase } from "lucide-react";

// Estos filtros son visuales por ahora, preparan la estructura para filtrar localmente o enviar parámetros al backend.
export function CarteraFilters() {
  return (
    <Card className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md border-zinc-150 dark:border-zinc-800 shadow-sm sticky top-24">
      <CardHeader className="pb-4 border-b border-border/50">
        <CardTitle className="text-zinc-850 dark:text-zinc-100 flex items-center gap-2 text-base font-bold">
          <Filter className="h-4 w-4 text-zinc-500" />
          Filtros de Cartera
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 space-y-6">
        
        {/* Filtro de Región */}
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <MapPin className="h-3 w-3" />
            Región
          </label>
          <select className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50">
            <option value="">Todas las regiones</option>
            <option value="NORTE">Norte</option>
            <option value="SUR">Sur</option>
            <option value="CENTRO">Centro</option>
            <option value="LIMA">Lima</option>
          </select>
        </div>

        {/* Filtro de Segmento */}
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <Briefcase className="h-3 w-3" />
            Segmento
          </label>
          <select className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50">
            <option value="">Todos los segmentos</option>
            <option value="VIP">VIP</option>
            <option value="PREMIUM">Premium</option>
            <option value="MASIVO">Masivo</option>
            <option value="PYME">Pyme</option>
          </select>
        </div>

        <button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2 rounded-md text-sm font-medium transition-colors">
          Aplicar Filtros
        </button>

      </CardContent>
    </Card>
  );
}
