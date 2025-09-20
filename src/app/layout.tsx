import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import GoogleTagManager from "@/components/GoogleTagManager";
import AdvancedTracking from "@/components/AdvancedTracking";
import GTMDataLayerChecker from "@/components/GTMDataLayerChecker";
import FacebookPixelDebugger from "@/components/FacebookPixelDebugger";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Maracujá Zero Pragas - Sistema de Controle de Trips",
  description: "Elimine o trips de vez e economize até R$ 5.000 por hectare com o método validado pela EMBRAPA.",
  keywords: ["trips", "controle de trips", "maracujá", "pragas", "defensivos", "EMBRAPA"],
  authors: [{ name: "Maracujá Zero Pragas" }],
  openGraph: {
    title: "Maracujá Zero Pragas - Sistema de Controle de Trips",
    description: "Elimine o trips de vez e economize até R$ 5.000 por hectare com o método validado pela EMBRAPA.",
    url: "https://www.maracujazeropragas.com",
    siteName: "Maracujá Zero Pragas",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Maracujá Zero Pragas - Sistema de Controle de Trips",
    description: "Elimine o trips de vez e economize até R$ 5.000 por hectare com o método validado pela EMBRAPA.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <GoogleTagManager />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <AdvancedTracking />
        <GTMDataLayerChecker />
        <FacebookPixelDebugger />
        {children}
        <Toaster />
      </body>
    </html>
  );
}