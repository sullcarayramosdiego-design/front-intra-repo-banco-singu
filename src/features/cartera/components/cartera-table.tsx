"use client";

import { useState } from "react";
import { CarteraActivaItem } from "../types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronUp, ChevronDown, Search } from "lucide-react";

interface CarteraTableProps {
  data: CarteraActivaItem[];
}

type SortField = "tipo_producto" | "region" | "total_cuentas" | "saldo_total";
type SortOrder = "asc" | "desc";

export function CarteraTable({ data }: CarteraTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [sortField, setSortField] = useState<SortField>("saldo_total");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  // Obtener regiones únicas para el filtro
  const uniqueRegions = Array.from(new Set(data.map((item) => item.region))).filter(Boolean);

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
      item.tipo_producto?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.region?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRegion = selectedRegion === "all" || item.region === selectedRegion;
    return matchesSearch && matchesRegion;
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
            placeholder="Buscar por tipo de producto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-sm focus-visible:ring-1"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
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
              <TableHead onClick={() => handleSort("tipo_producto")} className="cursor-pointer font-bold select-none text-zinc-700 dark:text-zinc-300">
                Tipo Producto <SortIcon field="tipo_producto" />
              </TableHead>
              <TableHead onClick={() => handleSort("region")} className="cursor-pointer font-bold select-none text-zinc-700 dark:text-zinc-300 text-center">
                Región Comercial <SortIcon field="region" />
              </TableHead>
              <TableHead onClick={() => handleSort("total_cuentas")} className="cursor-pointer font-bold select-none text-zinc-700 dark:text-zinc-300 text-center">
                Total Cuentas <SortIcon field="total_cuentas" />
              </TableHead>
              <TableHead onClick={() => handleSort("saldo_total")} className="cursor-pointer font-bold select-none text-zinc-700 dark:text-zinc-300 text-right">
                Saldo Administrado <SortIcon field="saldo_total" />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-zinc-500">
                  No se encontraron registros de cartera activa.
                </TableCell>
              </TableRow>
            ) : (
              sortedData.map((item, index) => (
                <TableRow key={index} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20 border-zinc-100 dark:border-zinc-800/50">
                  <TableCell className="font-semibold text-zinc-850 dark:text-zinc-200">
                    <div className="uppercase tracking-wide text-xs">{item.tipo_producto.replace(/_/g, " ")}</div>
                  </TableCell>
                  <TableCell className="text-center text-zinc-650 dark:text-zinc-300">{item.region}</TableCell>
                  <TableCell className="text-center font-mono text-zinc-800 dark:text-zinc-300">{item.total_cuentas}</TableCell>
                  <TableCell className={`text-right font-semibold font-mono ${item.saldo_total < 0 ? 'text-red-500' : 'text-zinc-900 dark:text-zinc-50'}`}>
                    {formatCurrency(item.saldo_total)}
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
