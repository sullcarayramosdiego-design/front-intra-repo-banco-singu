"use client";

import { useState } from "react";
import { ActividadTransaccionalItem } from "../types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronUp, ChevronDown, Search } from "lucide-react";

interface TransaccionesTableProps {
  data: ActividadTransaccionalItem[];
}

type SortField = "periodo" | "canal" | "cantidad_transacciones" | "monto_total";
type SortOrder = "asc" | "desc";

export function TransaccionesTable({ data }: TransaccionesTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCanal, setSelectedCanal] = useState("all");
  const [sortField, setSortField] = useState<SortField>("periodo");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  // Obtener canales únicos
  const uniqueCanales = Array.from(new Set(data.map((item) => item.canal))).filter(Boolean);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  // Filtrado de la data
  const filteredData = data.filter((item) => {
    const matchesSearch =
      item.canal?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.periodo?.includes(searchTerm);
    const matchesCanal = selectedCanal === "all" || item.canal === selectedCanal;
    return matchesSearch && matchesCanal;
  });

  // Ordenación de la data
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
            placeholder="Buscar por periodo o canal..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-sm focus-visible:ring-1"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <Select value={selectedCanal} onValueChange={(val) => setSelectedCanal(val ?? "all")}>
            <SelectTrigger className="w-full sm:w-[180px] bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-sm">
              <SelectValue placeholder="Canal" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los Canales</SelectItem>
              {uniqueCanales.map((canal) => (
                <SelectItem key={canal} value={canal}>{canal}</SelectItem>
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
              <TableHead onClick={() => handleSort("periodo")} className="cursor-pointer font-bold select-none text-zinc-700 dark:text-zinc-300">
                Periodo <SortIcon field="periodo" />
              </TableHead>
              <TableHead onClick={() => handleSort("canal")} className="cursor-pointer font-bold select-none text-zinc-700 dark:text-zinc-300">
                Canal de Atención <SortIcon field="canal" />
              </TableHead>
              <TableHead onClick={() => handleSort("cantidad_transacciones")} className="cursor-pointer font-bold select-none text-zinc-700 dark:text-zinc-300 text-center">
                Cantidad Operaciones <SortIcon field="cantidad_transacciones" />
              </TableHead>
              <TableHead onClick={() => handleSort("monto_total")} className="cursor-pointer font-bold select-none text-zinc-700 dark:text-zinc-300 text-right">
                Monto Total Canalizado <SortIcon field="monto_total" />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-zinc-500">
                  No se encontraron movimientos transaccionales.
                </TableCell>
              </TableRow>
            ) : (
              sortedData.map((item, index) => (
                <TableRow key={index} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20 border-zinc-100 dark:border-zinc-800/50">
                  <TableCell className="font-semibold text-zinc-850 dark:text-zinc-200 font-mono">{item.periodo}</TableCell>
                  <TableCell className="text-zinc-750 dark:text-zinc-300 font-medium">{item.canal}</TableCell>
                  <TableCell className="text-center font-mono text-zinc-750 dark:text-zinc-300">{item.cantidad_transacciones.toLocaleString()}</TableCell>
                  <TableCell className="text-right font-mono font-bold text-zinc-850 dark:text-zinc-100">
                    {formatCurrency(item.monto_total)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
