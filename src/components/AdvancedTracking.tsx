'use client';
import { useEffect, useRef } from 'react';
import META_CONFIG, { formatUserDataForMeta, validateMetaConfig } from '@/lib/metaConfig';
import { getAllTrackingParams, initializeTracking, getCachedGeographicData, getHighQualityLocationData, validateDataQuality } from '@/lib/cookies';
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
      const validatedEventData = validateAndFixFacebookEvent(eventData);
      debugFacebookEvent(eventName, validatedEventData);
      
      // Log detalhado dos dados antes de enviar
      console.log(`📤 Enviando evento ${eventName} com dados limpos:`);
      console.log('🔑 Event ID:', validatedEventData.event_id);
      console.log('👤 User Data:', validatedEventData.user_data);
      console.log('🛍️ Custom Data:', validatedEventData.custom_data);
      
      window.dataLayer.push(validatedEventData);
      
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
  
  // Garantir captura do FBC - TENTATIVA AGRESSIVA
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
      
      console.log('🎯 FBC capturado e salvo no ViewContent:', fbc);
    }
  }
  
  // Se ainda não tiver FBC, tentar obter do cookie novamente
  if (!fbc && typeof window !== 'undefined') {
    const fbcCookie = document.cookie.match(new RegExp('(^| )_fbc=([^;]+)'));
    if (fbcCookie) {
      fbc = fbcCookie[2];
      console.log('🎯 FBC obtido do cookie no ViewContent:', fbc);
    }
  }
  
  // Log do status do FBC para depuração
  console.log('📊 Status FBC no ViewContent:', fbc ? '✅ Presente' : '❌ Ausente');
  if (fbc) {
    console.log('🔑 FBC value:', fbc);
  }
  
  // Usar o MESMO formato do InitiateCheckout para consistência
  const metaFormattedData = cleanUserData({
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
  });
  
  // Enviar via DataLayer (GTM) com formato padronizado e retry
  const eventData = {
    event: 'view_content',
    event_id: eventId, // Adicionar event_id para desduplicação
    custom_data: {
      currency: 'BRL',
      value: 39.90,
      content_name: 'Sistema de Controle de Trips - Maracujá',
      content_category: 'E-book',
      content_ids: ['6080425'], // ✅ ARRAY CORRETO
      num_items: '1',
      contents: [{ // ✅ ARRAY CORRETO
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
  const metaFormattedData = cleanUserData({
    // ✅ Dados do usuário no formato que o Facebook entende
    em: userData.email ? userData.email.toLowerCase().trim() : undefined,           // Email - apenas se existir
    ph: userData.phone ? userData.phone.replace(/\D/g, '') : undefined,              // Telefone - apenas se existir
    fn: userData.firstName ? userData.firstName.trim() : undefined,                    // Primeiro nome - apenas se existir
    ln: userData.lastName ? userData.lastName.trim() : undefined,                     // Sobrenome - apenas se existir
    
    // ✅ Dados geográficos - usar dados de ALTA QUALIDADE com fallback para formulário
    ct: locationData.city || userData.city || undefined,           // Cidade - apenas se existir
    st: locationData.state || userData.state || undefined,          // Estado - apenas se existir
    zp: locationData.zip || userData.zip || undefined,            // CEP - apenas se existir
    country: locationData.country || userData.country || 'BR',     // País - sempre BR
    
    // ✅ Dados de rastreamento para matching
    fbc: userData.fbc,
    fbp: userData.fbp,
    ga_client_id: userData.ga_client_id,
    external_id: userData.external_id
  });
  
  // Log detalhado para depuração
  console.log('🌍 Dados geográficos disponíveis:');
  console.log('   - LocationData API:', locationData);
  console.log('   - LocationData Formulário:', {
    city: userData.city,
    state: userData.state,
    zip: userData.zip,
    country: userData.country
  });
  console.log('📧 Dados do usuário disponíveis:');
  console.log('   - Email:', userData.email);
  console.log('   - Telefone:', userData.phone);
  console.log('   - Nome:', userData.firstName, userData.lastName);
  console.log('🔑 Dados de rastreamento disponíveis:');
  console.log('   - FBC:', userData.fbc);
  console.log('   - FBP:', userData.fbp);
  console.log('   - GA Client ID:', userData.ga_client_id);
  console.log('   - External ID:', userData.external_id);
  console.log('✅ Dados finais após limpeza:', metaFormattedData);
  
  // ENVIAR DADOS DIRETAMENTE PARA O SERVER-SIDE (Stape) PRIMEIRO - VERSÃO OTIMIZADA PARA FACEBOOK PIXEL
  if (typeof window !== 'undefined') {
    try {
      console.log('🚀 Enviando dados para o server-side PRIMEIRO...');
      
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
          content_name: 'E-book Sistema de Controle de Trips - Maracujá',
          content_category: 'E-book',
          content_ids: ['ebook-controle-trips'], // ✅ ARRAY CORRETO
          num_items: '1',
          items: [{ // ✅ ARRAY CORRETO
            item_id: 'ebook-controle-trips',
            item_name: 'E-book Sistema de Controle de Trips',
            quantity: 1,
            price: 39.90,
            item_category: 'E-book',
            item_brand: 'Maracujá Zero Pragas',
            currency: 'BRL'
          }]
        }
      };
      
      console.log('🚀 Enviando para server-side com formato:', JSON.stringify(serverSideData, null, 2));
      
      // Enviar dados para o server-side via fetch - URL principal
      const response = await fetch('https://bfbsewli.sag.stape.io/event', {
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
      
    } catch (error) {
      console.error('❌ Erro ao enviar dados para o server-side:', error);
    }
  }

  // ENVIAR VIA DATALAYER (GTM) DEPOIS - com formato META para Facebook e sistema de retry
  const eventData = {
    event: 'initiate_checkout',
    event_id: eventId, // Mesmo padrão de Event ID
    custom_data: {
      currency: 'BRL',
      value: 39.90,
      content_name: 'E-book Sistema de Controle de Trips - Maracujá',
      content_category: 'E-book',
      content_ids: ['ebook-controle-trips'], // ✅ ARRAY CORRETO
      num_items: '1',
      items: [{ // ✅ ARRAY CORRETO
        item_id: 'ebook-controle-trips',
        item_name: 'E-book Sistema de Controle de Trips',
        quantity: 1,
        price: 39.90,
        item_category: 'E-book',
        item_brand: 'Maracujá Zero Pragas',
        currency: 'BRL'
      }]
    },
    // ✅ Usar formato META que o Facebook reconhece
    user_data: metaFormattedData
  };
  
  // Pequeno atraso para garantir que server-side seja processado primeiro
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Enviar com sistema de retry e validação de qualidade
  await sendEventWithRetry('initiate_checkout', eventData);

  if (META_CONFIG.TRACKING.enableDebugLogs) {
    console.log('🛒 Initiate Checkout: Enviado com formato OTIMIZADO para Facebook Pixel!');
    console.log('🔑 Event ID:', eventId);
    console.log('📊 Dados formatados (META padrão):', metaFormattedData);
    console.log('🌍 Dados geográficos usados:', locationData);
    console.log('📈 Ordem de envio: 1° Server-side, 2° Client-side (com 500ms de atraso)');
    console.log('🎯 Expectativa: Server-side deve ser priorizado e não desduplicado!');
    
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
    console.log('🚀 Dados enviados: Server-side PRIMEIRO (prioridade), depois Client-side (backup)');
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