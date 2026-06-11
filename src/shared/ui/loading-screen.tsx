"use client";

import { useEffect, useState } from "react";

interface LoadingScreenProps {
  /** Texto que se muestra debajo de la barra. Por defecto "Cargando..." */
  message?: string;
}

/**
 * Pantalla de carga fullscreen que cubre todo el viewport.
 * Muestra el monograma de marca, una barra de progreso animada y un mensaje.
 * Úsala justo después de un login exitoso antes de redirigir.
 */
export function LoadingScreen({ message = "Cargando permisos..." }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Simula una barra de progreso que avanza suave hasta ~92% y luego espera
    const steps = [
      { target: 30, delay: 80 },
      { target: 60, delay: 120 },
      { target: 82, delay: 180 },
      { target: 92, delay: 300 },
    ];

    let current = 0;

    const runStep = (index: number) => {
      if (index >= steps.length) return;
      const { target, delay } = steps[index];
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= target) {
            clearInterval(interval);
            setTimeout(() => runStep(index + 1), delay);
            return prev;
          }
          return prev + 1;
        });
      }, 20);
    };

    runStep(0);
  }, []);

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-6 bg-background text-foreground"
      role="status"
      aria-label={message}
    >
      {/* Logo / marca */}
      <div className="flex items-center gap-3 select-none">
        {/* Ícono geométrico corporativo */}
        <svg
          width="48"
          height="48"
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          {/* Nodos */}
          <circle cx="24" cy="10" r="5" className="fill-primary" />
          <circle cx="38" cy="30" r="4" className="fill-primary" />
          <circle cx="10" cy="30" r="4" className="fill-primary" />
          <circle cx="24" cy="34" r="3" className="fill-secondary" />
          {/* Líneas */}
          <line x1="24" y1="10" x2="38" y2="30" className="stroke-primary" strokeWidth="2" strokeLinecap="round" />
          <line x1="24" y1="10" x2="10" y2="30" className="stroke-primary" strokeWidth="2" strokeLinecap="round" />
          <line x1="10" y1="30" x2="24" y2="34" className="stroke-secondary" strokeWidth="2" strokeLinecap="round" />
          <line x1="38" y1="30" x2="24" y2="34" className="stroke-secondary" strokeWidth="2" strokeLinecap="round" />
          <line x1="10" y1="30" x2="38" y2="30" className="stroke-primary" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="3 3" />
        </svg>

        <span className="text-3xl font-bold tracking-tight text-secondary">
          FC
        </span>
      </div>

      {/* Barra de progreso */}
      <div className="w-64 flex flex-col gap-2">
        <div
          className="w-full h-1 rounded-full overflow-hidden bg-secondary/12"
        >
          <div
            className="h-full rounded-full transition-all duration-300 ease-out bg-gradient-to-r from-secondary to-primary"
            style={{
              width: `${progress}%`,
            }}
          />
        </div>

        {/* Mensaje */}
        <p className="text-center text-[13px] font-medium text-secondary/65">
          {message}
        </p>
      </div>
    </div>
  );
}
