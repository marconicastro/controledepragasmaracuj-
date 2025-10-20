import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Ebook Trips',
  description: 'Descubra destinos incríveis com nossos guias de viagem digitais',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <head>
        {/* Google Tag Manager - Stape.io */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s);j.async=true;j.src="https://stape.maracujazeropragas.com/8ln6mkilayicr.js?"+i;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','2nz=GwdUPjUhRDwiJyI9U186TQReW1dQSg0FTw4ICwAPHAETGQwLDhwbChUCGlcCAwQ%3D');`,
          }}
        />
        {/* End Google Tag Manager */}
      </head>
      <body className={inter.className}>
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://stape.maracujazeropragas.com/ns.html?id=GTM-WPDKD23S"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
        {/* End Google Tag Manager (noscript) */}
        
        {children}
      </body>
    </html>
  );
}