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
  
  // Capturar fbclid da URL
  const urlParams = new URLSearchParams(window.location.search);
  const fbclid = urlParams.get('fbclid');
  
  if (fbclid) {
    // Criar o cookie _fbc no formato correto
    // Formato: fb.1.{timestamp}.{fbclid}
    const timestamp = Date.now();
    const fbcValue = `fb.1.${timestamp}.${fbclid}`;
    
    // Definir o cookie com expiração de 90 dias
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 90);
    
    document.cookie = `_fbc=${fbcValue}; expires=${expirationDate.toUTCString()}; path=/; domain=${window.location.hostname}; SameSite=Lax`;
    
    console.log('🎯 Cookie _fbc criado com sucesso:', fbcValue);
    console.log('📊 fbclid capturado:', fbclid);
  } else {
    console.log('ℹ️ Nenhum fbclid encontrado na URL - usuário pode ter acessado diretamente');
  }
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
 * Obtém dados de localização de ALTA QUALIDADE com prioridade para dados do formulário
 * @returns Promise com dados de localização da melhor fonte disponível
 */
export async function getHighQualityLocationData(): Promise<{
  city: string;
  state: string;
  zip: string;
  country: string;
}> {
  // 1. Tentar obter dados do formulário primeiro (mais precisos)
  const formLocation = getFormLocationData();
  if (formLocation && formLocation.city && formLocation.state && formLocation.zip) {
    console.log('🌍 Usando dados de localização do formulário (ALTA QUALIDADE):', formLocation);
    return formLocation;
  }
  
  // 2. Tentar obter dados em cache (rápido e confiável)
  const cachedGeoData = getCachedGeographicData();
  if (cachedGeoData) {
    console.log('🌍 Usando dados geográficos em cache:', cachedGeoData);
    return {
      city: cachedGeoData.city,
      state: cachedGeoData.state,
      zip: cachedGeoData.zip,
      country: cachedGeoData.country
    };
  }
  
  // 3. Fallback para API externa
  console.log('🌍 Buscando dados de localização via API externa...');
  return await getLocationData();
}

/**
 * Obtém dados de localização do formulário (se disponíveis)
 * Verifica se os campos do formulário estão preenchidos na página
 */
function getFormLocationData(): {
  city: string;
  state: string;
  zip: string;
  country: string;
} | null {
  if (typeof document === 'undefined') return null;
  
  try {
    // Verificar se há elementos do formulário na página
    const cityElement = document.querySelector('input[name="city"]') as HTMLInputElement;
    const stateElement = document.querySelector('input[name="state"]') as HTMLInputElement;
    const zipElement = document.querySelector('input[name="cep"]') as HTMLInputElement;
    
    const city = cityElement?.value?.trim();
    const state = stateElement?.value?.trim();
    const zip = zipElement?.value?.replace(/\D/g, '');
    
    // Retornar apenas se todos os campos estiverem preenchidos
    if (city && state && zip && zip.length === 8) {
      return {
        city: city,
        state: state.toUpperCase(),
        zip: zip,
        country: 'BR'
      };
    }
  } catch (error) {
    console.warn('⚠️ Erro ao obter dados do formulário:', error);
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
 * Função para validar qualidade dos dados com feedback detalhado
 * @param data Dados a serem validados
 * @returns Objeto com score, problemas e recomendações
 */
export function validateDataQuality(data: any): {
  score: number;
  issues: string[];
  recommendations: string[];
  isValid: boolean;
} {
  const issues: string[] = [];
  const recommendations: string[] = [];
  let score = 0;
  
  // Validar FBC (mais importante - 30 pontos)
  if (!data.fbc) {
    issues.push('FBC não encontrado');
    recommendations.push('Verifique se o fbclid está na URL ou se o cookie _fbc existe');
  } else {
    score += 30;
  }
  
  // Validar FBP (importante - 20 pontos)
  if (!data.fbp) {
    issues.push('FBP não encontrado');
    recommendations.push('Verifique se o cookie _fbp existe');
  } else {
    score += 20;
  }
  
  // Validar dados de localização (10 pontos cada)
  if (!data.ct || data.ct.length < 2) {
    issues.push('Cidade inválida ou ausente');
    recommendations.push('Use API de geolocalização ou dados do formulário');
  } else {
    score += 10;
  }
  
  if (!data.st || data.st.length < 2) {
    issues.push('Estado inválido ou ausente');
    recommendations.push('Verifique o formato do estado (2 letras)');
  } else {
    score += 10;
  }
  
  if (!data.zp || data.zp.length < 8) {
    issues.push('CEP inválido ou ausente');
    recommendations.push('Use CEP válido com 8 dígitos');
  } else {
    score += 10;
  }
  
  // Validar external_id (10 pontos)
  if (!data.external_id) {
    issues.push('External ID não encontrado');
    recommendations.push('Gere external_id a partir do email ou outro identificador único');
  } else {
    score += 10;
  }
  
  // Validar GA Client ID (bônus - 10 pontos)
  if (!data.ga_client_id) {
    issues.push('GA Client ID não encontrado');
    recommendations.push('Verifique se o Google Analytics está configurado corretamente');
  } else {
    score += 10;
  }
  
  // Validar dados do usuário (se disponíveis)
  if (data.em && data.em.includes('@')) {
    score += 5; // Bônus para email
  }
  if (data.ph && data.ph.length >= 10) {
    score += 5; // Bônus para telefone
  }
  if (data.fn && data.fn.length > 1) {
    score += 3; // Bônus para nome
  }
  if (data.ln && data.ln.length > 1) {
    score += 2; // Bônus para sobrenome
  }
  
  const maxScore = 130; // Score máximo possível com todos os bônus
  const isValid = score >= 70; // Considerar válido se score >= 70%
  
  return {
    score: Math.round((score / maxScore) * 100),
    issues,
    recommendations,
    isValid
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