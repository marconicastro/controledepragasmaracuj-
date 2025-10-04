'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export default function UTMify() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Capturar parâmetros UTM da URL
    const utmParams = {
      utm_source: searchParams.get('utm_source') || '',
      utm_medium: searchParams.get('utm_medium') || '',
      utm_campaign: searchParams.get('utm_campaign') || '',
      utm_content: searchParams.get('utm_content') || '',
      utm_term: searchParams.get('utm_term') || ''
    };

    // Capturar fbclid
    const fbclid = searchParams.get('fbclid') || '';

    // Salvar UTM parameters no localStorage para uso futuro
    if (Object.values(utmParams).some(value => value)) {
      localStorage.setItem('utm_parameters', JSON.stringify(utmParams));
      console.log('📊 UTM parameters salvos:', utmParams);
    }

    // Salvar fbclid no localStorage
    if (fbclid) {
      localStorage.setItem('fbclid', fbclid);
      console.log('🔑 fbclid salvo:', fbclid);
    }

    // Se não tiver UTM na URL, tentar recuperar do localStorage
    if (!Object.values(utmParams).some(value => value)) {
      try {
        const savedUtmParams = localStorage.getItem('utm_parameters');
        if (savedUtmParams) {
          const parsed = JSON.parse(savedUtmParams);
          console.log('📊 UTM parameters recuperados do localStorage:', parsed);
        }
      } catch (error) {
        console.error('❌ Erro ao recuperar UTM parameters do localStorage:', error);
      }
    }

    // Se não tiver fbclid na URL, tentar recuperar do localStorage
    if (!fbclid) {
      const savedFbclid = localStorage.getItem('fbclid');
      if (savedFbclid) {
        console.log('🔑 fbclid recuperado do localStorage:', savedFbclid);
      }
    }

  }, [pathname, searchParams]);

  return null; // Componente não renderiza nada
}