import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import GoogleTagManager from "@/components/GoogleTagManager";
import AdvancedTracking from "@/components/AdvancedTracking";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://chat.z.ai'),
  title: "Sistema de Controle de Trips - Economize até R$ 5.000 por Hectare",
  description: "Método validado pela Embrapa para eliminar trips de vez. Sistema de 4 fases que economiza até R$ 5.000 por hectare em defensivos agrícolas.",
  keywords: ["controle de trips", "trips na soja", "defensivos agrícolas", "Embrapa", "agricultura", "pragas", "soja", "economia agrícola"],
  authors: [{ name: "Sistema de Controle de Trips" }],
  openGraph: {
    title: "Sistema de Controle de Trips - Economize até R$ 5.000 por Hectare",
    description: "Método validado pela Embrapa para eliminar trips de vez. Sistema de 4 fases que economiza até R$ 5.000 por hectare em defensivos agrícolas.",
    url: "https://chat.z.ai",
    siteName: "Sistema de Controle de Trips",
    type: "website",
    images: [
      {
        url: "/ebook-logo.webp",
        width: 400,
        height: 400,
        alt: "E-book Sistema de Controle de Trips",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sistema de Controle de Trips - Economize até R$ 5.000 por Hectare",
    description: "Método validado pela Embrapa para eliminar trips de vez. Sistema de 4 fases que economiza até R$ 5.000 por hectare em defensivos agrícolas.",
    images: ["/ebook-logo.webp"],
  },
  other: {
    "twitter:image": "/ebook-logo.webp",
    "og:image:width": "400",
    "og:image:height": "400",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <GoogleTagManager gtmId="GTM-567XZCDX" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <AdvancedTracking />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
