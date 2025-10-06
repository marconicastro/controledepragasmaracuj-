import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
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
        {/* Performance optimizations */}
        <link rel="preconnect" href="https://connect.facebook.net" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="//www.facebook.com" />
        <link rel="dns-prefetch" href="//ipapi.co" />
        <link rel="prefetch" href="/ebook-logo-optimized.webp" />
        <link rel="prefetch" href="/viroses-plantas-optimized.webp" />
        <link rel="prefetch" href="/travamento-ponteiras-optimized.webp" />
        <link rel="prefetch" href="/frutos-manchados-optimized.webp" />
        
        {/* Google Tag Manager */}
        <Script
          id="gtm-script"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','GTM-PW4HF9WD');
            `,
          }}
        />
        
        {/* Facebook Pixel Base Code - Deferred */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              setTimeout(function() {
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
                console.log('✅ Facebook Pixel carregado via layout');
              }, 2000);
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
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-PW4HF9WD"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
        
        <AdvancedTracking />
        {children}
        <Toaster />
      </body>
    </html>
  );
}