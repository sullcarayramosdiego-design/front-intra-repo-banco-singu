import type { Metadata } from "next";
import { Outfit, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/features/auth/components/session-provider";
import { TooltipProvider } from "@/components/ui/tooltip";

const sansFont = Outfit({
  variable: "--font-sans",
  subsets: ["latin"],
});

const monoFont = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Intranet Financiera Confianza | Banco Singular",
  description: "Dashboard de analítica financiera de cartera, transacciones y riesgo crediticio.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${sansFont.variable} ${monoFont.variable} h-full antialiased dark`}
      suppressHydrationWarning
    >
      <body
        className="min-h-full flex flex-col bg-zinc-50 text-zinc-900 dark:bg-black dark:text-zinc-50"
        suppressHydrationWarning
      >
        <SessionProvider>
          <TooltipProvider>
            {children}
          </TooltipProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
