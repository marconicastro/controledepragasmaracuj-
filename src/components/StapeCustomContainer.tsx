'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
    fbq: (...args: any[]) => void;
    _stapeGtmLoaded?: boolean;
  }
}

interface StapeCustomContainerProps {
  gtmId: string;
}

export default function StapeCustomContainer({ gtmId = 'GTM-567XZCDX' }: StapeCustomContainerProps) {
  const pathname = usePathname();
  const scriptLoaded = useRef(false);

  useEffect(() => {
    // Verificação global para evitar duplicação
    if (typeof window !== 'undefined' && window._stapeGtmLoaded) {
      console.log('🚫 GTM já carregado - evitando duplicação');
      return;
    }
    
    if (typeof window === 'undefined' || scriptLoaded.current) return;
    
    // Marcar como carregado
    scriptLoaded.current = true;
    window._stapeGtmLoaded = true;
    
    console.log('🚀 Carregando GTM Container...');
    
    // Inicializar dataLayer se não existir
    window.dataLayer = window.dataLayer || [];
    
    // Configurar GTM
    window.dataLayer.push({
      'gtm.start': new Date().getTime(),
      'event': 'gtm.js'
    });
    
  }, [pathname, gtmId]);

  return (
    <>
      {/* Stape.io Custom Container - Anti-AdBlock */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            (function(w,d,s,l,i){
              w[l]=w[l]||[];
              var f=d.getElementsByTagName(s)[0],j=d.createElement(s);
              j.async=true;
              j.src="https://data.maracujazeropragas.com/24rckptuywp.js?"+i;
              f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','4n13l=GRNEMiA9RlZGQCEvNzQzRQZKS1tFVg8NTRoYBxUTHgkRDRwHGwAZAhcWClsXHwY%3D');
          `,
        }}
      />
      
      {/* Stape.io Custom Container (noscript) */}
      <noscript>
        <iframe
          src="https://data.maracujazeropragas.com/ns.html?id=GTM-567XZCDX"
          height="0"
          width="0"
          style={{ display: 'none', visibility: 'hidden' }}
        />
      </noscript>
    </>
  );
}