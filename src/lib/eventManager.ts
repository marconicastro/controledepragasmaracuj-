/**
 * Gerenciador Simplificado de Eventos - Apenas Eventos Essenciais
 * 
 * FUNCIONALIDADES:
 * 1. Apenas view_content e initiate_checkout
 * 2. Envio via GTM, Server-side e Facebook Pixel
 * 3. Deduplicação adequada
 * 4. Nenhum evento de engajamento excessivo
 */

interface EventRecord {
  eventId: string;
  eventName: string;
  timestamp: number;
  channel: 'client' | 'server' | 'gtm' | 'fb';
  data: any;
  status: 'pending' | 'sent' | 'failed';
}

interface EventConfig {
  enableClientSide: boolean;
  enableServerSide: boolean;
  enableGTM: boolean;
  deduplicationWindow: number;
  primaryChannel: 'gtm' | 'server' | 'fb'; // Canal primário único
}

class EventManager {
  private static instance: EventManager;
  private eventCache: Map<string, EventRecord> = new Map();
  private config: EventConfig;

  private constructor() {
    this.config = {
      enableClientSide: true,
      enableServerSide: false, // Desativado - GTM/Stape já faz server-side
      enableGTM: true, // Ativado - GTM é o canal primário
      primaryChannel: 'gtm', // GTM como canal primário
      deduplicationWindow: 5 * 60 * 1000 // 5 minutos
    };

    // Limpar cache periodicamente
    setInterval(() => this.cleanupCache(), 60000);
    
    console.log('🎯 EventManager configurado para canal único:', this.config.primaryChannel);
    console.log('🚫 Facebook Pixel fallback desativado para evitar duplicidade com GTM/Stape');
  }

  public static getInstance(): EventManager {
    if (!EventManager.instance) {
      EventManager.instance = new EventManager();
    }
    return EventManager.instance;
  }

  private generateEventId(eventName: string, channel: 'client' | 'server' | 'gtm' | 'fb'): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    return `${eventName}_${timestamp}_${random}_${channel}`;
  }

  private registerEvent(eventId: string, eventName: string, channel: 'client' | 'server' | 'gtm' | 'fb', data: any): void {
    // Verificar duplicação por EventID dentro da janela de deduplicação
    const now = Date.now();
    const existingEvent = this.eventCache.get(eventId);
    
    if (existingEvent && (now - existingEvent.timestamp) < this.config.deduplicationWindow) {
      console.log(`⚠️ Evento duplicado detectado e ignorado: ${eventName} (${channel}) - ID: ${eventId}`);
      return;
    }

    const record: EventRecord = {
      eventId,
      eventName,
      timestamp: now,
      channel,
      data,
      status: 'pending'
    };

    this.eventCache.set(eventId, record);
    console.log(`📝 Evento registrado: ${eventName} (${channel}) - ID: ${eventId}`);
  }

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

  private async sendGTM(eventId: string, eventName: string, data: any): Promise<boolean> {
    if (!this.config.enableGTM || typeof window === 'undefined') {
      return false;
    }

    try {
      console.log(`📤 Enviando evento via GTM: ${eventName}`);
      
      window.dataLayer = window.dataLayer || [];
      
      // Mapear eventos para nomes padrão
      const mappedEventName = this.mapToStandardEventName(eventName);
      
      const eventData = {
        event: mappedEventName,
        event_id: eventId,
        user_data: data.user_data,
        custom_data: data.custom_data,
        // Dados adicionais para GA4
        event_category: data.custom_data?.content_category || 'engagement',
        event_label: data.custom_data?.content_name || 'E-book',
        value: data.custom_data?.value || 0,
        currency: data.custom_data?.currency || 'BRL',
        // Timestamp para debug
        timestamp: new Date().toISOString()
      };

      window.dataLayer.push(eventData);
      
      // Enviar também evento específico para GA4 se disponível
      if (typeof window.gtag !== 'undefined') {
        const ga4EventName = this.mapToGA4EventName(eventName);
        window.gtag('event', ga4EventName, {
          event_category: data.custom_data?.content_category || 'engagement',
          event_label: data.custom_data?.content_name || 'E-book',
          value: data.custom_data?.value || 0,
          currency: data.custom_data?.currency || 'BRL',
          custom_parameter_1: eventId,
          send_to: 'G-CZ0XMXL3RX'
        });
        console.log(`✅ Evento GA4 também enviado: ${ga4EventName}`);
      }
      
      console.log(`✅ Evento GTM enviado: ${eventName} -> ${mappedEventName}`);
      return true;
    } catch (error) {
      console.error(`❌ Erro ao enviar evento GTM ${eventName}:`, error);
      return false;
    }
  }

  private async sendServerSide(eventId: string, eventName: string, data: any): Promise<boolean> {
    if (!this.config.enableServerSide) {
      return false;
    }

    try {
      console.log(`📤 Enviando evento server-side: ${eventName}`);
      
      const apiData = {
        event_name: eventName,
        event_id: eventId,
        pixel_id: '714277868320104',
        user_data: data.user_data || {},
        custom_data: data.custom_data || {}
      };

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

  private async sendFacebookPixelDirect(eventId: string, eventName: string, data: any): Promise<boolean> {
    // Facebook Pixel direto desativado para evitar duplicidade com GTM/Stape
    console.log(`🚫 Facebook Pixel direto desativado para ${eventName} (evitar duplicidade com GTM/Stape)`);
    return false;
  }

  private mapToFacebookEventName(internalEventName: string): string {
    const eventMapping: { [key: string]: string } = {
      'view_content': 'ViewContent',
      'initiate_checkout': 'InitiateCheckout'
    };

    return eventMapping[internalEventName] || internalEventName;
  }

  private mapToStandardEventName(internalEventName: string): string {
    const eventMapping: { [key: string]: string } = {
      'view_content': 'view_content',
      'initiate_checkout': 'initiate_checkout',
      'PageView': 'page_view'
    };

    return eventMapping[internalEventName] || internalEventName;
  }

  private mapToGA4EventName(internalEventName: string): string {
    const eventMapping: { [key: string]: string } = {
      'view_content': 'view_item',
      'initiate_checkout': 'begin_checkout',
      'PageView': 'page_view'
    };

    return eventMapping[internalEventName] || internalEventName;
  }

  private prepareFacebookPixelData(data: any): any {
    const fbData: any = {};

    if (data.custom_data) {
      if (data.custom_data.value) fbData.value = data.custom_data.value;
      if (data.custom_data.currency) fbData.currency = data.custom_data.currency;
      if (data.custom_data.content_name) fbData.content_name = data.custom_data.content_name;
      if (data.custom_data.content_category) fbData.content_category = data.custom_data.content_category;
      if (data.custom_data.content_ids) fbData.content_ids = data.custom_data.content_ids;
      if (data.custom_data.num_items) fbData.num_items = data.custom_data.num_items;
      
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

  public async sendEvent(
    eventName: string,
    data: any
  ): Promise<{ success: boolean; eventId: string; channel: string }> {
    console.group(`🎯 EventManager - ${eventName} (canal único: ${this.config.primaryChannel})`);
    
    try {
      const eventId = this.generateEventId(eventName, this.config.primaryChannel);
      this.registerEvent(eventId, eventName, this.config.primaryChannel, data);
      
      let result = false;
      let channel = '';

      // Enviar APENAS pelo canal primário configurado
      switch (this.config.primaryChannel) {
        case 'gtm':
          result = await this.sendGTM(eventId, eventName, data);
          channel = 'gtm';
          break;
        case 'server':
          result = await this.sendServerSide(eventId, eventName, data);
          channel = 'server';
          break;
        case 'fb':
          result = await this.sendFacebookPixelDirect(eventId, eventName, data);
          channel = 'fb';
          break;
        default:
          console.error(`❌ Canal primário inválido: ${this.config.primaryChannel}`);
          return { success: false, eventId: '', channel: '' };
      }

      console.log(`📊 Resultado do envio único: ${eventName}`, {
        success: result,
        channel,
        eventId
      });

      return { success: result, eventId, channel };

    } catch (error) {
      console.error(`❌ Erro crítico no EventManager para ${eventName}:`, error);
      return { success: false, eventId: '', channel: '' };
    } finally {
      console.groupEnd();
    }
  }

  /**
   * Métodos específicos para eventos essenciais APENAS
   */
  public async sendViewContent(userData: any = {}): Promise<{ success: boolean; eventId: string; channel: string }> {
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

  public async sendInitiateCheckout(userData: any = {}): Promise<{ success: boolean; eventId: string; channel: string }> {
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
   * Métodos utilitários
   */
  public setPrimaryChannel(channel: 'gtm' | 'server' | 'fb'): void {
    this.config.primaryChannel = channel;
    console.log(`🔧 Canal primário alterado para: ${channel}`);
  }

  public getPrimaryChannel(): string {
    return this.config.primaryChannel;
  }

  public getCacheStats(): any {
    return {
      cacheSize: this.eventCache.size,
      config: this.config
    };
  }

  public clearCache(): void {
    this.eventCache.clear();
    console.log('🧹 Cache do EventManager limpo completamente');
  }
}

// Exportar instância única
export const eventManager = EventManager.getInstance();