"use client";

import { useState, Fragment, useMemo } from "react";
import { RiesgoCrediticioItem } from "../types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import { Map, MapControls, MapMarker, MarkerContent, MarkerTooltip } from "@/shared/ui/map";
import { BadgeAlert, MapPin, Activity } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

interface RiesgoMapProps {
  data: RiesgoCrediticioItem[];
}

const CLASIFICACIONES = ["NORMAL", "CPP", "DEFICIENTE", "DUDOSO", "PERDIDA"];

const COLORS: Record<string, string> = {
  NORMAL:    "bg-risk-normal text-risk-normal",
  CPP:       "bg-risk-cpp text-risk-cpp",
  DEFICIENTE:"bg-risk-deficiente text-risk-deficiente",
  DUDOSO:    "bg-risk-dudoso text-risk-dudoso",
  PERDIDA:   "bg-risk-perdida text-risk-perdida",
};

const CELL_BG: Record<string, string> = {
  NORMAL:    "bg-risk-normal/10 text-risk-normal border-risk-normal/20",
  CPP:       "bg-risk-cpp/10 text-risk-cpp border-risk-cpp/20",
  DEFICIENTE:"bg-risk-deficiente/10 text-risk-deficiente border-risk-deficiente/20",
  DUDOSO:    "bg-risk-dudoso/10 text-risk-dudoso border-risk-dudoso/20",
  PERDIDA:   "bg-risk-perdida/10 text-risk-perdida border-risk-perdida/20",
};

// Coordenadas de las principales regiones de Perú para los marcadores consolidados
const REGION_COORDS: Record<string, [number, number][]> = {
  "LIMA METROPOLITANA": [
    [-77.04279, -12.04637], // Centro Cercado de Lima
  ],
  "CENTRO": [
    [-75.2090, -12.0650],    // Huancayo
  ],
  "NORTE": [
    [-79.0290, -8.1120],     // Trujillo
  ],
  "ORIENTE": [
    [-73.2500, -3.7500],     // Iquitos / Oriente
  ],
  "SUR": [
    [-71.5375, -16.4090],    // Arequipa
  ],
};

// Coordenadas exactas por cada Zona según la base de datos y la distribución geográfica
const ZONA_COORDS: Record<string, [number, number]> = {
  // Lima Metropolitana (Centro de cada Zona especificado por el usuario)
  "ZONA LIMA MODERNA": [-77.04279, -12.04637], // Lima Centro (Eje histórico y administrativo)
  "ZONA LIMA NORTE":   [-77.06583, -11.92833], // Lima Norte (Los Olivos y Comas)
  "ZONA LIMA SUR":     [-76.95333, -12.18167], // Lima Sur (San Juan de Miraflores y VMT)
  "ZONA LIMA ESTE":    [-76.96695, -12.08397], // Lima Oriente / Este (Ate, Santa Anita, La Molina)

  // Centro
  "ZONA CENTRO":       [-75.2090, -12.0650],   // Huancayo

  // Norte
  "ZONA NORTE A":      [-79.0290, -8.1120],    // Trujillo
  "ZONA NORTE B":      [-80.6310, -5.1940],    // Piura

  // Oriente
  "ZONA ORIENTE":      [-73.2500, -3.7500],    // Iquitos / Oriente

  // Sur
  "ZONA SUR A":        [-71.5375, -16.4090],   // Arequipa
  "ZONA SUR B":        [-70.0219, -15.8402],   // Puno
};

// Color del marcador según clasificación dominante de la región
// Usamos hex directos para evitar problemas con WebGL / canvas de MapLibre
const RISK_MARKER_COLOR: Record<string, string> = {
  NORMAL:     "#22c55e",  // green-500
  CPP:        "#f59e0b",  // amber-500
  DEFICIENTE: "#f97316",  // orange-500
  DUDOSO:     "#ef4444",  // red-500
  PERDIDA:    "#7f1d1d",  // red-950
};

function getRiskLevel(clasificaciones: Record<string, number>): string {
  let dominantClass = "NORMAL";
  let maxSaldo = -1;

  for (const cls of ["NORMAL", "CPP", "DEFICIENTE", "DUDOSO", "PERDIDA"]) {
    const saldo = clasificaciones[cls] || 0;
    if (saldo > maxSaldo) {
      maxSaldo = saldo;
      dominantClass = cls;
    }
  }
  return dominantClass;
}

export function RiesgoMap({ data }: RiesgoMapProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeRegion = searchParams.get('region');

  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);

  const handleFilter = (key: string, value: string) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    if (current.get(key) === value) {
      current.delete(key);
    } else {
      current.set(key, value);
    }
    const search = current.toString();
    const query = search ? `?${search}` : "";
    router.push(`/riesgos${query}`);
  };

  // 1. Agrupar saldos por Clasificación de Cartera
  const totalSaldoEnRiesgo = data.reduce((acc, curr) => acc + Math.abs(curr.saldo_total || 0), 0);

  const clasificacionMap = data.reduce((acc, curr) => {
    const cls = curr.clasificacion_cartera || "NORMAL";
    acc[cls] = (acc[cls] || 0) + Math.abs(curr.saldo_total || 0);
    return acc;
  }, {} as Record<string, number>);

  interface MatrixRow {
    region: string;
    total: number;
    [key: string]: string | number;
  }

  // 2. Agrupar por Región y Clasificación para la Matriz
  const regiones = Array.from(new Set(data.map((item) => item.region))).filter(Boolean);

  const matrixData = regiones.map((region) => {
    const regionItems = data.filter((item) => item.region === region);
    const row: MatrixRow = { region, total: 0 };

    CLASIFICACIONES.forEach((cls) => {
      const saldo = regionItems.filter((i) => i.clasificacion_cartera === cls)
        .reduce((sum, curr) => sum + Math.abs(curr.saldo_total || 0), 0);
      row[cls] = saldo;
      row.total += saldo;
    });

    return row;
  }).sort((a, b) => b.total - a.total);

  // 3. Construir GeoJSON para clusters del mapa (agrupado por Zona real de la BD)
  const zonaGroups = data.reduce((acc, item) => {
    const key = `${item.region}__${item.zona}`;
    if (!acc[key]) {
      acc[key] = {
        region: item.region,
        zona: item.zona,
        saldo: 0,
        clasificaciones: {} as Record<string, number>
      };
    }
    acc[key].saldo += Math.abs(item.saldo_total || 0);
    const cls = item.clasificacion_cartera || "NORMAL";
    acc[key].clasificaciones[cls] = (acc[key].clasificaciones[cls] || 0) + Math.abs(item.saldo_total || 0);
    return acc;
  }, {} as Record<string, { region: string; zona: string; saldo: number; clasificaciones: Record<string, number> }>);

  const { minZonaSaldo, maxZonaSaldo } = useMemo(() => {
    const saldos = Object.values(zonaGroups).map(zg => zg.saldo);
    if (saldos.length === 0) return { minZonaSaldo: 0, maxZonaSaldo: 1 };
    return {
      minZonaSaldo: Math.min(...saldos),
      maxZonaSaldo: Math.max(...saldos, 1),
    };
  }, [zonaGroups]);

  // Escala lineal entre min y max reales: rango 14px → 68px
  const getMarkerSize = (saldo: number) => {
    const MIN_PX = 14;
    const MAX_PX = 68;
    const range = maxZonaSaldo - minZonaSaldo;
    if (range === 0) return (MIN_PX + MAX_PX) / 2;
    const ratio = (saldo - minZonaSaldo) / range;
    return MIN_PX + ratio * (MAX_PX - MIN_PX);
  };

  // Abrevia el saldo para mostrarlo dentro de la burbuja (p.ej: 215M, 4.5M, 830K)
  const abbreviateSaldo = (saldo: number): string => {
    if (saldo >= 1_000_000_000) return `${(saldo / 1_000_000_000).toFixed(1)}B`;
    if (saldo >= 1_000_000) return `${(saldo / 1_000_000).toFixed(1)}M`;
    if (saldo >= 1_000) return `${(saldo / 1_000).toFixed(0)}K`;
    return `${saldo.toFixed(0)}`;
  };

  const clusterGeoJSON: GeoJSON.FeatureCollection<GeoJSON.Point, { region: string; zona: string; riesgo: string; saldo: number }> = {
    type: "FeatureCollection",
    features: Object.values(zonaGroups).map((group) => {
      const keyUpper = (group.zona || "").toUpperCase();
      const coord = ZONA_COORDS[keyUpper] ||
                    REGION_COORDS[group.region.toUpperCase()]?.[0] ||
                    [-77.0428, -12.0464];

      const riesgo = getRiskLevel(group.clasificaciones);

      return {
        type: "Feature" as const,
        properties: {
          region: group.region,
          zona: group.zona,
          riesgo,
          saldo: group.saldo,
        },
        geometry: { type: "Point" as const, coordinates: coord },
      };
    }),
  };

  const formatCurrency = (value: number) => {
    if (value === 0) return "-";
    return new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN", maximumFractionDigits: 0 }).format(value);
  };

  const getPercentage = (value: number) => {
    if (totalSaldoEnRiesgo === 0) return 0;
    return (value / totalSaldoEnRiesgo) * 100;
  };

  return (
    <div className="space-y-6">

      {/* Grid de Resúmenes de Riesgo Crediticio */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {/* 1. Cartera Total */}
        <Card className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md border-zinc-150 dark:border-zinc-800">
          <CardHeader className="pb-1 pt-4 px-4">
            <CardTitle className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-sky-500" />
              Cartera Total
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-xl font-bold font-mono text-zinc-850 dark:text-zinc-100">
              {formatCurrency(totalSaldoEnRiesgo)}
            </div>
            <p className="text-[10px] text-zinc-400 mt-0.5">100% del portafolio</p>
            <div className="w-full bg-zinc-200 dark:bg-zinc-855 h-1 rounded-full mt-2 overflow-hidden">
              <div className="h-1 rounded-full bg-sky-500" style={{ width: "100%" }} />
            </div>
          </CardContent>
        </Card>

        {/* 2. Cartera Normal */}
        <Card className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md border-zinc-150 dark:border-zinc-800">
          <CardHeader className="pb-1 pt-4 px-4">
            <CardTitle className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              Normal
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-xl font-bold font-mono text-zinc-850 dark:text-zinc-100">
              {formatCurrency(clasificacionMap["NORMAL"] || 0)}
            </div>
            <p className="text-[10px] text-zinc-400 mt-0.5">{getPercentage(clasificacionMap["NORMAL"] || 0).toFixed(1)}% del total</p>
            <div className="w-full bg-zinc-200 dark:bg-zinc-855 h-1 rounded-full mt-2 overflow-hidden">
              <div className="h-1 rounded-full bg-emerald-500" style={{ width: `${getPercentage(clasificacionMap["NORMAL"] || 0)}%` }} />
            </div>
          </CardContent>
        </Card>

        {/* 3. Cartera CPP */}
        <Card className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md border-zinc-150 dark:border-zinc-800">
          <CardHeader className="pb-1 pt-4 px-4">
            <CardTitle className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
              CPP (Vigilancia)
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-xl font-bold font-mono text-zinc-850 dark:text-zinc-100">
              {formatCurrency(clasificacionMap["CPP"] || 0)}
            </div>
            <p className="text-[10px] text-zinc-400 mt-0.5">{getPercentage(clasificacionMap["CPP"] || 0).toFixed(1)}% del total</p>
            <div className="w-full bg-zinc-200 dark:bg-zinc-855 h-1 rounded-full mt-2 overflow-hidden">
              <div className="h-1 rounded-full bg-amber-500" style={{ width: `${getPercentage(clasificacionMap["CPP"] || 0)}%` }} />
            </div>
          </CardContent>
        </Card>

        {/* 4. Cartera Crítica */}
        <Card className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md border-zinc-150 dark:border-zinc-800">
          <CardHeader className="pb-1 pt-4 px-4">
            <CardTitle className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
              Crítica (Deficiente)
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-xl font-bold font-mono text-zinc-850 dark:text-zinc-100">
              {formatCurrency(clasificacionMap["DEFICIENTE"] || 0)}
            </div>
            <p className="text-[10px] text-zinc-400 mt-0.5">{getPercentage(clasificacionMap["DEFICIENTE"] || 0).toFixed(1)}% del total</p>
            <div className="w-full bg-zinc-200 dark:bg-zinc-855 h-1 rounded-full mt-2 overflow-hidden">
              <div className="h-1 rounded-full bg-rose-500" style={{ width: `${getPercentage(clasificacionMap["DEFICIENTE"] || 0)}%` }} />
            </div>
          </CardContent>
        </Card>

        {/* 5. Índice de Morosidad */}
        <Card className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md border-zinc-150 dark:border-zinc-800">
          <CardHeader className="pb-1 pt-4 px-4">
            <CardTitle className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-red-750" />
              Mora Crítica
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-xl font-bold font-mono text-rose-600 dark:text-rose-400">
              {(totalSaldoEnRiesgo > 0 ? ((clasificacionMap["DEFICIENTE"] || 0) / totalSaldoEnRiesgo) * 100 : 0).toFixed(1)}%
            </div>
            <p className="text-[10px] text-zinc-400 mt-0.5">Mora Crítica / Total</p>
            <div className="w-full bg-zinc-200 dark:bg-zinc-855 h-1 rounded-full mt-2 overflow-hidden">
              <div className="h-1 rounded-full bg-rose-600" style={{ width: `${totalSaldoEnRiesgo > 0 ? ((clasificacionMap["DEFICIENTE"] || 0) / totalSaldoEnRiesgo) * 100 : 0}%` }} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mapa Interactivo + Matriz */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Mapa de Riesgo Geoespacial */}
        <Card className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md border-zinc-150 dark:border-zinc-800 lg:col-span-3 overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="text-zinc-850 dark:text-zinc-100 text-base font-bold flex items-center gap-2">
              <MapPin className="h-5 w-5 text-sky-500" />
              Distribución Geográfica de Riesgo
            </CardTitle>
            <CardDescription>
              Agencias por región coloreadas según nivel de riesgo crediticio dominante
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-[420px] w-full">
              <Map
                center={[-75.0, -10.5]}
                zoom={5}
                className="rounded-b-xl"
              >
                {/* Marcadores individuales por cada Zona */}
                {Object.values(zonaGroups).map((zg) => {
                  const keyUpper = (zg.zona || "").toUpperCase();
                  const coord = ZONA_COORDS[keyUpper] ||
                                REGION_COORDS[zg.region.toUpperCase()]?.[0] ||
                                [-77.0428, -12.0464];
                  const riesgo = getRiskLevel(zg.clasificaciones);

                  return (
                    <MapMarker
                      key={zg.zona}
                      longitude={coord[0]}
                      latitude={coord[1]}
                      onClick={() => {
                        setSelectedRegion(zg.region === selectedRegion ? null : zg.region);
                        handleFilter('region', zg.region);
                      }}
                    >
                      <MarkerContent>
                        {(() => {
                          const size = getMarkerSize(zg.saldo);
                          const showLabel = size >= 30;
                          const fontSize = size < 36 ? "8px" : size < 50 ? "9px" : "10px";
                          return (
                            <div
                              className="flex flex-col items-center justify-center rounded-full border-2 border-white/80 shadow-xl transition-transform hover:scale-110 cursor-pointer select-none"
                              style={{
                                backgroundColor: RISK_MARKER_COLOR[riesgo],
                                width: `${size}px`,
                                height: `${size}px`,
                                boxShadow: `0 0 0 3px ${RISK_MARKER_COLOR[riesgo]}33, 0 4px 12px rgba(0,0,0,0.35)`,
                              }}
                            >
                              {showLabel && (
                                <>
                                  <span
                                    className="font-bold text-white leading-none"
                                    style={{ fontSize }}
                                  >
                                    S/{abbreviateSaldo(zg.saldo)}
                                  </span>
                                  <span
                                    className="text-white/80 leading-none mt-0.5"
                                    style={{ fontSize: "7px" }}
                                  >
                                    {(zg.zona || "").replace(/^ZONA /i, "")}
                                  </span>
                                </>
                              )}
                            </div>
                          );
                        })()}
                      </MarkerContent>
                      <MarkerTooltip>
                        <div className="text-xs font-semibold">{zg.zona}</div>
                        <div className="text-[10px] mt-0.5 opacity-80">
                          {formatCurrency(zg.saldo)}
                        </div>
                        <div
                          className="text-[9px] mt-0.5 font-bold uppercase tracking-wider"
                          style={{ color: RISK_MARKER_COLOR[riesgo] }}
                        >
                          {riesgo}
                        </div>
                      </MarkerTooltip>
                    </MapMarker>
                  );
                })}

                <MapControls position="bottom-right" showZoom showFullscreen />
              </Map>
            </div>

            {/* Leyenda */}
            <div className="flex flex-wrap gap-3 px-4 py-3 border-t border-zinc-100 dark:border-zinc-800/60">
              {Object.entries(RISK_MARKER_COLOR).map(([nivel, color]) => (
                <div key={nivel} className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full border border-white shadow-sm" style={{ backgroundColor: color }} />
                  <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">{nivel}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Matriz de Riesgo por Región */}
        <Card className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md border-zinc-150 dark:border-zinc-800 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-zinc-850 dark:text-zinc-100 text-base font-bold flex items-center gap-2">
              <BadgeAlert className="h-5 w-5 text-zinc-500" />
              Exposición por Región
            </CardTitle>
            <CardDescription>
              Saldo (S/) por región y clasificación de cartera
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-zinc-100/40 dark:bg-zinc-800/20">
                  <TableRow>
                    <TableHead className="font-bold text-zinc-700 dark:text-zinc-300 text-xs pl-4">Región</TableHead>
                    <TableHead className="text-right font-bold text-zinc-800 dark:text-zinc-200 text-xs pr-4">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {matrixData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={2} className="h-24 text-center text-zinc-500">
                        Sin datos disponibles.
                      </TableCell>
                    </TableRow>
                  ) : (
                    matrixData.map((row) => {
                      const isSelected = selectedRegion === row.region;
                      const clasificaciones = CLASIFICACIONES.reduce((acc, cls) => {
                        acc[cls] = row[cls] as number;
                        return acc;
                      }, {} as Record<string, number>);
                      const riesgo = getRiskLevel(clasificaciones);

                      return (
                        <Fragment key={row.region}>
                          <TableRow
                            className={`border-zinc-100 dark:border-zinc-800/50 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/10 cursor-pointer transition-colors ${isSelected ? "bg-sky-50/50 dark:bg-sky-950/10" : ""}`}
                            onClick={() => {
                              setSelectedRegion(isSelected ? null : row.region);
                              handleFilter('region', row.region);
                            }}
                          >
                            <TableCell className="pl-4">
                              <div className="flex items-center gap-2">
                                <span
                                  className="h-2 w-2 rounded-full shrink-0"
                                  style={{ backgroundColor: RISK_MARKER_COLOR[riesgo] }}
                                />
                                <span className="font-semibold text-zinc-800 dark:text-zinc-200 text-xs">{row.region}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right font-mono font-bold text-zinc-900 dark:text-zinc-100 text-xs pr-4">
                              {formatCurrency(row.total)}
                            </TableCell>
                          </TableRow>
                          {isSelected && (
                            <TableRow className="bg-zinc-50/80 dark:bg-zinc-900/30">
                              <TableCell colSpan={2} className="pl-4 pr-4 pb-3">
                                <div className="grid grid-cols-1 gap-1 mt-1">
                                  {CLASIFICACIONES.map((cls) => {
                                    const val = row[cls] as number;
                                    if (val === 0) return null;
                                    return (
                                      <div key={cls} className="flex items-center justify-between">
                                        <span className={`text-[10px] font-semibold uppercase ${CELL_BG[cls].split(" ")[1]}`}>
                                          {cls}
                                        </span>
                                        <span className="text-[10px] font-mono text-zinc-600 dark:text-zinc-400">
                                          {formatCurrency(val)}
                                        </span>
                                      </div>
                                    );
                                  })}
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </Fragment>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actividad por Zona */}
      <Card className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md border-zinc-150 dark:border-zinc-800">
        <CardHeader>
          <CardTitle className="text-zinc-850 dark:text-zinc-100 text-base font-bold flex items-center gap-2">
            <Activity className="h-5 w-5 text-indigo-500" />
            Actividad Transaccional por Zona
          </CardTitle>
          <CardDescription>
            Volumen y monto transaccional generado por ejecutivos agrupado por zona
          </CardDescription>
        </CardHeader>
        <CardContent>
          {(() => {
            const zonaMap = data.reduce((acc, curr) => {
              const key = `${curr.zona}__${curr.region}`;
              if (!acc[key]) {
                acc[key] = { zona: curr.zona, region: curr.region, volumen: 0, monto: 0, cuentas: 0, saldo: 0 };
              }
              acc[key].volumen += curr.transacciones_volumen;
              acc[key].monto += curr.transacciones_monto;
              acc[key].cuentas += curr.total_cuentas;
              acc[key].saldo += curr.saldo_total;
              return acc;
            }, {} as Record<string, { zona: string; region: string; volumen: number; monto: number; cuentas: number; saldo: number }>);

            const zonas = Object.values(zonaMap).sort((a, b) => b.monto - a.monto);
            const maxMonto = zonas[0]?.monto || 1;

            return (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {zonas.map((item) => (
                  <div
                    key={item.zona}
                    className="flex flex-col p-3 rounded-xl border border-zinc-150 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-950/20 hover:scale-[1.01] transition-all"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-zinc-800 dark:text-zinc-200 text-xs truncate max-w-[130px]">{item.zona}</span>
                      <span className="text-[10px] text-zinc-400 font-semibold uppercase">{item.region}</span>
                    </div>
                    {/* Barra de monto relativo */}
                    <div className="w-full bg-muted h-1 rounded-full mt-2 overflow-hidden">
                      <div
                        className="h-1 rounded-full bg-primary"
                        style={{ width: `${(item.monto / maxMonto) * 100}%` }}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-zinc-100 dark:border-zinc-800/50">
                      <div>
                        <div className="text-[9px] uppercase tracking-wider text-zinc-400">Operaciones</div>
                        <div className="text-xs font-mono font-bold text-zinc-750 dark:text-zinc-300 mt-0.5">{item.volumen.toLocaleString("es-PE")} ops</div>
                      </div>
                      <div>
                        <div className="text-[9px] uppercase tracking-wider text-zinc-400">Monto Total</div>
                        <div className="text-xs font-mono font-bold text-sky-600 dark:text-sky-400 mt-0.5">{formatCurrency(item.monto)}</div>
                      </div>
                      <div>
                        <div className="text-[9px] uppercase tracking-wider text-zinc-400">Ctas. Crédito</div>
                        <div className="text-xs font-mono font-bold text-zinc-750 dark:text-zinc-300 mt-0.5">{item.cuentas}</div>
                      </div>
                      <div>
                        <div className="text-[9px] uppercase tracking-wider text-zinc-400">Saldo Crédito</div>
                        <div className="text-xs font-mono font-bold text-red-500 mt-0.5">{formatCurrency(item.saldo)}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
        </CardContent>
      </Card>
    </div>
  );
}
