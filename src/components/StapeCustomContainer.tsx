'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { getAllTrackingParams, initializeTracking } from '@/lib/cookies';

declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
    fbq: (...args: any[]) => void;
    _fbqBlocked: boolean;
    _blockedEvents: any[];
    _releaseBlockedEvents: () => void;
  }
}

// Cache para evitar envio de eventos duplicados em rápida sucessão
const recentEventIds = new Set<string>();

// Função para limpar cache de eventos antigos (manter apenas últimos 30 segundos)
const cleanupEventCache = () => {
  const now = Date.now();
  recentEventIds.forEach((eventId) => {
    // Extrair timestamp do eventId (formato: client_tipo_timestamp_...)
    const timestampMatch = eventId.match(/client_\w+_(\d+)_/);
    if (timestampMatch) {
      const eventTimestamp = parseInt(timestampMatch[1]);
      if (now - eventTimestamp > 30000) { // 30 segundos
        recentEventIds.delete(eventId);
      }
    }
  });
};

// Função para gerar event_id único para desduplicação
const generateEventId = (eventType: string = '') => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 16); // Aumentado para 16 caracteres
  const uuid = crypto.randomUUID ? crypto.randomUUID().replace(/-/g, '').substr(0, 12) : Math.random().toString(36).substr(2, 12);
  const nonce = Math.floor(Math.random() * 1000000); // Nonce de 6 dígitos
  // Formato: client_tipo_timestamp_random_uuid_nonce
  return `client_${eventType}_${timestamp}_${random}_${uuid}_${nonce}`;
};

interface StapeCustomContainerProps {
  gtmId: string;
}

export default function StapeCustomContainer({ gtmId = 'GTM-567XZCDX' }: StapeCustomContainerProps) {
  const pathname = usePathname();
  const gtmInitialized = useRef(false);
  const serverSideEventsSent = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined' || gtmInitialized.current) return;
    
    // Inicializar dataLayer se não existir
    window.dataLayer = window.dataLayer || [];
    
    // Sistema de bloqueio de eventos do Facebook
    window._fbqBlocked = true;
    window._blockedEvents = [];
    
    // Interceptar e bloquear eventos do Facebook Pixel
    const originalFbq = window.fbq;
    window.fbq = function(...args: any[]) {
      if (window._fbqBlocked) {
        console.log('🚫 Evento do Facebook Pixel bloqueado temporariamente:', args);
        window._blockedEvents.push(args);
        return;
      }
      return originalFbq?.apply(this, args);
    };
    
    // Função para liberar eventos bloqueados
    window._releaseBlockedEvents = () => {
      console.log('🔓 Liberando eventos bloqueados do Facebook Pixel:', window._blockedEvents.length);
      window._fbqBlocked = false;
      
      // Reenviar eventos bloqueados
      window._blockedEvents.forEach((args: any[]) => {
        console.log('📤 Reenviando evento bloqueado:', args);
        originalFbq?.apply(this, args);
      });
      
      // Limpar eventos bloqueados
      window._blockedEvents = [];
    };
    
    // Timeout de segurança global - liberar eventos após 15 segundos mesmo sem confirmação
    const safetyTimeout = setTimeout(() => {
      if (window._fbqBlocked) {
        console.log('⏰ Timeout de segurança global - liberando eventos bloqueados...');
        window._releaseBlockedEvents();
      }
    }, 15000); // 15 segundos
    
    // Função gtag
    window.gtag = function gtag(...args: any[]) {
      window.dataLayer.push(args);
    };

    // Configuração inicial do GTM (mas sem enviar eventos ainda)
    window.gtag('js', new Date());
    window.gtag('config', gtmId, { 
      send_page_view: false // Desativar envio automático de page_view
    });

    // Enviar evento page_view APÓS server-side (sincronização completa)
    const sendPageView = async () => {
      console.log('⏳ Aguardando envio dos eventos server-side antes do page_view...');
      
      // Aguardar até que os eventos server-side sejam enviados
      const waitForServerSide = () => {
        return new Promise<void>((resolve) => {
          const checkInterval = setInterval(() => {
            if (serverSideEventsSent.current) {
              clearInterval(checkInterval);
              console.log('✅ Eventos server-side enviados, liberando page_view...');
              resolve();
            }
          }, 100); // Verificar a cada 100ms
          
          // Timeout de segurança (10 segundos)
          setTimeout(() => {
            clearInterval(checkInterval);
            console.log('⚠️ Timeout de espera por eventos server-side, enviando page_view mesmo assim...');
            resolve();
          }, 10000);
        });
      };
      
      await waitForServerSide();
      
      // 1. Capturar FBC PRIMEIRO (crítico para qualidade)
      await initializeTracking();
      
      // 2. Pequeno delay para garantir processamento do cookie FBC
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
      const eventId = generateEventId('pageview');
      
      // Verificar se este evento ID já foi enviado recentemente
      if (recentEventIds.has(eventId)) {
        console.warn(`⚠️ PageView com ID ${eventId} já enviado recentemente, ignorando...`);
        return;
      }
      
      // Adicionar ao cache de eventos recentes
      recentEventIds.add(eventId);
      
      // Limpar cache de eventos antigos
      cleanupEventCache();
      
      // 6. Enviar PageView com FBC garantido (agora com atraso estratégico)
      console.log('📍 Enviando PageView COM FBC (após server-side):', fbc ? '✅ ' + fbc : '❌ Não encontrado');
      
      window.gtag('event', 'page_view', {
        page_title: document.title,
        page_location: window.location.href,
        page_path: pathname,
        event_id: eventId, // Adicionar event_id para correlação
        // Incluir todos os dados de rastreamento para melhor matching
        user_data: trackingParams
      });
      
      console.log('📊 Dados completos do PageView:', trackingParams);
      console.log('🎯 FBC status no PageView:', fbc ? '✅ Capturado' : '❌ Não encontrado');
      
      // 7. Marcar GTM como inicializado
      gtmInitialized.current = true;
    };

    // Enviar PageView de forma sincronizada (aguarda server-side)
    sendPageView();
    
    // Expor função para marcar eventos server-side como enviados
    window.markServerSideEventsSent = () => {
      console.log('✅ Marcando eventos server-side como enviados');
      serverSideEventsSent.current = true;
    };
    
  }, [pathname, gtmId]);

  return (
    <>
      {/* Stape.io Custom Container - Anti-AdBlock */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s);j.async=true;j.src="https://data.maracujazeropragas.com/aqffwhuqxv.js?"+i;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','b6oj=HxxMMjw6S1NATykvKzM%2BQABFQ1tZUQIISxUQBwkUEwwXAhQHBwcUBxEZAlsLGAs%3D');
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