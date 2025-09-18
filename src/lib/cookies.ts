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
 * Captura o fbclid da URL e cria o cookie _fbc
 * Esta função deve ser chamada no carregamento da página
 */
export function captureFbclid(): void {
  if (typeof window === 'undefined') return;
  
  // Verificar se já temos o cookie _fbc
  const existingFbc = getCookie('_fbc');
  if (existingFbc) {
    console.log('✅ Cookie _fbc já existe:', existingFbc);
    return;
  }
  
  // Tentar múltiplas fontes de fbclid
  let fbclid: string | null = null;
  
  // 1. Verificar URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  fbclid = urlParams.get('fbclid');
  
  // 2. Verificar sessionStorage (pode ter sido salvo anteriormente)
  if (!fbclid && typeof sessionStorage !== 'undefined') {
    fbclid = sessionStorage.getItem('fbclid');
  }
  
  // 3. Verificar se há algum fbclid em hash fragments
  if (!fbclid && window.location.hash) {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    fbclid = hashParams.get('fbclid');
  }
  
  if (fbclid) {
    // Criar o cookie _fbc no formato correto
    // Formato: fb.1.{timestamp}.{fbclid}
    const timestamp = Date.now();
    const fbcValue = `fb.1.${timestamp}.${fbclid}`;
    
    // Definir o cookie com expiração de 90 dias
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 90);
    
    document.cookie = `_fbc=${fbcValue}; expires=${expirationDate.toUTCString()}; path=/; domain=${window.location.hostname}; SameSite=Lax`;
    
    // Salvar no sessionStorage para referência futura
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem('fbclid', fbclid);
    }
    
    console.log('🎯 Cookie _fbc criado com sucesso:', fbcValue);
    console.log('📊 fbclid capturado:', fbclid);
  } else {
    console.log('ℹ️ Nenhum fbclid encontrado na URL, sessionStorage ou hash - usuário pode ter acessado diretamente');
  }
}

/**
 * Função que aguarda a captura de dados geográficos com timeout
 * @param timeout Tempo máximo de espera em ms
 * @returns Promise com dados geográficos ou null
 */
export async function waitForGeographicData(timeout = 2000): Promise<{
  city: string;
  state: string;
  zip: string;
  country: string;
} | null> {
  return new Promise((resolve) => {
    const startTime = Date.now();
    
    const checkCache = () => {
      const cachedData = getCachedGeographicData();
      if (cachedData) {
        resolve(cachedData);
        return;
      }
      
      if (Date.now() - startTime > timeout) {
        resolve(null);
        return;
      }
      
      setTimeout(checkCache, 100); // Verificar a cada 100ms
    };
    
    checkCache();
  });
}

/**
 * Função para inicializar a captura de parâmetros de rastreamento
 * Deve ser chamada no carregamento da página
 */
export function initializeTracking(): void {
  if (typeof window === 'undefined') return;
  
  console.log('🚀 Inicializando captura de parâmetros de rastreamento...');
  
  // Capturar fbclid e criar cookie _fbc
  captureFbclid();
  
  // Log de status dos cookies
  const { fbc, fbp } = getFacebookCookies();
  console.log('📊 Status dos cookies de rastreamento:');
  console.log('   - _fbc:', fbc || 'Não encontrado');
  console.log('   - _fbp:', fbp || 'Não encontrado');
}

/**
 * Função de retry para captura de FBC com múltiplas tentativas
 * @param maxAttempts Número máximo de tentativas
 * @param delay Atraso inicial entre tentativas (ms)
 */
export function retryFbcCapture(maxAttempts = 5, delay = 1000): void {
  if (typeof window === 'undefined') return;
  
  let attempts = 0;
  
  const tryCapture = () => {
    attempts++;
    console.log(`🔄 Tentativa ${attempts}/${maxAttempts} de capturar FBC...`);
    
    captureFbclid();
    const { fbc } = getFacebookCookies();
    
    if (fbc) {
      console.log('✅ FBC capturado com sucesso na tentativa', attempts);
      return;
    }
    
    if (attempts < maxAttempts) {
      setTimeout(tryCapture, delay * attempts); // Aumentar delay a cada tentativa
    } else {
      console.log('❌ Não foi possível capturar FBC após', maxAttempts, 'tentativas');
    }
  };
  
  tryCapture();
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
 * Cache para dados geográficos para evitar múltiplas chamadas de API
 */
let geographicCache: {
  city: string;
  state: string;
  zip: string;
  country: string;
  timestamp: number;
} | null = null;

/**
 * Obtém dados de localização usando cache ou múltiplas APIs com fallback
 * @returns Promise com dados de localização
 */
export async function getLocationData(): Promise<{
  city: string;
  state: string;
  zip: string;
  country: string;
}> {
  // Verificar se temos dados em cache (válidos por 30 minutos)
  if (geographicCache && (Date.now() - geographicCache.timestamp) < 30 * 60 * 1000) {
    console.log('✅ Usando dados geográficos em cache:', geographicCache);
    return {
      city: geographicCache.city,
      state: geographicCache.state,
      zip: geographicCache.zip,
      country: geographicCache.country
    };
  }

  console.log('🌍 Buscando novos dados geográficos...');
  
  // Tentar múltiplas APIs em sequência
  const apis = [
    // API 1: ipapi.co (mais precisa)
    async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const response = await fetch('https://ipapi.co/json/', {
          method: 'GET',
          mode: 'cors',
          cache: 'no-cache',
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
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
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const response = await fetch('http://ip-api.com/json/', {
          method: 'GET',
          mode: 'cors',
          cache: 'no-cache',
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
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
      
      // Armazenar em cache
      geographicCache = {
        city: result.city,
        state: result.state,
        zip: result.zip,
        country: result.country,
        timestamp: Date.now()
      };
      
      return result;
    }
  }

  // Fallback final com dados padrão do Brasil
  console.warn('⚠️ Usando fallback de localização padrão (Brasil)');
  const fallbackData = {
    city: 'São Paulo',      // Cidade mais populosa como fallback
    state: 'SP',            // Estado mais populoso como fallback
    zip: '01310-100',       // CEP central de São Paulo
    country: 'BR'           // Garantir Brasil
  };
  
  // Armazenar fallback em cache também
  geographicCache = {
    city: fallbackData.city,
    state: fallbackData.state,
    zip: fallbackData.zip,
    country: fallbackData.country,
    timestamp: Date.now()
  };
  
  return fallbackData;
}

/**
 * Obtém dados geográficos em cache (para uso imediato)
 */
export function getCachedGeographicData(): {
  city: string;
  state: string;
  zip: string;
  country: string;
} | null {
  if (geographicCache && (Date.now() - geographicCache.timestamp) < 30 * 60 * 1000) {
    return {
      city: geographicCache.city,
      state: geographicCache.state,
      zip: geographicCache.zip,
      country: geographicCache.country
    };
  }
  return null;
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