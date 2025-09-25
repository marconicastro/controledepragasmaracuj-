/**
 * Verificação de status do token do Facebook
 * Utilitário para diagnosticar problemas com o token de acesso
 */

export interface FacebookTokenStatus {
  isValid: boolean;
  error?: string;
  errorCode?: string;
  errorType?: string;
  pixelId?: string;
  tokenPresent?: boolean;
}

/**
 * Verifica o status do token do Facebook
 * @returns Promise com status do token
 */
export async function checkFacebookTokenStatus(): Promise<FacebookTokenStatus> {
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substr(2, 9);
  
  try {
    console.log(`🔍 [${requestId}] Verificando status do token do Facebook...`);
    
    // Verificar se o token está configurado
    const accessToken = process.env.FACEBOOK_ACCESS_TOKEN;
    const pixelId = '714277868320104'; // ID do Pixel configurado
    
    if (!accessToken) {
      console.error(`❌ [${requestId}] Token do Facebook não configurado nas variáveis de ambiente`);
      return {
        isValid: false,
        error: 'Token do Facebook não configurado nas variáveis de ambiente',
        errorCode: 'TOKEN_NOT_CONFIGURED',
        errorType: 'configuration_error',
        tokenPresent: false,
        pixelId
      };
    }
    
    console.log(`🔑 [${requestId}] Token presente (${accessToken.length} caracteres), Pixel ID: ${pixelId}`);
    
    // Fazer uma requisição de teste para verificar o token
    const testUrl = `https://graph.facebook.com/v23.0/${pixelId}?access_token=${accessToken}`;
    
    const response = await fetch(testUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ [${requestId}] Token válido! Pixel verificado:`, data.name || pixelId);
      
      return {
        isValid: true,
        pixelId,
        tokenPresent: true
      };
    } else {
      const errorData = await response.json();
      console.error(`❌ [${requestId}] Token inválido:`, errorData);
      
      return {
        isValid: false,
        error: errorData.error?.message || 'Erro desconhecido ao validar token',
        errorCode: errorData.error?.code?.toString() || 'UNKNOWN_ERROR',
        errorType: errorData.error?.type || 'OAuthException',
        pixelId,
        tokenPresent: true
      };
    }
    
  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error(`❌ [${requestId}] Erro ao verificar token após ${processingTime}ms:`, error);
    
    return {
      isValid: false,
      error: error.message || 'Erro de conexão ao verificar token',
      errorCode: 'CONNECTION_ERROR',
      errorType: 'network_error',
      tokenPresent: !!process.env.FACEBOOK_ACCESS_TOKEN
    };
  }
}

/**
 * Função para diagnóstico completo do Facebook Pixel
 */
export async function diagnoseFacebookPixelIssues(): Promise<{
  tokenStatus: FacebookTokenStatus;
  recommendations: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
}> {
  console.group('🔍 DIAGNÓSTICO COMPLETO DO FACEBOOK PIXEL');
  
  const recommendations: string[] = [];
  let severity: 'low' | 'medium' | 'high' | 'critical' = 'low';
  
  try {
    // 1. Verificar status do token
    const tokenStatus = await checkFacebookTokenStatus();
    
    if (!tokenStatus.isValid) {
      severity = 'critical';
      
      switch (tokenStatus.errorCode) {
        case 'TOKEN_NOT_CONFIGURED':
          recommendations.push('🔧 Configure o FACEBOOK_ACCESS_TOKEN nas variáveis de ambiente');
          recommendations.push('📋 Adicione o token no arquivo .env ou nas configurações do ambiente');
          break;
          
        case '190': // Invalid OAuth access token
          recommendations.push('🔄 O token de acesso está expirado ou inválido');
          recommendations.push('🔑 Gere um novo token no Facebook Developers');
          recommendations.push('📝 Atualize a variável de ambiente FACEBOOK_ACCESS_TOKEN');
          break;
          
        case 'CONNECTION_ERROR':
          recommendations.push('🌐 Verifique sua conexão com a internet');
          recommendations.push('🔒 Verifique se há firewall bloqueando requisições para graph.facebook.com');
          break;
          
        default:
          recommendations.push(`❌ Erro no token: ${tokenStatus.error}`);
          recommendations.push('🔍 Verifique as configurações do Facebook Developers');
      }
    }
    
    // 2. Verificar configuração do Pixel
    if (tokenStatus.pixelId === '714277868320104') {
      console.log('✅ Pixel ID configurado corretamente');
    } else {
      recommendations.push('⚠️ Verifique se o Pixel ID está correto');
      severity = severity === 'critical' ? 'critical' : 'medium';
    }
    
    // 3. Recomendações gerais baseadas no status
    if (tokenStatus.isValid) {
      recommendations.push('✅ Token do Facebook está funcionando corretamente');
      recommendations.push('📊 Continue monitorando o envio de eventos');
      severity = 'low';
    } else if (severity !== 'critical') {
      recommendations.push('🔧 Verifique as configurações do Facebook Pixel');
      recommendations.push('📋 Consulte a documentação do Facebook Developers');
      severity = 'medium';
    }
    
    const result = {
      tokenStatus,
      recommendations,
      severity
    };
    
    console.log('📊 Resultado do diagnóstico:', result);
    console.groupEnd();
    
    return result;
    
  } catch (error) {
    console.error('❌ Erro no diagnóstico:', error);
    console.groupEnd();
    
    return {
      tokenStatus: {
        isValid: false,
        error: error.message,
        errorCode: 'DIAGNOSIS_ERROR',
        errorType: 'system_error'
      },
      recommendations: ['❌ Erro crítico no diagnóstico do sistema'],
      severity: 'critical'
    };
  }
}

export default {
  checkFacebookTokenStatus,
  diagnoseFacebookPixelIssues
};