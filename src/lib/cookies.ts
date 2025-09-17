/**
 * Utilitários para manipulação de cookies e geolocalização
 * Essencial para capturar fbc, fbp e dados de localização para rastreamento
 */

/**
 * Obtém o valor de um cookie pelo nome
 * @param name Nome do cookie
 * @returns Valor do cookie ou null se não existir
 */
export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2] : null;
}

/**
 * Obtém todos os cookies de rastreamento do Facebook
 * @returns Objeto com fbc, fbp e outros dados relevantes
 */
export function getFacebookCookies(): {
  fbc: string | null;
  fbp: string | null;
} {
  return {
    fbc: getCookie('_fbc'),
    fbp: getCookie('_fbp')
  };
}

/**
 * Obtém o Google Analytics Client ID
 * @returns GA Client ID ou null se não existir
 */
export function getGoogleClientId(): string | null {
  const gaCookie = getCookie('_ga');
  if (!gaCookie) return null;
  
  // Formato do cookie _ga: GA1.2.123456789.1234567890
  const parts = gaCookie.split('.');
  if (parts.length >= 4) {
    return parts.slice(2).join('.');
  }
  
  return null;
}

/**
 * Obtém dados de localização usando múltiplas APIs com fallback
 * @returns Promise com dados de localização
 */
export async function getLocationData(): Promise<{
  city: string;
  state: string;
  zip: string;
  country: string;
}> {
  // Tentar múltiplas APIs em sequência
  const apis = [
    // API 1: ipapi.co (mais precisa)
    async () => {
      try {
        const response = await fetch('https://ipapi.co/json/', {
          method: 'GET',
          mode: 'cors',
          cache: 'no-cache',
          timeout: 5000
        });
        
        if (response.ok) {
          const data = await response.json();
          return {
            city: data.city || '',
            state: data.region_code || '',
            zip: data.postal || '',
            country: data.country || 'BR'
          };
        }
      } catch (error) {
        console.warn('⚠️ Falha na API ipapi.co:', error);
      }
      return null;
    },
    
    // API 2: ip-api.com (fallback)
    async () => {
      try {
        const response = await fetch('http://ip-api.com/json/', {
          method: 'GET',
          mode: 'cors',
          cache: 'no-cache',
          timeout: 5000
        });
        
        if (response.ok) {
          const data = await response.json();
          return {
            city: data.city || '',
            state: data.region || '',
            zip: data.zip || '',
            country: data.countryCode || 'BR'
          };
        }
      } catch (error) {
        console.warn('⚠️ Falha na API ip-api.com:', error);
      }
      return null;
    },
    
    // API 3: geoip-js (fallback client-side)
    async () => {
      try {
        // Tentar usar a geolocalização do navegador
        if (typeof navigator !== 'undefined' && navigator.geolocation) {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              timeout: 5000,
              enableHighAccuracy: false
            });
          });
          
          // Reverse geocoding básico (aproximado)
          const { latitude, longitude } = position.coords;
          
          // Para o Brasil, podemos fazer algumas suposições baseadas nas coordenadas
          if (latitude > -34 && latitude < 5 && longitude > -74 && longitude < -34) {
            return {
              city: 'Desconhecida',
              state: 'BR',
              zip: '00000000',
              country: 'BR'
            };
          }
        }
      } catch (error) {
        console.warn('⚠️ Falha na geolocalização do navegador:', error);
      }
      return null;
    }
  ];

  // Tentar cada API em sequência
  for (const api of apis) {
    const result = await api();
    if (result && (result.city || result.state || result.zip)) {
      console.log('✅ Dados de localização obtidos com sucesso:', result);
      return result;
    }
  }

  // Fallback final com dados padrão do Brasil
  console.warn('⚠️ Usando fallback de localização padrão (Brasil)');
  return {
    city: 'São Paulo',      // Cidade mais populosa como fallback
    state: 'SP',            // Estado mais populoso como fallback
    zip: '01310-100',       // CEP central de São Paulo
    country: 'BR'           // Garantir Brasil
  };
}

/**
 * Obtém todos os parâmetros de rastreamento necessários
 * @returns Objeto completo com todos os dados de rastreamento
 */
export async function getAllTrackingParams(): Promise<{
  fbc: string | null;
  fbp: string | null;
  ga_client_id: string | null;
  external_id: string | null;
  city: string;
  state: string;
  zip: string;
  country: string;
}> {
  const facebookCookies = getFacebookCookies();
  const gaClientId = getGoogleClientId();
  const locationData = await getLocationData();
  
  // Gerar external_id baseado no email se disponível (será sobrescrito quando houver email real)
  const external_id = null; // Será preenchido dinamicamente
  
  return {
    ...facebookCookies,
    ga_client_id: gaClientId,
    external_id,
    ...locationData
  };
}

export default {
  getCookie,
  getFacebookCookies,
  getGoogleClientId,
  getLocationData,
  getAllTrackingParams
};