/**
 * Gerenciador Centralizado de Eventos - Solução para Desduplicação
 * 
 * PROBLEMAS RESOLVIDOS:
 * 1. Centraliza todos os eventos em um único ponto
 * 2. Garante event_ids consistentes entre client-side e server-side
 * 3. Implementa cache compartilhado com expiração adequada
 * 4. Coordena envio entre múltiplos canais
 * 5. Previne envios duplicados com sistema robusto de deduplicação
 */

interface EventRecord {
  eventId: string;
  eventName: string;
  timestamp: number;
  channel: 'client' | 'server' | 'gtm';
  data: any;
  status: 'pending' | 'sent' | 'failed';
}

interface EventConfig {
  enableClientSide: boolean;
  enableServerSide: boolean;
  enableGTM: boolean;
  deduplicationWindow: number; // janela de deduplicação em ms
  retryAttempts: number;
}

class EventManager {
  private static instance: EventManager;
  private eventCache: Map<string, EventRecord> = new Map();
  private processingEvents: Set<string> = new Set();
  private config: EventConfig;

  private constructor() {
    this.config = {
      enableClientSide: true,  // Habilitar client-side via dataLayer
      enableServerSide: true,  // Habilitar server-side via API
      enableGTM: true,         // Habilitar GTM para melhor sincronização
      deduplicationWindow: 5 * 60 * 1000, // 5 minutos de janela de deduplicação
      retryAttempts: 3
    };

    // Limpar cache periodicamente
    setInterval(() => this.cleanupCache(), 60000); // Limpar a cada minuto
    
    console.log('🎯 EventManager inicializado com configuração:', this.config);
  }

  public static getInstance(): EventManager {
    if (!EventManager.instance) {
      EventManager.instance = new EventManager();
    }
    return EventManager.instance;
  }

  /**
   * Gera event_id único e consistente
   * Formato: {eventName}_{timestamp}_{random}_{channel}
   */
  private generateEventId(eventName: string, channel: 'client' | 'server' | 'gtm'): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    const nonce = Math.floor(Math.random() * 1000000);
    return `${eventName}_${timestamp}_${random}_${nonce}_${channel}`;
  }

  /**
   * Verifica se evento já foi enviado recentemente
   * NOTA: Eventos de conversão (view_content, initiate_checkout) NÃO devem ser desduplicados
   */
  private isEventDuplicate(eventName: string, userData: any): boolean {
    // Eventos de conversão NUNCA devem ser desduplicados
    const conversionEvents = ['view_content', 'initiate_checkout', 'purchase', 'add_to_cart'];
    if (conversionEvents.includes(eventName)) {
      console.log(`🎯 Evento de conversão ${eventName} - pulando verificação de duplicação`);
      return false;
    }

    // Para outros eventos, aplicar lógica de desduplicação normal
    const now = Date.now();
    
    // Verificar por evento + email (identificador único do usuário)
    if (userData.email) {
      const userKey = `${eventName}_${userData.email.toLowerCase()}`;
      const userEvent = this.eventCache.get(userKey);
      
      if (userEvent && (now - userEvent.timestamp) < this.config.deduplicationWindow) {
        console.warn(`⚠️ Evento ${eventName} duplicado para usuário ${userData.email}, último envio: ${new Date(userEvent.timestamp).toISOString()}`);
        return true;
      }
    }

    // Verificar por evento + telefone (backup)
    if (userData.phone) {
      const phoneKey = `${eventName}_${userData.phone.replace(/\D/g, '')}`;
      const phoneEvent = this.eventCache.get(phoneKey);
      
      if (phoneEvent && (now - phoneEvent.timestamp) < this.config.deduplicationWindow) {
        console.warn(`⚠️ Evento ${eventName} duplicado para telefone ${userData.phone}, último envio: ${new Date(phoneEvent.timestamp).toISOString()}`);
        return true;
      }
    }

    return false;
  }

  /**
   * Registra evento no cache
   */
  private registerEvent(eventId: string, eventName: string, channel: 'client' | 'server' | 'gtm', data: any): void {
    const record: EventRecord = {
      eventId,
      eventName,
      timestamp: Date.now(),
      channel,
      data,
      status: 'pending'
    };

    this.eventCache.set(eventId, record);

    // Registrar também por usuário para deduplicação
    if (data.user_data?.email) {
      const userKey = `${eventName}_${data.user_data.email.toLowerCase()}`;
      this.eventCache.set(userKey, record);
    }

    if (data.user_data?.phone) {
      const phoneKey = `${eventName}_${data.user_data.phone.replace(/\D/g, '')}`;
      this.eventCache.set(phoneKey, record);
    }

    console.log(`📝 Evento registrado: ${eventName} (${channel}) - ID: ${eventId}`);
  }

  /**
   * Limpa cache de eventos antigos
   */
  private cleanupCache(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    this.eventCache.forEach((record, key) => {
      if (now - record.timestamp > this.config.deduplicationWindow) {
        expiredKeys.push(key);
      }
    });

    expiredKeys.forEach(key => {
      this.eventCache.delete(key);
    });

    if (expiredKeys.length > 0) {
      console.log(`🧹 Cache limpo: ${expiredKeys.length} eventos expirados removidos`);
    }
  }

  /**
   * Envia evento via GTM
   */
  private async sendGTM(eventId: string, eventName: string, data: any): Promise<boolean> {
    if (!this.config.enableGTM || typeof window === 'undefined') {
      return false;
    }

    try {
      console.log(`📤 Enviando evento via GTM: ${eventName}`);
      
      // Garantir que dataLayer exista
      window.dataLayer = window.dataLayer || [];
      
      // Preparar dados para GTM com os 29 parâmetros enriquecidos
      const enrichedData = this.getEnrichedEventParameters(eventName, data);
      
      const eventData = {
        event: eventName,
        event_id: eventId,
        ...enrichedData
      };

      // Enviar para dataLayer
      window.dataLayer.push(eventData);
      
      console.log(`✅ Evento GTM enviado com ${Object.keys(enrichedData).length} parâmetros enriquecidos: ${eventName}`);
      return true;
    } catch (error) {
      console.error(`❌ Erro ao enviar evento GTM ${eventName}:`, error);
      return false;
    }
  }

  /**
   * Envia evento via Client-side (dataLayer)
   */
  private async sendClientSide(eventId: string, eventName: string, data: any): Promise<boolean> {
    if (!this.config.enableClientSide || typeof window === 'undefined') {
      return false;
    }

    try {
      console.log(`📤 Enviando evento client-side: ${eventName}`);
      
      // Garantir que dataLayer exista
      window.dataLayer = window.dataLayer || [];
      
      // Preparar dados para dataLayer com parâmetros enriquecidos
      const enrichedData = this.getEnrichedEventParameters(eventName, data);
      
      const eventData = {
        event: eventName,
        event_id: eventId,
        ...enrichedData
      };

      // Enviar para dataLayer
      window.dataLayer.push(eventData);
      
      console.log(`✅ Evento client-side enviado com ${Object.keys(enrichedData).length} parâmetros enriquecidos: ${eventName}`);
      return true;
    } catch (error) {
      console.error(`❌ Erro ao enviar evento client-side ${eventName}:`, error);
      return false;
    }
  }

  /**
   * Envia evento via Server-side (API)
   */
  private async sendServerSide(eventId: string, eventName: string, data: any): Promise<boolean> {
    if (!this.config.enableServerSide) {
      return false;
    }

    try {
      console.log(`📤 Enviando evento server-side: ${eventName}`);
      
      // Preparar dados para API
      const apiData = {
        event_name: eventName,
        event_id: eventId,
        pixel_id: '714277868320104', // ID do Pixel
        user_data: data.user_data || {},
        custom_data: data.custom_data || {}
      };

      // Enviar para API
      const response = await fetch('/api/facebook-pixel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData)
      });

      if (response.ok) {
        const result = await response.json();
        console.log(`✅ Evento server-side enviado: ${eventName}`, result);
        return true;
      } else {
        const error = await response.json();
        console.error(`❌ Erro ao enviar evento server-side ${eventName}:`, error);
        return false;
      }
    } catch (error) {
      console.error(`❌ Erro ao enviar evento server-side ${eventName}:`, error);
      return false;
    }
  }

  /**
   * Envia evento via Facebook Pixel direto (fbq)
   * Este método é específico para compatibilidade com Meta Pixel Helper
   */
  private async sendFacebookPixelDirect(eventId: string, eventName: string, data: any): Promise<boolean> {
    if (typeof window === 'undefined' || !window.fbq) {
      console.log(`📤 Facebook Pixel não disponível, pulando envio direto de ${eventName}`);
      return false;
    }

    try {
      console.log(`📤 Enviando evento via Facebook Pixel direto: ${eventName}`);
      
      // Mapear nomes de eventos para o formato padrão do Facebook
      const fbEventName = this.mapToFacebookEventName(eventName);
      
      // Preparar dados para o Facebook Pixel
      const fbData = this.prepareFacebookPixelData(data);
      
      // Enviar via fbq() direto - isso será detectado pelo Meta Pixel Helper
      window.fbq('track', fbEventName, fbData, { eventID: eventId });
      
      console.log(`✅ Evento Facebook Pixel direto enviado: ${eventName} -> ${fbEventName}`);
      return true;
    } catch (error) {
      console.error(`❌ Erro ao enviar evento Facebook Pixel direto ${eventName}:`, error);
      return false;
    }
  }

  /**
   * Mapeia nomes de eventos internos para nomes padrão do Facebook
   */
  private mapToFacebookEventName(internalEventName: string): string {
    const eventMapping: { [key: string]: string } = {
      'page_view': 'PageView',
      'view_content': 'ViewContent',
      'initiate_checkout': 'InitiateCheckout',
      'purchase': 'Purchase',
      'add_to_cart': 'AddToCart',
      'add_to_wishlist': 'AddToWishlist',
      'lead': 'Lead',
      'complete_registration': 'CompleteRegistration',
      'contact': 'Contact',
      'find_location': 'FindLocation',
      'schedule': 'Schedule',
      'start_trial': 'StartTrial',
      'submit_application': 'SubmitApplication',
      'subscribe': 'Subscribe',
      'donate': 'Donate'
    };

    return eventMapping[internalEventName] || internalEventName;
  }

  /**
   * Prepara dados para o formato esperado pelo Facebook Pixel
   */
  private prepareFacebookPixelData(data: any): any {
    const fbData: any = {};

    if (data.custom_data) {
      // Mapear campos padrão
      if (data.custom_data.value) fbData.value = data.custom_data.value;
      if (data.custom_data.currency) fbData.currency = data.custom_data.currency;
      if (data.custom_data.content_name) fbData.content_name = data.custom_data.content_name;
      if (data.custom_data.content_category) fbData.content_category = data.custom_data.content_category;
      if (data.custom_data.content_ids) fbData.content_ids = data.custom_data.content_ids;
      if (data.custom_data.num_items) fbData.num_items = data.custom_data.num_items;
      
      // Mapear contents para o formato esperado
      if (data.custom_data.items) {
        fbData.contents = data.custom_data.items.map((item: any) => ({
          id: item.item_id,
          quantity: item.quantity,
          item_price: item.price
        }));
      }
    }

    return fbData;
  }

  /**
   * Método principal para enviar eventos
   */
  public async sendEvent(
    eventName: string,
    data: any,
    options: {
      forceClient?: boolean;
      forceServer?: boolean;
      skipDeduplication?: boolean;
    } = {}
  ): Promise<{ success: boolean; eventId: string; channels: string[] }> {
    const { forceClient = false, forceServer = false, skipDeduplication = false } = options;

    console.group(`🎯 EventManager - ${eventName}`);
    
    try {
      // Verificar duplicação (a menos que seja forçado)
      if (!skipDeduplication && !forceClient && !forceServer) {
        if (this.isEventDuplicate(eventName, data.user_data || {})) {
          console.warn(`⚠️ Evento ${eventName} ignorado por duplicação`);
          return { success: false, eventId: '', channels: [] };
        }
      }

      // Determinar canais de envio
      const channels: string[] = [];
      const results: boolean[] = [];

      // Estratégia de envio baseada na configuração
      if (forceClient || (this.config.enableClientSide && !forceServer)) {
        const clientEventId = this.generateEventId(eventName, 'client');
        this.registerEvent(clientEventId, eventName, 'client', data);
        
        const clientResult = await this.sendClientSide(clientEventId, eventName, data);
        results.push(clientResult);
        channels.push('client');
      }

      if (forceServer || (this.config.enableServerSide && !forceClient)) {
        const serverEventId = this.generateEventId(eventName, 'server');
        this.registerEvent(serverEventId, eventName, 'server', data);
        
        const serverResult = await this.sendServerSide(serverEventId, eventName, data);
        results.push(serverResult);
        channels.push('server');
      }

      // Enviar via GTM se habilitado (para sincronização)
      if (this.config.enableGTM && !forceClient && !forceServer) {
        const gtmEventId = this.generateEventId(eventName, 'gtm');
        this.registerEvent(gtmEventId, eventName, 'gtm', data);
        
        const gtmResult = await this.sendGTM(gtmEventId, eventName, data);
        results.push(gtmResult);
        channels.push('gtm');
      }

      // Enviar via Facebook Pixel direto (para compatibilidade com Meta Pixel Helper)
      if (!forceServer && !forceClient) {
        const fbEventId = this.generateEventId(eventName, 'fb');
        this.registerEvent(fbEventId, eventName, 'fb', data);
        
        const fbResult = await this.sendFacebookPixelDirect(fbEventId, eventName, data);
        results.push(fbResult);
        channels.push('fb');
      }

      const success = results.some(result => result);
      
      console.log(`📊 Resultado do envio: ${eventName}`, {
        success,
        channels,
        results,
        totalAttempts: results.length,
        successfulAttempts: results.filter(r => r).length
      });

      return { success, eventId: channels.join('_'), channels };

    } catch (error) {
      console.error(`❌ Erro crítico no EventManager para ${eventName}:`, error);
      return { success: false, eventId: '', channels: [] };
    } finally {
      console.groupEnd();
    }
  }

  /**
   * Métodos específicos para eventos comuns
   */
  public async sendViewContent(userData: any = {}): Promise<{ success: boolean; eventId: string; channels: string[] }> {
    const eventData = {
      user_data: userData,
      custom_data: {
        currency: 'BRL',
        value: 39.90,
        content_name: 'E-book Sistema de Controle de Trips - Maracujá',
        content_category: 'E-book',
        content_ids: ['6080425'],
        num_items: '1'
      }
    };

    return this.sendEvent('view_content', eventData);
  }

  public async sendInitiateCheckout(userData: any = {}): Promise<{ success: boolean; eventId: string; channels: string[] }> {
    const eventData = {
      user_data: userData,
      custom_data: {
        currency: 'BRL',
        value: 39.90,
        content_name: 'E-book Sistema de Controle de Trips - Maracujá',
        content_category: 'E-book',
        content_ids: ['ebook-controle-trips'],
        num_items: '1',
        items: [{
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

    return this.sendEvent('initiate_checkout', eventData);
  }

  /**
   * Métodos para eventos de engajamento avançados
   */
  public async sendScrollDepth(percentage: number, userData: any = {}): Promise<{ success: boolean; eventId: string; channels: string[] }> {
    const eventData = {
      user_data: userData,
      custom_data: {
        scroll_percentage: percentage,
        page_location: typeof window !== 'undefined' ? window.location.href : '',
        page_title: typeof window !== 'undefined' ? document.title : ''
      }
    };

    return this.sendEvent(`scroll_${percentage}_percent`, eventData);
  }

  public async sendTimeOnPage(seconds: number, userData: any = {}): Promise<{ success: boolean; eventId: string; channels: string[] }> {
    const eventData = {
      user_data: userData,
      custom_data: {
        time_on_page: seconds,
        page_location: typeof window !== 'undefined' ? window.location.href : '',
        page_title: typeof window !== 'undefined' ? document.title : ''
      }
    };

    return this.sendEvent(`time_on_page_${seconds}s`, eventData);
  }

  public async sendClickBuyButton(buttonText: string, userData: any = {}): Promise<{ success: boolean; eventId: string; channels: string[] }> {
    const eventData = {
      user_data: userData,
      custom_data: {
        button_text: buttonText,
        page_location: typeof window !== 'undefined' ? window.location.href : '',
        page_title: typeof window !== 'undefined' ? document.title : ''
      }
    };

    return this.sendEvent('click_buy_button', eventData);
  }

  public async sendClickWhatsApp(linkUrl: string, userData: any = {}): Promise<{ success: boolean; eventId: string; channels: string[] }> {
    const eventData = {
      user_data: userData,
      custom_data: {
        link_url: linkUrl,
        page_location: typeof window !== 'undefined' ? window.location.href : '',
        page_title: typeof window !== 'undefined' ? document.title : ''
      }
    };

    return this.sendEvent('click_whatsapp', eventData);
  }

  public async sendFormInteraction(formData: any, userData: any = {}): Promise<{ success: boolean; eventId: string; channels: string[] }> {
    const eventData = {
      user_data: userData,
      custom_data: {
        form_data: formData,
        page_location: typeof window !== 'undefined' ? window.location.href : '',
        page_title: typeof window !== 'undefined' ? document.title : ''
      }
    };

    return this.sendEvent('form_interaction', eventData);
  }

  public async sendEmailFocus(userData: any = {}): Promise<{ success: boolean; eventId: string; channels: string[] }> {
    const eventData = {
      user_data: userData,
      custom_data: {
        field_type: 'email',
        page_location: typeof window !== 'undefined' ? window.location.href : '',
        page_title: typeof window !== 'undefined' ? document.title : ''
      }
    };

    return this.sendEvent('email_focus', eventData);
  }

  public async sendPageExit(userData: any = {}): Promise<{ success: boolean; eventId: string; channels: string[] }> {
    const eventData = {
      user_data: userData,
      custom_data: {
        exit_reason: 'user_leave',
        page_location: typeof window !== 'undefined' ? window.location.href : '',
        page_title: typeof window !== 'undefined' ? document.title : ''
      }
    };

    return this.sendEvent('page_exit', eventData);
  }

  public async sendPageVisible(userData: any = {}): Promise<{ success: boolean; eventId: string; channels: string[] }> {
    const eventData = {
      user_data: userData,
      custom_data: {
        visibility_state: 'visible',
        page_location: typeof window !== 'undefined' ? window.location.href : '',
        page_title: typeof window !== 'undefined' ? document.title : ''
      }
    };

    return this.sendEvent('page_visible', eventData);
  }

  /**
   * Gera os 29 parâmetros enriquecidos para GTM
   */
  private getEnrichedEventParameters(eventName: string, data: any): any {
    const enrichedParams: any = {};
    
    // Dados básicos do evento
    enrichedParams.event_name = eventName;
    enrichedParams.content_type = 'product';
    enrichedParams.event_source_url = typeof window !== 'undefined' ? window.location.href : '';
    enrichedParams.event_url = enrichedParams.event_source_url;
    
    // Dados de tempo
    const now = new Date();
    enrichedParams.event_time = Math.floor(now.getTime() / 1000);
    enrichedParams.event_day = now.getDate().toString();
    enrichedParams.event_month = (now.getMonth() + 1).toString();
    enrichedParams.event_year = now.getFullYear().toString();
    enrichedParams.event_hour = now.getHours().toString();
    enrichedParams.event_minute = now.getMinutes().toString();
    enrichedParams.event_second = now.getSeconds().toString();
    
    // Dados da página
    enrichedParams.page_title = typeof window !== 'undefined' ? document.title : '';
    enrichedParams.page_location = enrichedParams.event_source_url;
    enrichedParams.referrer_url = typeof window !== 'undefined' ? document.referrer : '';
    
    // Dados do usuário
    if (data.user_data) {
      enrichedParams.client_ip_address = data.user_data.client_ip_address || '';
      enrichedParams.client_user_agent = data.user_data.client_user_agent || (typeof window !== 'undefined' ? window.navigator.userAgent : '');
      enrichedParams.external_id = data.user_data.external_id || '';
      enrichedParams.fbp = data.user_data.fbp || '';
      enrichedParams.fbc = data.user_data.fbc || '';
      enrichedParams.ct = data.user_data.ct || '';
      enrichedParams.st = data.user_data.st || '';
      enrichedParams.zp = data.user_data.zp || '';
      enrichedParams.country = data.user_data.country || '';
      enrichedParams.em = data.user_data.em || '';
      enrichedParams.ph = data.user_data.ph || '';
      enrichedParams.fn = data.user_data.fn || '';
      enrichedParams.ln = data.user_data.ln || '';
    }
    
    // Dados personalizados
    if (data.custom_data) {
      enrichedParams.currency = data.custom_data.currency || 'BRL';
      enrichedParams.value = data.custom_data.value || 39.90;
      enrichedParams.content_name = data.custom_data.content_name || 'E-book Sistema de Controle de Trips';
      enrichedParams.content_category = data.custom_data.content_category || 'E-book';
      enrichedParams.content_ids = Array.isArray(data.custom_data.content_ids) ? data.custom_data.content_ids : ['6080425'];
      enrichedParams.num_items = data.custom_data.num_items || '1';
      
      // Dados de itens
      if (data.custom_data.items) {
        enrichedParams.items = Array.isArray(data.custom_data.items) ? data.custom_data.items : [{
          item_id: 'ebook-controle-trips',
          item_name: 'E-book Sistema de Controle de Trips',
          quantity: 1,
          price: 39.90,
          item_category: 'E-book',
          item_brand: 'Maracujá Zero Pragas',
          currency: 'BRL'
        }];
      }
    }
    
    // Dados de tráfego
    enrichedParams.traffic_source = typeof window !== 'undefined' ? window.location.hostname : '';
    enrichedParams.device_type = typeof window !== 'undefined' ? (window.innerWidth < 768 ? 'mobile' : 'desktop') : 'desktop';
    enrichedParams.browser_language = typeof window !== 'undefined' ? window.navigator.language : '';
    
    // Dados de UTM (se disponíveis)
    const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams();
    enrichedParams.utm_source = urlParams.get('utm_source') || '';
    enrichedParams.utm_medium = urlParams.get('utm_medium') || '';
    enrichedParams.utm_campaign = urlParams.get('utm_campaign') || '';
    enrichedParams.utm_content = urlParams.get('utm_content') || '';
    enrichedParams.utm_term = urlParams.get('utm_term') || '';
    
    console.log(`📊 Gerados ${Object.keys(enrichedParams).length} parâmetros enriquecidos para ${eventName}:`, Object.keys(enrichedParams));
    
    return enrichedParams;
  }

  /**
   * Método para engajamento geral - combina múltiplos sinais
   */
  public async sendHighEngagement(userData: any = {}): Promise<{ success: boolean; eventId: string; channels: string[] }> {
    const eventData = {
      user_data: userData,
      custom_data: {
        engagement_type: 'high',
        engagement_score: 100,
        page_location: typeof window !== 'undefined' ? window.location.href : '',
        page_title: typeof window !== 'undefined' ? document.title : ''
      }
    };

    return this.sendEvent('high_engagement', eventData);
  }

  /**
   * Métodos de utilidade
   */
  public getCacheStats(): { total: number; pending: number; sent: number; failed: number } {
    let total = 0;
    let pending = 0;
    let sent = 0;
    let failed = 0;

    this.eventCache.forEach(record => {
      total++;
      switch (record.status) {
        case 'pending':
          pending++;
          break;
        case 'sent':
          sent++;
          break;
        case 'failed':
          failed++;
          break;
      }
    });

    return { total, pending, sent, failed };
  }

  public clearCache(): void {
    this.eventCache.clear();
    this.processingEvents.clear();
    console.log('🧹 Cache do EventManager limpo completamente');
  }

  public updateConfig(newConfig: Partial<EventConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log('⚙️ Configuração do EventManager atualizada:', this.config);
  }
}

// Exportar instância singleton
export const eventManager = EventManager.getInstance();

// Exportar para uso no window object
if (typeof window !== 'undefined') {
  (window as any).eventManager = eventManager;
}

export default eventManager;