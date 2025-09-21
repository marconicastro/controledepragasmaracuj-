'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { getAllTrackingParams, initializeTracking, waitForFBCReady } from '@/lib/cookies';

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

      // Enviar evento page_view APÓS garantir FBC (sincronizado)
      const sendPageView = async () => {
        console.log('🎯 Iniciando envio de PageView com garantia de FBC...');
        
        // 1. Inicializar tracking primeiro
        await initializeTracking();
        
        // 2. GARANTIR FBC com retry inteligente (CRÍTICO)
        const fbc = await waitForFBCReady();
        
        // 3. Obter todos os parâmetros de rastreamento com FBC garantido
        const trackingParams = await getAllTrackingParams();
        
        // Forçar o FBC garantido nos parâmetros
        trackingParams.fbc = fbc;
        
        // Log do status do FBC para depuração
        console.log('📊 Status FBC no PageView:', fbc ? '✅ Presente' : '❌ Ausente');
        if (fbc) {
          console.log('🔑 FBC value:', fbc);
        }
        
        // 4. Gerar event_id consistente para correlação
        const eventId = Date.now().toString(36) + Math.random().toString(36).substr(2);
        
        // 5. Enviar PageView com FBC garantido
        window.gtag('event', 'page_view', {
          page_title: document.title,
          page_location: window.location.href,
          page_path: pathname,
          event_id: eventId, // Adicionar event_id para correlação
          // Incluir todos os dados de rastreamento para melhor matching
          user_data: trackingParams
        });
        
        console.log('📍 PageView enviado COM FBC:', fbc ? '✅ ' + fbc : '❌ Não encontrado');
        console.log('📊 Dados completos:', trackingParams);
        console.log('🎯 FBC status no PageView:', fbc ? '✅ Garantido com retry' : '❌ Não encontrado mesmo com retry');
      };

      // Enviar PageView de forma sincronizada (aguarda FBC)
      sendPageView();
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