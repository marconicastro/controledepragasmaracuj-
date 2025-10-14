/**
 * SCRIPT DE OTIMIZAÇÃO DE TRACKING FACEBOOK
 * 
 * Este script garante que todos os parâmetros críticos para o Facebook
 * sejam capturados, processados e enviados corretamente.
 * 
 * PARÂMETROS OTIMIZADOS:
 * - fbc (Facebook Click ID) - +100% conversões correspondidas
 * - external_id (Identificação Externa) - +3% conversões correspondidas  
 * - IP e User Agent - +17% conversões correspondidas
 * - fbp (Facebook Pixel ID) - Essencial para atribuição
 * 
 * AUTOR: Sistema de Otimização de Tracking
 * VERSÃO: 2.0
 */

(function() {
    'use strict';
    
    console.log('🚀 Iniciando Script de Otimização de Tracking Facebook v2.0...');
    
    // Configurações
    const CONFIG = {
        PIXEL_ID: '714277868320104',
        DEBUG_MODE: true,
        RETRY_ATTEMPTS: 3,
        RETRY_DELAY: 1000,
        VALIDATION_INTERVAL: 30000 // 30 segundos
    };
    
    // Estado global
    let trackingState = {
        initialized: false,
        fbc: null,
        fbp: null,
        external_id: null,
        userIP: null,
        userAgent: null,
        validationTimer: null,
        retryCount: 0
    };
    
    // Funções utilitárias
    const utils = {
        log: function(message, type = 'info') {
            if (CONFIG.DEBUG_MODE) {
                const prefix = '[Tracking Optimizer]';
                switch(type) {
                    case 'error':
                        console.error(prefix, message);
                        break;
                    case 'warn':
                        console.warn(prefix, message);
                        break;
                    case 'success':
                        console.log('%c' + prefix + ' ' + message, 'color: green');
                        break;
                    default:
                        console.log(prefix, message);
                }
            }
        },
        
        getCookie: function(name) {
            const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
            return match ? match[2] : null;
        },
        
        setCookie: function(name, value, days = 90) {
            const expiration = new Date();
            expiration.setDate(expiration.getDate() + days);
            
            const cookieSettings = [
                `${name}=${value}`,
                `expires=${expiration.toUTCString()}`,
                'path=/',
                `domain=${window.location.hostname}`,
                'SameSite=Lax',
                ...(window.location.protocol === 'https:' ? ['Secure'] : [])
            ].join('; ');
            
            document.cookie = cookieSettings;
            this.log(`Cookie ${name} definido: ${value}`);
        },
        
        generateHash: async function(data) {
            const encoder = new TextEncoder();
            const dataBuffer = encoder.encode(data);
            const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 32);
        }
    };
    
    // Módulo de captura de fbclid
    const fbclidCapture = {
        capture: function() {
            utils.log('🔍 Iniciando captura avançada de fbclid...');
            
            // Verificar se já existe um fbc válido
            const existingFbc = utils.getCookie('_fbc');
            if (existingFbc && existingFbc.includes('fb.1.')) {
                const parts = existingFbc.split('.');
                if (parts.length >= 3) {
                    const timestamp = parseInt(parts[2]);
                    const daysDiff = (Date.now() - timestamp) / (1000 * 60 * 60 * 24);
                    
                    if (daysDiff <= 90) {
                        trackingState.fbc = existingFbc;
                        utils.log(`✅ fbc existente válido (${daysDiff.toFixed(0)} dias): ${existingFbc}`);
                        return existingFbc;
                    }
                }
            }
            
            // Tentar capturar fbclid de múltiplas fontes
            let fbclid = this.getFbclidFromSources();
            
            if (fbclid) {
                const fbcValue = `fb.1.${Date.now()}.${fbclid}`;
                utils.setCookie('_fbc', fbcValue);
                
                // Persistência em múltiplos lugares
                try {
                    sessionStorage.setItem('fbclid', fbclid);
                    localStorage.setItem('fbclid', fbclid);
                    localStorage.setItem('fbc_timestamp', Date.now().toString());
                } catch (error) {
                    utils.log('Erro ao salvar no storage: ' + error.message, 'warn');
                }
                
                trackingState.fbc = fbcValue;
                utils.log(`🎯 Novo fbc criado: ${fbcValue}`);
                return fbcValue;
            }
            
            utils.log('❌ Nenhum fbclid encontrado', 'warn');
            return null;
        },
        
        getFbclidFromSources: function() {
            // 1. URL atual
            const urlParams = new URLSearchParams(window.location.search);
            let fbclid = urlParams.get('fbclid');
            if (fbclid) {
                utils.log(`📊 fbclid da URL: ${fbclid}`);
                return fbclid;
            }
            
            // 2. Session storage
            fbclid = sessionStorage.getItem('fbclid');
            if (fbclid) {
                utils.log(`📊 fbclid do sessionStorage: ${fbclid}`);
                return fbclid;
            }
            
            // 3. Local storage
            fbclid = localStorage.getItem('fbclid');
            if (fbclid) {
                utils.log(`📊 fbclid do localStorage: ${fbclid}`);
                return fbclid;
            }
            
            // 4. Referrer
            if (document.referrer) {
                try {
                    const referrerUrl = new URL(document.referrer);
                    const referrerParams = new URLSearchParams(referrerUrl.search);
                    fbclid = referrerParams.get('fbclid');
                    if (fbclid) {
                        utils.log(`📊 fbclid do referrer: ${fbclid}`);
                        return fbclid;
                    }
                } catch (error) {
                    utils.log('Erro ao processar referrer: ' + error.message, 'warn');
                }
            }
            
            return null;
        }
    };
    
    // Módulo de gerenciamento de fbp
    const fbpManager = {
        ensure: function() {
            const existingFbp = utils.getCookie('_fbp');
            if (existingFbp) {
                trackingState.fbp = existingFbp;
                utils.log(`✅ fbp existente: ${existingFbp}`);
                return existingFbp;
            }
            
            // Criar novo fbp
            const timestamp = Date.now();
            const random = Math.random().toString(36).substring(2, 15);
            const fbpValue = `fb.1.${timestamp}.${random}`;
            
            utils.setCookie('_fbp', fbpValue);
            trackingState.fbp = fbpValue;
            utils.log(`🎯 Novo fbp criado: ${fbpValue}`);
            return fbpValue;
        }
    };
    
    // Módulo de captura de IP
    const ipCapture = {
        capture: async function() {
            try {
                utils.log('🌍 Capturando endereço IP...');
                
                const apis = [
                    'https://api.ipify.org?format=json',
                    'https://ipapi.co/json/',
                    'https://api.ip.sb/ip',
                    'https://httpbin.org/ip'
                ];
                
                for (const api of apis) {
                    try {
                        const response = await fetch(api, {
                            method: 'GET',
                            mode: 'cors',
                            cache: 'no-cache',
                            timeout: 5000
                        });
                        
                        if (response.ok) {
                            const data = await response.json();
                            const ip = data.ip || data.ip_address || (typeof data === 'string' ? data.trim() : null);
                            
                            if (ip && /^\d+\.\d+\.\d+\.\d+$/.test(ip)) {
                                trackingState.userIP = ip;
                                utils.log(`✅ IP capturado: ${ip}`);
                                return ip;
                            }
                        }
                    } catch (error) {
                        utils.log(`Falha na API ${api}: ${error.message}`, 'warn');
                        continue;
                    }
                }
                
                utils.log('❌ Não foi possível capturar o IP', 'warn');
                return null;
                
            } catch (error) {
                utils.log('Erro ao capturar IP: ' + error.message, 'error');
                return null;
            }
        }
    };
    
    // Módulo de geração de external_id
    const externalIdGenerator = {
        generate: async function(userData = {}) {
            try {
                let identifier = '';
                
                // Prioridade: Email > Telefone > Nome Completo
                if (userData.email) {
                    identifier = userData.email.toLowerCase().trim();
                    utils.log(`🎯 Gerando external_id a partir do email: ${identifier}`);
                } else if (userData.phone) {
                    identifier = userData.phone.replace(/\D/g, '');
                    utils.log(`🎯 Gerando external_id a partir do telefone: ${identifier}`);
                } else if (userData.firstName && userData.lastName) {
                    identifier = `${userData.firstName.trim().toLowerCase()}_${userData.lastName.trim().toLowerCase()}`;
                    utils.log(`🎯 Gerando external_id a partir do nome: ${identifier}`);
                }
                
                if (!identifier) {
                    // Fallback: usar timestamp e domínio
                    identifier = `${window.location.hostname}_${Date.now()}`;
                    utils.log(`🎯 Gerando external_id fallback: ${identifier}`);
                }
                
                const externalId = await utils.generateHash(identifier);
                trackingState.external_id = externalId;
                
                // Persistir no localStorage
                localStorage.setItem('external_id', externalId);
                
                utils.log(`✅ external_id gerado: ${externalId}`);
                return externalId;
                
            } catch (error) {
                utils.log('Erro ao gerar external_id: ' + error.message, 'error');
                return null;
            }
        }
    };
    
    // Módulo de validação
    const validator = {
        validate: function() {
            const issues = [];
            let score = 0;
            
            // Validar fbc
            if (trackingState.fbc && trackingState.fbc.includes('fb.1.')) {
                score += 30;
                utils.log('✅ fbc válido', 'success');
            } else {
                issues.push('fbc ausente ou inválido');
                utils.log('❌ fbc ausente ou inválido', 'error');
            }
            
            // Validar fbp
            if (trackingState.fbp && trackingState.fbp.includes('fb.1.')) {
                score += 20;
                utils.log('✅ fbp válido', 'success');
            } else {
                issues.push('fbp ausente ou inválido');
                utils.log('❌ fbp ausente ou inválido', 'error');
            }
            
            // Validar external_id
            if (trackingState.external_id && trackingState.external_id.length >= 16) {
                score += 20;
                utils.log('✅ external_id válido', 'success');
            } else {
                issues.push('external_id ausente ou curto');
                utils.log('⚠️ external_id ausente ou curto', 'warn');
            }
            
            // Validar IP
            if (trackingState.userIP) {
                score += 15;
                utils.log('✅ IP capturado', 'success');
            } else {
                issues.push('IP não capturado');
                utils.log('⚠️ IP não capturado', 'warn');
            }
            
            // Validar User Agent
            if (trackingState.userAgent) {
                score += 15;
                utils.log('✅ User Agent disponível', 'success');
            } else {
                issues.push('User Agent não disponível');
                utils.log('❌ User Agent não disponível', 'error');
            }
            
            const result = {
                score: score,
                maxScore: 100,
                issues: issues,
                readyForConversion: score >= 70
            };
            
            utils.log(`📊 Validação concluída: ${score}/100 - ${result.readyForConversion ? 'PRONTO PARA CONVERSÕES' : 'NECESSITA MELHORIAS'}`);
            
            return result;
        }
    };
    
    // Módulo de integração com eventos
    const eventIntegration = {
        enhanceEventData: function(eventData) {
            const enhancedData = {
                ...eventData,
                user_data: {
                    ...eventData.user_data,
                    fbc: trackingState.fbc,
                    fbp: trackingState.fbp,
                    external_id: trackingState.external_id,
                    ip: trackingState.userIP,
                    user_agent: trackingState.userAgent
                }
            };
            
            utils.log('📦 Dados do evento enriquecidos com parâmetros otimizados');
            return enhancedData;
        },
        
        sendEnhancedEvent: function(eventName, eventData) {
            const enhancedData = this.enhanceEventData(eventData);
            
            // Enviar via dataLayer (GTM)
            if (typeof window.dataLayer !== 'undefined') {
                window.dataLayer.push({
                    event: eventName,
                    event_id: `${eventName}_${Date.now()}_optimized`,
                    ...enhancedData
                });
                utils.log(`📤 Evento otimizado enviado via GTM: ${eventName}`);
            }
            
            // Enviar via Facebook Pixel (fallback)
            if (typeof window.fbq !== 'undefined') {
                const fbEventName = eventName === 'view_content' ? 'ViewContent' : 
                                   eventName === 'initiate_checkout' ? 'InitiateCheckout' : eventName;
                
                window.fbq('track', fbEventName, enhancedData.custom_data || {});
                utils.log(`📤 Evento otimizado enviado via Facebook Pixel: ${fbEventName}`);
            }
            
            return enhancedData;
        }
    };
    
    // Função principal de inicialização
    async function initialize() {
        if (trackingState.initialized) {
            utils.log('⚠️ Tracking Optimizer já inicializado');
            return;
        }
        
        utils.log('🚀 Inicializando Tracking Optimizer...');
        
        try {
            // 1. Capturar User Agent
            trackingState.userAgent = navigator.userAgent;
            
            // 2. Garantir fbp
            fbpManager.ensure();
            
            // 3. Capturar fbclid
            fbclidCapture.capture();
            
            // 4. Capturar IP (assíncrono)
            ipCapture.capture();
            
            // 5. Tentar gerar external_id com dados existentes
            const existingEmail = localStorage.getItem('user_email');
            const existingPhone = localStorage.getItem('user_phone');
            if (existingEmail || existingPhone) {
                await externalIdGenerator.generate({
                    email: existingEmail,
                    phone: existingPhone
                });
            }
            
            // 6. Validar configuração
            setTimeout(() => {
                const validation = validator.validate();
                if (!validation.readyForConversion) {
                    utils.log('⚠️ Configuração não está ótima. Execute runDiagnostic() para detalhes.', 'warn');
                }
            }, 2000);
            
            // 7. Configurar validação periódica
            trackingState.validationTimer = setInterval(() => {
                validator.validate();
            }, CONFIG.VALIDATION_INTERVAL);
            
            trackingState.initialized = true;
            utils.log('✅ Tracking Optimizer inicializado com sucesso!', 'success');
            
        } catch (error) {
            utils.log('Erro na inicialização: ' + error.message, 'error');
        }
    }
    
    // API pública
    window.TrackingOptimizer = {
        // Inicialização
        init: initialize,
        
        // Captura de dados
        captureFbclid: () => fbclidCapture.capture(),
        ensureFbp: () => fbpManager.ensure(),
        captureIP: () => ipCapture.capture(),
        generateExternalId: (userData) => externalIdGenerator.generate(userData),
        
        // Validação
        validate: () => validator.validate(),
        
        // Eventos
        sendEvent: (eventName, eventData) => eventIntegration.sendEnhancedEvent(eventName, eventData),
        
        // Diagnóstico
        runDiagnostic: function() {
            console.group('🔍 DIAGNÓSTICO COMPLETO - TRACKING OPTIMIZER');
            console.log('Estado atual:', trackingState);
            console.log('Validação:', validator.validate());
            console.log('Cookies:', document.cookie);
            console.log('LocalStorage:', JSON.stringify(localStorage));
            console.log('SessionStorage:', JSON.stringify(sessionStorage));
            console.groupEnd();
        },
        
        // Status
        getStatus: () => trackingState,
        
        // Utilitários
        utils: utils
    };
    
    // Inicializar automaticamente
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        // Inicializar imediatamente se o DOM já estiver carregado
        setTimeout(initialize, 100);
    }
    
    // Expor mensagem de inicialização
    utils.log('🎯 Tracking Optimizer carregado. Aguardando inicialização...');
    
})();