"use client";

import { useSession } from "next-auth/react";
import { User, Shield } from "lucide-react";

export function UserProfile() {
  const { data: session } = useSession();

  if (!session?.user) {
    return null;
  }

  const { name, email, roles } = session.user;

  return (
    <div className="flex items-center gap-3 p-2 rounded-lg border border-zinc-100 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md">
      <div className="flex items-center justify-center h-9 w-9 rounded-full bg-primary/10 text-primary dark:bg-zinc-800 dark:text-zinc-200">
        <User className="h-5 w-5" />
      </div>
      <div className="flex flex-col text-left">
        <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 leading-tight">
          {name || "Usuario Confianza"}
        </span>
        <span className="text-xs text-zinc-500 dark:text-zinc-400">
          {email || "usuario@singular.pe"}
        </span>
        <div className="flex gap-1 mt-1">
          {roles?.map((role) => (
            <span
              key={role}
              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/50"
            >
              <Shield className="h-2.5 w-2.5" />
              {role}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
export default UserProfile;
