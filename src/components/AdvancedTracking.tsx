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

  // Enviar via EventManager
  const result = await eventManager.sendViewContent(userData);
  
  if (result.success) {
    console.log('✅ ViewContent enviado com sucesso:', result);
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
    console.log('✅ InitiateCheckout enviado com sucesso:', result);
  } else {
    console.error('❌ Falha ao enviar InitiateCheckout');
  }
};

// --- COMPONENTE PRINCIPAL SIMPLIFICADO ---
export default function AdvancedTracking() {
  const viewContentHasBeenTracked = useRef(false);

  useEffect(() => {
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
        }
      };
    }

    return () => clearTimeout(timer);
  }, []);

  return null; // Componente invisível
}

// --- TIPAGEM GLOBAL SIMPLIFICADA ---
declare global {
  interface Window {
    dataLayer?: any[];
    advancedTracking?: {
      trackCheckout: (userData: any) => Promise<void>;
      trackViewContentWithUserData: (userData: any) => Promise<void>;
      testCheckout: () => void;
      testViewContent: () => void;
    };
  }
}