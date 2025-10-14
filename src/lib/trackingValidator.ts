/**
 * Sistema de Validação e Diagnóstico de Parâmetros de Tracking
 * 
 * Este módulo ajuda a identificar problemas nos parâmetros críticos para o Facebook:
 * - fbc (Facebook Click ID)
 * - fbp (Facebook Pixel ID) 
 * - external_id (Identificação Externa)
 * - IP e User Agent
 */

import { getFacebookCookies, getAllTrackingParams } from './cookies';

interface ValidationResult {
  parameter: string;
  status: 'success' | 'warning' | 'error';
  value: string | null;
  message: string;
  recommendations: string[];
  score: number; // 0-100
}

interface TrackingDiagnostic {
  overallScore: number;
  parameters: ValidationResult[];
  summary: {
    success: number;
    warning: number;
    error: number;
  };
  recommendations: string[];
  timestamp: string;
}

class TrackingValidator {
  private static instance: TrackingValidator;

  private constructor() {}

  public static getInstance(): TrackingValidator {
    if (!TrackingValidator.instance) {
      TrackingValidator.instance = new TrackingValidator();
    }
    return TrackingValidator.instance;
  }

  /**
   * Valida o parâmetro fbc (Facebook Click ID)
   */
  private validateFbc(fbc: string | null): ValidationResult {
    if (!fbc) {
      return {
        parameter: 'fbc',
        status: 'error',
        value: null,
        message: '❌ fbc não encontrado - impacto CRÍTICO na atribuição',
        recommendations: [
          'Verifique se o fbclid está na URL da página',
          'Execute captureFbclid() imediatamente no carregamento',
          'Verifique se os cookies estão sendo salvos corretamente',
          'Teste com URL: ?fbclid=teste123'
        ],
        score: 0
      };
    }

    // Verificar formato do fbc
    const fbcPattern = /^fb\.1\.\d+\.[a-zA-Z0-9_-]+$/;
    if (!fbcPattern.test(fbc)) {
      return {
        parameter: 'fbc',
        status: 'error',
        value: fbc,
        message: '❌ Formato do fbc inválido',
        recommendations: [
          'O formato deve ser: fb.1.{timestamp}.{fbclid}',
          'Verifique se o fbclid está completo',
          'Execute captureFbclid() novamente'
        ],
        score: 20
      };
    }

    // Verificar idade do fbc
    const parts = fbc.split('.');
    if (parts.length >= 3) {
      const timestamp = parseInt(parts[2]);
      const now = Date.now();
      const daysDiff = (now - timestamp) / (1000 * 60 * 60 * 24);
      
      if (daysDiff > 90) {
        return {
          parameter: 'fbc',
          status: 'warning',
          value: fbc,
          message: `⚠️ fbc está velho (${daysDiff.toFixed(0)} dias)`,
          recommendations: [
            'fbc perde eficácia após 90 dias',
            'Considere capturar um novo fbclid',
            'Verifique se o usuário está voltando de um anúncio'
          ],
          score: 60
        };
      }
    }

    return {
      parameter: 'fbc',
      status: 'success',
      value: fbc,
      message: '✅ fbc válido e recente',
      recommendations: [],
      score: 100
    };
  }

  /**
   * Valida o parâmetro fbp (Facebook Pixel ID)
   */
  private validateFbp(fbp: string | null): ValidationResult {
    if (!fbp) {
      return {
        parameter: 'fbp',
        status: 'error',
        value: null,
        message: '❌ fbp não encontrado - impacto ALTO na correspondência',
        recommendations: [
          'Execute ensureFbpCookie() imediatamente',
          'Verifique se os cookies estão habilitados',
          'Verifique se o domínio está correto'
        ],
        score: 0
      };
    }

    // Verificar formato do fbp
    const fbpPattern = /^fb\.1\.\d+\.[a-zA-Z0-9_-]+$/;
    if (!fbpPattern.test(fbp)) {
      return {
        parameter: 'fbp',
        status: 'error',
        value: fbp,
        message: '❌ Formato do fbp inválido',
        recommendations: [
          'O formato deve ser: fb.1.{timestamp}.{random}',
          'Execute ensureFbpCookie() novamente'
        ],
        score: 30
      };
    }

    return {
      parameter: 'fbp',
      status: 'success',
      value: fbp,
      message: '✅ fbp válido',
      recommendations: [],
      score: 100
    };
  }

  /**
   * Valida o parâmetro external_id
   */
  private validateExternalId(external_id: string | null): ValidationResult {
    if (!external_id) {
      return {
        parameter: 'external_id',
        status: 'warning',
        value: null,
        message: '⚠️ external_id não encontrado - impacto MÉDIO na correspondência',
        recommendations: [
          'Forneça dados do usuário (email, telefone, nome)',
          'Execute generateExternalId() com dados do formulário',
          'External ID aumenta em ~3% as conversões correspondidas'
        ],
        score: 40
      };
    }

    // Verificar formato do external_id
    if (external_id.length < 16) {
      return {
        parameter: 'external_id',
        status: 'warning',
        value: external_id,
        message: '⚠️ external_id muito curto',
        recommendations: [
          'External_id deve ter pelo menos 16 caracteres',
          'Use hash SHA-256 para melhor qualidade'
        ],
        score: 60
      };
    }

    return {
      parameter: 'external_id',
      status: 'success',
      value: external_id,
      message: '✅ external_id válido',
      recommendations: [],
      score: 100
    };
  }

  /**
   * Valida dados de IP e User Agent
   */
  private validateIpAndUserAgent(ip: string | null, userAgent: string | null): ValidationResult {
    const issues: string[] = [];
    let score = 100;

    if (!ip) {
      issues.push('IP não capturado');
      score -= 30;
    }

    if (!userAgent) {
      issues.push('User Agent não capturado');
      score -= 20;
    }

    if (issues.length === 0) {
      return {
        parameter: 'ip_user_agent',
        status: 'success',
        value: `${ip} | ${userAgent?.substring(0, 50)}...`,
        message: '✅ IP e User Agent capturados',
        recommendations: [],
        score: 100
      };
    }

    return {
      parameter: 'ip_user_agent',
      status: issues.length > 1 ? 'error' : 'warning',
      value: issues.join(', '),
      message: `⚠️ Problemas: ${issues.join(', ')}`,
      recommendations: [
        'Execute getUserIP() para capturar o IP',
        'Verifique se window.navigator.userAgent está disponível',
        'IP e User Agent aumentam em ~17% as conversões correspondidas'
      ],
      score
    };
  }

  /**
   * Valida dados pessoais (email, telefone, nome)
   */
  private validatePersonalData(em: string, ph: string, fn: string, ln: string): ValidationResult {
    const hasEmail = !!em;
    const hasPhone = !!ph;
    const hasName = !!(fn && ln);
    
    let score = 0;
    let status: 'success' | 'warning' | 'error' = 'error';
    let message = '';
    const recommendations: string[] = [];

    if (hasEmail) score += 40;
    if (hasPhone) score += 30;
    if (hasName) score += 30;

    if (score >= 70) {
      status = 'success';
      message = '✅ Dados pessoais completos';
    } else if (score >= 40) {
      status = 'warning';
      message = '⚠️ Dados pessoais incompletos';
      recommendations.push('Adicione mais dados do usuário para melhor correspondência');
    } else {
      status = 'error';
      message = '❌ Dados pessoais insuficientes';
      recommendations.push('Capture pelo menos email do usuário');
    }

    return {
      parameter: 'personal_data',
      status,
      value: `Email: ${hasEmail ? '✅' : '❌'} | Telefone: ${hasPhone ? '✅' : '❌'} | Nome: ${hasName ? '✅' : '❌'}`,
      message,
      recommendations,
      score
    };
  }

  /**
   * Executa diagnóstico completo dos parâmetros de tracking
   */
  public async runFullDiagnostic(): Promise<TrackingDiagnostic> {
    console.group('🔍 DIAGNÓSTICO COMPLETO DE TRACKING');
    
    try {
      // Obter todos os parâmetros
      const params = await getAllTrackingParams();
      const { fbc, fbp, external_id } = params;
      
      // Obter IP e User Agent
      const { getUserIP } = await import('./cookies');
      const ip = await getUserIP();
      const userAgent = typeof window !== 'undefined' ? window.navigator.userAgent : null;
      
      // Obter dados pessoais
      const { getHighQualityPersonalData } = await import('./cookies');
      const personalData = await getHighQualityPersonalData();
      
      // Validar cada parâmetro
      const validations: ValidationResult[] = [
        this.validateFbc(fbc),
        this.validateFbp(fbp),
        this.validateExternalId(external_id),
        this.validateIpAndUserAgent(ip, userAgent),
        this.validatePersonalData(personalData.em, personalData.ph, personalData.fn, personalData.ln)
      ];

      // Calcular pontuação geral
      const totalScore = validations.reduce((sum, v) => sum + v.score, 0);
      const overallScore = Math.round(totalScore / validations.length);
      
      // Contar status
      const summary = {
        success: validations.filter(v => v.status === 'success').length,
        warning: validations.filter(v => v.status === 'warning').length,
        error: validations.filter(v => v.status === 'error').length
      };

      // Compilar recomendações gerais
      const allRecommendations = validations.flatMap(v => v.recommendations);
      const uniqueRecommendations = [...new Set(allRecommendations)];

      const diagnostic: TrackingDiagnostic = {
        overallScore,
        parameters: validations,
        summary,
        recommendations: uniqueRecommendations,
        timestamp: new Date().toISOString()
      };

      // Exibir resultados no console
      console.log('📊 PONTUAÇÃO GERAL:', overallScore + '/100');
      console.log('📈 RESUMO:', summary);
      console.log('💡 RECOMENDAÇÕES:', uniqueRecommendations);
      
      validations.forEach(validation => {
        console.log(`\n${validation.parameter}: ${validation.message} (${validation.score}/100)`);
        if (validation.recommendations.length > 0) {
          validation.recommendations.forEach(rec => console.log(`   • ${rec}`));
        }
      });

      console.groupEnd();
      
      return diagnostic;

    } catch (error) {
      console.error('❌ Erro no diagnóstico:', error);
      console.groupEnd();
      
      return {
        overallScore: 0,
        parameters: [],
        summary: { success: 0, warning: 0, error: 1 },
        recommendations: ['Execute o diagnóstico novamente'],
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Validação rápida dos parâmetros mais críticos
   */
  public async quickValidation(): Promise<{
    fbc: boolean;
    fbp: boolean;
    external_id: boolean;
    readyForConversion: boolean;
  }> {
    const { fbc, fbp, external_id } = await getAllTrackingParams();
    
    const validation = {
      fbc: !!fbc && fbc.includes('fb.1.'),
      fbp: !!fbp && fbp.includes('fb.1.'),
      external_id: !!external_id && external_id.length >= 16,
      readyForConversion: false
    };
    
    validation.readyForConversion = validation.fbc && validation.fbp;
    
    console.log('⚡ VALIDAÇÃO RÁPIDA:', validation);
    
    return validation;
  }

  /**
   * Gera relatório detalhado para debugging
   */
  public generateDetailedReport(): string {
    const report = `
=== RELATÓRIO DETALHADO DE TRACKING ===
Data/Hora: ${new Date().toLocaleString('pt-BR')}
URL Atual: ${typeof window !== 'undefined' ? window.location.href : 'N/A'}
User Agent: ${typeof window !== 'undefined' ? window.navigator.userAgent : 'N/A'}

=== COOKIES DO FACEBOOK ===
${document.cookie}

=== PARÂMETROS DA URL ===
${typeof window !== 'undefined' ? window.location.search : 'N/A'}

=== LOCAL STORAGE ===
${typeof window !== 'undefined' ? JSON.stringify(localStorage, null, 2) : 'N/A'}

=== SESSION STORAGE ===
${typeof window !== 'undefined' ? JSON.stringify(sessionStorage, null, 2) : 'N/A'}
    `;
    
    console.log(report);
    return report;
  }
}

// Exportar instância única
export const trackingValidator = TrackingValidator.getInstance();

// Funções de conveniência para exportação
export const runFullDiagnostic = () => trackingValidator.runFullDiagnostic();
export const quickValidation = () => trackingValidator.quickValidation();
export const generateDetailedReport = () => trackingValidator.generateDetailedReport();