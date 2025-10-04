/**
 * Ponto de entrada principal para o sistema de tracking
 * Exporta todas as funcionalidades de forma organizada
 */

// Core GTM functionality
export { default as GTM } from './gtm';
export { 
  initializeGTM, 
  pushToDataLayer, 
  updateUserData, 
  trackEvent,
  MetaEvents,
  EngagementEvents,
  TrackingUtils
} from './gtm';

// User data management
export { default as UserDataManager } from './user-data';

// Scroll tracking
export { default as ScrollTracker } from './scroll-tracker';

// UTM tracking
export { default as UTMTracker } from './utm-tracker';

// Project-specific events
export { default as ProjectEvents } from './events';
export { EventUtils } from './events';

// Funções de reset para SPA
export { resetProjectEvents } from './events';

// Types
export type {
  UserData,
  TrackingData,
  EventData,
  ProductData
} from './gtm';

export type {
  PersonalData,
  FormFieldData
} from './user-data';

export type {
  UTMParameters,
  TrackingParameters
} from './utm-tracker';

// Product data constants
export const PRODUCT_DATA = {
  value: '39.90',
  currency: 'BRL',
  content_name: 'E-book Sistema de Controle de Trips',
  content_category: 'E-book',
  content_ids: ['["ebook-controle-trips"]'],
  num_items: '1',
  items: '[{"id":"ebook-controle-trips","quantity":1,"item_price":39.90}]'
};

/**
 * Função principal de inicialização do tracking
 * Deve ser chamada no início da aplicação
 */
export async function initializeTracking(): Promise<void> {
  console.log('🚀 Inicializando sistema completo de tracking...');
  
  try {
    // Inicializar GTM
    const { initializeGTM } = await import('./gtm');
    initializeGTM();
    
    // Inicializar UTM tracking
    const { UTMTracker } = await import('./utm-tracker');
    UTMTracker.initialize();
    
    // Inicializar scroll tracking
    const { initializeScrollTracker } = await import('./scroll-tracker');
    initializeScrollTracker();
    
    // Inicializar eventos do projeto
    const { ProjectEvents } = await import('./events');
    ProjectEvents.initialize();
    
    console.log('✅ Sistema de tracking inicializado com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao inicializar sistema de tracking:', error);
  }
}

/**
 * Hook React para tracking (se necessário)
 */
export async function useTracking() {
  if (typeof window !== 'undefined') {
    // Garantir que tracking está inicializado
    if (!window._gtmInitialized) {
      await initializeTracking();
    }
  }
  
  return {
    // Eventos do Meta Pixel
    trackPageView: async () => {
      const { MetaEvents } = await import('./gtm');
      MetaEvents.pageView();
    },
    
    trackViewContent: async () => {
      const { MetaEvents } = await import('./gtm');
      MetaEvents.viewContent();
    },
    
    trackInitiateCheckout: async (userData?: any) => {
      const { ProjectEvents } = await import('./events');
      ProjectEvents.initiateCheckout(userData);
    },
    
    // Eventos de engajamento
    trackScrollDepth: async (percentage: number) => {
      const { EngagementEvents } = await import('./gtm');
      EngagementEvents.scrollDepth(percentage);
    },
    
    trackHighIntent: async () => {
      const { EngagementEvents } = await import('./gtm');
      EngagementEvents.highIntent();
    },
    
    // Utilitários
    updateUserData: async (userData: any) => {
      const { updateUserData } = await import('./gtm');
      updateUserData(userData);
    },
    
    getTrackingStats: async () => {
      const { TrackingUtils } = await import('./gtm');
      return TrackingUtils.getTrackingStats();
    }
  };
}

const TrackingSystem = {
  initializeTracking,
  useTracking,
  PRODUCT_DATA
};

export default TrackingSystem;