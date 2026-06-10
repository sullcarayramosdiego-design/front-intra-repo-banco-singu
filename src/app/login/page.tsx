"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Lock, User, AlertCircle, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
        setError("Credenciales incorrectas. Intenta con analista.prueba / 123456.");
      } else {
        router.push("/");
        router.refresh();
      }
    } catch (err) {
      setError("Error inesperado en el servidor de autenticación.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (user: string, pass: string) => {
    setError("");
    setLoading(true);
    try {
      const res = await signIn("credentials", {
        username: user,
        password: pass,
        redirect: false,
      });

      if (res?.error) {
        setError("Error al iniciar sesión rápida.");
      } else {
        router.push("/");
        router.refresh();
      }
    } catch (err) {
      setError("Error inesperado.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#07070a] px-4 overflow-hidden font-sans">
      {/* Background Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#0284c7]/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#8b5cf6]/10 rounded-full blur-[120px]" />

      <Card className="w-full max-w-md border border-zinc-800 bg-zinc-950/60 backdrop-blur-2xl text-zinc-100 shadow-2xl relative z-10">
        <CardHeader className="text-center space-y-2 pb-4">
          <div className="flex justify-center mb-1">
            <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-2xl text-sky-400">
              <ShieldCheck className="h-8 w-8" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
            Banco Singular
          </CardTitle>
          <CardDescription className="text-zinc-400 text-xs">
            Intranet de Gestión Financiera Confianza
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 bg-red-950/30 border border-red-900/50 rounded-xl text-red-400 text-xs flex items-start gap-2.5">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-300">Usuario</label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                <Input
                  type="text"
                  placeholder="ej: analista.prueba"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={loading}
                  className="pl-9 bg-zinc-900/50 border-zinc-800 text-zinc-200 focus-visible:ring-sky-500/50"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-300">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className="pl-9 bg-zinc-900/50 border-zinc-800 text-zinc-200 focus-visible:ring-sky-500/50"
                  required
                />
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-lg h-10 transition-all shadow-lg shadow-sky-600/20">
              {loading ? "Iniciando Sesión..." : "Iniciar Sesión"}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-zinc-800" />
            <span className="flex-shrink mx-4 text-[10px] text-zinc-500 uppercase tracking-widest font-semibold">Desarrollo local</span>
            <div className="flex-grow border-t border-zinc-800" />
          </div>

          {/* Quick Logins */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              size="sm"
              disabled={loading}
              onClick={() => handleQuickLogin("analista.prueba", "123456")}
              className="border-zinc-800 bg-zinc-900/30 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold"
            >
              Rol: Analista
              <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={loading}
              onClick={() => handleQuickLogin("admin.prueba", "admin")}
              className="border-zinc-800 bg-zinc-900/30 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold"
            >
              Rol: Admin
              <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </div>
        </CardContent>
        <CardFooter className="justify-center border-t border-zinc-900 py-3">
          <p className="text-[10px] text-zinc-500">© 2026 Banco Singular S.A. Todos los derechos reservados.</p>
        </CardFooter>
      </Card>
    </div>
  );
}
