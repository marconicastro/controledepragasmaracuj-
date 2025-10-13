'use client';
import { useEffect, useRef } from 'react';
import { eventManager } from '@/lib/eventManager';
import { getAllTrackingParams, initializeTracking, getHighQualityLocationData, getHighQualityPersonalData } from '@/lib/cookies';

// --- FUNÇÕES ESSENCIAIS APENAS ---

// Função trackViewContent simplificada
const trackViewContent = async (viewContentHasBeenTracked: any) => {
  if (viewContentHasBeenTracked.current) {
    return;
  }

  console.log('🚀 Enviando ViewContent único...');

  // initializeTracking() já foi chamado no useEffect principal
  await new Promise(resolve => setTimeout(resolve, 100));

  const locationData = await getHighQualityLocationData();
  const personalData = await getHighQualityPersonalData();
  const trackingParams = await getAllTrackingParams();

  // Preparar dados do usuário formatados
  const userData = {
    em: personalData.em,
    ph: personalData.ph,
    fn: personalData.fn,
    ln: personalData.ln,
    ct: locationData.city,
    st: locationData.state,
    zp: locationData.zip,
    country: locationData.country,
    fbc: trackingParams.fbc,
    fbp: trackingParams.fbp,
    ga_client_id: trackingParams.ga_client_id,
    external_id: trackingParams.external_id
  };

  // Enviar via EventManager
  const result = await eventManager.sendViewContent(userData);
  
  if (result.success) {
    console.log('✅ ViewContent enviado com sucesso (canal único):', result);
    viewContentHasBeenTracked.current = true;
  } else {
    console.error('❌ Falha ao enviar ViewContent');
  }
};

// Função trackCheckout essencial
export const trackCheckout = async (userData: any) => {
  console.log('🚀 Enviando InitiateCheckout único...');

  await new Promise(resolve => setTimeout(resolve, 50));

  const locationData = await getHighQualityLocationData();
  const personalData = await getHighQualityPersonalData();

  // Preparar dados do usuário com prioridade para dados do formulário
  const formattedUserData = {
    em: userData.email ? userData.email.toLowerCase().trim() : personalData.em,
    ph: userData.phone ? userData.phone.replace(/\D/g, '') : personalData.ph,
    fn: userData.firstName ? userData.firstName.trim() : personalData.fn,
    ln: userData.lastName ? userData.lastName.trim() : personalData.ln,
    ct: locationData.city || userData.city || undefined,
    st: locationData.state || userData.state || undefined,
    zp: locationData.zip || userData.zip || undefined,
    country: locationData.country || userData.country || 'BR',
    fbc: userData.fbc,
    fbp: userData.fbp,
    ga_client_id: userData.ga_client_id,
    external_id: userData.external_id
  };

  // Salvar os dados pessoais no localStorage para uso futuro
  if (userData.email || userData.phone || userData.firstName || userData.lastName) {
    const { savePersonalDataToLocalStorage } = await import('@/lib/cookies');
    const personalDataToSave = {
      fn: userData.firstName ? userData.firstName.trim() : personalData.fn,
      ln: userData.lastName ? userData.lastName.trim() : personalData.ln,
      em: userData.email ? userData.email.toLowerCase().trim() : personalData.em,
      ph: userData.phone ? userData.phone.replace(/\D/g, '') : personalData.ph
    };
    savePersonalDataToLocalStorage(personalDataToSave);
    console.log('💾 Dados pessoais salvos:', personalDataToSave);
  }

  console.log('📊 Dados formatados:', formattedUserData);

  // Enviar via EventManager
  const result = await eventManager.sendInitiateCheckout(formattedUserData);
  
  if (result.success) {
    console.log('✅ InitiateCheckout enviado com sucesso (canal único):', result);
  } else {
    console.error('❌ Falha ao enviar InitiateCheckout');
  }
};

// --- COMPONENTE PRINCIPAL SIMPLIFICADO ---
export default function AdvancedTracking() {
  const viewContentHasBeenTracked = useRef(false);
  const pageViewHasBeenTracked = useRef(false);

  useEffect(() => {
    // � CRÍTICO: Inicializar tracking IMEDIATAMENTE para capturar fbclid
    console.log('🚀 Inicializando tracking imediatamente...');
    initializeTracking();
    
    // Otimizado: iniciar tracking sem bloquear renderização
    const initTimer = requestIdleCallback(() => {
      // Adicionar logs detalhados para debug do PageView
      console.log('🔍 Debug do PageView (após idle callback):');
      console.log('- window.dataLayer existe:', !!window.dataLayer);
      console.log('- window.fbq existe:', !!window.fbq);
      console.log('- pageViewHasBeenTracked:', pageViewHasBeenTracked.current);
      console.log('- dataLayer content:', window.dataLayer);
      
      // Dispara PageView via GTM assim que o componente monta
      if (!pageViewHasBeenTracked.current && typeof window !== 'undefined' && window.dataLayer) {
        console.log('📄 Enviando PageView único via GTM...');
        
        // Adicionar log detalhado antes de enviar
        const pageViewEvent = {
          event: 'page_view',
          event_id: `pageview_${Date.now()}_gtm`,
          page_title: document.title,
          page_location: window.location.href,
          page_referrer: document.referrer,
          // Dados adicionais para GA4
          event_category: 'navigation',
          event_label: document.title,
          timestamp: new Date().toISOString()
        };
        
        console.log('📤 Evento PageView que será enviado:', pageViewEvent);
        
        window.dataLayer.push(pageViewEvent);
        
        // Enviar também diretamente para GA4 se disponível
        if (typeof window.gtag !== 'undefined') {
          window.gtag('config', 'G-CZ0XMXL3RX', {
            page_title: document.title,
            page_location: window.location.href,
            page_referrer: document.referrer
          });
          window.gtag('event', 'page_view', {
            page_title: document.title,
            page_location: window.location.href,
            page_referrer: document.referrer,
            send_to: 'G-CZ0XMXL3RX'
          });
          console.log('✅ PageView também enviado diretamente para GA4');
        }
        
        pageViewHasBeenTracked.current = true;
        console.log('✅ PageView enviado via GTM');
        console.log('📊 dataLayer após PageView:', window.dataLayer);
        
        // Verificar se o evento foi realmente adicionado
        setTimeout(() => {
          console.log('🔍 Verificando se PageView está no dataLayer...');
          const hasPageView = window.dataLayer?.some(item => item.event === 'page_view');
          console.log('- PageView encontrado no dataLayer:', hasPageView);
          
          // Fallback desativado para evitar duplicidade com GTM/Stape
          if (!hasPageView) {
            console.log('⚠️ PageView não encontrado no dataLayer, mas fallback desativado para evitar duplicidade');
            console.log('💡 Verifique sua configuração GTM/Stape');
          }
        }, 2000);
      } else {
        console.log('❌ Condições para PageView não atendidas:', {
          hasWindow: typeof window !== 'undefined',
          hasDataLayer: !!window.dataLayer,
          alreadyTracked: pageViewHasBeenTracked.current
        });
      }
    }, { timeout: 3000 }); // Timeout de 3 segundos como fallback

    // Dispara o view_content apenas uma vez após 5 segundos (otimizado para performance)
    const timer = setTimeout(async () => {
      console.log('🎯 Disparando ViewContent único...');
      await trackViewContent(viewContentHasBeenTracked);
    }, 5000);

    // Expondo as funções essenciais na janela global
    if (typeof window !== 'undefined') {
      window.advancedTracking = {
        trackCheckout,
        trackViewContentWithUserData: trackViewContent,
        // Função de teste para debug
        testCheckout: () => {
          console.log('🧪 Testando checkout...');
          trackCheckout({
            email: 'teste@email.com',
            phone: '11999999999',
            firstName: 'Teste',
            lastName: 'Usuario',
            city: 'São Paulo',
            state: 'SP',
            zip: '01310-100',
            country: 'BR'
          });
        },
        // Função para testar ViewContent manualmente
        testViewContent: () => {
          console.log('🧪 Testando ViewContent...');
          trackViewContent(viewContentHasBeenTracked);
        },
        // Função para testar PageView manualmente
        testPageView: () => {
          console.log('🧪 Testando PageView...');
          if (typeof window !== 'undefined' && window.dataLayer) {
            const testEvent = {
              event: 'page_view',
              event_id: `pageview_test_${Date.now()}_gtm`,
              page_title: document.title,
              page_location: window.location.href,
              page_referrer: document.referrer,
              event_category: 'navigation',
              event_label: document.title,
              test_mode: true,
              timestamp: new Date().toISOString()
            };
            
            console.log('📤 Enviando PageView de teste:', testEvent);
            window.dataLayer.push(testEvent);
            console.log('✅ PageView de teste enviado via GTM');
            
            // Testar GA4 também
            if (typeof window.gtag !== 'undefined') {
              console.log('🧪 Testando PageView via GA4 direto...');
              window.gtag('event', 'page_view', {
                page_title: document.title,
                page_location: window.location.href,
                page_referrer: document.referrer,
                send_to: 'G-CZ0XMXL3RX',
                test_mode: true
              });
              console.log('✅ PageView de teste enviado via GA4 direto');
            }
            
            // Facebook Pixel fallback desativado para evitar duplicidade
            console.log('🚫 Facebook Pixel fallback desativado para teste (evitar duplicidade)');
          } else {
            console.log('❌ dataLayer não disponível para teste');
          }
        },
        // Função para verificar status do tracking
        checkTrackingStatus: () => {
          console.log('📊 Status do Tracking:');
          console.log('- dataLayer:', !!window.dataLayer);
          console.log('- fbq:', !!window.fbq);
          console.log('- gtag:', !!window.gtag);
          console.log('- pageView já trackeado:', pageViewHasBeenTracked.current);
          console.log('- viewContent já trackeado:', viewContentHasBeenTracked.current);
          
          // Verificar cookies Facebook
          const { fbc, fbp } = require('@/lib/cookies').getFacebookCookies();
          console.log('📊 Status dos cookies Facebook:');
          console.log('- _fbc:', fbc || '❌ Não encontrado');
          console.log('- _fbp:', fbp || '❌ Não encontrado');
          
          // Verificar parâmetros da URL atual
          if (typeof window !== 'undefined') {
            const urlParams = new URLSearchParams(window.location.search);
            const fbclid = urlParams.get('fbclid');
            console.log('🔍 Parâmetros da URL atual:');
            console.log('- fbclid:', fbclid || '❌ Não encontrado');
            console.log('- URL completa:', window.location.href);
          }
          
          if (window.dataLayer) {
            console.log('- dataLayer items:', window.dataLayer.length);
            console.log('- dataLayer content:', window.dataLayer);
          }
        },
        // Função para testar captura de fbclid
        testFbclidCapture: () => {
          console.log('🧪 Testando captura de fbclid...');
          const { captureFbclid, getFacebookCookies } = require('@/lib/cookies');
          captureFbclid();
          setTimeout(() => {
            const { fbc, fbp } = getFacebookCookies();
            console.log('📊 Resultado após teste:');
            console.log('- _fbc:', fbc || '❌ Não capturado');
            console.log('- _fbp:', fbp || '❌ Não capturado');
          }, 200);
        }
      };
    }

    return () => {
      if (initTimer) cancelIdleCallback(initTimer);
      clearTimeout(timer);
    };
  }, []);

  return null; // Componente invisível
}

// --- TIPAGEM GLOBAL SIMPLIFICADA ---
declare global {
  interface Window {
    dataLayer?: any[];
    fbq?: any;
    gtag?: any;
    advancedTracking?: {
      trackCheckout: (userData: any) => Promise<void>;
      trackViewContentWithUserData: (userData: any) => Promise<void>;
      testCheckout: () => void;
      testViewContent: () => void;
      testPageView: () => void;
      checkTrackingStatus: () => void;
      testFbclidCapture: () => void;
    };
  }
}