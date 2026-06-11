"use client";

import { useState } from "react";
import { DesempenioEjecutivoItem } from "../types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import { Input } from "@/shared/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { ChevronUp, ChevronDown, Search, Award } from "lucide-react";

interface EjecutivosTableProps {
  data: DesempenioEjecutivoItem[];
}

type SortField = "nombre_ejecutivo" | "zona" | "region" | "cantidad_transacciones" | "monto_total";
type SortOrder = "asc" | "desc";

export function EjecutivosTable({ data }: EjecutivosTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [sortField, setSortField] = useState<SortField>("monto_total");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  const uniqueRegions = Array.from(new Set(data.map((item) => item.region))).filter(Boolean);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  // Filtrado de ejecutivos
  const filteredData = data.filter((item) => {
    const matchesSearch =
      item.nombre_ejecutivo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.zona?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRegion = selectedRegion === "all" || item.region === selectedRegion;
    return matchesSearch && matchesRegion;
  });

  // Ordenación de ejecutivos
  const sortedData = [...filteredData].sort((a, b) => {
    let aVal = a[sortField];
    let bVal = b[sortField];

    if (typeof aVal === "string") {
      aVal = aVal.toLowerCase();
      bVal = (bVal as string).toLowerCase();
    }

    if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
    if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" }).format(value);
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortOrder === "asc" ? <ChevronUp className="h-4 w-4 inline ml-1 text-zinc-500" /> : <ChevronDown className="h-4 w-4 inline ml-1 text-zinc-500" />;
  };

  return (
    <div className="space-y-4">
      {/* Controles de Filtros */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white/40 dark:bg-zinc-900/40 p-4 rounded-xl border border-zinc-150 dark:border-zinc-800 backdrop-blur-md">
        <div className="relative w-full md:max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
          <Input
            placeholder="Buscar por ejecutivo o zona..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-sm focus-visible:ring-1"
          />
        </div>

        <div>
          <Select value={selectedRegion} onValueChange={(val) => setSelectedRegion(val ?? "all")}>
            <SelectTrigger className="w-full sm:w-[180px] bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-sm">
              <SelectValue placeholder="Región" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las Regiones</SelectItem>
              {uniqueRegions.map((region) => (
                <SelectItem key={region} value={region}>{region}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tabla */}
      <div className="rounded-xl border border-zinc-150 dark:border-zinc-800 overflow-hidden bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md">
        <Table>
          <TableHeader className="bg-zinc-100/50 dark:bg-zinc-800/40">
            <TableRow>
              <TableHead className="w-[80px] font-bold text-center text-zinc-700 dark:text-zinc-300">Rango</TableHead>
              <TableHead onClick={() => handleSort("nombre_ejecutivo")} className="cursor-pointer font-bold select-none text-zinc-700 dark:text-zinc-300">
                Ejecutivo <SortIcon field="nombre_ejecutivo" />
              </TableHead>
              <TableHead onClick={() => handleSort("zona")} className="cursor-pointer font-bold select-none text-zinc-700 dark:text-zinc-300">
                Zona <SortIcon field="zona" />
              </TableHead>
              <TableHead onClick={() => handleSort("region")} className="cursor-pointer font-bold select-none text-zinc-700 dark:text-zinc-300 text-center">
                Región <SortIcon field="region" />
              </TableHead>
              <TableHead onClick={() => handleSort("cantidad_transacciones")} className="cursor-pointer font-bold select-none text-zinc-700 dark:text-zinc-300 text-center">
                Operaciones <SortIcon field="cantidad_transacciones" />
              </TableHead>
              <TableHead onClick={() => handleSort("monto_total")} className="cursor-pointer font-bold select-none text-zinc-700 dark:text-zinc-300 text-right">
                Monto Transaccionado <SortIcon field="monto_total" />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-zinc-500">
                  No se encontraron ejecutivos.
                </TableCell>
              </TableRow>
            ) : (
              sortedData.map((item, index) => {
                const isTop1 = index === 0 && sortField === "monto_total" && sortOrder === "desc";
                return (
                  <TableRow key={item.ejecutivo_id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20 border-zinc-100 dark:border-zinc-800/50">
                    <TableCell className="text-center font-bold text-zinc-500">
                      {isTop1 ? (
                        <div className="flex justify-center items-center">
                          <Award className="h-5 w-5 text-amber-500" />
                        </div>
                      ) : (
                        `#${index + 1}`
                      )}
                    </TableCell>
                    <TableCell className="font-semibold text-zinc-900 dark:text-zinc-100">
                      {item.nombre_ejecutivo}
                    </TableCell>
                    <TableCell className="text-zinc-600 dark:text-zinc-400">{item.zona}</TableCell>
                    <TableCell className="text-center text-zinc-650 dark:text-zinc-300">{item.region}</TableCell>
                    <TableCell className="text-center font-mono text-zinc-750 dark:text-zinc-300">{item.cantidad_transacciones.toLocaleString("es-PE")}</TableCell>
                    <TableCell className="text-right font-mono font-bold text-zinc-900 dark:text-zinc-50">
                      {formatCurrency(item.monto_total)}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
