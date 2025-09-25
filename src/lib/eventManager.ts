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
      enableGTM: false,        // Desabilitar GTM para evitar duplicação
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
   */
  private isEventDuplicate(eventName: string, userData: any): boolean {
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
      
      // Preparar dados para dataLayer
      const eventData = {
        event: eventName,
        event_id: eventId,
        ...data
      };

      // Enviar para dataLayer
      window.dataLayer.push(eventData);
      
      console.log(`✅ Evento client-side enviado: ${eventName}`);
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