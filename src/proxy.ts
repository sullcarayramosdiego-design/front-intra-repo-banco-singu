import { withAuth } from "next-auth/middleware";

const authMiddleware = withAuth({
  pages: {
    signIn: "/login",
  },
});

export const proxy = authMiddleware;
export default authMiddleware;

export const config = {
  matcher: [
    // Proteger todas las rutas excepto login, archivos estáticos, api/auth, etc.
    "/((?!api|_next/static|_next/image|favicon.ico|login).*)",
  ],
};
