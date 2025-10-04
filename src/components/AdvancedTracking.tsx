'use client';
import { useEffect, useRef } from 'react';
import META_CONFIG, { formatUserDataForMeta, validateMetaConfig } from '@/lib/metaConfig';
import { getAllTrackingParams, initializeTracking, getHighQualityLocationData, getHighQualityPersonalData, validateDataQuality } from '@/lib/cookies';
import { validateAndFixFacebookEvent, debugFacebookEvent } from '@/lib/facebookPixelValidation';
import { eventManager } from '@/lib/eventManager';

// --- FUNÇÕES SIMPLIFICADAS USANDO EVENT MANAGER ---

// Função trackViewContent simplificada usando EventManager
const trackViewContent = async (viewContentHasBeenTracked: any) => {
  if (viewContentHasBeenTracked.current) {
    return;
  }

  console.log('🚀 Enviando ViewContent via EventManager...');

  await initializeTracking();
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

  // Enviar via EventManager (gerencia deduplicação automaticamente)
  const result = await eventManager.sendViewContent(userData);
  
  if (result.success) {
    console.log('✅ ViewContent enviado com sucesso via EventManager:', result);
    viewContentHasBeenTracked.current = true;
  } else {
    console.error('❌ Falha ao enviar ViewContent via EventManager');
  }
};

// Função trackCheckout simplificada usando EventManager
export const trackCheckout = async (userData: any) => {
  console.log('🚀 Enviando InitiateCheckout via EventManager...');

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

  // Salvar os dados pessoais no localStorage para uso futuro em view_content
  if (userData.email || userData.phone || userData.firstName || userData.lastName) {
    const { savePersonalDataToLocalStorage } = await import('@/lib/cookies');
    const personalDataToSave = {
      fn: userData.firstName ? userData.firstName.trim() : personalData.fn,
      ln: userData.lastName ? userData.lastName.trim() : personalData.ln,
      em: userData.email ? userData.email.toLowerCase().trim() : personalData.em,
      ph: userData.phone ? userData.phone.replace(/\D/g, '') : personalData.ph
    };
    savePersonalDataToLocalStorage(personalDataToSave);
    console.log('💾 Dados pessoais salvos para uso futuro:', personalDataToSave);
  }

  console.log('📊 Dados formatados para EventManager:', formattedUserData);

  // Enviar via EventManager (gerencia deduplicação automaticamente)
  const result = await eventManager.sendInitiateCheckout(formattedUserData);
  
  if (result.success) {
    console.log('✅ InitiateCheckout enviado com sucesso via EventManager:', result);
  } else {
    console.error('❌ Falha ao enviar InitiateCheckout via EventManager');
  }
};

// --- COMPONENTE PRINCIPAL ---
export default function AdvancedTracking() {
  // Cria a trava para o view_content, que persiste durante o ciclo de vida do componente.
  const viewContentHasBeenTracked = useRef(false);

  useEffect(() => {
    // Validar configuração primeiro
    validateMetaConfig();
    
    // Dispara o view_content após o tempo configurado, mas apenas se a trava permitir.
    if (META_CONFIG.TRACKING.enableViewContent) {
      const timer = setTimeout(async () => {
        console.log('🎯 DISPARANDO VIEWCONTENT PARA TESTE NO PIXEL HELPER');
        await trackViewContent(viewContentHasBeenTracked);
      }, 500); // Reduzido para 500ms para teste rápido

      // Expondo as funções na janela global para serem chamadas pelo pré-checkout.
      if (typeof window !== 'undefined') {
        window.advancedTracking = {
          trackCheckout,
          trackViewContentWithUserData: trackViewContent,
          // Função de teste para o Pixel Helper
          testCheckout: () => {
            console.log('🧪 TESTANDO CHECKOUT NO PIXEL HELPER');
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
          // Funções de depuração do EventManager
          getEventManagerStats: () => {
            return eventManager.getCacheStats();
          },
          clearEventManagerCache: () => {
            eventManager.clearCache();
          },
          testEventManagerDeduplication: () => {
            console.log('🧪 Testando deduplicação do EventManager...');
            // Testar envio do mesmo evento múltiplas vezes
            const testData = {
              email: 'teste@deduplicacao.com',
              phone: '11999999999',
              firstName: 'Teste',
              lastName: 'Deduplicação'
            };
            
            // Enviar o mesmo evento 3 vezes - só o primeiro deve passar
            eventManager.sendInitiateCheckout(testData);
            setTimeout(() => eventManager.sendInitiateCheckout(testData), 100);
            setTimeout(() => eventManager.sendInitiateCheckout(testData), 200);
          }
        };
      }

      // Limpa o timer se o componente for desmontado.
      return () => clearTimeout(timer);
    }
  }, []);

  return null; // O componente não renderiza nada na tela.
}

// --- TIPAGEM GLOBAL ---
// Garante que o TypeScript entenda o objeto window.advancedTracking.
declare global {
  interface Window {
    dataLayer?: any[];
    advancedTracking?: {
      trackCheckout: (userData: any) => Promise<void>;
      trackViewContentWithUserData: (userData: any) => Promise<void>;
      testCheckout: () => void;
      getEventManagerStats: () => any;
      clearEventManagerCache: () => void;
      testEventManagerDeduplication: () => void;
    };
    markServerSideEventsSent?: () => void;
    _releaseBlockedEvents?: () => void;
    eventManager?: any;
  }
}