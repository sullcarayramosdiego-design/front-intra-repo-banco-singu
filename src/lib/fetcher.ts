import { getServerSession } from "next-auth";
import { getSession } from "next-auth/react";
import { authOptions } from "@/modules/auth/lib/auth-options";

if (process.env.NEXT_PUBLIC_API_URL === "") {
  delete process.env.NEXT_PUBLIC_API_URL;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export async function fetcher<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  let token: string | undefined;

  if (typeof window === "undefined") {
    // Servidor (Server Component / Route Handler)
    const session = await getServerSession(authOptions);
    token = (session as any)?.accessToken;
  } else {
    // Cliente (Client Component)
    const session = await getSession();
    token = (session as any)?.accessToken;
  }

  const headers = new Headers(options.headers || {});
  
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const base = typeof window !== "undefined"
    ? (process.env.NEXT_PUBLIC_API_URL || "")
    : API_BASE_URL;

  const url = endpoint.startsWith("http") ? endpoint : `${base}${endpoint}`;

  console.log(`[Fetcher] Requesting URL: ${url}`, {
    method: options.method || "GET",
    hasToken: !!token,
    tokenType: token ? typeof token : "none",
  });

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      next: { revalidate: 30 }, // Cachear por 30 segundos por defecto en el servidor
    });

    console.log(`[Fetcher] Response from URL: ${url} status: ${response.status}`);

    if (!response.ok) {
      let errorMessage = `Error de API (${response.status})`;
      let errorBody = "";
      try {
        errorBody = await response.text();
        const errorData = JSON.parse(errorBody);
        errorMessage = errorData.message || errorMessage;
      } catch {
        errorMessage = errorBody || errorMessage;
      }
      console.error(`[Fetcher Error] Status: ${response.status}, Message: ${errorMessage}`);

      // Si la sesión expiró (401) y estamos en el navegador, desconectar y mandar a login
      if (response.status === 401 && typeof window !== "undefined") {
        console.warn("[Fetcher] Sesión no autorizada o expirada (401). Forzando logout...");
        const { signOut } = await import("next-auth/react");
        signOut({ callbackUrl: "/login?error=SessionExpired" });
      }

      throw new Error(errorMessage);
    }

    if (response.status === 204) {
      return null as any;
    }

    const responseData = await response.json();
    if (responseData && typeof responseData === "object" && "status" in responseData && responseData.status === "success" && "data" in responseData) {
      return responseData.data as T;
    }

    return responseData as T;
  } catch (error: any) {
    console.error(`[Fetcher Exception] URL: ${url}, Error:`, error?.message || error, error?.stack);
    throw error;
  }
}
export default fetcher;
