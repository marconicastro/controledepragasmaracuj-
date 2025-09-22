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

interface StapeCustomContainerProps {
  gtmId: string;
}

export default function StapeCustomContainer({ gtmId = 'GTM-567XZCDX' }: StapeCustomContainerProps) {
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

      // Enviar evento page_view APÓS capturar FBC (sincronizado)
      const sendPageView = async () => {
        // 1. Capturar FBC PRIMEIRO (crítico para qualidade)
        await initializeTracking();
        
        // 2. Pequeno delay para garantir processamento do cookie FBC (AJUSTE PONTUAL)
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // 3. Obter todos os parâmetros de rastreamento com FBC garantido
        const trackingParams = await getAllTrackingParams();
        
        // 4. Garantir captura do FBC - TENTATIVA AGRESSIVA
        let fbc = trackingParams.fbc;
        
        // Se não tiver FBC, tentar capturar da URL novamente
        if (!fbc && typeof window !== 'undefined') {
          const urlParams = new URLSearchParams(window.location.search);
          const fbclid = urlParams.get('fbclid');
          
          if (fbclid) {
            // Criar FBC no formato correto
            const timestamp = Date.now();
            fbc = `fb.1.${timestamp}.${fbclid}`;
            
            // Salvar no cookie para futuros eventos
            const expirationDate = new Date();
            expirationDate.setDate(expirationDate.getDate() + 90);
            document.cookie = `_fbc=${fbc}; expires=${expirationDate.toUTCString()}; path=/; domain=${window.location.hostname}; SameSite=Lax`;
            
            console.log('🎯 FBC capturado e salvo no PageView:', fbc);
            
            // Atualizar trackingParams com o FBC capturado
            trackingParams.fbc = fbc;
          }
        }
        
        // Se ainda não tiver FBC, tentar obter do cookie novamente
        if (!fbc && typeof window !== 'undefined') {
          const fbcCookie = document.cookie.match(new RegExp('(^| )_fbc=([^;]+)'));
          if (fbcCookie) {
            fbc = fbcCookie[2];
            trackingParams.fbc = fbc;
            console.log('🎯 FBC obtido do cookie no PageView:', fbc);
          }
        }
        
        // Log do status do FBC para depuração
        console.log('📊 Status FBC no PageView:', fbc ? '✅ Presente' : '❌ Ausente');
        if (fbc) {
          console.log('🔑 FBC value:', fbc);
        }
        
        // 5. Gerar event_id consistente para correlação
        const eventId = Date.now().toString(36) + Math.random().toString(36).substr(2);
        
        // 6. Enviar PageView com FBC garantido
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
        console.log('🎯 FBC status no PageView:', fbc ? '✅ Capturado' : '❌ Não encontrado');
      };

      // Enviar PageView de forma sincronizada (aguarda FBC)
      sendPageView();
    }
  }, [pathname, gtmId]);

  return (
    <>
      {/* Stape.io Custom Container - Anti-AdBlock */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s);j.async=true;j.src="https://data.maracujazeropragas.com/7aibfbsewli.js?"+i;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','2nj=AAhKIicvS1dfWy8%2FMCY%2BRB9RRUtCRAIMVAEWFxIBEwgIFhIXHBIUAw4NBEsQDQs%3D');
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