/**
 * UTM Tracker - Captura e gerenciamento de parâmetros UTM
 * Compatível com variáveis do GTM: {{utm_source_var}}, {{utm_medium_var}}, etc.
 */

export interface UTMParameters {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
}

export interface TrackingParameters extends UTMParameters {
  fbclid?: string;
  gclid?: string;
  referrer?: string;
  landing_page?: string;
  timestamp?: number;
}

export class UTMTracker {
  private static readonly STORAGE_KEYS = {
    UTM_PARAMETERS: 'utm_parameters',
    FBCLID: 'fbclid',
    FIRST_VISIT: 'first_visit',
    LAST_VISIT: 'last_visit',
    SESSION_START: 'session_start'
  };

  private static readonly SESSION_DURATION = 30 * 60 * 1000; // 30 minutos

  /**
   * Captura parâmetros UTM da URL atual
   */
  static captureFromURL(): UTMParameters {
    if (typeof window === 'undefined') return {};

    const urlParams = new URLSearchParams(window.location.search);
    const utmParams: UTMParameters = {};

    // Capturar todos os parâmetros UTM
    const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
    
    utmKeys.forEach(key => {
      const value = urlParams.get(key);
      if (value) {
        utmParams[key as keyof UTMParameters] = value;
      }
    });

    return utmParams;
  }

  /**
   * Captura fbclid da URL
   */
  static captureFBCLID(): string | null {
    if (typeof window === 'undefined') return null;

    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('fbclid');
  }

  /**
   * Captura gclid da URL (Google Click ID)
   */
  static captureGCLID(): string | null {
    if (typeof window === 'undefined') return null;

    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('gclid');
  }

  /**
   * Salva parâmetros UTM no localStorage
   */
  static saveUTMParameters(utmParams: UTMParameters): void {
    if (typeof window === 'undefined') return;

    try {
      // Adicionar timestamp
      const dataToSave = {
        ...utmParams,
        timestamp: Date.now()
      };

      localStorage.setItem(this.STORAGE_KEYS.UTM_PARAMETERS, JSON.stringify(dataToSave));
      console.log('💾 Parâmetros UTM salvos:', this.sanitizeForLogging(utmParams));
    } catch (error) {
      console.error('❌ Erro ao salvar parâmetros UTM:', error);
    }
  }

  /**
   * Carrega parâmetros UTM do localStorage
   */
  static loadUTMParameters(): UTMParameters {
    if (typeof window === 'undefined') return {};

    try {
      const saved = localStorage.getItem(this.STORAGE_KEYS.UTM_PARAMETERS);
      if (saved) {
        const parsed = JSON.parse(saved);
        
        // Verificar se os dados não estão expirados (30 dias)
        const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;
        if (Date.now() - parsed.timestamp < thirtyDaysInMs) {
          const { timestamp, ...utmParams } = parsed;
          return utmParams;
        } else {
          // Remover dados expirados
          localStorage.removeItem(this.STORAGE_KEYS.UTM_PARAMETERS);
        }
      }
    } catch (error) {
      console.error('❌ Erro ao carregar parâmetros UTM:', error);
    }

    return {};
  }

  /**
   * Salva fbclid no localStorage
   */
  static saveFBCLID(fbclid: string): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(this.STORAGE_KEYS.FBCLID, fbclid);
      console.log('💾 fbclid salvo:', fbclid);
    } catch (error) {
      console.error('❌ Erro ao salvar fbclid:', error);
    }
  }

  /**
   * Carrega fbclid do localStorage
   */
  static loadFBCLID(): string | null {
    if (typeof window === 'undefined') return null;

    try {
      return localStorage.getItem(this.STORAGE_KEYS.FBCLID);
    } catch (error) {
      console.error('❌ Erro ao carregar fbclid:', error);
      return null;
    }
  }

  /**
   * Inicializa tracking de primeira visita
   */
  static initializeFirstVisit(): void {
    if (typeof window === 'undefined') return;

    try {
      const firstVisit = localStorage.getItem(this.STORAGE_KEYS.FIRST_VISIT);
      
      if (!firstVisit) {
        // Primeira visita
        const visitData = {
          timestamp: Date.now(),
          landing_page: window.location.pathname + window.location.search,
          referrer: document.referrer
        };
        
        localStorage.setItem(this.STORAGE_KEYS.FIRST_VISIT, JSON.stringify(visitData));
        console.log('🎯 Primeira visita registrada');
      }
    } catch (error) {
      console.error('❌ Erro ao inicializar primeira visita:', error);
    }
  }

  /**
   * Atualiza última visita
   */
  static updateLastVisit(): void {
    if (typeof window === 'undefined') return;

    try {
      const visitData = {
        timestamp: Date.now(),
        page: window.location.pathname + window.location.search
      };
      
      localStorage.setItem(this.STORAGE_KEYS.LAST_VISIT, JSON.stringify(visitData));
    } catch (error) {
      console.error('❌ Erro ao atualizar última visita:', error);
    }
  }

  /**
   * Gerencia sessão do usuário
   */
  static manageSession(): void {
    if (typeof window === 'undefined') return;

    try {
      const sessionStart = localStorage.getItem(this.STORAGE_KEYS.SESSION_START);
      const now = Date.now();

      if (!sessionStart || (now - parseInt(sessionStart)) > this.SESSION_DURATION) {
        // Nova sessão
        localStorage.setItem(this.STORAGE_KEYS.SESSION_START, now.toString());
        console.log('🔄 Nova sessão iniciada');
      }
    } catch (error) {
      console.error('❌ Erro ao gerenciar sessão:', error);
    }
  }

  /**
   * Obtém todos os parâmetros de tracking completos
   */
  static getAllTrackingParameters(): TrackingParameters {
    const utmParams = this.loadUTMParameters();
    const fbclid = this.loadFBCLID();
    const gclid = this.captureGCLID();

    return {
      ...utmParams,
      fbclid,
      gclid,
      referrer: document.referrer,
      landing_page: window.location.pathname + window.location.search,
      timestamp: Date.now()
    };
  }

  /**
   * Inicialização completa do tracking UTM
   */
  static initialize(): void {
    if (typeof window === 'undefined') return;

    console.log('🎯 Inicializando UTM Tracker...');

    // Capturar parâmetros da URL
    const urlUTMParams = this.captureFromURL();
    const urlFBCLID = this.captureFBCLID();

    // Salvar se tiver parâmetros na URL
    if (Object.keys(urlUTMParams).length > 0) {
      this.saveUTMParameters(urlUTMParams);
    }

    if (urlFBCLID) {
      this.saveFBCLID(urlFBCLID);
    }

    // Inicializar visita e sessão
    this.initializeFirstVisit();
    this.updateLastVisit();
    this.manageSession();

    // Log de status
    const currentParams = this.loadUTMParameters();
    const currentFBCLID = this.loadFBCLID();

    console.log('📊 Status UTM Tracking:');
    console.log('   UTM Parameters:', this.sanitizeForLogging(currentParams));
    console.log('   fbclid:', currentFBCLID || 'Não encontrado');
    console.log('   gclid:', this.captureGCLID() || 'Não encontrado');

    console.log('✅ UTM Tracker inicializado');
  }

  /**
   * Adiciona parâmetros UTM a uma URL
   */
  static addUTMToURL(url: string, additionalParams: Record<string, string> = {}): string {
    if (typeof window === 'undefined') return url;

    try {
      const urlObj = new URL(url.startsWith('http') ? url : window.location.origin + url);
      const utmParams = this.loadUTMParameters();

      // Adicionar parâmetros UTM
      Object.entries(utmParams).forEach(([key, value]) => {
        if (value) {
          urlObj.searchParams.set(key, value);
        }
      });

      // Adicionar fbclid se existir
      const fbclid = this.loadFBCLID();
      if (fbclid) {
        urlObj.searchParams.set('fbclid', fbclid);
      }

      // Adicionar parâmetros adicionais
      Object.entries(additionalParams).forEach(([key, value]) => {
        if (value) {
          urlObj.searchParams.set(key, value);
        }
      });

      return urlObj.toString();
    } catch (error) {
      console.error('❌ Erro ao adicionar UTM à URL:', error);
      return url;
    }
  }

  /**
   * Cria campos ocultos de UTM para formulários
   */
  static createHiddenFields(): HTMLInputElement[] {
    if (typeof window === 'undefined') return [];

    const fields: HTMLInputElement[] = [];
    const utmParams = this.loadUTMParameters();
    const fbclid = this.loadFBCLID();

    // Criar campos UTM
    Object.entries(utmParams).forEach(([key, value]) => {
      if (value) {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = value;
        fields.push(input);
      }
    });

    // Criar campo fbclid
    if (fbclid) {
      const fbclidInput = document.createElement('input');
      fbclidInput.type = 'hidden';
      fbclidInput.name = 'fbclid';
      fbclidInput.value = fbclid;
      fields.push(fbclidInput);
    }

    return fields;
  }

  /**
   * Adiciona campos ocultos a um formulário
   */
  static addHiddenFieldsToForm(form: HTMLFormElement): void {
    const fields = this.createHiddenFields();
    fields.forEach(field => form.appendChild(field));
    console.log('📝 Campos UTM adicionados ao formulário');
  }

  /**
   * Limpa dados sensíveis para logging
   */
  private static sanitizeForLogging(data: any): any {
    if (!data) return data;
    
    // Para UTM, não há dados sensíveis, mas mantemos a função por consistência
    return data;
  }

  /**
   * Limpa todos os dados UTM
   */
  static clearAll(): void {
    if (typeof window === 'undefined') return;

    try {
      Object.values(this.STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
      
      console.log('🗑️ Todos os dados UTM limpos');
    } catch (error) {
      console.error('❌ Erro ao limpar dados UTM:', error);
    }
  }

  /**
   * Obtém estatísticas do tracking
   */
  static getStats(): {
    hasUTMParameters: boolean;
    hasFBCLID: boolean;
    hasGCLID: boolean;
    firstVisit: any;
    lastVisit: any;
    sessionActive: boolean;
  } {
    const utmParams = this.loadUTMParameters();
    const fbclid = this.loadFBCLID();
    const gclid = this.captureGCLID();

    let firstVisit = null;
    let lastVisit = null;
    let sessionActive = false;

    try {
      firstVisit = localStorage.getItem(this.STORAGE_KEYS.FIRST_VISIT);
      lastVisit = localStorage.getItem(this.STORAGE_KEYS.LAST_VISIT);
      
      const sessionStart = localStorage.getItem(this.STORAGE_KEYS.SESSION_START);
      if (sessionStart) {
        sessionActive = (Date.now() - parseInt(sessionStart)) <= this.SESSION_DURATION;
      }
    } catch (error) {
      console.error('❌ Erro ao obter estatísticas:', error);
    }

    return {
      hasUTMParameters: Object.keys(utmParams).length > 0,
      hasFBCLID: !!fbclid,
      hasGCLID: !!gclid,
      firstVisit: firstVisit ? JSON.parse(firstVisit) : null,
      lastVisit: lastVisit ? JSON.parse(lastVisit) : null,
      sessionActive
    };
  }
}

export default UTMTracker;