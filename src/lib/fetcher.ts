import { getServerSession } from "next-auth";
import { getSession } from "next-auth/react";
import { authOptions } from "@/modules/auth/lib/auth-options";

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

  const url = endpoint.startsWith("http") ? endpoint : `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers,
    next: { revalidate: 30 }, // Cachear por 30 segundos por defecto en el servidor
  });

  if (!response.ok) {
    let errorMessage = `Error de API (${response.status})`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch {
      // no JSON
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
}
export default fetcher;
