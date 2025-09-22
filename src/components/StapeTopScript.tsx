'use client';

import Script from 'next/script';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { getAllTrackingParams, initializeTracking } from '@/lib/cookies';

declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

export default function StapeTopScript() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Inicializar dataLayer se não existir
      window.dataLayer = window.dataLayer || [];
      
      // Função gtag
      window.gtag = function gtag(...args: any[]) {
        window.dataLayer.push(args);
      };

      // Enviar evento page_view com tracking parameters
      const sendPageView = async () => {
        try {
          // 1. Inicializar tracking primeiro para capturar FBC
          await initializeTracking();
          
          // 2. Pequeno delay para garantir processamento do cookie FBC
          await new Promise(resolve => setTimeout(resolve, 100));
          
          // 3. Obter todos os parâmetros de rastreamento
          const trackingParams = await getAllTrackingParams();
          
          // 4. Tentar capturar FBC agressivamente
          let fbc = trackingParams.fbc;
          
          if (!fbc) {
            const urlParams = new URLSearchParams(window.location.search);
            const fbclid = urlParams.get('fbclid');
            
            if (fbclid) {
              const timestamp = Date.now();
              fbc = `fb.1.${timestamp}.${fbclid}`;
              
              const expirationDate = new Date();
              expirationDate.setDate(expirationDate.getDate() + 90);
              document.cookie = `_fbc=${fbc}; expires=${expirationDate.toUTCString()}; path=/; domain=${window.location.hostname}; SameSite=Lax`;
              
              trackingParams.fbc = fbc;
              console.log('🎯 FBC capturado via Stape Top Script:', fbc);
            }
          }

          // 5. Gerar event_id consistente
          const eventId = Date.now().toString(36) + Math.random().toString(36).substr(2);
          
          // 6. Enviar PageView com FBC garantido
          window.gtag('event', 'page_view', {
            page_title: document.title,
            page_location: window.location.href,
            page_path: pathname,
            event_id: eventId,
            user_data: trackingParams,
            stape_enabled: true // Marcar que está usando Stape
          });
          
          console.log('📍 PageView enviado via Stape Top Script:', fbc ? '✅ ' + fbc : '❌ Não encontrado');
          console.log('📊 Dados completos:', trackingParams);
          
        } catch (error) {
          console.error('❌ Erro ao enviar PageView via Stape Top Script:', error);
        }
      };

      // Enviar PageView
      sendPageView();
    }
  }, [pathname]);

  return (
    <>
      {/* Stape GTM Script - PRIMEIRO SCRIPT NO HEAD */}
      <Script
        id="stape-gtm-top"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s);j.async=true;j.src="https://bfbsewli.sag.stape.io/7aibfbsewli.js?"+i;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','2nj=AAhKIicvS1dfWy8%2FMCY%2BRB9RRUtC');
          `,
        }}
      />
    </>
  );
}