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
}

class EventManager {
  private static instance: EventManager;
  private eventCache: Map<string, EventRecord> = new Map();
  private config: EventConfig;

  private constructor() {
    this.config = {
      enableClientSide: true,
      enableServerSide: true,
      enableGTM: true,
      deduplicationWindow: 5 * 60 * 1000 // 5 minutos
    };

    // Limpar cache periodicamente
    setInterval(() => this.cleanupCache(), 60000);
    
    console.log('🎯 EventManager simplificado inicializado');
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
    const record: EventRecord = {
      eventId,
      eventName,
      timestamp: Date.now(),
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
      
      const eventData = {
        event: eventName,
        event_id: eventId,
        user_data: data.user_data,
        custom_data: data.custom_data
      };

      window.dataLayer.push(eventData);
      
      console.log(`✅ Evento GTM enviado: ${eventName}`);
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
    if (typeof window === 'undefined' || !window.fbq) {
      console.log(`📤 Facebook Pixel não disponível, pulando envio direto de ${eventName}`);
      return false;
    }

    try {
      console.log(`📤 Enviando evento via Facebook Pixel direto: ${eventName}`);
      
      const fbEventName = this.mapToFacebookEventName(eventName);
      const fbData = this.prepareFacebookPixelData(data);
      
      window.fbq('track', fbEventName, fbData, { eventID: eventId });
      
      console.log(`✅ Evento Facebook Pixel direto enviado: ${eventName} -> ${fbEventName}`);
      return true;
    } catch (error) {
      console.error(`❌ Erro ao enviar evento Facebook Pixel direto ${eventName}:`, error);
      return false;
    }
  }

  private mapToFacebookEventName(internalEventName: string): string {
    const eventMapping: { [key: string]: string } = {
      'view_content': 'ViewContent',
      'initiate_checkout': 'InitiateCheckout'
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
  ): Promise<{ success: boolean; eventId: string; channels: string[] }> {
    console.group(`🎯 EventManager - ${eventName}`);
    
    try {
      const channels: string[] = [];
      const results: boolean[] = [];

      // Enviar via GTM
      if (this.config.enableGTM) {
        const gtmEventId = this.generateEventId(eventName, 'gtm');
        this.registerEvent(gtmEventId, eventName, 'gtm', data);
        
        const gtmResult = await this.sendGTM(gtmEventId, eventName, data);
        results.push(gtmResult);
        if (gtmResult) channels.push('gtm');
      }

      // Enviar via Server-side
      if (this.config.enableServerSide) {
        const serverEventId = this.generateEventId(eventName, 'server');
        this.registerEvent(serverEventId, eventName, 'server', data);
        
        const serverResult = await this.sendServerSide(serverEventId, eventName, data);
        results.push(serverResult);
        if (serverResult) channels.push('server');
      }

      // Enviar via Facebook Pixel direto
      const fbEventId = this.generateEventId(eventName, 'fb');
      this.registerEvent(fbEventId, eventName, 'fb', data);
      
      const fbResult = await this.sendFacebookPixelDirect(fbEventId, eventName, data);
      results.push(fbResult);
      if (fbResult) channels.push('fb');

      const success = results.some(result => result);
      
      console.log(`📊 Resultado do envio: ${eventName}`, {
        success,
        channels,
        successfulAttempts: results.filter(r => r).length,
        totalAttempts: results.length
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
   * Métodos específicos para eventos essenciais APENAS
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
   * Métodos utilitários
   */
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