import { NextAuthOptions } from "next-auth";
import KeycloakProvider from "next-auth/providers/keycloak";
import CredentialsProvider from "next-auth/providers/credentials";

// Safeguard for build time: delete empty string environment variables so libraries can fallback safely
if (process.env.NEXTAUTH_URL === "") delete process.env.NEXTAUTH_URL;
if (process.env.NEXT_PUBLIC_API_URL === "") delete process.env.NEXT_PUBLIC_API_URL;
if (process.env.KEYCLOAK_ISSUER === "") delete process.env.KEYCLOAK_ISSUER;

const keycloakId = process.env.KEYCLOAK_ID?.trim();
const keycloakSecret = process.env.KEYCLOAK_SECRET?.trim();
const keycloakIssuer = process.env.KEYCLOAK_ISSUER?.trim();
const isMockActive = process.env.NEXT_PUBLIC_MOCK_LOGIN === "true";
const hasKeycloakConfig = Boolean(keycloakId && keycloakSecret && keycloakIssuer) && !isMockActive;

export const authOptions: NextAuthOptions = {
  providers: [
    // ── Keycloak SSO (OAuth / OIDC) ──────────────────────────────
    ...(hasKeycloakConfig
      ? [
        KeycloakProvider({
          clientId: keycloakId!,
          clientSecret: keycloakSecret!,
          issuer: keycloakIssuer!,
        }),
      ]
      : []),

    // ── Formulario usuario/contraseña → valida contra Keycloak o API Mock ───
    CredentialsProvider({
      id: "credentials",
      name: "Banco Singular",
      credentials: {
        username: { label: "Usuario", type: "text" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        console.log("[Auth-Options] Starting authorize callback");

        if (!credentials?.username || !credentials?.password) {
          console.warn("[Auth-Options] Missing username or password in credentials");
          return null;
        }

        // Si el login simulado/mock está activo, enviamos la petición a nuestro endpoint local del backend
        if (isMockActive) {
          const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3100";
          const mockLoginUrl = `${apiBaseUrl}/api/auth/login`;
          console.log("[Auth-Options] Local mock login mode active. Sending request to:", mockLoginUrl);

          try {
            const res = await fetch(mockLoginUrl, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                username: credentials.username,
                password: credentials.password,
              }),
            });

            console.log("[Auth-Options] Mock login response status:", res.status);

            if (!res.ok) {
              const errorText = await res.text();
              console.error("[Auth-Options] Mock login failed. Status:", res.status, "Body:", errorText);
              return null;
            }

            const responseData = await res.json();
            if (responseData.status !== "success" || !responseData.data) {
              console.error("[Auth-Options] Mock login returned non-success response:", responseData);
              return null;
            }

            const userData = responseData.data;
            console.log("[Auth-Options] Mock user logged in successfully:", userData.name);

            return {
              id: userData.id,
              name: userData.name,
              email: userData.email,
              roles: userData.roles,
              accessToken: userData.accessToken,
            };
          } catch (error: any) {
            console.error("[Auth-Options] Exception caught during mock login:", error?.message || error);
            return null;
          }
        }

        console.log("[Auth-Options] Environment checks:", {
          hasIssuer: !!keycloakIssuer,
          hasClientId: !!keycloakId,
          hasSecret: !!keycloakSecret,
          issuer: keycloakIssuer,
          clientId: keycloakId
        });

        if (!keycloakIssuer || !keycloakId || !keycloakSecret) {
          console.error("[Auth-Options] Missing Keycloak configuration environment variables");
          return null;
        }

        const tokenUrl = `${keycloakIssuer}/protocol/openid-connect/token`;
        console.log("[Auth-Options] Sending token request to:", tokenUrl);

        try {
          const res = await fetch(tokenUrl, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
              grant_type: "password",
              client_id: keycloakId,
              client_secret: keycloakSecret,
              username: credentials.username,
              password: credentials.password,
              scope: "openid profile email",
            }),
          });

          console.log("[Auth-Options] Keycloak token response status:", res.status);

          if (!res.ok) {
            const errorText = await res.text();
            console.error("[Auth-Options] Keycloak login failed. Status:", res.status, "Body:", errorText);
            return null;
          }

          const tokens = await res.json();
          console.log("[Auth-Options] Token successfully received from Keycloak");

          // Decodificar el access_token para extraer claims del usuario
          const payloadB64 = tokens.access_token.split(".")[1];
          const payload = JSON.parse(
            Buffer.from(payloadB64, "base64url").toString("utf-8")
          );

          console.log("[Auth-Options] User token decoded successfully. Subject:", payload.sub);

          return {
            id: payload.sub,
            name: payload.name || payload.preferred_username,
            email: payload.email || "",
            roles: payload.realm_access?.roles ?? [],
            accessToken: tokens.access_token,
          };
        } catch (error: any) {
          console.error("[Auth-Options] Exception caught during Keycloak authorization:", error?.message || error, error?.stack);
          return null;
        }
      },
    }),
  ],

  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60,
  },

  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.roles = (user as any).roles ?? [];
        token.accessToken = (user as any).accessToken;
      }
      // Keycloak SSO: usa el access_token del proveedor OIDC
      if (account?.access_token) {
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
    },
  },

  pages: {
    signIn: "/login",
  },
};
