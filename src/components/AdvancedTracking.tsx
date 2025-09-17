'use client';
import { useEffect, useRef } from 'react';
import META_CONFIG, { formatUserDataForMeta, validateMetaConfig } from '@/lib/metaConfig';

// --- FUNÇÕES HELPER PARA HASH SHA-256 ---
// Função para criar hash SHA-256 (necessária para Meta Conversions API)
async function sha256(message: string): Promise<string> {
  if (!message) return '';
  
  // Converter para minúsculas e trim antes de hashear
  const normalized = message.toLowerCase().trim();
  
  // Encode como UTF-8
  const msgBuffer = new TextEncoder().encode(normalized);
  
  // Hash the message
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  
  // Converter buffer para hexadecimal
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return hashHex;
}

// --- FUNÇÕES HELPER PARA O DATALAYER ---
// Cada função tem a responsabilidade única de enviar um evento padronizado para o dataLayer.

/**
 * Dispara o evento 'view_content' para o dataLayer.
 * Utiliza uma trava para garantir que seja disparado apenas uma vez por página.
 */
const trackViewContent = (viewContentHasBeenTracked) => {
  if (viewContentHasBeenTracked.current) {
    return; // Se já foi disparado, não faz nada.
  }

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: 'view_content',
    ecommerce: {
      items: [{
        item_id: '6080425',
        item_name: 'Sistema de Controle de Trips - Maracujá',
        price: 39.90,
        quantity: 1,
        currency: 'BRL'
      }]
    }
  });
  
  if (META_CONFIG.TRACKING.enableDebugLogs) {
    console.log('DataLayer Push: view_content (disparado uma única vez)');
  }
  
  viewContentHasBeenTracked.current = true; // Ativa a trava.
};

/**
 * Dispara o evento 'initiate_checkout' com os dados do usuário otimizados para Meta EQM.
 * @param {object} userData - Os dados capturados do formulário de pré-checkout.
 */
const trackCheckout = async (userData) => {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: 'initiate_checkout',
    ecommerce: {
      items: [{
        item_id: '6080425',
        item_name: 'Sistema de Controle de Trips - Maracujá',
        price: 39.90,
        quantity: 1,
        currency: 'BRL'
      }],
    },
    // Anexa os dados do usuário para serem usados pelo GTM
    user_data: userData 
  });
  
  if (META_CONFIG.TRACKING.enableDebugLogs) {
    console.log('DataLayer Push: initiate_checkout com dados do usuário', userData);
  }

  // Preparar dados avançados para Meta com hash SHA-256
  const prepareMetaUserData = async (userData) => {
    const hashedData: any = {};
    const plainData: any = {};
    
    // Email (hash e plain)
    if (userData.email) {
      const cleanEmail = userData.email.toLowerCase().trim();
      plainData.em = cleanEmail;
      hashedData.em = await sha256(cleanEmail);
    }
    
    // Telefone (hash e plain)
    if (userData.phone) {
      const cleanPhone = userData.phone.replace(/\D/g, '');
      plainData.ph = cleanPhone;
      hashedData.ph = await sha256(cleanPhone);
    }
    
    // Nome (primeiro e último)
    if (userData.firstName) {
      const cleanFirstName = userData.firstName.trim().toLowerCase();
      plainData.fn = cleanFirstName;
      hashedData.fn = await sha256(cleanFirstName);
    }
    
    if (userData.lastName) {
      const cleanLastName = userData.lastName.trim().toLowerCase();
      plainData.ln = cleanLastName;
      hashedData.ln = await sha256(cleanLastName);
    }
    
    // Cidade
    if (userData.city) {
      const cleanCity = userData.city.trim().toLowerCase();
      plainData.ct = cleanCity;
      hashedData.ct = await sha256(cleanCity);
    }
    
    // Estado
    if (userData.state) {
      const cleanState = userData.state.trim().toUpperCase();
      plainData.st = cleanState;
      hashedData.st = await sha256(cleanState);
    }
    
    // CEP
    if (userData.zip) {
      const cleanZip = userData.zip.replace(/\D/g, '');
      plainData.zp = cleanZip;
      hashedData.zp = await sha256(cleanZip);
    }
    
    // Dados adicionais para melhor matching
    return {
      ...plainData,
      ...hashedData,
      country: 'BR',
      external_id: userData.external_id ? await sha256(userData.external_id) : undefined,
      fbc: userData.fbc,
      fbp: userData.fbp,
      ga_client_id: userData.ga_client_id
    };
  };
  
  // Preparar dados para Meta
  const metaUserData = await prepareMetaUserData(userData);
  
  // ENVIO OTIMIZADO PARA FACEBOOK PIXEL
  if (typeof fbq !== 'undefined') {
    const checkoutData = {
      content_name: 'Sistema de Controle de Trips - Maracujá',
      content_category: 'Agricultura',
      content_ids: ['6080425'],
      content_type: 'ebook',
      value: 39.90,
      currency: 'BRL',
      num_items: 1,
      // Dados do usuário para enriquecimento (com hash e plain text)
      user_data: metaUserData
    };
    
    fbq('track', 'InitiateCheckout', checkoutData);
    
    if (META_CONFIG.TRACKING.enableDebugLogs) {
      console.log('✅ Facebook Pixel: InitiateCheckout enviado com dados enriquecidos');
      console.log('📊 Dados formatados para Meta:', metaUserData);
    }
  } else {
    if (META_CONFIG.TRACKING.enableDebugLogs) {
      console.warn('⚠️ Facebook Pixel não está disponível');
    }
  }

  // ENVIO PARA GOOGLE ANALYTICS
  if (typeof gtag !== 'undefined') {
    gtag('event', 'begin_checkout', {
      currency: 'BRL',
      value: 39.90,
      items: [{
        item_id: '6080425',
        item_name: 'Sistema de Controle de Trips - Maracujá',
        category: 'Agricultura',
        price: 39.90,
        quantity: 1
      }]
    });
    
    if (META_CONFIG.TRACKING.enableDebugLogs) {
      console.log('✅ Google Analytics: begin_checkout enviado');
    }
  } else {
    if (META_CONFIG.TRACKING.enableDebugLogs) {
      console.warn('⚠️ Google Analytics não está disponível');
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
    
    // Carregar Facebook Pixel primeiro
    loadFacebookPixel();
    
    // Dispara o view_content após o tempo configurado, mas apenas se a trava permitir.
    if (META_CONFIG.TRACKING.enableViewContent) {
      const timer = setTimeout(() => {
        trackViewContent(viewContentHasBeenTracked);
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

// Função para carregar Facebook Pixel
const loadFacebookPixel = () => {
  if (typeof window === 'undefined') return;
  
  // Verificar se o fbq já existe
  if (typeof fbq === 'undefined') {
    // Criar o fbq globalmente
    window.fbq = function(...args: any[]) {
      if (window.fbq.callMethod) {
        window.fbq.callMethod(...args);
      } else {
        window.fbq.queue.push(args);
      }
    };
    
    if (!window._fbq) window._fbq = window.fbq;
    window.fbq.push = window.fbq;
    window.fbq.loaded = !0;
    window.fbq.version = '2.0';
    window.fbq.queue = [];
    
    // Carregar o script do Facebook Pixel
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://connect.facebook.net/en_US/fbevents.js';
    script.onload = () => {
      if (META_CONFIG.TRACKING.enableDebugLogs) {
        console.log('✅ Facebook Pixel carregado com sucesso');
      }
      
      // Inicializar o Pixel com o ID da configuração
      if (typeof fbq !== 'undefined') {
        fbq('init', META_CONFIG.PIXEL_ID);
        fbq('track', 'PageView');
        
        if (META_CONFIG.TRACKING.enableDebugLogs) {
          console.log('✅ Facebook Pixel inicializado e PageView trackado');
          console.log('📊 Pixel ID:', META_CONFIG.PIXEL_ID);
        }
      }
    };
    script.onerror = () => {
      if (META_CONFIG.TRACKING.enableDebugLogs) {
        console.error('❌ Erro ao carregar Facebook Pixel');
      }
    };
    
    document.head.appendChild(script);
  } else {
    if (META_CONFIG.TRACKING.enableDebugLogs) {
      console.log('✅ Facebook Pixel já estava carregado');
    }
  }
};


// --- TIPAGEM GLOBAL ---
// Garante que o TypeScript entenda o objeto window.advancedTracking.
declare global {
  interface Window {
    dataLayer?: any[];
    advancedTracking?: {
      trackCheckout: (userData: any) => Promise<void>;
    };
    fbq?: any;
    _fbq?: any;
  }
}