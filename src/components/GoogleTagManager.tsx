'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { getAllTrackingParams, initializeTracking, retryFbcCapture, waitForGeographicData } from '@/lib/cookies';

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

      // Estratégia de envio de PageView otimizada para FBC e dados geográficos
      const sendPageView = async (retryCount = 0) => {
        const trackingParams = await getAllTrackingParams();
        
        // Gerar event_id consistente para correlação
        const eventId = Date.now().toString(36) + Math.random().toString(36).substr(2);
        
        // Enviar para GTM Web (client-side)
        window.gtag('event', 'page_view', {
          page_title: document.title,
          page_location: window.location.href,
          page_path: pathname,
          event_id: eventId, // Adicionar event_id para correlação
          // Incluir todos os dados de rastreamento para melhor matching
          user_data: trackingParams
        });
        
        // Enviar para Server-side via DataLayer
        window.dataLayer.push({
          event: 'page_view_server',
          event_id: eventId,
          user_data: trackingParams,
          user_data_raw: trackingParams,
          page_location: window.location.href,
          page_title: document.title
        });
        
        console.log(`📍 PageView enviado (tentativa ${retryCount + 1}) com event_id:`, eventId, 'e dados:', trackingParams);
        
        // Se temos FBC e dados geográficos, ótimo! Se não, tentar novamente em breve
        const hasGoodData = trackingParams.fbc && trackingParams.city && trackingParams.state;
        if (!hasGoodData && retryCount < 3) {
          setTimeout(async () => {
            console.log(`🔄 Tentando capturar mais dados (tentativa ${retryCount + 2})...`);
            await sendPageView(retryCount + 1);
          }, retryCount === 0 ? 1000 : 1500); // Primeira tentativa em 1s, depois 1.5s
        }
      };

      // Iniciar captura de FBC imediatamente com retry
      console.log('🎯 Iniciando captura de FBC com retry...');
      initializeTracking();
      retryFbcCapture(3, 500); // 3 tentativas com delay crescente
      
      // Aguardar um pouco para tentar capturar dados geográficos e FBC
      setTimeout(async () => {
        console.log('🌍 Aguardando dados geográficos...');
        const geoData = await waitForGeographicData(1500); // Esperar até 1.5s por dados geográficos
        if (geoData) {
          console.log('✅ Dados geográficos obtidos:', geoData);
        } else {
          console.log('⚠️ Dados geográficos não obtidos no timeout, enviando mesmo assim...');
        }
        
        sendPageView();
      }, 500); // Esperar 500ms antes de enviar
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