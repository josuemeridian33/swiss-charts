import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const SITE_URL = "https://swiss-charts-josuemeridian33s-projects.vercel.app";

// Render correcto en móvil: ancho de viewport y color de la barra superior.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0d0f0f",
  colorScheme: "dark",
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Swiss Charts — Analiza tu gráfico como El Código Suizo",
  description:
    "Sube la captura de tu gráfico y recibe un análisis técnico en segundos: estructura, order block de origen, Fibonacci 78.6%, imbalance y plan de entrada con la metodología El Código Suizo.",
  applicationName: "Swiss Charts",
  openGraph: {
    title: "Swiss Charts — Analiza tu gráfico como El Código Suizo",
    description:
      "Sube tu gráfico y recibe un análisis técnico en segundos: estructura, order block, Fib 78.6%, imbalance y plan de entrada.",
    url: SITE_URL,
    siteName: "Swiss Charts",
    type: "website",
    locale: "es",
  },
  twitter: {
    card: "summary",
    title: "Swiss Charts — Analiza tu gráfico como El Código Suizo",
    description:
      "Sube tu gráfico y recibe un análisis técnico en segundos con la metodología El Código Suizo.",
  },
  robots: { index: true, follow: true },
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
