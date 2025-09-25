# Solução Completa para Problemas de Desduplicação do Facebook Pixel

## Problemas Identificados

### 1. Token do Facebook Inválido/Expirado
- **Sintoma**: Erro "Invalid OAuth access token - Cannot parse access token" (código 190)
- **Impacto**: Falha no envio de eventos server-side, perda de dados de conversão
- **Causa**: Token de acesso do Facebook expirado ou configurado incorretamente

### 2. Desduplicação Indevida de Eventos de Conversão
- **Sintoma**: Eventos importantes marcados como "Desduplicado" no Facebook
- **Impacto**: Perda de dados críticos para EQM e otimização de campanhas
- **Causa**: Lógica de desduplicação aplicada incorretamente a eventos de conversão

## Soluções Implementadas

### 1. Sistema de Verificação de Token do Facebook

#### Arquivo: `src/lib/facebookTokenStatus.ts`
- **Função**: `checkFacebookTokenStatus()` - Verifica validade do token
- **Função**: `diagnoseFacebookPixelIssues()` - Diagnóstico completo com recomendações
- **Recursos**:
  - Verificação em tempo real do status do token
  - Identificação específica de erros (OAuth, configuração, conexão)
  - Recomendações automáticas para correção

#### Arquivo: `src/lib/eventManager.ts`
- **Verificação periódica**: Checa token a cada 10 minutos
- **Verificação sob demanda**: `forceTokenCheck()` para verificação imediata
- **Desabilitação automática**: Desabilita server-side quando token está inválido
- **Reabilitação controlada**: `forceEnableServerSide()` para reabilitar após correção

### 2. Lógica Aprimorada de Desduplicação

#### Para Eventos de Conversão:
- **Lista de eventos**: `['view_content', 'initiate_checkout', 'purchase', 'add_to_cart']`
- **Regra**: NUNCA desduplicar eventos de conversão
- **Implementação**:
  ```typescript
  if (conversionEvents.includes(eventName)) {
    console.log(`🎯 EVENTO DE CONVERSÃO ${eventName} - IGNORANDO COMPLETAMENTE A VERIFICAÇÃO DE DUPLICAÇÃO`);
    return false;
  }
  ```

#### Geração de Event IDs Únicos:
- **Eventos normais**: `{eventName}_{timestamp}_{random}_{nonce}_{channel}`
- **Eventos de conversão**: `{eventName}_{timestamp}_{random}_{nonce}_{uniqueId}_{channel}`
- **Propósito**: Garantir unicidade absoluta para evitar desduplicação no Facebook

### 3. Sistema de Fallback Inteligente

#### Estratégia de Envio:
1. **Token válido**: Envia para client-side E server-side
2. **Token inválido**: Envia apenas para client-side (fallback)
3. **Forçar client-side**: Ignora status do token e envia apenas client-side
4. **Forçar server-side**: Envia apenas server-side (se token válido)

#### Lógica de Decisão:
```typescript
if (!isTokenValid && !forceClient) {
  console.warn(`⚠️ Token inválido detectado, ajustando estratégia de envio para evento ${eventName}`);
  // Forçar client-side como fallback
}
```

### 4. Proteções Adicionais na API

#### Arquivo: `src/app/api/facebook-pixel/route.ts`
- **Geração de event_id único para conversão**: Cria ID diferente do original
- **Campos anti-desduplicação**: Adiciona `event_processing_time` e `deduplication_key`
- **Logging aprimorado**: Registra eventos de conversão com detalhes adicionais

## Como Usar

### 1. Verificar Status do Token
```javascript
// No console do navegador
await window.advancedTracking.checkTokenStatus();
```

### 2. Diagnosticar Problemas
```javascript
// No console do navegador
await window.advancedTracking.diagnoseTokenIssues();
```

### 3. Reabilitar Server-side (após corrigir token)
```javascript
// No console do navegador
await window.advancedTracking.forceEnableServerSide();
```

### 4. Testar Deduplicação
```javascript
// No console do navegador
window.advancedTracking.testEventManagerDeduplication();
```

## Benefícios da Solução

### 1. Recuperação de Eventos Perdidos
- ✅ Eventos de conversão nunca mais serão desduplicados
- ✅ Fallback automático para client-side quando token falha
- ✅ Recuperação de dados críticos para EQM

### 2. Monitoramento Proativo
- ✅ Verificação automática do status do token
- ✅ Diagnóstico com recomendações específicas
- ✅ Logging detalhado para depuração

### 3. Resiliência do Sistema
- ✅ Funciona mesmo com token inválido (via client-side)
- ✅ Recuperação automática quando token é corrigido
- ✅ Proteção contra perda de dados

### 4. Facilidade de Manutenção
- ✅ Funções de diagnóstico expostas no console
- ✅ Recomendações claras para correção
- ✅ Monitoramento em tempo real

## Próximos Passos

### 1. Corrigir o Token do Facebook
1. Acesse o [Facebook Developers](https://developers.facebook.com/)
2. Gere um novo token de acesso
3. Atualize a variável de ambiente `FACEBOOK_ACCESS_TOKEN`
4. Use `forceEnableServerSide()` para reabilitar o server-side

### 2. Monitorar os Eventos
- Use as funções de diagnóstico para verificar o status
- Monitore o console para logs de eventos de conversão
- Verifique no Facebook Events Manager se os eventos estão chegando

### 3. Validar a Solução
- Teste o envio de eventos de conversão
- Verifique se não há mais eventos marcados como "Desduplicado"
- Confirme que os eventos contêm dados pessoais quando disponíveis

## Impacto Esperado

### No Curto Prazo:
- ✅ Parada imediata da desduplicação de eventos de conversão
- ✅ Recuperação do envio via client-side mesmo com token inválido
- ✅ Visibilidade clara do status do token

### No Médio Prazo:
- ✅ Melhoria no EQM devido à recuperação de eventos de conversão
- ✅ Redução de perda de dados críticos
- ✅ Otimização melhor das campanhas

### No Longo Prazo:
- ✅ Sistema resiliente a problemas de token
- ✅ Monitoramento proativo de problemas
- ✅ Manutenção simplificada do sistema de rastreamento

## Conclusão

Esta solução aborda tanto o problema imediato (desduplicação indevida) quanto o problema raiz (token inválido), criando um sistema robusto e resiliente que garante a integridade dos dados de rastreamento essenciais para o sucesso das campanhas de marketing.