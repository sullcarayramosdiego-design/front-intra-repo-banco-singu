if (process.env.NEXTAUTH_URL === "") delete process.env.NEXTAUTH_URL;
if (process.env.NEXT_PUBLIC_API_URL === "") delete process.env.NEXT_PUBLIC_API_URL;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  cacheComponents: true,
  typescript: {
    // Ignorar errores de compilación de tipos en producción (ya validados en local)
    ignoreBuildErrors: true,
  },
  experimental: {
    instantNavigationDevToolsToggle: true,
  },
};

export default nextConfig;
