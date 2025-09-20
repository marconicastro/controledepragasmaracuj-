'use client';
import { useEffect, useRef } from 'react';
import META_CONFIG, { formatUserDataForMeta, validateMetaConfig } from '@/lib/metaConfig';
import { getAllTrackingParams, initializeTracking, getCachedGeographicData, getHighQualityLocationData, validateDataQuality } from '@/lib/cookies';

// --- FUNÇÕES HELPER PARA O DATALAYER ---
// Função para gerar event_id único para desduplicação
const generateEventId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Função para calcular qualidade dos dados
const calculateDataQualityScore = (userData: any): number => {
  let score = 0;
  let maxScore = 0;
  
  // Pontuar dados de rastreamento (mais importantes)
  if (userData.fbc) score += 30;
  if (userData.fbp) score += 20;
  if (userData.external_id) score += 10;
  if (userData.ga_client_id) score += 10;
  
  // Pontuar dados de localização
  if (userData.ct && userData.ct.length > 2) score += 10;
  if (userData.st && userData.st.length > 1) score += 10;
  if (userData.zp && userData.zp.length >= 8) score += 10;
  
  maxScore = 100; // Score máximo possível
  
  return Math.min(score, maxScore);
};

// Função para obter dados de rastreamento melhorados
const getImprovedTrackingData = async () => {
  // Tentar obter dados de localização de alta qualidade novamente
  const locationData = await getHighQualityLocationData();
  
  // Obter parâmetros de rastreamento atualizados
  const trackingParams = await getAllTrackingParams();
  
  return {
    fbc: trackingParams.fbc,
    fbp: trackingParams.fbp,
    ga_client_id: trackingParams.ga_client_id,
    external_id: trackingParams.external_id,
    ct: locationData.city,
    st: locationData.state,
    zp: locationData.zip,
    country: locationData.country
  };
};

// Função para enviar eventos com retry e validação de qualidade
const sendEventWithRetry = async (eventName: string, eventData: any, maxRetries = 3) => {
  let retries = 0;
  
  const attemptSend = async () => {
    try {
      // Validar qualidade dos dados antes de enviar com feedback detalhado
      const validation = validateDataQuality(eventData.user_data);
      
      if (META_CONFIG.TRACKING.enableDebugLogs) {
        console.log(`📊 Validação de dados para ${eventName}:`);
        console.log(`   - Score: ${validation.score}%`);
        console.log(`   - Válido: ${validation.isValid ? '✅' : '❌'}`);
        if (validation.issues.length > 0) {
          console.log(`   - Issues: ${validation.issues.join(', ')}`);
        }
      }
      
      if (!validation.isValid && retries < maxRetries) {
        console.log(`📊 Qualidade insuficiente (${validation.score}%) para ${eventName}, tentando novamente... (${retries + 1}/${maxRetries})`);
        
        if (META_CONFIG.TRACKING.enableDebugLogs) {
          console.log(`🔧 Recomendações para melhoria:`);
          validation.recommendations.forEach(rec => console.log(`   - ${rec}`));
        }
        
        retries++;
        
        // Esperar antes de tentar novamente (exponencial backoff)
        await new Promise(resolve => setTimeout(resolve, 1000 * retries));
        
        // Recalcular dados com melhor qualidade
        const improvedData = await getImprovedTrackingData();
        eventData.user_data = improvedData;
        
        return attemptSend();
      }
      
      // Enviar evento com dados de qualidade aceitável
      window.dataLayer.push(eventData);
      
      console.log(`✅ Evento ${eventName} enviado com sucesso!`);
      console.log(`📊 Qualidade final: ${validation.score}%`);
      console.log(`🔑 Event ID: ${eventData.event_id}`);
      
      if (META_CONFIG.TRACKING.enableDebugLogs) {
        console.log(`📊 Dados enviados para ${eventName}:`, eventData.user_data);
        
        // Log de sucesso com detalhes
        if (validation.score >= 90) {
          console.log(`🎉 EXCELENTE! Qualidade de dados acima de 90% para ${eventName}!`);
        } else if (validation.score >= 80) {
          console.log(`👍 ÓTIMO! Qualidade de dados acima de 80% para ${eventName}!`);
        } else if (validation.score >= 70) {
          console.log(`✅ BOM! Qualidade de dados aceitável para ${eventName}!`);
        }
      }
      
    } catch (error) {
      console.error(`❌ Erro ao enviar evento ${eventName}:`, error);
      if (retries < maxRetries) {
        retries++;
        console.log(`🔄 Tentando novamente... (${retries}/${maxRetries})`);
        setTimeout(attemptSend, 1000 * retries);
      } else {
        console.error(`❌ Falha ao enviar evento ${eventName} após ${maxRetries} tentativas`);
      }
    }
  };
  
  await attemptSend();
};

// Cada função tem a responsabilidade única de enviar um evento padronizado para o dataLayer.

/**
 * Dispara o evento 'view_content' para o dataLayer com formato padronizado.
 * Utiliza uma trava para garantir que seja disparado apenas uma vez por página.
 * Inclui dados completos de localização de alta qualidade e cookies do Facebook para melhor matching.
 */
const trackViewContent = async (viewContentHasBeenTracked) => {
  if (viewContentHasBeenTracked.current) {
    return; // Se já foi disparado, não faz nada.
  }

  // Gerar event_id único para desduplicação
  const eventId = generateEventId();
  
  // Obter dados de localização de ALTA QUALIDADE (prioridade formulário > cache > API)
  const locationData = await getHighQualityLocationData();
  
  // Obter todos os parâmetros de rastreamento (incluindo FBC, FBP, etc.)
  const trackingParams = await getAllTrackingParams();
  
  // Garantir captura do FBC - TENTATIVA ADICIONAL
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
      
      console.log('🎯 FBC capturado e salvo:', fbc);
    }
  }
  
  // Usar o MESMO formato do InitiateCheckout para consistência
  const metaFormattedData = {
    // ✅ Dados de rastreamento para matching (iguais ao InitiateCheckout)
    fbc: fbc, // Usar FBC garantido
    fbp: trackingParams.fbp,
    ga_client_id: trackingParams.ga_client_id,
    external_id: trackingParams.external_id,
    
    // ✅ Dados geográficos no formato META (mesmo formato do InitiateCheckout)
    ct: locationData.city,
    st: locationData.state,
    zp: locationData.zip,
    country: locationData.country
  };
  
  // Enviar via DataLayer (GTM) com formato padronizado e retry
  const eventData = {
    event: 'view_content',
    event_id: eventId, // Adicionar event_id para desduplicação
    custom_data: {
      currency: 'BRL',
      value: 39.90,
      content_name: 'Sistema de Controle de Trips - Maracujá',
      content_category: 'E-book',
      content_ids: ['6080425'],
      num_items: 1,
      contents: [{
        id: '6080425',
        quantity: 1,
        item_price: 39.90
      }]
    },
    // ✅ Usar formato META padronizado (igual ao InitiateCheckout)
    user_data: metaFormattedData
  };
  
  // Enviar com sistema de retry e validação de qualidade
  await sendEventWithRetry('view_content', eventData);
  
  if (META_CONFIG.TRACKING.enableDebugLogs) {
    console.log('🎯 DataLayer Push: view_content (formato padronizado via GTM)');
    console.log('🔑 Event ID:', eventId);
    console.log('📍 Dados de localização (ALTA QUALIDADE):', locationData);
    console.log('📊 Dados formatados (META padrão):', metaFormattedData);
    console.log('✅ Formato consistente com InitiateCheckout');
    console.log('🎯 FBC status:', fbc ? '✅ Capturado' : '❌ Não encontrado');
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
  
  // Obter dados de localização de ALTA QUALIDADE (prioridade formulário > cache > API)
  const locationData = await getHighQualityLocationData();
  
  // Preparar dados no FORMATO META que o Facebook reconhece - MELHORADO
  const metaFormattedData = {
    // ✅ Dados do usuário no formato que o Facebook entende
    em: userData.email ? userData.email.toLowerCase().trim() : '',           // Email - Facebook entende "em"
    ph: userData.phone ? userData.phone.replace(/\D/g, '') : '',              // Telefone - Facebook entende "ph"
    fn: userData.firstName ? userData.firstName.trim() : '',                    // Primeiro nome - Facebook entende "fn"
    ln: userData.lastName ? userData.lastName.trim() : '',                     // Sobrenome - Facebook entende "ln"
    
    // ✅ Dados geográficos - usar dados de ALTA QUALIDADE com fallback para formulário
    ct: locationData.city || userData.city || '',           // Cidade - Facebook entende "ct"
    st: locationData.state || userData.state || '',          // Estado - Facebook entende "st"
    zp: locationData.zip || userData.zip || '',            // CEP - Facebook entende "zp"
    country: locationData.country || 'BR',                 // País - Facebook entende "country"
    
    // ✅ Dados de rastreamento para matching
    fbc: userData.fbc,
    fbp: userData.fbp,
    ga_client_id: userData.ga_client_id,
    external_id: userData.external_id
  };
  
  // ENVIAR VIA DATALAYER (GTM) com formato META para Facebook e sistema de retry
  const eventData = {
    event: 'initiate_checkout',
    event_id: eventId, // Mesmo padrão de Event ID
    custom_data: {
      currency: 'BRL',
      value: 39.90,
      content_name: 'Sistema de Controle de Trips - Maracujá',
      content_category: 'E-book',
      content_ids: ['6080425'],
      num_items: 1,
      contents: [{
        id: '6080425',
        quantity: 1,
        item_price: 39.90
      }]
    },
    // ✅ Usar formato META que o Facebook reconhece
    user_data: metaFormattedData
  };
  
  // Enviar com sistema de retry e validação de qualidade
  await sendEventWithRetry('initiate_checkout', eventData);

  // ENVIAR DADOS DIRETAMENTE PARA O SERVER-SIDE (Stape) - VERSÃO OTIMIZADA PARA FACEBOOK PIXEL
  if (typeof window !== 'undefined') {
    try {
      console.log('🚀 Tentando enviar dados para o server-side...');
      
      // Preparar dados no formato EXATO que o Facebook Pixel espera no server-side
      const serverSideData = {
        event_name: 'InitiateCheckout', // Nome do evento padrão do Facebook
        event_id: eventId,
        pixel_id: '714277868320104', // ID do Pixel do Facebook
        user_data: {
          // Dados do usuário no formato que o Facebook Pixel reconhece
          em: metaFormattedData.em,
          ph: metaFormattedData.ph,
          fn: metaFormattedData.fn,
          ln: metaFormattedData.ln,
          ct: metaFormattedData.ct,
          st: metaFormattedData.st,
          zp: metaFormattedData.zp,
          country: metaFormattedData.country,
          client_ip_address: '', // Será preenchido pelo server-side
          client_user_agent: navigator.userAgent,
          fbc: metaFormattedData.fbc,
          fbp: metaFormattedData.fbp,
          external_id: metaFormattedData.external_id
        },
        custom_data: {
          currency: 'BRL',
          value: 39.90,
          content_type: 'product',
          contents: [{
            id: '6080425',
            quantity: 1,
            item_price: 39.90
          }]
        }
      };
      
      // Enviar dados para o server-side via fetch - URL principal
      const response = await fetch('https://gtm-GTM-WTL9CQ7W.stape.io/event', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(serverSideData)
      });
      
      console.log('✅ Resposta do server-side:', response.status, response.statusText);
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ Dados enviados para o server-side com sucesso!', result);
      } else {
        console.error('❌ Erro na resposta do server-side:', response.status, response.statusText);
      }
      
      console.log('📊 Dados enviados para Facebook Pixel:', {
        em: metaFormattedData.em,
        ph: metaFormattedData.ph,
        fn: metaFormattedData.fn,
        ln: metaFormattedData.ln,
        ct: metaFormattedData.ct,
        st: metaFormattedData.st,
        zp: metaFormattedData.zp,
        country: metaFormattedData.country
      });
      
      // Também enviar via dataLayer para garantir que o GTM capture
      window.dataLayer.push({
        event: 'initiate_checkout',
        event_id: eventId,
        user_data: metaFormattedData,
        facebook_pixel_data: {
          event_name: 'InitiateCheckout',
          user_data: {
            em: metaFormattedData.em,
            ph: metaFormattedData.ph,
            fn: metaFormattedData.fn,
            ln: metaFormattedData.ln,
            ct: metaFormattedData.ct,
            st: metaFormattedData.st,
            zp: metaFormattedData.zp,
            country: metaFormattedData.country
          }
        }
      });
      
    } catch (error) {
      console.error('❌ Erro ao enviar dados para o server-side:', error);
      
      // Tentar URL alternativa
      try {
        console.log('🔄 Tentando URL alternativa...');
        const response2 = await fetch('https://collect.stape.io/v2/s/GTM-WTL9CQ7W/event', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            event_name: 'InitiateCheckout',
            event_id: eventId,
            pixel_id: '714277868320104',
            user_data: {
              em: metaFormattedData.em,
              ph: metaFormattedData.ph,
              fn: metaFormattedData.fn,
              ln: metaFormattedData.ln,
              ct: metaFormattedData.ct,
              st: metaFormattedData.st,
              zp: metaFormattedData.zp,
              country: metaFormattedData.country,
              client_ip_address: '',
              client_user_agent: navigator.userAgent,
              fbc: metaFormattedData.fbc,
              fbp: metaFormattedData.fbp,
              external_id: metaFormattedData.external_id
            },
            custom_data: {
              currency: 'BRL',
              value: 39.90,
              content_type: 'product',
              contents: [{
                id: '6080425',
                quantity: 1,
                item_price: 39.90
              }]
            }
          })
        });
        
        console.log('✅ URL alternativa funcionou!', response2.status);
      } catch (error2) {
        console.error('❌ URL alternativa também falhou:', error2);
      }
    }
  }

  if (META_CONFIG.TRACKING.enableDebugLogs) {
    console.log('🛒 Initiate Checkout: Enviado com formato OTIMIZADO para Facebook Pixel!');
    console.log('🔑 Event ID:', eventId);
    console.log('📊 Dados formatados (META padrão):', metaFormattedData);
    console.log('🌍 Dados geográficos usados:', locationData);
    console.log('📈 Expectativa: Score deve subir para 8.5+ com dados completos enviados diretamente ao Facebook Pixel');
    
    // Log de confirmação do formato correto
    console.log('🎯 Dados do formulário enviados para Facebook Pixel:');
    console.log('   - Email (em):', metaFormattedData.em);
    console.log('   - Telefone (ph):', metaFormattedData.ph);
    console.log('   - Nome (fn):', metaFormattedData.fn);
    console.log('   - Sobrenome (ln):', metaFormattedData.ln);
    console.log('   - Cidade (ct):', metaFormattedData.ct);
    console.log('   - Estado (st):', metaFormattedData.st);
    console.log('   - CEP (zp):', metaFormattedData.zp);
    console.log('   - País (country):', metaFormattedData.country);
    console.log('   - FBC (fbc):', metaFormattedData.fbc);
    console.log('   - FBP (fbp):', metaFormattedData.fbp);
    console.log('   - External ID:', metaFormattedData.external_id);
    console.log('🚀 Dados enviados via server-side (Stape) e dataLayer para garantir entrega ao Facebook');
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
    
    // Log de inicialização unificada com melhorias
    if (META_CONFIG.TRACKING.enableDebugLogs) {
      console.log('🎯 AdvancedTracking: Inicializado com arquitetura OTIMIZADA!');
      console.log('📊 Todos os eventos (PageView, ViewContent, InitiateCheckout) usam apenas GTM');
      console.log('🔗 Event ID padrão sincronizado entre todos os eventos');
      console.log('🌍 Dados geográficos com ALTA QUALIDADE (formulário > cache > API)');
      console.log('🎯 FBC: Sincronizado e garantido para todos os eventos');
      console.log('🔄 Sistema de retry automático para qualidade de dados');
      console.log('📈 Validação detalhada de qualidade com feedback em tempo real');
      console.log('🚀 Expectativa: Scores de qualidade EXCELENTES (8.0+) para todos os eventos!');
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