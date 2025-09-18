'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { getAllTrackingParams, initializeTracking } from '@/lib/cookies';

declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

interface GoogleTagManagerProps {
  gtmId: string;
}

export default function GoogleTagManager({ gtmId = 'GTM-567XZCDX' }: GoogleTagManagerProps) {
  const pathname = usePathname();

  useEffect(() => {
    // Inicializar dataLayer se não existir
    if (typeof window !== 'undefined') {
      window.dataLayer = window.dataLayer || [];
      
      // Função gtag
      window.gtag = function gtag(...args: any[]) {
        window.dataLayer.push(args);
      };

      // Configuração inicial do GTM
      window.gtag('js', new Date());
      window.gtag('config', gtmId);

      // Enviar evento page_view IMEDIATAMENTE (sem esperar FBC)
      const sendPageView = async () => {
        const trackingParams = await getAllTrackingParams();
        
        // Gerar event_id consistente para correlação
        const eventId = Date.now().toString(36) + Math.random().toString(36).substr(2);
        
        window.gtag('event', 'page_view', {
          page_title: document.title,
          page_location: window.location.href,
          page_path: pathname,
          event_id: eventId, // Adicionar event_id para correlação
          // Incluir todos os dados de rastreamento para melhor matching
          user_data: trackingParams
        });
        
        console.log('📍 PageView enviado RAPIDAMENTE com event_id:', eventId, 'e dados:', trackingParams);
      };

      // Enviar PageView imediatamente (prioridade #1)
      sendPageView();
      
      // Capturar FBC em segundo plano (não bloquear PageView)
      setTimeout(() => {
        console.log('🎯 Capturando FBC em segundo plano (não bloqueia PageView)...');
        initializeTracking();
      }, 100);
    }
  }, [pathname, gtmId]);

  return (
    <>
      {/* Google Tag Manager */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${gtmId}');
          `,
        }}
      />
      
      {/* Google Tag Manager (noscript) */}
      <noscript>
        <iframe
          src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
          height="0"
          width="0"
          style={{ display: 'none', visibility: 'hidden' }}
        />
      </noscript>
    </>
  );
}