import "./globals.css";
import type { Metadata } from "next";
import AppSplash from "../components/powerlift/AppSplash";

export const metadata: Metadata = {
  title: "Powerlifting Score",
  description: "Sistema profesional de competencia Powerlift Tlalmanalco",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <AppSplash>{children}</AppSplash>
      </body>
    </html>
  );
}