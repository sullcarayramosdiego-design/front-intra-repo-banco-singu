"use client";

import { useState, Fragment } from "react";
import { RiesgoCrediticioItem } from "../types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import { Map, MapControls, MapMarker, MarkerContent, MarkerTooltip, MapClusterLayer } from "@/shared/ui/map";
import { ShieldAlert, BadgeAlert, MapPin, Activity } from "lucide-react";

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

// Coordenadas de las principales regiones de Perú con agencias simuladas
const REGION_COORDS: Record<string, [number, number][]> = {
  LIMA: [
    [-77.0428, -12.0464],
    [-77.0700, -12.1010],
    [-76.9600, -12.0900],
    [-77.1200, -12.0600],
    [-77.0100, -11.9800],
    [-77.0800, -12.1500],
    [-76.9200, -12.1100],
    [-77.0500, -12.0100],
  ],
  AREQUIPA: [
    [-71.5375, -16.4090],
    [-71.5600, -16.4300],
    [-71.5100, -16.3900],
    [-71.5800, -16.3700],
  ],
  CUSCO: [
    [-71.9675, -13.5170],
    [-72.0000, -13.5500],
    [-71.9300, -13.5000],
    [-71.9900, -13.4800],
  ],
  TRUJILLO: [
    [-79.0290, -8.1120],
    [-79.0600, -8.1400],
    [-79.0000, -8.0900],
    [-79.0400, -8.0700],
  ],
  PIURA: [
    [-80.6310, -5.1940],
    [-80.6600, -5.2200],
    [-80.6000, -5.1700],
    [-80.6800, -5.1500],
  ],
  CHICLAYO: [
    [-79.8440, -6.7714],
    [-79.8700, -6.7900],
    [-79.8200, -6.7500],
    [-79.8600, -6.8100],
  ],
  HUANCAYO: [
    [-75.2090, -12.0650],
    [-75.2300, -12.0900],
    [-75.1900, -12.0400],
    [-75.2500, -12.0200],
  ],
  ICA: [
    [-75.7280, -14.0680],
    [-75.7500, -14.0900],
    [-75.7000, -14.0400],
    [-75.7600, -14.0100],
  ],
  PUNO: [
    [-70.0219, -15.8402],
    [-70.0500, -15.8700],
    [-69.9900, -15.8100],
    [-70.0700, -15.8000],
  ],
  TACNA: [
    [-70.2510, -18.0060],
    [-70.2800, -18.0300],
    [-70.2200, -17.9800],
    [-70.2600, -18.0500],
  ],
};

// Color del marcador según clasificación dominante de la región
const RISK_MARKER_COLOR: Record<string, string> = {
  NORMAL:     "var(--risk-normal)",
  CPP:        "var(--risk-cpp)",
  DEFICIENTE: "var(--risk-deficiente)",
  DUDOSO:     "var(--risk-dudoso)",
  PERDIDA:    "var(--risk-perdida)",
};

function getRiskLevel(clasificaciones: Record<string, number>): string {
  for (const cls of ["PERDIDA", "DUDOSO", "DEFICIENTE", "CPP", "NORMAL"]) {
    if ((clasificaciones[cls] || 0) > 0) return cls;
  }
  return "NORMAL";
}

export function RiesgoMap({ data }: RiesgoMapProps) {
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);

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

  // 3. Construir GeoJSON para clusters del mapa
  const clusterGeoJSON: GeoJSON.FeatureCollection<GeoJSON.Point, { region: string; zona: string; riesgo: string; saldo: number }> = {
    type: "FeatureCollection",
    features: regiones.flatMap((region) => {
      const regionItems = data.filter((item) => item.region === region);
      const clasificaciones = regionItems.reduce((acc, curr) => {
        acc[curr.clasificacion_cartera] = (acc[curr.clasificacion_cartera] || 0) + Math.abs(curr.saldo_total || 0);
        return acc;
      }, {} as Record<string, number>);
      const riesgo = getRiskLevel(clasificaciones);
      const saldoRegion = regionItems.reduce((acc, curr) => acc + Math.abs(curr.saldo_total || 0), 0);

      const coords = REGION_COORDS[region.toUpperCase()] || [[-77.0428 + Math.random() * 4 - 2, -12.0464 + Math.random() * 4 - 2]];

      return coords.map((coord, i) => ({
        type: "Feature" as const,
        properties: {
          region,
          zona: regionItems[i % regionItems.length]?.zona || region,
          riesgo,
          saldo: saldoRegion / coords.length,
        },
        geometry: { type: "Point" as const, coordinates: coord },
      }));
    }),
  };

  // 4. Marcadores por región para tooltips
  const regionMarkers = matrixData.map((row) => {
    const coords = REGION_COORDS[row.region.toUpperCase()];
    if (!coords || coords.length === 0) return null;
    const center = coords[0];

    const clasificaciones = CLASIFICACIONES.reduce((acc, cls) => {
      acc[cls] = row[cls] as number;
      return acc;
    }, {} as Record<string, number>);
    const riesgo = getRiskLevel(clasificaciones);

    return { region: row.region, riesgo, total: row.total, coords: center };
  }).filter(Boolean) as { region: string; riesgo: string; total: number; coords: [number, number] }[];

  // 5. Cartera Crítica
  const saldoCritico = (clasificacionMap["DEFICIENTE"] || 0) + (clasificacionMap["DUDOSO"] || 0) + (clasificacionMap["PERDIDA"] || 0);
  const porcentajeCritico = totalSaldoEnRiesgo > 0 ? ((saldoCritico / totalSaldoEnRiesgo) * 100).toFixed(1) : "0";

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
      {/* Alerta de Cartera Crítica */}
      <Card className="border-red-200/50 bg-gradient-to-r from-red-50/30 to-rose-50/10 dark:border-red-950/40 dark:from-red-950/10 dark:to-zinc-950 backdrop-blur-md">
        <CardContent className="flex items-center gap-4 py-4">
          <div className="p-3 bg-red-100 dark:bg-red-950/50 text-red-650 dark:text-red-400 rounded-full">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div>
            <h4 className="font-bold text-red-900 dark:text-red-400 text-sm">Alerta de Riesgo Crediticio</h4>
            <p className="text-xs text-zinc-650 dark:text-zinc-400 mt-0.5">
              La cartera vencida o crítica (Deficiente, Dudoso y Pérdida) asciende a{" "}
              <span className="font-bold text-red-700 dark:text-red-300 font-mono">{formatCurrency(saldoCritico)}</span>, lo cual representa el{" "}
              <span className="font-bold text-red-700 dark:text-red-350">{porcentajeCritico}%</span> del portafolio bajo análisis.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Grid de Resúmenes por Clasificación */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {CLASIFICACIONES.map((cls) => {
          const saldo = clasificacionMap[cls] || 0;
          const pct = getPercentage(saldo);

          return (
            <Card key={cls} className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md border-zinc-150 dark:border-zinc-800">
              <CardHeader className="pb-1 pt-4 px-4">
                <CardTitle className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                  <span className={`h-2.5 w-2.5 rounded-full ${COLORS[cls].split(" ")[0]}`} />
                  {cls}
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="text-xl font-bold font-mono text-zinc-850 dark:text-zinc-100">{formatCurrency(saldo)}</div>
                <p className="text-[10px] text-zinc-400 mt-0.5">{pct.toFixed(1)}% del total</p>
                <div className="w-full bg-zinc-200 dark:bg-zinc-855 h-1 rounded-full mt-2 overflow-hidden">
                  <div className={`h-1 rounded-full ${COLORS[cls].split(" ")[0]}`} style={{ width: `${pct}%` }} />
                </div>
              </CardContent>
            </Card>
          );
        })}
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
                {/* Clusters para vista alejada */}
                <MapClusterLayer
                  data={clusterGeoJSON}
                  clusterMaxZoom={6}
                  clusterRadius={40}
                  clusterColors={["var(--risk-normal)", "var(--risk-cpp)", "var(--risk-deficiente)"]}
                  clusterThresholds={[5, 10]}
                  pointColor="var(--chart-1)"
                  onClusterClick={undefined}
                />

                {/* Marcadores individuales con tooltip de región */}
                {regionMarkers.map((rm) => (
                  <MapMarker
                    key={rm.region}
                    longitude={rm.coords[0]}
                    latitude={rm.coords[1]}
                    onClick={() => setSelectedRegion(rm.region === selectedRegion ? null : rm.region)}
                  >
                    <MarkerContent>
                      <div
                        className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white shadow-lg transition-transform hover:scale-110 cursor-pointer"
                        style={{ backgroundColor: RISK_MARKER_COLOR[rm.riesgo] }}
                      >
                        <MapPin className="h-4 w-4 text-white" />
                      </div>
                    </MarkerContent>
                    <MarkerTooltip>
                      <div className="text-xs font-semibold">{rm.region}</div>
                      <div className="text-[10px] mt-0.5 opacity-80">
                        {formatCurrency(rm.total)}
                      </div>
                      <div
                        className="text-[9px] mt-0.5 font-bold uppercase tracking-wider"
                        style={{ color: RISK_MARKER_COLOR[rm.riesgo] }}
                      >
                        {rm.riesgo}
                      </div>
                    </MarkerTooltip>
                  </MapMarker>
                ))}

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
                            onClick={() => setSelectedRegion(isSelected ? null : row.region)}
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
