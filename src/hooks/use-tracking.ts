/**
 * Hook React para tracking
 * Fornece fácil acesso às funcionalidades de tracking em componentes React
 */

import { useEffect, useCallback } from 'react';
import { 
  ProjectEvents,
  EventUtils,
  UserDataManager,
  UTMTracker
} from '../lib/tracking';

export interface TrackingHook {
  // Eventos do Meta Pixel
  trackPageView: () => void;
  trackViewContent: () => void;
  trackInitiateCheckout: (userData?: any) => void;
  trackPurchase: (orderData: { orderId: string; value?: string; userData?: any }) => void;
  trackLead: (userData: any) => void;
  
  // Eventos de engajamento
  trackScrollDepth: (percentage: number) => void;
  trackHighIntent: () => void;
  
  // Novos eventos customizados separados
  trackScroll75Percent: () => void;
  trackHighIntentDetected: () => void;
  
  // Eventos customizados
  trackCTAClick: (ctaName: string, ctaLocation: string) => void;
  trackFormInteraction: (formType: 'checkout' | 'lead' | 'contact', action: 'start' | 'submit' | 'error') => void;
  trackError: (errorType: string, errorMessage: string, errorContext?: any) => void;
  
  // Gerenciamento de dados
  updateUserData: (userData: any) => void;
  savePersonalData: (personalData: any) => void;
  
  // Utilitários
  setupFormTracking: (formElement: HTMLFormElement, formType: 'checkout' | 'lead' | 'contact') => void;
  setupCTATracking: (buttonElement: HTMLElement, ctaName: string, ctaLocation: string) => void;
  getTrackingStats: () => any;
  addUTMToURL: (url: string, additionalParams?: Record<string, string>) => string;
  resetTracking: () => Promise<void>;
}

/**
 * Hook principal para tracking em componentes React
 */
export function useTracking(): TrackingHook {
  // Eventos do Meta Pixel
  const trackPageView = useCallback(() => {
    ProjectEvents.pageView();
  }, []);

  const trackViewContent = useCallback(() => {
    ProjectEvents.viewContent();
  }, []);

  const trackInitiateCheckout = useCallback((userData?: any) => {
    ProjectEvents.initiateCheckout(userData);
  }, []);

  const trackPurchase = useCallback((orderData: { orderId: string; value?: string; userData?: any }) => {
    ProjectEvents.purchase(orderData);
  }, []);

  const trackLead = useCallback((userData: any) => {
    ProjectEvents.lead(userData);
  }, []);

  // Eventos de engajamento
  const trackScrollDepth = useCallback((percentage: number) => {
    ProjectEvents.scrollDepth(percentage);
  }, []);

  const trackHighIntent = useCallback(() => {
    ProjectEvents.highIntent();
  }, []);

  // Novos eventos customizados separados
  const trackScroll75Percent = useCallback(() => {
    ProjectEvents.scroll75Percent();
  }, []);

  const trackHighIntentDetected = useCallback(() => {
    ProjectEvents.highIntentDetected();
  }, []);

  // Eventos customizados
  const trackCTAClick = useCallback((ctaName: string, ctaLocation: string) => {
    ProjectEvents.ctaClick(ctaName, ctaLocation);
  }, []);

  const trackFormInteraction = useCallback((formType: 'checkout' | 'lead' | 'contact', action: 'start' | 'submit' | 'error') => {
    ProjectEvents.formInteraction(formType, action);
  }, []);

  const trackError = useCallback((errorType: string, errorMessage: string, errorContext?: any) => {
    ProjectEvents.error(errorType, errorMessage, errorContext);
  }, []);

  // Gerenciamento de dados
  const updateUserData = useCallback((userData: any) => {
    // Função de updateUserData será chamada diretamente via GTM
    if (typeof window !== 'undefined' && window.dataLayer) {
      window.dataLayer.push({
        user_data: userData,
        'x-ga-mp2-user_properties': {
          em: userData.em,
          ph: userData.ph,
          fn: userData.fn,
          ln: userData.ln
        }
      });
    }
  }, []);

  const savePersonalData = useCallback((personalData: any) => {
    UserDataManager.savePersonalData(personalData);
  }, []);

  // Utilitários
  const setupFormTracking = useCallback((formElement: HTMLFormElement, formType: 'checkout' | 'lead' | 'contact') => {
    EventUtils.setupFormTracking(formElement, formType);
  }, []);

  const setupCTATracking = useCallback((buttonElement: HTMLElement, ctaName: string, ctaLocation: string) => {
    EventUtils.setupCTATracking(buttonElement, ctaName, ctaLocation);
  }, []);

  const getTrackingStats = useCallback(() => {
    return EventUtils.getTrackingStats();
  }, []);

  const addUTMToURL = useCallback((url: string, additionalParams: Record<string, string> = {}) => {
    return UTMTracker.addUTMToURL(url, additionalParams);
  }, []);

  const resetTracking = useCallback(async () => {
    // Resetar scroll tracker
    const { ScrollTracker } = await import('../lib/tracking');
    const scrollTracker = ScrollTracker.getInstance();
    scrollTracker.reset();
    
    // Resetar eventos do projeto
    const { resetProjectEvents } = await import('../lib/tracking');
    resetProjectEvents();
  }, []);

  return {
    trackPageView,
    trackViewContent,
    trackInitiateCheckout,
    trackPurchase,
    trackLead,
    trackScrollDepth,
    trackHighIntent,
    trackScroll75Percent,
    trackHighIntentDetected,
    trackCTAClick,
    trackFormInteraction,
    trackError,
    updateUserData,
    savePersonalData,
    setupFormTracking,
    setupCTATracking,
    getTrackingStats,
    addUTMToURL,
    resetTracking
  };
}

/**
 * Hook simplificado para tracking básico
 */
export function useBasicTracking() {
  const tracking = useTracking();
  
  return {
    trackPageView: tracking.trackPageView,
    trackViewContent: tracking.trackViewContent,
    trackInitiateCheckout: tracking.trackInitiateCheckout,
    trackCTAClick: tracking.trackCTAClick
  };
}

/**
 * Hook para tracking de formulários
 */
export function useFormTracking(formType: 'checkout' | 'lead' | 'contact') {
  const tracking = useTracking();
  
  const setupForm = useCallback((formElement: HTMLFormElement) => {
    tracking.setupFormTracking(formElement, formType);
  }, [tracking, formType]);

  const trackStart = useCallback(() => {
    tracking.trackFormInteraction(formType, 'start');
  }, [tracking, formType]);

  const trackSubmit = useCallback(() => {
    tracking.trackFormInteraction(formType, 'submit');
  }, [tracking, formType]);

  const trackError = useCallback((errorMessage: string) => {
    tracking.trackFormInteraction(formType, 'error');
    tracking.trackError('form_validation', errorMessage, { formType });
  }, [tracking, formType]);

  return {
    setupForm,
    trackStart,
    trackSubmit,
    trackError
  };
}

/**
 * Hook para tracking de CTA
 */
export function useCTATracking() {
  const tracking = useTracking();
  
  const setupCTA = useCallback((buttonElement: HTMLElement, ctaName: string, ctaLocation: string) => {
    tracking.setupCTATracking(buttonElement, ctaName, ctaLocation);
  }, [tracking]);

  const trackClick = useCallback((ctaName: string, ctaLocation: string) => {
    tracking.trackCTAClick(ctaName, ctaLocation);
  }, [tracking]);

  return {
    setupCTA,
    trackClick
  };
}

export default useTracking;