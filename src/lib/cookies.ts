/**
 * Utilitários simplificados para manipulação de cookies e rastreamento
 * Compatível com GTM e META CAPI Gateway STAPE
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
 * Obtém parâmetros UTM armazenados no localStorage
 * @returns Objeto com os parâmetros UTM
 */
export function getStoredUTMParameters(): {
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
} {
  const utmParams = {
    utm_source: null as string | null,
    utm_medium: null as string | null,
    utm_campaign: null as string | null,
    utm_content: null as string | null,
    utm_term: null as string | null
  };
  
  if (typeof window === 'undefined') return utmParams;
  
  // Tentar obter do localStorage
  try {
    const savedUtmParams = localStorage.getItem('utm_parameters');
    if (savedUtmParams) {
      const parsed = JSON.parse(savedUtmParams);
      Object.assign(utmParams, parsed);
    }
  } catch (error) {
    console.error('❌ Erro ao recuperar UTM parameters do localStorage:', error);
  }
  
  return utmParams;
}

/**
 * Obtém o fbclid armazenado no localStorage
 * @returns fbclid ou null se não existir
 */
export function getStoredFBCLID(): string | null {
  if (typeof window === 'undefined') return null;
  
  try {
    return localStorage.getItem('fbclid');
  } catch (error) {
    console.error('❌ Erro ao recuperar fbclid do localStorage:', error);
    return null;
  }
}

/**
 * Função para inicializar a captura de parâmetros de rastreamento
 * Deve ser chamada no carregamento da página
 */
export async function initializeTracking(): Promise<void> {
  if (typeof window === 'undefined') return;
  
  console.log('🚀 Inicializando captura de parâmetros de rastreamento...');
  
  // Capturar fbclid e criar cookie _fbc
  captureFbclid();
  
  // Log de status dos cookies
  const { fbc, fbp } = getFacebookCookies();
  const utmParams = getStoredUTMParameters();
  const fbclid = getStoredFBCLID();
  
  console.log('📊 Status dos cookies de rastreamento:');
  console.log('   - _fbc:', fbc || 'Não encontrado');
  console.log('   - _fbp:', fbp || 'Não encontrado');
  console.log('   - fbclid:', fbclid || 'Não encontrado');
  console.log('📊 Status dos parâmetros UTM:');
  Object.keys(utmParams).forEach(key => {
    const value = utmParams[key as keyof typeof utmParams];
    console.log(`   - ${key}:`, value || 'Não encontrado');
  });
}

/**
 * Obtém todos os parâmetros de rastreamento necessários
 * @returns Promise com todos os parâmetros de rastreamento
 */
export async function getAllTrackingParams(): Promise<{
  email: string | null;
  phone: string | null;
  firstName: string | null;
  lastName: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  country: string | null;
  fbc: string | null;
  fbp: string | null;
  fbclid: string | null;
  ga_client_id: string | null;
  external_id: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
}> {
  // Garantir que o rastreamento está inicializado
  await initializeTracking();
  
  // Obter cookies do Facebook
  const { fbc, fbp } = getFacebookCookies();
  
  // Obter GA Client ID
  const ga_client_id = getGoogleClientId();
  
  // Obter UTM parameters
  const utmParams = getStoredUTMParameters();
  
  // Obter fbclid
  const fbclid = getStoredFBCLID();
  
  // Gerar external_id baseado em email se disponível
  let external_id: string | null = null;
  try {
    const savedEmail = localStorage.getItem('user_email');
    if (savedEmail) {
      external_id = savedEmail.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    }
  } catch (error) {
    console.error('❌ Erro ao gerar external_id:', error);
  }
  
  return {
    email: null, // Será preenchido pelo formulário
    phone: null, // Será preenchido pelo formulário
    firstName: null, // Será preenchido pelo formulário
    lastName: null, // Será preenchido pelo formulário
    city: null, // Será preenchido pelo formulário
    state: null, // Será preenchido pelo formulário
    zip: null, // Será preenchido pelo formulário
    country: 'BR', // Padrão Brasil
    fbc,
    fbp,
    fbclid,
    ga_client_id,
    external_id,
    utm_source: utmParams.utm_source,
    utm_medium: utmParams.utm_medium,
    utm_campaign: utmParams.utm_campaign,
    utm_content: utmParams.utm_content,
    utm_term: utmParams.utm_term
  };
}

/**
 * Salva dados pessoais no localStorage para uso futuro
 * @param personalData Dados pessoais para salvar
 */
export function savePersonalDataToLocalStorage(personalData: {
  fn: string;
  ln: string;
  em: string;
  ph: string;
}): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem('user_personal_data', JSON.stringify(personalData));
    if (personalData.em) {
      localStorage.setItem('user_email', personalData.em);
    }
    console.log('💾 Dados pessoais salvos no localStorage:', personalData);
  } catch (error) {
    console.error('❌ Erro ao salvar dados pessoais no localStorage:', error);
  }
}

/**
 * Constrói URL com parâmetros UTM
 * @param baseUrl URL base
 * @param additionalParams Parâmetros adicionais para incluir
 * @returns URL completa com parâmetros UTM
 */
export function buildURLWithUTM(baseUrl: string, additionalParams: Record<string, string> = {}): string {
  if (typeof window === 'undefined') return baseUrl;
  
  const url = new URL(baseUrl);
  const utmParams = getStoredUTMParameters();
  
  // Adicionar parâmetros UTM
  Object.entries(utmParams).forEach(([key, value]) => {
    if (value) {
      url.searchParams.set(key, value);
    }
  });
  
  // Adicionar parâmetros adicionais
  Object.entries(additionalParams).forEach(([key, value]) => {
    if (value) {
      url.searchParams.set(key, value);
    }
  });
  
  console.log('🔗 URL construída com UTM:', url.toString());
  return url.toString();
}

/**
 * Adiciona campos ocultos de UTM a um formulário
 * @param form Elemento do formulário
 */
export function addUTMHiddenFields(form: HTMLFormElement): void {
  if (typeof window === 'undefined') return;
  
  const utmParams = getStoredUTMParameters();
  
  // Adicionar campos UTM ocultos ao formulário
  Object.entries(utmParams).forEach(([key, value]) => {
    if (value) {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = value;
      form.appendChild(input);
    }
  });
  
  // Adicionar fbclid se existir
  const fbclid = getStoredFBCLID();
  if (fbclid) {
    const fbclidInput = document.createElement('input');
    fbclidInput.type = 'hidden';
    fbclidInput.name = 'fbclid';
    fbclidInput.value = fbclid;
    form.appendChild(fbclidInput);
  }
  
  console.log('📝 Campos UTM adicionados ao formulário:', utmParams);
}