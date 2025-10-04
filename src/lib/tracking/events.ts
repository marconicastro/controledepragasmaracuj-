/**
 * Eventos Específicos para o Projeto
 * Implementação dos eventos do GTM configurados
 */

import { MetaEvents, EngagementEvents, TrackingData, ProductData } from './gtm';
import { UserDataManager } from './user-data';
import { UTMTracker } from './utm-tracker';
import { getFacebookCookies, getGoogleClientId } from '../cookies';

/**
 * Dados do produto para eventos
 */
export const PRODUCT_DATA: ProductData = {
  value: '39.90',
  currency: 'BRL',
  content_name: 'E-book Sistema de Controle de Trips',
  content_category: 'E-book',
  content_ids: ['["ebook-controle-trips"]'],
  num_items: '1',
  items: '[{"id":"ebook-controle-trips","quantity":1,"item_price":39.90}]'
};

/**
 * Classe principal para gerenciar eventos do projeto
 */
export class ProjectEvents {
  /**
   * Inicializa todos os eventos automáticos
   */
  static initialize(): void {
    console.log('🎯 Inicializando eventos do projeto...');
    
    // Disparar PageView automático
    this.pageView();
    
    // Disparar ViewContent após um pequeno delay
    setTimeout(() => {
      this.viewContent();
    }, 1000);
    
    console.log('✅ Eventos do projeto inicializados');
  }

  /**
   * PageView - Evento automático em todas as páginas
   */
  static pageView(): void {
    console.log('📄 Disparando PageView...');
    
    const trackingData = this.buildTrackingData();
    MetaEvents.pageView(trackingData);
  }

  /**
   * ViewContent - Quando usuário visualiza o produto
   */
  static viewContent(): void {
    console.log('👀 Disparando ViewContent...');
    
    const trackingData = this.buildTrackingData();
    MetaEvents.viewContent(trackingData);
  }

  /**
   * InitiateCheckout - Quando usuário inicia processo de checkout
   */
  static initiateCheckout(userData?: any): void {
    console.log('🛒 Disparando InitiateCheckout...');
    
    // Atualizar dados do usuário se fornecidos
    if (userData) {
      const processedData = UserDataManager.processFormData({
        fullName: userData.fullName,
        email: userData.email,
        phone: userData.phone,
        city: userData.city,
        state: userData.state,
        zip: userData.zip
      });
      
      if (processedData.isValid) {
        const trackingData = this.buildTrackingData({
          ...PRODUCT_DATA,
          user_data: processedData.userData
        });
        
        MetaEvents.initiateCheckout(trackingData);
      } else {
        console.error('❌ Dados do usuário inválidos para InitiateCheckout:', processedData.errors);
      }
    } else {
      // Usar dados existentes no localStorage
      const existingUserData = UserDataManager.getFormattedUserData();
      const trackingData = this.buildTrackingData({
        ...PRODUCT_DATA,
        user_data: existingUserData
      });
      
      MetaEvents.initiateCheckout(trackingData);
    }
  }

  /**
   * Purchase - Quando usuário completa a compra
   */
  static purchase(orderData: {
    orderId: string;
    value?: string;
    userData?: any;
  }): void {
    console.log('💰 Disparando Purchase...');
    
    const trackingData = this.buildTrackingData({
      ...PRODUCT_DATA,
      value: orderData.value || PRODUCT_DATA.value,
      order_id: orderData.orderId
    });
    
    // Adicionar dados do usuário se fornecidos
    if (orderData.userData) {
      const processedData = UserDataManager.processFormData(orderData.userData);
      if (processedData.isValid) {
        trackingData.user_data = processedData.userData;
      }
    }
    
    MetaEvents.purchase(trackingData);
  }

  /**
   * Lead - Quando usuário se qualifica como lead
   */
  static lead(userData: any): void {
    console.log('🎯 Disparando Lead...');
    
    const processedData = UserDataManager.processFormData(userData);
    if (processedData.isValid) {
      const trackingData = this.buildTrackingData({
        user_data: processedData.userData
      });
      
      MetaEvents.lead(trackingData);
    } else {
      console.error('❌ Dados do usuário inválidos para Lead:', processedData.errors);
    }
  }

  /**
   * Scroll75Percent - Evento customizado quando usuário atinge 75% de scroll
   */
  static scroll75Percent(): void {
    console.log('📜 [DEBUG] Disparando evento Scroll75Percent...');
    
    const trackingData = this.buildTrackingData();
    
    // Disparar evento customizado
    if (typeof window !== 'undefined' && window.dataLayer) {
      console.log('📜 [DEBUG] Enviando Scroll75Percent para dataLayer:', {
        event: 'Scroll75Percent',
        ...trackingData
      });
      window.dataLayer.push({
        event: 'Scroll75Percent',
        ...trackingData
      });
    } else {
      console.log('📜 [DEBUG] window ou dataLayer não disponível');
    }
  }

  /**
   * HighIntentDetected - Evento customizado quando sistema detecta alta intenção
   */
  static highIntentDetected(): void {
    console.log('🎯 [DEBUG] Disparando evento HighIntentDetected...');
    
    const trackingData = this.buildTrackingData();
    
    // Disparar evento customizado
    if (typeof window !== 'undefined' && window.dataLayer) {
      console.log('🎯 [DEBUG] Enviando HighIntentDetected para dataLayer:', {
        event: 'HighIntentDetected',
        ...trackingData
      });
      window.dataLayer.push({
        event: 'HighIntentDetected',
        ...trackingData
      });
    } else {
      console.log('🎯 [DEBUG] window ou dataLayer não disponível');
    }
  }

  /**
   * Reseta o controle de eventos para navegações SPA
   */
  static reset(): void {
    console.log('🔄 Eventos do projeto resetados');
  }

  /**
   * Scroll Depth - Wrapper para evento de scroll
   */
  static scrollDepth(percentage: number): void {
    console.log(`📜 Scroll Depth: ${percentage}%`);
    
    const trackingData = this.buildTrackingData();
    EngagementEvents.scrollDepth(percentage);
    
    // Disparar Scroll75Percent para scroll 75%
    if (percentage >= 75) {
      this.scroll75Percent();
    }
  }

  /**
   * High Intent - Wrapper para evento de high intent
   */
  static highIntent(): void {
    console.log('🎯 High Intent detectado');
    
    const trackingData = this.buildTrackingData();
    EngagementEvents.highIntent();
    
    // Disparar HighIntentDetected
    this.highIntentDetected();
  }

  /**
   * Form Interaction - Quando usuário interage com formulário
   */
  static formInteraction(formType: 'checkout' | 'lead' | 'contact', action: 'start' | 'submit' | 'error'): void {
    console.log(`📝 Form Interaction: ${formType} - ${action}`);
    
    const trackingData = this.buildTrackingData();
    
    if (typeof window !== 'undefined' && window.dataLayer) {
      window.dataLayer.push({
        event: 'form_interaction',
        form_type: formType,
        form_action: action,
        ...trackingData
      });
    }
  }

  /**
   * CTA Click - Quando usuário clica em call-to-action
   */
  static ctaClick(ctaName: string, ctaLocation: string): void {
    console.log(`🖱️ CTA Click: ${ctaName} (${ctaLocation})`);
    
    const trackingData = this.buildTrackingData();
    
    if (typeof window !== 'undefined' && window.dataLayer) {
      window.dataLayer.push({
        event: 'cta_click',
        cta_name: ctaName,
        cta_location: ctaLocation,
        ...trackingData
      });
    }
  }

  /**
   * Error Tracking - Quando ocorre um erro
   */
  static error(errorType: string, errorMessage: string, errorContext?: any): void {
    console.log(`❌ Error Tracking: ${errorType} - ${errorMessage}`);
    
    if (typeof window !== 'undefined' && window.dataLayer) {
      window.dataLayer.push({
        event: 'error',
        error_type: errorType,
        error_message: errorMessage,
        error_context: errorContext
      });
    }
  }

  /**
   * Constroi dados de tracking completos
   */
  private static buildTrackingData(additionalData: any = {}): TrackingData {
    // Obter dados do usuário
    const userData = UserDataManager.getFormattedUserData();
    
    // Obter cookies do Facebook
    const { fbc, fbp } = getFacebookCookies();
    
    // Obter GA Client ID
    const gaClientId = getGoogleClientId();
    
    // Obter parâmetros UTM
    const utmParams = UTMTracker.loadUTMParameters();
    const fbclid = UTMTracker.loadFBCLID();
    
    // Gerar external ID
    let externalId: string | null = null;
    if (userData.em) {
      externalId = userData.em.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    }
    
    return {
      user_data: userData,
      fbc,
      fbp,
      fbclid,
      external_id: externalId,
      utm_source: utmParams.utm_source,
      utm_medium: utmParams.utm_medium,
      utm_campaign: utmParams.utm_campaign,
      utm_content: utmParams.utm_content,
      utm_term: utmParams.utm_term,
      ga_client_id: gaClientId,
      ...additionalData
    };
  }
}

/**
 * Funções utilitárias para uso em componentes
 */
export class EventUtils {
  /**
   * Configura tracking em formulários
   */
  static setupFormTracking(
    formElement: HTMLFormElement,
    formType: 'checkout' | 'lead' | 'contact'
  ): void {
    // Disparar evento quando formulário é iniciado
    const handleFocus = () => {
      ProjectEvents.formInteraction(formType, 'start');
      formElement.removeEventListener('focusin', handleFocus);
    };
    
    formElement.addEventListener('focusin', handleFocus);
    
    // Disparar evento quando formulário é submetido
    const handleSubmit = (event: Event) => {
      event.preventDefault();
      ProjectEvents.formInteraction(formType, 'submit');
    };
    
    formElement.addEventListener('submit', handleSubmit);
    
    // Adicionar campos UTM ocultos
    UTMTracker.addHiddenFieldsToForm(formElement);
    
    console.log(`📝 Tracking configurado para formulário ${formType}`);
  }

  /**
   * Configura tracking em botões CTA
   */
  static setupCTATracking(
    buttonElement: HTMLElement,
    ctaName: string,
    ctaLocation: string
  ): void {
    const handleClick = () => {
      ProjectEvents.ctaClick(ctaName, ctaLocation);
    };
    
    buttonElement.addEventListener('click', handleClick);
    
    console.log(`🖱️ Tracking configurado para CTA ${ctaName} em ${ctaLocation}`);
  }

  /**
   * Dispara evento de checkout manualmente
   */
  static triggerCheckout(userData: any): void {
    ProjectEvents.initiateCheckout(userData);
  }

  /**
   * Dispara evento de lead manualmente
   */
  static triggerLead(userData: any): void {
    ProjectEvents.lead(userData);
  }

  /**
   * Obtém estatísticas de tracking
   */
  static getTrackingStats(): any {
    const utmStats = UTMTracker.getStats();
    const userData = UserDataManager.getFormattedUserData();
    
    return {
      utm: utmStats,
      userData: {
        hasEmail: !!userData.em,
        hasPhone: !!userData.ph,
        hasName: !!(userData.fn || userData.ln),
        hasLocation: !!(userData.ct || userData.st || userData.zp)
      }
    };
  }
}

/**
 * Função exportada para resetar eventos do projeto
 */
export function resetProjectEvents(): void {
  ProjectEvents.reset();
}

export default ProjectEvents;