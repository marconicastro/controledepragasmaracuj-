'use client';
import { useEffect, useRef } from 'react';
import META_CONFIG, { formatUserDataForMeta, validateMetaConfig } from '@/lib/metaConfig';
import { getAllTrackingParams, initializeTracking, getHighQualityLocationData, getHighQualityPersonalData, validateDataQuality } from '@/lib/cookies';
import { validateAndFixFacebookEvent, debugFacebookEvent } from '@/lib/facebookPixelValidation';

// --- FUNÇÕES HELPER PARA O DATALAYER ---
// Função para limpar dados removendo valores vazios e undefined
const cleanUserData = (userData: any) => {
  const cleaned = { ...userData };
  
  Object.keys(cleaned).forEach(key => {
    if (cleaned[key] === undefined || cleaned[key] === '' || cleaned[key] === null) {
      delete cleaned[key];
    }
  });
  
  return cleaned;
};

// Cache para evitar envio de eventos duplicados em rápida sucessão
const recentEventIds = new Set<string>();

// Função para limpar cache de eventos antigos (manter apenas últimos 60 segundos)
const cleanupEventCache = () => {
  const now = Date.now();
  recentEventIds.forEach((eventId) => {
    // Extrair timestamp do eventId (formato: client_tipo_timestamp_...)
    const timestampMatch = eventId.match(/client_\w+_(\d+)_/);
    if (timestampMatch) {
      const eventTimestamp = parseInt(timestampMatch[1]);
      if (now - eventTimestamp > 60000) { // 60 segundos (aumentado)
        recentEventIds.delete(eventId);
      }
    }
  });
};

// Função para gerar event_id único para desduplicação
const generateEventId = (eventType: string = '') => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 16);
  const uuid = crypto.randomUUID ? crypto.randomUUID().replace(/-/g, '').substr(0, 12) : Math.random().toString(36).substr(2, 12);
  const nonce = Math.floor(Math.random() * 1000000);
  // Adicionar um identificador único baseado no tempo em milissegundos + contador
  const uniqueCounter = performance.now().toString(36).replace('.', '');
  // Formato: client_tipo_timestamp_random_uuid_nonce_uniqueCounter
  return `client_${eventType}_${timestamp}_${random}_${uuid}_${nonce}_${uniqueCounter}`;
};

// Função para enviar eventos com retry e validação de qualidade
const sendEventWithRetry = async (eventName: string, eventData: any, maxRetries = 3) => {
  let retries = 0;
  
  // Verificar se este evento ID já foi enviado recentemente
  if (recentEventIds.has(eventData.event_id)) {
    console.warn(`⚠️ Evento ${eventName} com ID ${eventData.event_id} já enviado recentemente, ignorando...`);
    return;
  }
  
  // Adicionar ao cache de eventos recentes
  recentEventIds.add(eventData.event_id);
  
  // Limpar cache de eventos antigos
  cleanupEventCache();
  
  const attemptSend = async () => {
    try {
      // Validar qualidade dos dados antes de enviar
      const validation = validateDataQuality(eventData.user_data);
      
      if (!validation.isValid && retries < maxRetries) {
        console.log(`Qualidade insuficiente (${validation.score}%) para ${eventName}, tentando novamente...`);
        retries++;
        await new Promise(resolve => setTimeout(resolve, 1000 * retries));
        return attemptSend();
      }
      
      // Adicionar variabilidade para evitar desduplicação
      const variedEventData = {
        ...eventData,
        // Adicionar timestamp exato do envio para garantir unicidade
        event_time: Date.now(),
        // Adicionar um valor aleatório pequeno ao value para variar um pouco os dados
        custom_data: {
          ...eventData.custom_data,
          value: eventData.custom_data.value + (Math.random() * 0.01 - 0.005), // Variação de ±0.005
          // Adicionar um ID único de sessão
          session_id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substr(2, 16)
        }
      };
      
      // Enviar evento com dados de qualidade aceitável
      const validatedEventData = validateAndFixFacebookEvent(variedEventData);
      debugFacebookEvent(eventName, validatedEventData);
      
      console.log(`Enviando evento ${eventName} com ID único: ${validatedEventData.event_id}`);
      console.log(`Timestamp do evento: ${validatedEventData.event_time}`);
      console.log(`Valor variado: ${validatedEventData.custom_data.value}`);
      
      window.dataLayer.push(validatedEventData);
      
      console.log(`Evento ${eventName} enviado com sucesso!`);
      
    } catch (error) {
      console.error(`Erro ao enviar evento ${eventName}:`, error);
      if (retries < maxRetries) {
        retries++;
        setTimeout(attemptSend, 1000 * retries);
      }
    }
  };
  
  await attemptSend();
};

// Função trackViewContent simplificada
const trackViewContent = async (viewContentHasBeenTracked: any) => {
  if (viewContentHasBeenTracked.current) {
    return;
  }

  const eventId = generateEventId('view_content');
  
  await initializeTracking();
  await new Promise(resolve => setTimeout(resolve, 100));
  
  const locationData = await getHighQualityLocationData();
  const personalData = await getHighQualityPersonalData();
  const trackingParams = await getAllTrackingParams();
  
  // Adicionar timestamp único para este evento
  const eventTimestamp = Date.now();
  
  const metaFormattedData = cleanUserData({
    fbc: trackingParams.fbc,
    fbp: trackingParams.fbp,
    ga_client_id: trackingParams.ga_client_id,
    external_id: trackingParams.external_id,
    ct: locationData.city,
    st: locationData.state,
    zp: locationData.zip,
    country: locationData.country,
    fn: personalData.fn,
    ln: personalData.ln,
    em: personalData.em,
    ph: personalData.ph
  });
  
  console.log('🚀 FORÇANDO ENVIO CLIENT-SIDE PARA TESTE NO PIXEL HELPER');
  
  // Forçar envio client-side para teste no Pixel Helper
  const eventData = {
    event: 'view_content',
    event_id: eventId,
    custom_data: {
      currency: 'BRL',
      value: 39.90 + (Math.random() * 0.02 - 0.01), // Variação pequena para garantir unicidade
      content_name: 'Sistema de Controle de Trips - Maracujá',
      content_category: 'E-book',
      content_ids: ['6080425'],
      num_items: '1',
      // Adicionar dados únicos para evitar desduplicação
      event_timestamp: eventTimestamp,
      unique_identifier: Math.random().toString(36).substr(2, 16)
    },
    user_data: metaFormattedData
  };
  
  await sendEventWithRetry('view_content', eventData);
  
  viewContentHasBeenTracked.current = true;
};

// Função trackCheckout simplificada
const trackCheckout = async (userData: any) => {
  // Adicionar pequeno delay para garantir timestamp diferente
  await new Promise(resolve => setTimeout(resolve, 50));
  
  const eventId = generateEventId('initiate_checkout');
  
  const locationData = await getHighQualityLocationData();
  const personalData = await getHighQualityPersonalData();
  
  // Adicionar timestamp único para este evento
  const eventTimestamp = Date.now();
  
  const metaFormattedData = cleanUserData({
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
  });
  
  console.log('🚀 FORÇANDO ENVIO CLIENT-SIDE CHECKOUT PARA TESTE NO PIXEL HELPER');
  
  // Forçar envio client-side para teste no Pixel Helper
  const eventData = {
    event: 'initiate_checkout',
    event_id: eventId,
    custom_data: {
      currency: 'BRL',
      value: 39.90 + (Math.random() * 0.02 - 0.01), // Variação pequena para garantir unicidade
      content_name: 'E-book Sistema de Controle de Trips - Maracujá',
      content_category: 'E-book',
      content_ids: ['ebook-controle-trips'],
      num_items: '1',
      // Adicionar dados únicos para evitar desduplicação
      event_timestamp: eventTimestamp,
      unique_identifier: Math.random().toString(36).substr(2, 16),
      checkout_session: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substr(2, 16)
    },
    user_data: metaFormattedData
  };
  
  await sendEventWithRetry('initiate_checkout', eventData);
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
    };
    markServerSideEventsSent?: () => void;
    _releaseBlockedEvents?: () => void;
  }
}