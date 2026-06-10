import { NextAuthOptions } from "next-auth";
import KeycloakProvider from "next-auth/providers/keycloak";
import CredentialsProvider from "next-auth/providers/credentials";

// Función nativa para firmar JWT con HS256 usando Web Crypto API
async function signJwtHS256(payload: any, secret: string): Promise<string> {
  const header = { alg: "HS256", typ: "JWT" };
  
  const base64UrlEncode = (obj: any) => {
    const json = JSON.stringify(obj);
    const bytes = new TextEncoder().encode(json);
    return btoa(String.fromCharCode(...bytes))
      .replace(/=/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");
  };

  const headerEncoded = base64UrlEncode(header);
  const payloadEncoded = base64UrlEncode(payload);
  const data = `${headerEncoded}.${payloadEncoded}`;

  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign("HMAC", cryptoKey, encoder.encode(data));
  const signatureBytes = new Uint8Array(signature);
  const signatureEncoded = btoa(String.fromCharCode(...signatureBytes))
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  return `${data}.${signatureEncoded}`;
}

export const authOptions: NextAuthOptions = {
  providers: [
    // Proveedor para Producción / Keycloak Real
    KeycloakProvider({
      clientId: process.env.KEYCLOAK_ID || process.env.KEYCLOAK_CLIENT_ID || "intranet-frontend",
      clientSecret: process.env.KEYCLOAK_SECRET || process.env.KEYCLOAK_CLIENT_SECRET || "",
      issuer: process.env.KEYCLOAK_ISSUER || "https://dummy-idp.dokploy.app/realms/banco-singular",
    }),

    // Proveedor para Desarrollo Local / Pruebas
    CredentialsProvider({
      id: "credentials",
      name: "Banco Singular Credentials",
      credentials: {
        username: { label: "Usuario", type: "text", placeholder: "analista.prueba" },
        password: { label: "Contraseña", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials) return null;
        
        // Simulación sencilla de credenciales para desarrollo
        const { username, password } = credentials;
        
        // Permite logear con cualquier usuario simulando roles
        if (password === "admin" || password === "123456" || process.env.NODE_ENV === "development") {
          const roles = username.includes("admin") ? ["Analista", "Admin"] : ["Analista"];
          const user = {
            id: "mock|123456",
            name: username === "analista.prueba" ? "Usuario Analista Prueba" : username,
            email: `${username}@singular.pe`,
            roles: roles,
          };

          // Generamos el JWT de Backend HS256
          const iat = Math.floor(Date.now() / 1000);
          const exp = iat + 24 * 60 * 60; // 24 horas
          
          const jwtPayload = {
            sub: user.id,
            name: user.name,
            email: user.email,
            roles: user.roles,
            aud: process.env.JWT_AUDIENCE || "https://api.intranet.confianza.pe",
            iss: process.env.JWT_ISSUER || "https://dummy-idp.dokploy.app/",
            iat,
            exp
          };

          const devSecret = process.env.JWT_DEV_SECRET || "super-secret-development-key-for-local-testing";
          const backendToken = await signJwtHS256(jwtPayload, devSecret);

          return {
            ...user,
            accessToken: backendToken
          };
        }
        
        return null;
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 horas
  },
  callbacks: {
    async jwt({ token, user, account }) {
      // Si es la primera vez que se logea
      if (user) {
        token.id = user.id;
        token.roles = (user as any).roles || ["Analista"];
        
        // Si viene del CredentialsProvider, ya creamos el accessToken
        if ((user as any).accessToken) {
          token.accessToken = (user as any).accessToken;
        }
      }
      
      // Si viene de Keycloak (OIDC)
      if (account && account.access_token) {
        token.accessToken = account.access_token;
      }

      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user = {
          ...session.user,
          id: token.id as string,
          roles: token.roles as string[],
        } as any;
        (session as any).accessToken = token.accessToken;
      }
      return session;
    }
  },
  pages: {
    signIn: "/login",
  }
};
