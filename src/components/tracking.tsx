'use client';

import { useEffect } from 'react';

interface TrackingProps {
  ga4Id?: string;
  metaPixelId?: string;
}

export default function Tracking({ ga4Id = 'G-MCYYSBP1VE', metaPixelId = '714277868320104' }: TrackingProps) {
  useEffect(() => {
    // Inicializar dataLayer
    window.dataLayer = window.dataLayer || [];
    
    // Função para gerar ID de evento único
    const generateUniqueEventId = () => {
      const timestamp = Date.now();
      const random = Math.floor(Math.random() * 1000000);
      return `${timestamp}_${random}`;
    };

    // Configurar cookies fbc e fbp
    const setupCookies = () => {
      // Gerar fbp se não existir
      if (!document.cookie.includes('_fbp')) {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 1000000000);
        const fbpValue = `fb.1.${timestamp}.${random}`;
        document.cookie = `_fbp=${fbpValue}; domain=.maracujazeropragas.com; path=/; max-age=7776000; secure; samesite=lax`;
      }

      // Gerar fbc se tiver fbclid na URL
      const urlParams = new URLSearchParams(window.location.search);
      const fbclid = urlParams.get('fbclid');
      if (fbclid && !document.cookie.includes('_fbc')) {
        const timestamp = Date.now();
        const subdomainIndex = window.location.hostname.split('.').length - 1;
        const fbcValue = `fb.${subdomainIndex}.${timestamp}.${fbclid}`;
        document.cookie = `_fbc=${fbcValue}; domain=.maracujazeropragas.com; path=/; max-age=7776000; secure; samesite=lax`;
      }
    };

    // Obter valores dos cookies
    const getCookieValue = (name: string): string => {
      const match = document.cookie.match(new RegExp('(^|;\\s*)' + name + '=([^;]*)'));
      return match ? match[2] : '';
    };

    // Obter parâmetros UTM
    const getUTMParams = () => {
      const urlParams = new URLSearchParams(window.location.search);
      return {
        utm_source: urlParams.get('utm_source') || '',
        utm_medium: urlParams.get('utm_medium') || '',
        utm_campaign: urlParams.get('utm_campaign') || '',
        utm_content: urlParams.get('utm_content') || '',
        utm_term: urlParams.get('utm_term') || ''
      };
    };

    // Inicializar GTM e Meta Pixel
    const initializeTracking = () => {
      setupCookies();
      
      const uniqueEventId = generateUniqueEventId();
      const fbcCookie = getCookieValue('_fbc');
      const fbpCookie = getCookieValue('_fbp');
      const fbclidUrl = new URLSearchParams(window.location.search).get('fbclid') || '';
      const utmParams = getUTMParams();

      // Configurar dataLayer com informações iniciais
      window.dataLayer.push({
        'event': 'page_view',
        'page_location': window.location.href,
        'page_title': document.title,
        'event_id': uniqueEventId,
        'fbcCookie': fbcCookie,
        'fbpCookie': fbpCookie,
        'fbclidUrl': fbclidUrl,
        ...utmParams,
        'user_data': {
          em: '',
          ph: '',
          fn: '',
          ln: '',
          ct: '',
          st: '',
          zp: '',
          country: ''
        }
      });

      // Carregar GTM
      (function(w: any, d: Document, s: string, l: string, i: string) {
        w[l] = w[l] || [];
        w[l].push({
          'gtm.start': new Date().getTime(),
          event: 'gtm.js'
        });
        const f = d.getElementsByTagName(s)[0],
          j = d.createElement(s),
          dl = l != 'dataLayer' ? '&l=' + l : '';
        j.async = true;
        j.src = 'https://www.googletagmanager.com/gtm.js?id=' + i + dl;
        f.parentNode?.insertBefore(j, f);
      })(window, document, 'script', 'dataLayer', 'GTM-567XZCDX');

      // Verificar se o Meta Pixel já foi carregado pelo GTM
      // Se não foi carregado, inicializamos manualmente
      if (!window.fbq) {
        // Carregar Meta Pixel manualmente
        (function(f: any, b: Document, e: string, v: string, n: any, t: HTMLElement, s: HTMLElement) {
          if (f.fbq) return;
          n = f.fbq = function(...args: any[]) {
            if (n.callMethod) {
              n.callMethod(...args);
            } else {
              n.queue.push(args);
            }
          };
          if (!f._fbq) f._fbq = n;
          n.push = n;
          n.loaded = !0;
          n.version = '2.0';
          n.queue = [];
          t = b.createElement(e) as HTMLElement;
          t.async = !0;
          t.src = v;
          s = b.getElementsByTagName(e)[0] as HTMLElement;
          s.parentNode?.insertBefore(t, s);
        })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

        // Inicializar Meta Pixel com parâmetros avançados
        fbq('init', metaPixelId, {
          fbc: fbcCookie,
          fbp: fbpCookie,
          external_id: uniqueEventId
        });

        // Enviar PageView para Meta Pixel
        fbq('track', 'PageView', {
          em: '',
          ph: '',
          fn: '',
          ln: '',
          city: '',
          state: '',
          zip: '',
          country: '',
          fbc: fbcCookie,
          fbp: fbpCookie,
          fbclid: fbclidUrl,
          utm_source: utmParams.utm_source,
          utm_medium: utmParams.utm_medium,
          utm_campaign: utmParams.utm_campaign,
          utm_content: utmParams.utm_content,
          utm_term: utmParams.utm_term,
          event_id: uniqueEventId
        });
      } else {
        // Se o Meta Pixel já foi carregado pelo GTM, apenas inicializamos com nosso ID
        fbq('init', metaPixelId, {
          fbc: fbcCookie,
          fbp: fbpCookie,
          external_id: uniqueEventId
        });

        // Enviar PageView para Meta Pixel
        fbq('track', 'PageView', {
          em: '',
          ph: '',
          fn: '',
          ln: '',
          city: '',
          state: '',
          zip: '',
          country: '',
          fbc: fbcCookie,
          fbp: fbpCookie,
          fbclid: fbclidUrl,
          utm_source: utmParams.utm_source,
          utm_medium: utmParams.utm_medium,
          utm_campaign: utmParams.utm_campaign,
          utm_content: utmParams.utm_content,
          utm_term: utmParams.utm_term,
          event_id: uniqueEventId
        });
      }

      // Configurar GA4 com server container
      window.gtag = window.gtag || function(...args: any[]) {
        window.gtag.q = window.gtag.q || [];
        window.gtag.q.push(args);
      };
      window.gtag('js', new Date());
      window.gtag('config', ga4Id, {
        server_container_url: 'https://data.maracujazeropragas.com',
        transport_url: 'https://data.maracujazeropragas.com',
        event_id: uniqueEventId,
        fbc: fbcCookie,
        fbp: fbpCookie,
        fbclid: fbclidUrl,
        event_name: 'page_view',
        page_url: window.location.href
      });

      // Enviar evento view_content após um pequeno delay
      setTimeout(() => {
        sendEvent('view_content');
      }, 2000);
    };

    // Função para enviar eventos
    const sendEvent = (eventName: string, additionalData?: Record<string, any>) => {
      const uniqueEventId = generateUniqueEventId();
      const fbcCookie = getCookieValue('_fbc');
      const fbpCookie = getCookieValue('_fbp');
      const fbclidUrl = new URLSearchParams(window.location.search).get('fbclid') || '';
      const utmParams = getUTMParams();

      // Data para GA4
      const ga4Data = {
        event: eventName,
        event_id: uniqueEventId,
        fbcCookie: fbcCookie,
        fbpCookie: fbpCookie,
        fbclidUrl: fbclidUrl,
        ...utmParams,
        ...additionalData
      };

      // Data para Meta Pixel
      const metaPixelData = {
        em: '',
        ph: '',
        fn: '',
        ln: '',
        city: '',
        state: '',
        zip: '',
        country: '',
        fbc: fbcCookie,
        fbp: fbpCookie,
        fbclid: fbclidUrl,
        utm_source: utmParams.utm_source,
        utm_medium: utmParams.utm_medium,
        utm_campaign: utmParams.utm_campaign,
        utm_content: utmParams.utm_content,
        utm_term: utmParams.utm_term,
        event_id: uniqueEventId,
        ...additionalData
      };

      // Enviar para GA4
      window.dataLayer.push(ga4Data);

      // Enviar para Meta Pixel baseado no tipo de evento
      switch (eventName) {
        case 'view_content':
          fbq('track', 'ViewContent', metaPixelData);
          break;
        case 'begin_checkout':
          fbq('track', 'InitiateCheckout', {
            ...metaPixelData,
            value: 39.90,
            currency: 'BRL',
            content_name: 'E-book Sistema de Controle de Trips',
            content_category: 'E-book',
            content_ids: ['["ebook-controle-trips"]'],
            num_items: 1,
            items: '[{"id":"ebook-controle-trips","quantity":1,"item_price":39.90}]'
          });
          break;
        case 'high_quality_traffic':
          fbq('trackCustom', 'HighQualityTraffic', {
            event_id: uniqueEventId
          });
          break;
        default:
          fbq('trackCustom', eventName, metaPixelData);
      }
    };

    // Tornar a função disponível globalmente
    (window as any).sendTrackingEvent = sendEvent;

    // Configurar eventos de scroll
    const setupScrollEvents = () => {
      let scrollTriggered = false;
      const scrollThreshold = 75; // 75% do scroll

      const handleScroll = () => {
        if (scrollTriggered) return;

        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrollPercentage = (scrollTop / scrollHeight) * 100;

        if (scrollPercentage >= scrollThreshold) {
          scrollTriggered = true;
          window.dataLayer.push({
            event: 'engagement_scroll_depth',
            scroll_percentage: scrollThreshold
          });
          sendEvent('high_quality_traffic');
        }
      };

      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    };

    // Configurar eventos de high intent
    const setupHighIntentEvents = () => {
      const highIntentActions = [
        'click',
        'mousedown',
        'touchstart'
      ];

      const handleHighIntent = (e: Event) => {
        const target = e.target as HTMLElement;
        const isCTA = target.closest('button') || 
                     target.closest('a') || 
                     target.closest('[role="button"]') ||
                     target.classList.contains('bg-orange-500') ||
                     target.classList.contains('bg-green-600') ||
                     target.classList.contains('bg-yellow-400');

        if (isCTA) {
          setTimeout(() => {
            sendEvent('high_quality_traffic');
          }, 100);
        }
      };

      highIntentActions.forEach(action => {
        document.addEventListener(action, handleHighIntent);
      });

      return () => {
        highIntentActions.forEach(action => {
          document.removeEventListener(action, handleHighIntent);
        });
      };
    };

    // Inicializar tudo
    initializeTracking();
    const scrollCleanup = setupScrollEvents();
    const intentCleanup = setupHighIntentEvents();

    // Cleanup
    return () => {
      scrollCleanup();
      intentCleanup();
    };
  }, [ga4Id, metaPixelId]);

  return null;
}

// Tipagem para o window
declare global {
  interface Window {
    dataLayer: any[];
    fbq: any;
    gtag: any;
    sendTrackingEvent?: (eventName: string, additionalData?: Record<string, any>) => void;
  }
}