/**
 * Google Tag Manager Integration
 * Gerenciamento completo do dataLayer e eventos para GTM
 * Compatível com Container ID: GTM-567XZCDX
 */

declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
    fbq: (...args: any[]) => void;
    _gtmInitialized: boolean;
    _gtmEventsSent: Set<string>;
    _trackingUserData: any;
  }
}

export interface UserData {
  em?: string; // email
  ph?: string; // phone
  fn?: string; // first_name
  ln?: string; // last_name
  ct?: string; // city
  st?: string; // state
  zp?: string; // zip
  country?: string; // country
}

export interface TrackingData {
  user_data?: UserData;
  fbc?: string; // facebook click id
  fbp?: string; // facebook browser id
  fbclid?: string; // facebook click id from URL
  external_id?: string; // unique user id
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  ga_client_id?: string;
}

export interface EventData extends TrackingData {
  event: string;
  [key: string]: any;
}

export interface ProductData {
  value: string;
  currency: string;
  content_name: string;
  content_category: string;
  content_ids: string[];
  num_items: string;
  items: string;
}

/**
 * Inicializa o dataLayer e configurações básicas do GTM
 */
export function initializeGTM(): void {
  if (typeof window === 'undefined') return;

  // Evitar inicialização duplicada
  if (window._gtmInitialized) {
    console.log('🚫 GTM já inicializado');
    return;
  }

  console.log('🚀 Inicializando GTM...');

  // Inicializar dataLayer se não existir
  window.dataLayer = window.dataLayer || [];

  // Inicializar controle de eventos enviados
  window._gtmEventsSent = new Set<string>();

  // Marcar como inicializado
  window._gtmInitialized = true;

  console.log('✅ GTM inicializado com sucesso');
}

/**
 * Push de dados para o dataLayer com validação
 */
export function pushToDataLayer(data: any): void {
  if (typeof window === 'undefined') return;

  try {
    window.dataLayer.push(data);
    console.log('📊 DataLayer push:', data);
  } catch (error) {
    console.error('❌ Erro ao fazer push para dataLayer:', error);
  }
}

/**
 * Gerencia e atualiza dados do usuário no dataLayer
 */
export function updateUserData(userData: UserData): void {
  if (typeof window === 'undefined') return;

  // Salvar dados do usuário globalmente
  window._trackingUserData = {
    ...window._trackingUserData,
    ...userData
  };

  // Atualizar dataLayer com dados do usuário
  pushToDataLayer({
    user_data: userData,
    'x-ga-mp2-user_properties': {
      em: userData.em,
      ph: userData.ph,
      fn: userData.fn,
      ln: userData.ln
    }
  });

  console.log('👤 Dados do usuário atualizados:', userData);
}

/**
 * Envia eventos para o GTM com controle de duplicação
 */
export function trackEvent(eventName: string, data: TrackingData = {}): void {
  if (typeof window === 'undefined') return;

  // Verificar se evento já foi enviado para evitar duplicação
  const eventKey = `${eventName}_${JSON.stringify(data)}`;
  if (window._gtmEventsSent?.has(eventKey)) {
    console.log(`🚫 Evento ${eventName} já enviado anteriormente`);
    return;
  }

  // Marcar evento como enviado
  window._gtmEventsSent?.add(eventKey);

  // Preparar dados do evento
  const eventData: EventData = {
    event: eventName,
    ...data
  };

  // Adicionar dados do usuário se disponíveis
  if (window._trackingUserData) {
    eventData.user_data = window._trackingUserData;
  }

  // Enviar evento
  pushToDataLayer(eventData);
  console.log(`🎯 Evento rastreado: ${eventName}`, eventData);
}

/**
 * Eventos específicos do Meta Pixel
 */
export class MetaEvents {
  /**
   * PageView - Automático em todas as páginas
   */
  static pageView(data: TrackingData = {}): void {
    trackEvent('page_view', data);
  }

  /**
   * ViewContent - Quando usuário visualiza o produto
   */
  static viewContent(data: TrackingData = {}): void {
    trackEvent('view_content', data);
  }

  /**
   * InitiateCheckout - Quando usuário inicia processo de checkout
   */
  static initiateCheckout(data: TrackingData & ProductData): void {
    trackEvent('initiate_checkout', data);
  }

  /**
   * Purchase - Quando usuário completa a compra
   */
  static purchase(data: TrackingData & ProductData): void {
    trackEvent('purchase', data);
  }

  /**
   * Lead - Quando usuário se qualifica como lead
   */
  static lead(data: TrackingData): void {
    trackEvent('lead', data);
  }
}

/**
 * Eventos de engajamento
 */
export class EngagementEvents {
  /**
   * Scroll Depth - Quando usuário atinge determinada porcentagem de scroll
   */
  static scrollDepth(percentage: number): void {
    trackEvent('engagement_scroll_depth', {
      scroll_percentage: percentage
    });
  }

  /**
   * High Intent - Quando usuário demonstra alta intenção
   */
  static highIntent(): void {
    trackEvent('high_intent', {});
  }

  /**
   * Time on Page - Quando usuário fica X segundos na página
   */
  static timeOnPage(seconds: number): void {
    trackEvent('engagement_time_on_page', {
      time_on_page: seconds
    });
  }
}

/**
 * Utilitários para tracking
 */
export class TrackingUtils {
  /**
   * Gera external ID único para o usuário
   */
  static generateExternalId(email?: string): string {
    if (email) {
      return email.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    }
    
    // Gerar ID aleatório se não tiver email
    return 'user_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Limpa dados sensíveis para logging
   */
  static sanitizeForLogging(data: any): any {
    if (!data) return data;
    
    const sanitized = { ...data };
    
    // Limpar dados sensíveis
    if (sanitized.user_data) {
      sanitized.user_data = {
        ...sanitized.user_data,
        em: sanitized.user_data.em ? '[REDACTED]' : undefined,
        ph: sanitized.user_data.ph ? '[REDACTED]' : undefined
      };
    }
    
    return sanitized;
  }

  /**
   * Verifica se o GTM está disponível
   */
  static isGTMAvailable(): boolean {
    return typeof window !== 'undefined' && 
           typeof window.dataLayer !== 'undefined' && 
           window._gtmInitialized;
  }

  /**
   * Obtém estatísticas de tracking
   */
  static getTrackingStats(): {
    dataLayerLength: number;
    eventsSent: number;
    gtmInitialized: boolean;
    userDataAvailable: boolean;
  } {
    return {
      dataLayerLength: window.dataLayer?.length || 0,
      eventsSent: window._gtmEventsSent?.size || 0,
      gtmInitialized: window._gtmInitialized || false,
      userDataAvailable: !!window._trackingUserData
    };
  }
}

// Exportar funções principais
const GTM = {
  initializeGTM,
  pushToDataLayer,
  updateUserData,
  trackEvent,
  MetaEvents,
  EngagementEvents,
  TrackingUtils
};

export default GTM;