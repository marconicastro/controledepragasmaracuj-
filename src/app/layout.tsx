import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import StapeCustomContainer from "@/components/StapeCustomContainer";
import GTMDataLayerChecker from "@/components/GTMDataLayerChecker";
import FacebookPixelDebugger from "@/components/FacebookPixelDebugger";
import UTMify from "@/components/UTMify";
import AdvancedTracking from "@/components/AdvancedTracking";
import FacebookPixelScript from "@/components/FacebookPixelScript";

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
        <StapeCustomContainer />
        <FacebookPixelScript />
        
        {/* Facebook Pixel Base Code */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '714277868320104');
              fbq('track', 'PageView');
              console.log('✅ Facebook Pixel loaded via script tag');
            `,
          }}
        />
        
        {/* Facebook Pixel Noscript */}
        <noscript>
          <img 
            height="1" 
            width="1" 
            style={{ display: 'none' }}
            src="https://www.facebook.com/tr?id=714277868320104&ev=PageView&noscript=1"
            alt="Facebook Pixel"
          />
        </noscript>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <GTMDataLayerChecker />
        <FacebookPixelDebugger />
        <UTMify />
        <AdvancedTracking />
        {children}
        <Toaster />
      </body>
    </html>
  );
}