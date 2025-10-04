/**
 * Scroll Tracker para eventos de engajamento
 * Monitora scroll depth e dispara eventos para o GTM
 */

import { EngagementEvents } from './gtm';
import { ProjectEvents } from './events';

export interface ScrollConfig {
  thresholds: number[]; // Porcentagens de scroll para tracking
  highIntentThreshold: number; // Porcentagem para considerar high intent
  timeOnPageThresholds: number[]; // Tempos em segundos para tracking
}

export class ScrollTracker {
  private static instance: ScrollTracker;
  private initialized = false;
  private thresholdsReached = new Set<number>();
  private timeThresholdsReached = new Set<number>();
  private scrollHandler: ((event: Event) => void) | null = null;
  private timeOnPage = 0;
  private timeInterval: NodeJS.Timeout | null = null;

  private readonly config: ScrollConfig = {
    thresholds: [25, 50, 75, 90], // Porcentagens de scroll
    highIntentThreshold: 75, // High intent a 75% de scroll
    timeOnPageThresholds: [30, 60, 120, 300] // 30s, 1min, 2min, 5min
  };

  private constructor() {}

  /**
   * Obtém instância singleton
   */
  static getInstance(): ScrollTracker {
    if (!ScrollTracker.instance) {
      ScrollTracker.instance = new ScrollTracker();
    }
    return ScrollTracker.instance;
  }

  /**
   * Inicializa o tracking de scroll
   */
  initialize(): void {
    if (this.initialized || typeof window === 'undefined') {
      return;
    }

    console.log('📜 Inicializando Scroll Tracker...');

    // Configurar listener de scroll
    this.scrollHandler = this.handleScroll.bind(this);
    window.addEventListener('scroll', this.scrollHandler, { passive: true });

    // Inicializar tracking de tempo na página
    this.startTimeTracking();

    // Verificar scroll inicial (caso página já tenha scroll)
    setTimeout(() => this.checkCurrentScroll(), 100);

    this.initialized = true;
    console.log('✅ Scroll Tracker inicializado');
  }

  /**
   * Para o tracking de scroll
   */
  destroy(): void {
    if (!this.initialized) return;

    // Remover listener de scroll
    if (this.scrollHandler) {
      window.removeEventListener('scroll', this.scrollHandler);
      this.scrollHandler = null;
    }

    // Parar tracking de tempo
    if (this.timeInterval) {
      clearInterval(this.timeInterval);
      this.timeInterval = null;
    }

    this.initialized = false;
    console.log('🛑 Scroll Tracker destruído');
  }

  /**
   * Handler de evento de scroll
   */
  private handleScroll(): void {
    if (typeof window === 'undefined') return;

    this.checkCurrentScroll();
  }

  /**
   * Verifica scroll atual e dispara eventos se necessário
   */
  private checkCurrentScroll(): void {
    const scrollPercentage = this.calculateScrollPercentage();
    
    this.config.thresholds.forEach(threshold => {
      if (scrollPercentage >= threshold && !this.thresholdsReached.has(threshold)) {
        this.thresholdsReached.add(threshold);
        this.onThresholdReached(threshold, scrollPercentage);
      }
    });
  }

  /**
   * Calcula porcentagem de scroll
   */
  private calculateScrollPercentage(): number {
    if (typeof window === 'undefined') return 0;

    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    
    if (scrollHeight === 0) return 0;
    
    const percentage = Math.round((scrollTop / scrollHeight) * 100);
    return Math.min(100, Math.max(0, percentage));
  }

  /**
   * Disparado quando um threshold é atingido
   */
  private onThresholdReached(threshold: number, actualPercentage: number): void {
    console.log(`📜 Threshold de scroll atingido: ${threshold}% (atual: ${actualPercentage}%)`);

    // Disparar evento de scroll depth
    EngagementEvents.scrollDepth(threshold);

    // Verificar se é high intent
    if (threshold >= this.config.highIntentThreshold) {
      this.triggerHighIntent();
    }
  }

  /**
   * Dispara evento de high intent (apenas uma vez)
   */
  private triggerHighIntent(): void {
    if (this.thresholdsReached.has(-1)) return; // -1 indica que high intent já foi disparado
    
    this.thresholdsReached.add(-1);
    console.log('🎯 High Intent detectado - usuário engajado');
    
    // Usar ProjectEvents para garantir que o evento correto seja acionado
    ProjectEvents.highIntent();
  }

  /**
   * Inicializa tracking de tempo na página
   */
  private startTimeTracking(): void {
    this.timeInterval = setInterval(() => {
      this.timeOnPage++;
      this.checkTimeThresholds();
    }, 1000); // Atualizar a cada segundo
  }

  /**
   * Verifica thresholds de tempo na página
   */
  private checkTimeThresholds(): void {
    this.config.timeOnPageThresholds.forEach(threshold => {
      if (this.timeOnPage >= threshold && !this.timeThresholdsReached.has(threshold)) {
        this.timeThresholdsReached.add(threshold);
        this.onTimeThresholdReached(threshold);
      }
    });
  }

  /**
   * Disparado quando um threshold de tempo é atingido
   */
  private onTimeThresholdReached(seconds: number): void {
    console.log(`⏱️ Threshold de tempo atingido: ${seconds}s`);
    
    EngagementEvents.timeOnPage(seconds);
    
    // Considerar high intent baseado no tempo também
    if (seconds >= 120 && !this.thresholdsReached.has(-1)) { // 2 minutos
      this.triggerHighIntent();
    }
  }

  /**
   * Obtém estatísticas atuais
   */
  getStats(): {
    initialized: boolean;
    currentScrollPercentage: number;
    thresholdsReached: number[];
    timeOnPage: number;
    timeThresholdsReached: number[];
    highIntentTriggered: boolean;
  } {
    return {
      initialized: this.initialized,
      currentScrollPercentage: this.calculateScrollPercentage(),
      thresholdsReached: Array.from(this.thresholdsReached).filter(t => t > 0),
      timeOnPage: this.timeOnPage,
      timeThresholdsReached: Array.from(this.timeThresholdsReached),
      highIntentTriggered: this.thresholdsReached.has(-1)
    };
  }

  /**
   * Força verificação manual de scroll
   */
  forceCheck(): void {
    this.checkCurrentScroll();
  }

  /**
   * Reseta o tracker (útil para SPA)
   */
  reset(): void {
    this.thresholdsReached.clear();
    this.timeThresholdsReached.clear();
    this.timeOnPage = 0;
    
    // Resetar também os eventos do projeto para evitar duplicação em navegações SPA
    ProjectEvents.reset();
    
    console.log('🔄 Scroll Tracker resetado');
  }
}

/**
 * Hook para usar Scroll Tracker em componentes React
 */
export function useScrollTracker(): ScrollTracker {
  return ScrollTracker.getInstance();
}

/**
 * Função utilitária para inicializar scroll tracker globalmente
 */
export function initializeScrollTracker(): ScrollTracker {
  const tracker = ScrollTracker.getInstance();
  tracker.initialize();
  return tracker;
}

export default ScrollTracker;