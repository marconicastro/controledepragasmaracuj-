// GTM Data Layer Tracking Utils
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

// Initialize dataLayer if it doesn't exist
if (typeof window !== 'undefined' && !window.dataLayer) {
  window.dataLayer = [];
}

// GTM Event Types
export interface GTMEvent {
  event: string;
  [key: string]: any;
}

// Push event to dataLayer
export const pushToDataLayer = (eventData: GTMEvent) => {
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push(eventData);
    console.log('GTM Event:', eventData);
  }
};

// Page View Event
export const trackPageView = (pageName: string, pageUrl?: string) => {
  pushToDataLayer({
    event: 'page_view',
    page_name: pageName,
    page_url: pageUrl || window.location.href,
    page_title: document.title,
    timestamp: new Date().toISOString(),
  });
};

// Click Events
export const trackButtonClick = (buttonText: string, buttonLocation: string, actionType: string = 'click') => {
  pushToDataLayer({
    event: 'button_click',
    button_text: buttonText,
    button_location: buttonLocation,
    action_type: actionType,
    timestamp: new Date().toISOString(),
  });
};

// Checkout Events
export const trackCheckoutStart = (product: string, price: number, currency: string = 'BRL') => {
  pushToDataLayer({
    event: 'begin_checkout',
    product_name: product,
    price: price,
    currency: currency,
    timestamp: new Date().toISOString(),
  });
};

export const trackPurchaseClick = (product: string, price: number, currency: string = 'BRL') => {
  pushToDataLayer({
    event: 'purchase_click',
    product_name: product,
    price: price,
    currency: currency,
    checkout_url: 'https://go.allpes.com.br/r1wl4qyyfv',
    timestamp: new Date().toISOString(),
  });
};

// Scroll Events
export const trackScrolled = (percentage: number) => {
  pushToDataLayer({
    event: 'scroll',
    scroll_percentage: percentage,
    timestamp: new Date().toISOString(),
  });
};

// Section View Events
export const trackSectionView = (sectionName: string) => {
  pushToDataLayer({
    event: 'section_view',
    section_name: sectionName,
    timestamp: new Date().toISOString(),
  });
};

// Timer Events
export const trackTimerExpiry = (timerName: string) => {
  pushToDataLayer({
    event: 'timer_expiry',
    timer_name: timerName,
    timestamp: new Date().toISOString(),
  });
};

// User Engagement Events
export const trackUserEngagement = (engagementType: string, value?: any) => {
  pushToDataLayer({
    event: 'user_engagement',
    engagement_type: engagementType,
    engagement_value: value,
    timestamp: new Date().toISOString(),
  });
};

// Lead Events
export const trackLeadEvent = (leadType: string, source: string) => {
  pushToDataLayer({
    event: 'generate_lead',
    lead_type: leadType,
    lead_source: source,
    timestamp: new Date().toISOString(),
  });
};

// Custom Event
export const trackCustomEvent = (eventName: string, eventData: Record<string, any> = {}) => {
  pushToDataLayer({
    event: eventName,
    ...eventData,
    timestamp: new Date().toISOString(),
  });
};
