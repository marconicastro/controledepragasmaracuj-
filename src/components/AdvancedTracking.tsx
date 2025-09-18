'use client';
import { useEffect, useRef } from 'react';
import META_CONFIG, { formatUserDataForMeta, validateMetaConfig } from '@/lib/metaConfig';
import { getAllTrackingParams, initializeTracking, getCachedGeographicData } from '@/lib/cookies';

// --- FUNÇÕES HELPER PARA O DATALAYER ---
// Função para gerar event_id único para desduplicação
const generateEventId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Cada função tem a responsabilidade única de enviar um evento padronizado para o dataLayer.

/**
 * Dispara o evento 'view_content' para o dataLayer.
 * Utiliza uma trava para garantir que seja disparado apenas uma vez por página.
 * Inclui dados completos de localização e cookies do Facebook para melhor matching.
 */
const trackViewContent = async (viewContentHasBeenTracked) => {
  if (viewContentHasBeenTracked.current) {
    return; // Se já foi disparado, não faz nada.
  }

  // Gerar event_id único para desduplicação
  const eventId = generateEventId();
  
  // Tentar obter dados geográficos em cache primeiro (rápido)
  const cachedGeoData = getCachedGeographicData();
  
  // Obter todos os parâmetros de rastreamento (incluindo localização e cookies)
  const trackingParams = await getAllTrackingParams();
  
  // Se temos dados geográficos em cache, usar eles (mais confiáveis)
  if (cachedGeoData) {
    Object.assign(trackingParams, cachedGeoData);
    console.log('🌍 Usando dados geográficos em cache para ViewContent:', cachedGeoData);
  }
  
  // Enviar APENAS via DataLayer (GTM) - Remover envio direto do Facebook Pixel
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: 'view_content',
    event_id: eventId, // Adicionar event_id para desduplicação
    ecommerce: {
      items: [{
        item_id: '6080425',
        item_name: 'Sistema de Controle de Trips - Maracujá',
        price: 39.90,
        quantity: 1,
        currency: 'BRL'
      }]
    },
    // Incluir todos os dados de rastreamento para melhor matching
    user_data: trackingParams
  });
  
  if (META_CONFIG.TRACKING.enableDebugLogs) {
    console.log('DataLayer Push: view_content (disparado uma única vez via GTM)');
    console.log('🔑 Event ID:', eventId);
    console.log('📍 Dados de rastreamento (formato GTM):', trackingParams);
    console.log('🌍 Dados geográficos usados:', cachedGeoData || 'Buscados em tempo real');
    console.log('✅ Evento enviado apenas via DataLayer - GTM gerencia Facebook Pixel');
  }
  
  viewContentHasBeenTracked.current = true; // Ativa a trava.
};

/**
 * Dispara o evento 'initiate_checkout' com os dados do usuário otimizados para Meta EQM.
 * @param {object} userData - Os dados capturados do formulário de pré-checkout.
 */
const trackCheckout = async (userData) => {
  // Gerar event_id único e consistente com o mesmo padrão dos outros eventos
  const eventId = Date.now().toString(36) + Math.random().toString(36).substr(2);
  
  // Tentar obter dados geográficos em cache primeiro (rápido e confiável)
  const cachedGeoData = getCachedGeographicData();
  
  // Preparar dados no FORMATO META que o Facebook reconhece
  const metaFormattedData = {
    // ✅ Dados do usuário no formato que o Facebook entende
    em: userData.email,           // Email - Facebook entende "em"
    ph: userData.phone,          // Telefone - Facebook entende "ph"
    fn: userData.firstName,      // Primeiro nome - Facebook entende "fn"
    ln: userData.lastName,       // Sobrenome - Facebook entende "ln"
    
    // ✅ Dados geográficos - usar cache se disponível, senão usar do formulário
    ct: cachedGeoData?.city || userData.city || '',           // Cidade - Facebook entende "ct"
    st: cachedGeoData?.state || userData.state || '',          // Estado - Facebook entende "st"
    zp: cachedGeoData?.zip || userData.zip || '',            // CEP - Facebook entende "zp"
    country: cachedGeoData?.country || 'BR',                 // País - Facebook entende "country"
    
    // ✅ Dados de rastreamento para matching
    fbc: userData.fbc,
    fbp: userData.fbp,
    ga_client_id: userData.ga_client_id,
    external_id: userData.external_id
  };
  
  // ENVIAR VIA DATALAYER (GTM) com formato META para Facebook
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: 'initiate_checkout',
    event_id: eventId, // Mesmo padrão de Event ID
    ecommerce: {
      items: [{
        item_id: '6080425',
        item_name: 'Sistema de Controle de Trips - Maracujá',
        price: 39.90,
        quantity: 1,
        currency: 'BRL'
      }],
    },
    // ✅ Usar formato META que o Facebook reconhece
    user_data: metaFormattedData
  });
  
  if (META_CONFIG.TRACKING.enableDebugLogs) {
    console.log('🛒 DataLayer Push: initiate_checkout (via GTM - formato META)');
    console.log('🔑 Event ID:', eventId);
    console.log('📊 Dados formatados (META padrão):', metaFormattedData);
    console.log('🌍 Dados geográficos usados:', cachedGeoData || 'Dados do formulário');
    console.log('✅ Agora Facebook reconhece em, ph, fn, ln!');
    console.log('📈 Expectativa: Score deve subir para 7.0+ com dados do formulário');
  }

  // REMOVIDO: Envio direto do Facebook Pixel para evitar conflitos
  // REMOVIDO: Envio separado do Google Analytics (GTM já gerencia)
  
  // Log de confirmação do formato correto
  if (META_CONFIG.TRACKING.enableDebugLogs) {
    console.log('🎯 Initiate Checkout: Agora com formato META correto!');
    console.log('📊 Dados do formulário sendo enviados:');
    console.log('   - Email (em):', userData.email);
    console.log('   - Telefone (ph):', userData.phone);
    console.log('   - Nome (fn):', userData.firstName);
    console.log('   - Sobrenome (ln):', userData.lastName);
    if (cachedGeoData) {
      console.log('🌍 Dados geográficos em cache utilizados:', cachedGeoData);
    }
  }
};


// --- COMPONENTE PRINCIPAL ---
export default function AdvancedTracking() {
  // Cria a trava para o view_content, que persiste durante o ciclo de vida do componente.
  const viewContentHasBeenTracked = useRef(false);

  useEffect(() => {
    // Validar configuração primeiro
    validateMetaConfig();
    
    // Inicializar captura de parâmetros de rastreamento
    initializeTracking();
    
    // Log de inicialização unificada
    if (META_CONFIG.TRACKING.enableDebugLogs) {
      console.log('🎯 AdvancedTracking: Inicializado com arquitetura otimizada');
      console.log('📊 Todos os eventos (PageView, ViewContent, InitiateCheckout) usam apenas GTM');
      console.log('🔗 Event ID padrão sincronizado entre todos os eventos');
      console.log('🌍 Dados geográficos com cache para melhor performance');
      console.log('🎯 FBC: Capturando fbclid da URL e criando cookie _fbc automaticamente');
      console.log('📈 Expectativa: Scores de qualidade excelentes (7.0+) para todos os eventos');
    }
    
    // Dispara o view_content após o tempo configurado, mas apenas se a trava permitir.
    if (META_CONFIG.TRACKING.enableViewContent) {
      const timer = setTimeout(async () => {
        await trackViewContent(viewContentHasBeenTracked);
      }, META_CONFIG.TRACKING.viewContentDelay);

      // Expondo as funções na janela global para serem chamadas pelo pré-checkout.
      if (typeof window !== 'undefined') {
        window.advancedTracking = {
          // Apenas a função trackCheckout é exposta globalmente.
          trackCheckout,
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
    };
  }
}