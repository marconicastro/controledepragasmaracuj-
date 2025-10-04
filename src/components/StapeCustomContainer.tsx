'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { getAllTrackingParams, initializeTracking } from '@/lib/cookies';

declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
    fbq: (...args: any[]) => void;
    advancedTracking?: {
      trackCheckout: (userData: any) => Promise<void>;
      trackViewContentWithUserData: (userData: any) => Promise<void>;
      testCheckout: () => void;
      getTrackingStats: () => { dataLayerLength: number; gtmInitialized: boolean };
      testDataLayerPush: () => void;
    };
    _stapeGtmLoaded?: boolean;
    _originalGtag?: (...args: any[]) => void;
    _pixelEventsBlocked?: boolean;
  }
}

interface StapeCustomContainerProps {
  gtmId: string;
}

export default function StapeCustomContainer({ gtmId = 'GTM-567XZCDX' }: StapeCustomContainerProps) {
  const pathname = usePathname();
  const gtmInitialized = useRef(false);
  const scriptLoaded = useRef(false);

  useEffect(() => {
    // Verificação global - se o pixel já foi carregado em qualquer lugar
    if (typeof window !== 'undefined' && window._stapeGtmLoaded) {
      console.log('🚫 GTM já carregado globalmente - evitando duplicação');
      gtmInitialized.current = true;
      return;
    }
    
    if (typeof window === 'undefined' || gtmInitialized.current || scriptLoaded.current) return;
    
    // Marcar como carregado imediatamente para evitar race conditions
    scriptLoaded.current = true;
    
    // Inicializar dataLayer se não existir
    window.dataLayer = window.dataLayer || [];
    
    // Função gtag simplificada - permite configuração mas bloqueia eventos automáticos duplicados
    window.gtag = function gtag(...args: any[]) {
      // Permitir configurações básicas
      if (args[0] === 'config' || args[0] === 'js' || args[0] === 'set') {
        window.dataLayer.push(args);
        return;
      }
      
      // Bloquear eventos automáticos duplicados, mas permitir eventos manuais
      if (args[0] === 'event') {
        const eventName = args[1];
        
        // Bloquear apenas eventos automáticos duplicados
        if (eventName === 'page_view' && !window._pixelEventsBlocked) {
          console.log('🚫 PageView automático bloqueado - GTM gerenciará');
          window._pixelEventsBlocked = true; // Marcar que já bloqueamos
          return;
        }
        
        if (eventName === 'view_content' && !window._pixelEventsBlocked) {
          console.log('🚫 ViewContent automático bloqueado - GTM gerenciará');
          return;
        }
        
        // Permitir eventos manuais (checkout, etc)
        if (['initiate_checkout', 'purchase', 'lead'].includes(eventName)) {
          window.dataLayer.push(args);
          return;
        }
        
        // Permitir outros eventos que não sejam duplicados
        window.dataLayer.push(args);
      }
    };

    // Configuração inicial do GTM
    window.gtag('js', new Date());

    // Inicializar o GTM e configurar dados
    const initializeGTM = async () => {
      console.log('📍 Inicializando GTM com controle de eventos...');
      
      try {
        // 1. Capturar parâmetros de rastreamento
        await initializeTracking();
        await new Promise(resolve => setTimeout(resolve, 100));
        const trackingParams = await getAllTrackingParams();
        
        // 2. Preparar dados do usuário
        const userData = {
          user_data: {
            em: trackingParams.email,
            ph: trackingParams.phone,
            fn: trackingParams.firstName,
            ln: trackingParams.lastName,
            ct: trackingParams.city,
            st: trackingParams.state,
            zp: trackingParams.zip,
            country: trackingParams.country || 'BR'
          },
          fbc: trackingParams.fbc,
          fbp: trackingParams.fbp,
          fbclid: trackingParams.fbclid,
          external_id: trackingParams.external_id,
          utm_source: trackingParams.utm_source,
          utm_medium: trackingParams.utm_medium,
          utm_campaign: trackingParams.utm_campaign,
          utm_content: trackingParams.utm_content,
          utm_term: trackingParams.utm_term
        };
        
        // 3. Configurar dataLayer com dados do usuário (sem eventos automáticos)
        window.dataLayer.push({
          'user_data': userData.user_data,
          'fbc': userData.fbc,
          'fbp': userData.fbp,
          'fbclid': userData.fbclid,
          'x-stape-user-id': userData.external_id,
          'utm_source': userData.utm_source,
          'utm_medium': userData.utm_medium,
          'utm_campaign': userData.utm_campaign,
          'utm_content': userData.utm_content,
          'utm_term': userData.utm_term
        });
        
        console.log('✅ Dados de rastreamento configurados no dataLayer');
        
        // 4. Expor funções globais para checkout
        if (typeof window !== 'undefined') {
          window.advancedTracking = {
            trackCheckout: async (userData: any) => {
              console.log('🚀 Enviando InitiateCheckout via dataLayer...');
              
              const checkoutData = {
                'event': 'initiate_checkout',
                'user_data': {
                  em: userData.email || userData.em,
                  ph: userData.phone || userData.ph,
                  fn: userData.firstName || userData.fn,
                  ln: userData.lastName || userData.ln,
                  ct: userData.city || userData.ct,
                  st: userData.state || userData.st,
                  zp: userData.zip || userData.zp,
                  country: userData.country || 'BR'
                },
                'fbc': userData.fbc || trackingParams.fbc,
                'fbp': userData.fbp || trackingParams.fbp,
                'fbclid': userData.fbclid || trackingParams.fbclid,
                'x-stape-user-id': userData.external_id || trackingParams.external_id,
                'utm_source': userData.utm_source || trackingParams.utm_source,
                'utm_medium': userData.utm_medium || trackingParams.utm_medium,
                'utm_campaign': userData.utm_campaign || trackingParams.utm_campaign,
                'utm_content': userData.utm_content || trackingParams.utm_content,
                'utm_term': userData.utm_term || trackingParams.utm_term,
                'value': '39.90',
                'currency': 'BRL',
                'content_name': 'E-book Sistema de Controle de Trips',
                'content_category': 'E-book',
                'content_ids': '["ebook-controle-trips"]',
                'num_items': '1',
                'items': '[{"id":"ebook-controle-trips","quantity":1,"item_price":39.90}]'
              };
              
              window.dataLayer.push(checkoutData);
              console.log('✅ InitiateCheckout enviado via dataLayer');
            },
            trackViewContentWithUserData: async (userData: any) => {
              console.log('🚀 Enviando ViewContent com dados do usuário via dataLayer...');
              
              const viewContentUserData = {
                'event': 'view_content',
                'user_data': {
                  em: userData.email || userData.em,
                  ph: userData.phone || userData.ph,
                  fn: userData.firstName || userData.fn,
                  ln: userData.lastName || userData.ln,
                  ct: userData.city || userData.ct,
                  st: userData.state || userData.st,
                  zp: userData.zip || userData.zp,
                  country: userData.country || 'BR'
                },
                'fbc': userData.fbc || trackingParams.fbc,
                'fbp': userData.fbp || trackingParams.fbp,
                'fbclid': userData.fbclid || trackingParams.fbclid,
                'x-stape-user-id': userData.external_id || trackingParams.external_id,
                'utm_source': userData.utm_source || trackingParams.utm_source,
                'utm_medium': userData.utm_medium || trackingParams.utm_medium,
                'utm_campaign': userData.utm_campaign || trackingParams.utm_campaign,
                'utm_content': userData.utm_content || trackingParams.utm_content,
                'utm_term': userData.utm_term || trackingParams.utm_term
              };
              
              window.dataLayer.push(viewContentUserData);
              console.log('✅ ViewContent com dados do usuário enviado via dataLayer');
            },
            testCheckout: () => {
              console.log('🧪 TESTANDO CHECKOUT');
              if (window.advancedTracking) {
                window.advancedTracking.trackCheckout({
                  email: 'teste@email.com',
                  phone: '11999999999',
                  firstName: 'Teste',
                  lastName: 'Usuario',
                  city: 'São Paulo',
                  state: 'SP',
                  zip: '01310-100',
                  country: 'BR'
                });
              }
            },
            getTrackingStats: () => {
              return {
                dataLayerLength: window.dataLayer ? window.dataLayer.length : 0,
                gtmInitialized: gtmInitialized.current
              };
            },
            testDataLayerPush: () => {
              console.log('🧪 Testando push para dataLayer...');
              window.dataLayer.push({
                'event': 'test_event',
                'test_data': 'test_value',
                'timestamp': new Date().toISOString()
              });
            }
          };
        }
        
        // 5. Marcar GTM como inicializado
        gtmInitialized.current = true;
        
      } catch (error) {
        console.error('❌ Erro ao inicializar GTM:', error);
        gtmInitialized.current = true;
      }
    };

    // Inicializar GTM de forma assíncrona
    initializeGTM();
    
  }, [pathname, gtmId]);

  return (
    <>
      {/* Stape.io Custom Container - Anti-AdBlock */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            // Verificação global para evitar duplicação
            if (typeof window !== 'undefined') {
              if (window._stapeGtmLoaded) {
                console.log('🚫 GTM já carregado - evitando duplicação');
                return;
              }
              
              // Marcar como carregado globalmente
              window._stapeGtmLoaded = true;
              
              // Inicializar dataLayer se não existir
              window.dataLayer = window.dataLayer || [];
              
              // Proteger gtag original se existir
              if (typeof window.gtag === 'function') {
                window._originalGtag = window.gtag;
              }
              
              // Sobrescrever gtag para controle fino de eventos
              window.gtag = function() {
                // Permitir configurações
                if (arguments[0] === 'config' || arguments[0] === 'js' || arguments[0] === 'set') {
                  if (window.dataLayer) {
                    window.dataLayer.push(arguments);
                  }
                  return;
                }
                
                // Controle de eventos
                if (arguments[0] === 'event') {
                  const eventName = arguments[1];
                  
                  // Permitir PageView apenas uma vez (do GTM, não do React)
                  if (eventName === 'page_view') {
                    if (!window._pageViewSent) {
                      window._pageViewSent = true;
                      if (window.dataLayer) {
                        window.dataLayer.push(arguments);
                      }
                      console.log('✅ PageView enviado (única vez)');
                    } else {
                      console.log('🚫 PageView duplicado bloqueado');
                    }
                    return;
                  }
                  
                  // Bloquear ViewContent automático
                  if (eventName === 'view_content') {
                    console.log('🚫 ViewContent automático bloqueado');
                    return;
                  }
                  
                  // Permitir eventos manuais
                  if (['initiate_checkout', 'purchase', 'lead'].includes(eventName)) {
                    if (window.dataLayer) {
                      window.dataLayer.push(arguments);
                    }
                    console.log('✅ Evento manual permitido:', eventName);
                    return;
                  }
                  
                  // Permitir outros eventos
                  if (window.dataLayer) {
                    window.dataLayer.push(arguments);
                  }
                }
              };
              
              // Configurar GTM
              window.dataLayer.push({
                'gtm.start': new Date().getTime(),
                'event': 'gtm.js'
              });
              
              // Carregar GTM
              (function(w,d,s,l,i){
                w[l]=w[l]||[];
                var f=d.getElementsByTagName(s)[0],j=d.createElement(s);
                j.async=true;
                j.src="https://data.maracujazeropragas.com/24rckptuywp.js?"+i;
                f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','4n13l=GRNEMiA9RlZGQCEvNzQzRQZKS1tFVg8NTRoYBxUTHgkRDRwHGwAZAhcWClsXHwY%3D');
            }
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