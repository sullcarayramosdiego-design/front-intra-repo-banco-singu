"use client";

export default function DashboardLoading() {
  return (
    <div className="w-full min-h-[calc(100vh-8rem)] flex flex-col items-center justify-center gap-4 bg-transparent p-6">
      {/* Spinner animado premium */}
      <div className="relative w-16 h-16 flex items-center justify-center">
        {/* Anillo exterior */}
        <div className="absolute inset-0 border-4 border-t-violet-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin" style={{ animationDuration: '1s' }} />
        {/* Anillo intermedio */}
        <div className="absolute inset-1.5 border-4 border-t-transparent border-r-emerald-500 border-b-transparent border-l-transparent rounded-full animate-spin" style={{ animationDuration: '0.75s', animationDirection: 'reverse' }} />
        {/* Anillo interior */}
        <div className="absolute inset-3 border-2 border-t-cyan-400 border-r-transparent border-b-cyan-400 border-l-transparent rounded-full animate-spin" style={{ animationDuration: '1.5s' }} />
      </div>

      <div className="flex flex-col items-center gap-1 text-center">
        <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 tracking-wide">
          Cargando datos del módulo...
        </h3>
        <p className="text-xs text-zinc-400 dark:text-zinc-505">
          Por favor espere un momento
        </p>
      </div>
    </div>
  );
}
