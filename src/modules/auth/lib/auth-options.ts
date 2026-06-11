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
const hasKeycloakConfig = Boolean(keycloakId && keycloakSecret && keycloakIssuer);

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

    // ── Formulario usuario/contraseña → valida contra Keycloak ───
    CredentialsProvider({
      id: "credentials",
      name: "Banco Singular",
      credentials: {
        username: { label: "Usuario", type: "text" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;
        if (!keycloakIssuer || !keycloakId || !keycloakSecret) return null;

        const tokenUrl = `${keycloakIssuer}/protocol/openid-connect/token`;

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

          if (!res.ok) return null;

          const tokens = await res.json();

          // Decodificar el access_token para extraer claims del usuario
          const payloadB64 = tokens.access_token.split(".")[1];
          const payload = JSON.parse(
            Buffer.from(payloadB64, "base64url").toString("utf-8")
          );

          return {
            id: payload.sub,
            name: payload.name || payload.preferred_username,
            email: payload.email || "",
            roles: payload.realm_access?.roles ?? [],
            accessToken: tokens.access_token,
          };
        } catch {
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
