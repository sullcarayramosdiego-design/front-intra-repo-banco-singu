"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { AlertCircle, Eye, EyeOff } from "lucide-react";
import { LoadingScreen } from "@/shared/ui/loading-screen";

import { useEffect } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("error") === "SessionExpired") {
        setError("Tu sesión ha expirado por inactividad. Por favor, inicia sesión de nuevo.");
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        username,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError("Usuario o contraseña incorrectos.");
      } else {
        setRedirecting(true);
        router.push("/");
        router.refresh();
      }
    } catch {
      setError("Error inesperado. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  if (redirecting) {
    return <LoadingScreen message="Cargando permisos..." />;
  }

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-4 overflow-hidden font-sans">
      {/* Imagen de fondo */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="https://confianza.pe/admin/img/noticias/Financiera%20Confianza-v2.png"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover object-center"
      />
      {/* Overlay oscuro */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Card minimalista */}
      <div
        className="relative z-10 w-full max-w-sm px-8 py-10 flex flex-col gap-8 bg-secondary/78 backdrop-blur-[24px] border border-primary/25 rounded-2xl"
      >
        {/* Header */}
        <div className="flex flex-col items-center gap-1 text-center">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center mb-3 bg-primary/15 border border-primary/30"
          >
            <span className="text-sm font-bold tracking-tight text-primary">
              FC
            </span>
          </div>
          <h1 className="text-base font-semibold text-white tracking-tight">
            Financiera Confianza · Banco Singular
          </h1>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {error && (
            <div className="flex items-start gap-2 text-xs text-red-300 bg-red-950/30 border border-red-500/20 rounded-md px-3 py-2.5">
              <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="login-username"
              className="text-[10px] font-medium tracking-widest uppercase text-white/30"
            >
              Usuario
            </label>
            <Input
              id="login-username"
              type="text"
              placeholder="nombre de usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
              autoComplete="username"
              className="h-10 bg-transparent text-white text-sm placeholder:text-white/20 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none px-0 border-0 border-b border-b-white/20 hover:border-b-white/40 transition-colors"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="login-password"
              className="text-[10px] font-medium tracking-widest uppercase text-white/30"
            >
              Contraseña
            </label>
            <div className="relative flex items-center">
              <Input
                id="login-password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                autoComplete="current-password"
                className="h-10 w-full bg-transparent text-white text-sm placeholder:text-white/20 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none pl-0 pr-8 border-0 border-b border-b-white/20 hover:border-b-white/40 transition-colors"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-0 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors focus:outline-none"
                tabIndex={-1}
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <Button
            id="login-submit"
            type="submit"
            disabled={loading}
            className="h-10 w-full text-sm font-medium tracking-wide text-primary-foreground bg-primary hover:bg-primary/90 rounded-lg transition-all disabled:opacity-50 mt-1"
          >
            {loading ? "Verificando..." : "Iniciar sesión"}
          </Button>
        </form>
      </div>

      {/* Copyright */}
      <p className="relative z-10 mt-5 text-[10px] text-white/25 text-center tracking-wide">
        © 2026 Banco Singular S.A. Todos los derechos reservados.
      </p>
    </div>
  );
}
