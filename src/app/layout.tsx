import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Powerlifting Score",
  description: "Sistema profesional de competencia",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}