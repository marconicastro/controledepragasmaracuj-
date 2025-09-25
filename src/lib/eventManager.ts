/**
 * Gerenciador Centralizado de Eventos - Solução para Desduplicação
 * 
 * PROBLEMAS RESOLVIDOS:
 * 1. Centraliza todos os eventos em um único ponto
 * 2. Garante event_ids consistentes entre client-side e server-side
 * 3. Implementa cache compartilhado com expiração adequada
 * 4. Coordena envio entre múltiplos canais
 * 5. Previne envios duplicados com sistema robusto de deduplicação
 * 6. Implementa verificação de status do token do Facebook
 * 7. Adiciona fallback quando o token não está funcionando
 */

import { checkFacebookTokenStatus } from '@/lib/facebookTokenStatus';

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

// Interface para status do token
interface TokenStatus {
  isValid: boolean;
  lastChecked: number;
  error?: string;
}

class EventManager {
  private static instance: EventManager;
  private eventCache: Map<string, EventRecord> = new Map();
  private processingEvents: Set<string> = new Set();
  private config: EventConfig;
  private tokenStatus: TokenStatus = {
    isValid: true, // Assumir válido inicialmente
    lastChecked: 0
  };
  private tokenCheckInProgress = false;

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
    
    // Verificar status do token periodicamente (a cada 10 minutos)
    setInterval(() => this.checkTokenStatus(), 10 * 60 * 1000);
    
    console.log('🎯 EventManager inicializado com configuração:', this.config);
  }

  public static getInstance(): EventManager {
    if (!EventManager.instance) {
      EventManager.instance = new EventManager();
    }
    return EventManager.instance;
  }

  /**
   * Verifica o status do token do Facebook
   */
  private async checkTokenStatus(): Promise<void> {
    // Evitar verificações concorrentes
    if (this.tokenCheckInProgress) {
      return;
    }
    
    // Verificar se já verificamos recentemente (menos de 5 minutos)
    if (Date.now() - this.tokenStatus.lastChecked < 5 * 60 * 1000) {
      return;
    }
    
    this.tokenCheckInProgress = true;
    
    try {
      console.log('🔍 Verificando status do token do Facebook...');
      const status = await checkFacebookTokenStatus();
      
      this.tokenStatus = {
        isValid: status.isValid,
        lastChecked: Date.now(),
        error: status.error
      };
      
      if (status.isValid) {
        console.log('✅ Token do Facebook está válido');
        // Reabilitar server-side se estava desabilitado
        this.config.enableServerSide = true;
      } else {
        console.error('❌ Token do Facebook está inválido:', status.error);
        // Desabilitar server-side para evitar erros
        this.config.enableServerSide = false;
        console.warn('⚠️ Server-side desabilitado devido ao token inválido');
      }
      
    } catch (error) {
      console.error('❌ Erro ao verificar status do token:', error);
      this.tokenStatus = {
        isValid: false,
        lastChecked: Date.now(),
        error: error.message
      };
      // Desabilitar server-side em caso de erro
      this.config.enableServerSide = false;
    } finally {
      this.tokenCheckInProgress = false;
    }
  }

  /**
   * Obtém o status atual do token
   */
  public getTokenStatus(): TokenStatus {
    return { ...this.tokenStatus };
  }

  /**
   * Força uma verificação imediata do token
   */
  public async forceTokenCheck(): Promise<TokenStatus> {
    await this.checkTokenStatus();
    return this.getTokenStatus();
  }

  /**
   * Gera event_id único e consistente
   * Formato: {eventName}_{timestamp}_{random}_{channel}
   * CRÍTICO: Para eventos de conversão, incluir um nonce único para evitar desduplicação no Facebook
   */
  private generateEventId(eventName: string, channel: 'client' | 'server' | 'gtm'): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    
    // Para eventos de conversão, adicionar um nonce extra para garantir unicidade absoluta
    const conversionEvents = ['view_content', 'initiate_checkout', 'purchase', 'add_to_cart'];
    if (conversionEvents.includes(eventName)) {
      const nonce = Math.floor(Math.random() * 1000000);
      const uniqueId = Math.random().toString(36).substring(2, 15);
      return `${eventName}_${timestamp}_${random}_${nonce}_${uniqueId}_${channel}`;
    }
    
    const nonce = Math.floor(Math.random() * 1000000);
    return `${eventName}_${timestamp}_${random}_${nonce}_${channel}`;
  }

  /**
   * Verifica se evento já foi enviado recentemente
   * NOTA: Eventos de conversão (view_content, initiate_checkout) NÃO devem ser desduplicados
   * CRÍTICO: Para eventos de conversão, sempre retornar false para evitar qualquer desduplicação
   */
  private isEventDuplicate(eventName: string, userData: any): boolean {
    // Eventos de conversão NUNCA devem ser desduplicados - nunca, nunca, nunca!
    const conversionEvents = ['view_content', 'initiate_checkout', 'purchase', 'add_to_cart'];
    if (conversionEvents.includes(eventName)) {
      console.log(`🎯 EVENTO DE CONVERSÃO ${eventName} - IGNORANDO COMPLETAMENTE A VERIFICAÇÃO DE DUPLICAÇÃO`);
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
   * CRÍTICO: Verificar status do token antes de enviar
   */
  private async sendServerSide(eventId: string, eventName: string, data: any): Promise<boolean> {
    if (!this.config.enableServerSide) {
      console.log(`🚫 Server-side desabilitado para evento ${eventName}`);
      return false;
    }

    // Verificar status do token antes de enviar
    if (!this.tokenStatus.isValid) {
      console.warn(`⚠️ Token inválido, pulando envio server-side para evento ${eventName}`);
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
        
        // Se for erro de autenticação, verificar o token
        if (error.error?.code === 190) {
          console.warn('🔄 Erro de autenticação detectado, verificando token...');
          this.tokenStatus.isValid = false;
          this.tokenStatus.lastChecked = Date.now();
          this.tokenStatus.error = error.error.message;
          this.config.enableServerSide = false;
          
          // Iniciar verificação assíncrona do token
          this.checkTokenStatus();
        }
        
        return false;
      }
    } catch (error) {
      console.error(`❌ Erro ao enviar evento server-side ${eventName}:`, error);
      return false;
    }
  }

  /**
   * Método principal para enviar eventos
   * CRÍTICO: Para eventos de conversão, gerar event_ids únicos a cada envio para evitar desduplicação no Facebook
   * ADICIONADO: Verificação de status do token e fallback para client-side quando token está inválido
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
      // CRÍTICO: Eventos de conversão nunca devem ser desduplicados, nem mesmo com skipDeduplication=false
      const conversionEvents = ['view_content', 'initiate_checkout', 'purchase', 'add_to_cart'];
      const isConversionEvent = conversionEvents.includes(eventName);
      
      // Verificar duplicação (a menos que seja forçado ou evento de conversão)
      if (!skipDeduplication && !forceClient && !forceServer && !isConversionEvent) {
        if (this.isEventDuplicate(eventName, data.user_data || {})) {
          console.warn(`⚠️ Evento ${eventName} ignorado por duplicação`);
          return { success: false, eventId: '', channels: [] };
        }
      }
      
      // Se for evento de conversão, logar explicitamente que estamos ignorando desduplicação
      if (isConversionEvent) {
        console.log(`🎯 EVENTO DE CONVERSÃO ${eventName} - ENVIANDO SEM VERIFICAÇÃO DE DUPLICAÇÃO`);
      }

      // Verificar status do token antes de decidir estratégia de envio
      const tokenStatus = this.getTokenStatus();
      const isTokenValid = tokenStatus.isValid;
      
      if (!isTokenValid && !forceClient) {
        console.warn(`⚠️ Token inválido detectado, ajustando estratégia de envio para evento ${eventName}`);
        // Se token estiver inválido e não forçado client-side, forçar client-side como fallback
        if (!forceServer) {
          console.log(`🔄 Forçando client-side para evento ${eventName} devido ao token inválido`);
        }
      }

      // Determinar canais de envio
      const channels: string[] = [];
      const results: boolean[] = [];

      // Estratégia de envio baseada na configuração e status do token
      if (forceClient || (this.config.enableClientSide && !forceServer) || !isTokenValid) {
        // Para eventos de conversão, gerar event_id único a cada vez
        const clientEventId = isConversionEvent 
          ? this.generateEventId(eventName, 'client')
          : this.generateEventId(eventName, 'client');
        
        this.registerEvent(clientEventId, eventName, 'client', data);
        
        const clientResult = await this.sendClientSide(clientEventId, eventName, data);
        results.push(clientResult);
        channels.push('client');
        
        if (!isTokenValid) {
          console.log(`✅ Evento ${eventName} enviado via client-side (fallback devido ao token inválido)`);
        }
      }

      // Tentar server-side apenas se token estiver válido e não forçado client-side
      if (isTokenValid && (forceServer || (this.config.enableServerSide && !forceClient))) {
        // Para eventos de conversão, gerar event_id único a cada vez (diferente do client-side)
        const serverEventId = isConversionEvent 
          ? this.generateEventId(eventName, 'server')
          : this.generateEventId(eventName, 'server');
        
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
        successfulAttempts: results.filter(r => r).length,
        isConversionEvent,
        tokenStatus: isTokenValid ? '✅ Válido' : '❌ Inválido',
        fallbackUsed: !isTokenValid && channels.includes('client')
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

  /**
   * Métodos de diagnóstico e status do token
   */
  public async diagnoseTokenIssues(): Promise<{
    tokenStatus: TokenStatus;
    serverSideEnabled: boolean;
    clientSideEnabled: boolean;
    recommendations: string[];
  }> {
    const tokenStatus = this.getTokenStatus();
    const recommendations: string[] = [];
    
    if (!tokenStatus.isValid) {
      recommendations.push('❌ Token do Facebook está inválido ou expirado');
      recommendations.push('🔧 Verifique a variável de ambiente FACEBOOK_ACCESS_TOKEN');
      recommendations.push('📝 Gere um novo token no Facebook Developers');
      recommendations.push('🔄 Use forceTokenCheck() para verificar novamente');
    } else {
      recommendations.push('✅ Token do Facebook está válido');
    }
    
    if (!this.config.enableServerSide) {
      recommendations.push('⚠️ Server-side está desabilitado');
      if (tokenStatus.isValid) {
        recommendations.push('🔄 Considere reabilitar server-side para melhor rastreamento');
      }
    }
    
    if (!this.config.enableClientSide) {
      recommendations.push('⚠️ Client-side está desabilitado');
      recommendations.push('🔄 Considere habilitar client-side como fallback');
    }
    
    return {
      tokenStatus,
      serverSideEnabled: this.config.enableServerSide,
      clientSideEnabled: this.config.enableClientSide,
      recommendations
    };
  }

  /**
   * Força reabilitação do server-side (útil após corrigir o token)
   */
  public async forceEnableServerSide(): Promise<boolean> {
    console.log('🔄 Forçando reabilitação do server-side...');
    
    // Verificar token primeiro
    await this.forceTokenCheck();
    
    if (this.tokenStatus.isValid) {
      this.config.enableServerSide = true;
      console.log('✅ Server-side reabilitado com sucesso');
      return true;
    } else {
      console.error('❌ Não foi possível reabilitar server-side - token ainda inválido');
      return false;
    }
  }
}

// Exportar instância singleton
export const eventManager = EventManager.getInstance();

// Exportar para uso no window object
if (typeof window !== 'undefined') {
  (window as any).eventManager = eventManager;
}

export default eventManager;