import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Swiss Charts — Analiza tu gráfico como El Código Suizo",
  description:
    "Sube la captura de tu gráfico y recibe un análisis técnico en segundos: estructura, order block de origen, Fibonacci 78.6%, imbalance y plan de entrada con la metodología El Código Suizo.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col text-fg">{children}</body>
    </html>
  );
}
