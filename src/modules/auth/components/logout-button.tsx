"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { Button } from "@/shared/ui/button";
import { LogOut } from "lucide-react";
import { LoadingScreen } from "@/shared/ui/loading-screen";

export function LogoutButton() {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await signOut({ callbackUrl: "/login" });
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="text-zinc-500 hover:text-red-600 dark:text-zinc-400 dark:hover:text-red-400 gap-2 font-medium transition-colors"
        onClick={handleLogout}
        disabled={isLoggingOut}
      >
        <LogOut className="h-4 w-4" />
        <span>Cerrar Sesión</span>
      </Button>
      {isLoggingOut && <LoadingScreen message="Cerrando sesión..." />}
    </>
  );
}
export default LogoutButton;

