"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/shared/ui/button";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  return (
    <Button
      variant="ghost"
      size="sm"
      className="text-zinc-500 hover:text-red-600 dark:text-zinc-400 dark:hover:text-red-400 gap-2 font-medium transition-colors"
      onClick={() => signOut({ callbackUrl: "/login" })}
    >
      <LogOut className="h-4 w-4" />
      <span>Cerrar Sesión</span>
    </Button>
  );
}
export default LogoutButton;
