# Configuração GTM Web para Server-side Forwarding

## Visão Geral

Este documento explica como configurar seu GTM Web (client-side) para enviar eventos para o GTM Server-side, garantindo que os dados de usuário sejam processados e enviados corretamente para o Facebook Conversions API.

## Arquitetura Desejada

```
Frontend (Seu Site)
    ↓ (DataLayer)
GTM Web (Client-side) ← GTM-567XZCDX
    ↓ (HTTP Request)
GTM Server-side
    ↓ (Conversions API)
Facebook
```

## Passo 1: Configurar Variáveis no GTM Web

### 1.1 Variáveis de Dados do Usuário

**Variável: `dl_user_data`**
- **Variable Type:** Data Layer Variable
- **Data Layer Variable Name:** `user_data`
- **Data Layer Version:** 2

**Variável: `dl_user_data_raw`**
- **Variable Type:** Data Layer Variable
- **Data Layer Variable Name:** `user_data_raw`
- **Data Layer Version:** 2

### 1.2 Variáveis de Página

**Variável: `Event ID`**
- **Variable Type:** Custom JavaScript
```javascript
function() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}
```

**Variável: `Page URL`**
- **Variable Type:** Page URL
- **URL Type:** Full URL

**Variável: `Page Title`**
- **Variable Type:** Document Title

## Passo 2: Configurar Triggers no GTM Web

### 2.1 Trigger para Page View Server

**Trigger: `Server Event - Page View`**
- **Trigger Type:** Custom Event
- **Event Name:** `page_view_server`
- **This trigger fires on:** All Custom Events

### 2.2 Trigger para Initiate Checkout Server

**Trigger: `Server Event - Initiate Checkout`**
- **Trigger Type:** Custom Event
- **Event Name:** `initiate_checkout`
- **This trigger fires on:** All Custom Events

### 2.3 Trigger para View Content Server

**Trigger: `Server Event - View Content`**
- **Trigger Type:** Custom Event
- **Event Name:** `view_content`
- **This trigger fires on:** All Custom Events

## Passo 3: Configurar Tags de Forwarding

### 3.1 Tag para Page View

**Tag: `Forward to Server - Page View`**
- **Tag Type:** HTTP Request
- **Request Type:** POST
- **URL:** `https://seu-gtm-server.com/collect` (substitua pela URL do seu server)
- **Headers:**
  - **Header Name:** `Content-Type`
  - **Header Value:** `application/json`
- **Payload:**
```json
{
  "event": "page_view",
  "event_id": "{{Event ID}}",
  "user_data": {{dl_user_data}},
  "user_data_raw": {{dl_user_data_raw}},
  "page_location": "{{Page URL}}",
  "page_title": "{{Page Title}}",
  "timestamp": {{Timestamp}}
}
```
- **Trigger:** `Server Event - Page View`
- **Tag Sequencing:** None
- **Firing Options:** Once per event

### 3.2 Tag para Initiate Checkout

**Tag: `Forward to Server - Initiate Checkout`**
- **Tag Type:** HTTP Request
- **Request Type:** POST
- **URL:** `https://seu-gtm-server.com/collect` (substitua pela URL do seu server)
- **Headers:**
  - **Header Name:** `Content-Type`
  - **Header Value:** `application/json`
- **Payload:**
```json
{
  "event": "initiate_checkout",
  "event_id": "{{Event ID}}",
  "user_data": {{dl_user_data}},
  "user_data_raw": {{dl_user_data_raw}},
  "ecommerce": {
    "items": [{
      "item_id": "6080425",
      "item_name": "Sistema de Controle de Trips - Maracujá",
      "price": 39.90,
      "quantity": 1,
      "currency": "BRL"
    }]
  },
  "page_location": "{{Page URL}}",
  "page_title": "{{Page Title}}",
  "timestamp": {{Timestamp}}
}
```
- **Trigger:** `Server Event - Initiate Checkout`
- **Tag Sequencing:** None
- **Firing Options:** Once per event

### 3.3 Tag para View Content

**Tag: `Forward to Server - View Content`**
- **Tag Type:** HTTP Request
- **Request Type:** POST
- **URL:** `https://seu-gtm-server.com/collect` (substitua pela URL do seu server)
- **Headers:**
  - **Header Name:** `Content-Type`
  - **Header Value:** `application/json`
- **Payload:**
```json
{
  "event": "view_content",
  "event_id": "{{Event ID}}",
  "user_data": {{dl_user_data}},
  "user_data_raw": {{dl_user_data_raw}},
  "ecommerce": {
    "items": [{
      "item_id": "6080425",
      "item_name": "Sistema de Controle de Trips - Maracujá",
      "price": 39.90,
      "quantity": 1,
      "currency": "BRL"
    }]
  },
  "page_location": "{{Page URL}}",
  "page_title": "{{Page Title}}",
  "timestamp": {{Timestamp}}
}
```
- **Trigger:** `Server Event - View Content`
- **Tag Sequencing:** None
- **Firing Options:** Once per event

## Passo 4: Configurar Client no GTM Web (Opcional)

Se você estiver usando Stape ou outra solução de GTM Server-side:

**Client: `Server Container Forwarding`**
- **Client Type:** Custom HTML
```html
<script>
(function() {
  // Configurar server forwarding
  window.dataLayer = window.dataLayer || [];
  
  // Função para enviar eventos para o server
  window.sendToServer = function(eventName, data) {
    fetch('https://seu-gtm-server.com/collect', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event: eventName,
        ...data,
        timestamp: Date.now()
      })
    }).catch(function(error) {
      console.log('Erro ao enviar para server-side:', error);
    });
  };
  
  // Interceptar eventos do DataLayer
  const originalPush = window.dataLayer.push;
  window.dataLayer.push = function(data) {
    originalPush.apply(this, arguments);
    
    // Enviar eventos específicos para o server
    if (data.event && ['page_view_server', 'initiate_checkout', 'view_content'].includes(data.event)) {
      window.sendToServer(data.event, data);
    }
  };
})();
</script>
```
- **Trigger:** All Pages

## Passo 5: Testar a Configuração

### 5.1 Usar Preview Mode

1. **No GTM Web:**
   - Clique em **Preview**
   - Digite a URL do seu site
   - Clique em **Connect**

2. **No GTM Server-side:**
   - Clique em **Preview**
   - Digite a URL do seu site
   - Clique em **Connect**

3. **Teste no Site:**
   - Acesse seu site
   - Preencha o formulário e clique em checkout
   - Verifique se os eventos aparecem em ambos os GTMs

### 5.2 Verificar no Console

Abra o console do navegador e procure por:
- `📍 PageView enviado` - Confirma envio do PageView
- `🛒 DataLayer Push: initiate_checkout` - Confirma envio do Initiate Checkout
- Erros de rede (se houver)

### 5.3 Verificar Rede

Na aba Network do DevTools:
- Procure por requisições para `https://seu-gtm-server.com/collect`
- Verifique o payload das requisições
- Confirme o status 200 (OK)

## Passo 6: Publicar as Alterações

1. **No GTM Web:**
   - Clique em **Submit**
   - Dê um nome para a versão (ex: "Server-side forwarding setup")
   - Clique em **Publish**

2. **No GTM Server-side:**
   - Clique em **Submit**
   - Dê um nome para a versão (ex: "Facebook Conversions API setup")
   - Clique em **Publish**

## Troubleshooting

### Problema: Eventos não chegam no server-side

**Soluções:**
1. Verifique a URL do server-side nas tags
2. Confirme se os triggers estão configurados corretamente
3. Verifique se há erros no console do navegador
4. Teste a URL do server-side diretamente

### Problema: Dados de usuário não aparecem

**Soluções:**
1. Verifique se as variáveis `dl_user_data` e `dl_user_data_raw` estão configuradas
2. Confirme se os dados estão sendo enviados no DataLayer
3. Verifique o console do navegador por logs de erro

### Problema: Erros de CORS

**Soluções:**
1. Configure os headers CORS no server-side
2. Verifique se a URL do server-side está correta
3. Confirme se o server-side está aceitando requisições POST

## Resumo da Configuração

Após concluir estes passos, seu fluxo de dados será:

1. **Frontend** envia eventos para o DataLayer
2. **GTM Web** captura os eventos e envia para:
   - Google Analytics (client-side)
   - Facebook Pixel (client-side)
   - GTM Server-side (via HTTP Request)
3. **GTM Server-side** processa os dados e envia para:
   - Facebook Conversions API (com dados hasheados)
   - Outras plataformas (se configurado)

## Resultado Esperado

Com esta configuração, o Facebook receberá todos os dados necessários:

```json
{
  "data": [{
    "event_name": "InitiateCheckout",
    "user_data": {
      "em": "[hash_do_email]",
      "ph": "[hash_do_telefone]",
      "fn": "[hash_do_primeiro_nome]",
      "ln": "[hash_do_sobrenome]",
      "ct": "[hash_da_cidade]",
      "st": "[hash_do_estado]",
      "zp": "[hash_do_cep]",
      "country": "[hash_do_pais]",
      "fbc": "fb.1.[timestamp].[fbclid]",
      "fbp": "fb.1.[timestamp].[browser_id]",
      "external_id": "[external_id]"
    },
    "custom_data": {
      "content_name": "Sistema de Controle de Trips - Maracujá",
      "content_ids": ["6080425"],
      "content_type": "product",
      "value": 39.90,
      "currency": "BRL",
      "num_items": 1
    }
  }]
}
```

Isso deve melhorar significativamente a pontuação de qualidade dos seus eventos no Facebook Event Manager.