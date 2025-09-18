# Configuração Manual GTM Web para Server-side Forwarding
## (Simplificado e Atualizado)

## 🎯 Objetivo
Configurar o GTM Web (client-side) para enviar eventos para o GTM Server-side, garantindo que os dados de usuário sejam transmitidos corretamente para o Facebook Conversions API.

## 📋 Pré-requisitos
1. Contêiner GTM Web já instalado no site
2. URL do seu GTM Server-side (ex: https://gtm.seusite.com)
3. Frontend já está enviando dados para o DataLayer

---

## 🔧 Passo 1: Configurar Variáveis no GTM Web

### 1.1 Variáveis de Dados do Usuário

**Variável: `dl_user_data`**
- Tipo: **Data Layer Variable**
- Data Layer Variable Name: `user_data`
- Data Layer Version: 2

**Variável: `dl_user_data_raw`**
- Tipo: **Data Layer Variable**
- Data Layer Variable Name: `user_data_raw`
- Data Layer Version: 2

### 1.2 Variáveis de Sistema

**Variável: `Event ID`**
- Tipo: **Custom JavaScript**
```javascript
function() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}
```

**Variável: `Page URL`**
- Tipo: **Page URL**
- URL Type: Full URL

**Variável: `Page Title`**
- Tipo: **Document Title**

**Variável: `Timestamp`**
- Tipo: **Custom JavaScript**
```javascript
function() {
  return Date.now();
}
```

---

## 🔧 Passo 2: Configurar Triggers no GTM Web

### 2.1 Trigger para Page View

**Trigger: `Server Event - Page View`**
- Tipo: **Custom Event**
- Event Name: `page_view_server`
- This trigger fires on: **All Custom Events**

### 2.2 Trigger para Initiate Checkout

**Trigger: `Server Event - Initiate Checkout`**
- Tipo: **Custom Event**
- Event Name: `initiate_checkout`
- This trigger fires on: **All Custom Events**

### 2.3 Trigger para View Content

**Trigger: `Server Event - View Content`**
- Tipo: **Custom Event**
- Event Name: `view_content`
- This trigger fires on: **All Custom Events**

---

## 🔧 Passo 3: Configurar Tags de Forwarding

### 3.1 Tag para Page View

**Tag: `Forward to Server - Page View`**
- Tipo: **HTTP Request**
- Request Type: **POST**
- URL: `https://seu-gtm-server.com/collect` (substitua pela sua URL)
- Headers:
  - Header Name: `Content-Type`
  - Header Value: `application/json`
- Payload:
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
- Trigger: `Server Event - Page View`
- Firing Options: **Once per event**

### 3.2 Tag para Initiate Checkout

**Tag: `Forward to Server - Initiate Checkout`**
- Tipo: **HTTP Request**
- Request Type: **POST**
- URL: `https://seu-gtm-server.com/collect` (substitua pela sua URL)
- Headers:
  - Header Name: `Content-Type`
  - Header Value: `application/json`
- Payload:
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
- Trigger: `Server Event - Initiate Checkout`
- Firing Options: **Once per event**

### 3.3 Tag para View Content

**Tag: `Forward to Server - View Content`**
- Tipo: **HTTP Request**
- Request Type: **POST**
- URL: `https://seu-gtm-server.com/collect` (substitua pela sua URL)
- Headers:
  - Header Name: `Content-Type`
  - Header Value: `application/json`
- Payload:
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
- Trigger: `Server Event - View Content`
- Firing Options: **Once per event**

---

## 🔧 Passo 4: Configurar Cliente para Server Forwarding (Opcional)

Se você preferir uma abordagem mais robusta:

**Cliente: `Server Container Forwarding`**
- Tipo: **Custom HTML**
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
- Trigger: **All Pages**

---

## 🧪 Passo 5: Testar a Configuração

### 5.1 Usar Preview Mode do GTM Web
1. No GTM Web, clique em **Preview**
2. Digite a URL do seu site
3. Clique em **Connect**
4. No seu site, navegue e preencha o formulário
5. Verifique se os eventos aparecem no preview

### 5.2 Verificar no Console do Navegador
Abra o console e procure por:
- `📍 PageView enviado` - Confirma envio do PageView
- `🛒 DataLayer Push: initiate_checkout` - Confirma envio do Initiate Checkout
- Requisições para seu server GTM

### 5.3 Verificar Requisições de Rede
Na aba Network do DevTools:
- Procure por requisições para `https://seu-gtm-server.com/collect`
- Verifique o payload das requisições
- Confirme o status 200 (OK)

### 5.4 Testar Dados do DataLayer
No console, execute:
```javascript
// Verificar DataLayer
console.log('DataLayer completo:', dataLayer);

// Verificar dados de usuário
console.log('User Data:', dataLayer.find(item => item.user_data)?.user_data);
console.log('User Data Raw:', dataLayer.find(item => item.user_data_raw)?.user_data_raw);
```

---

## 🚀 Passo 6: Publicar as Alterações

1. No GTM Web, clique em **Submit**
2. Nome da versão: "Server-side Forwarding Setup"
3. Descrição: "Configuração para envio de eventos ao GTM Server-side"
4. Clique em **Publish**

---

## 🔍 Troubleshooting

### Problema: Eventos não aparecem no preview
**Solução:**
1. Verifique se os triggers estão configurados corretamente
2. Confirme se os nomes dos eventos estão exatamente como especificados
3. Verifique o console do navegador por erros

### Problema: Requisições falham (status 404/500)
**Solução:**
1. Verifique a URL do server-side nas tags
2. Confirme se o server-side está online
3. Teste a URL diretamente no navegador

### Problema: Dados de usuário não aparecem
**Solução:**
1. Verifique se as variáveis `dl_user_data` e `dl_user_data_raw` estão configuradas
2. Confirme se o frontend está enviando os dados corretamente
3. Use o console para verificar o DataLayer

### Problema: Erros de CORS
**Solução:**
1. Verifique se o server-side está configurado para aceitar requisições do seu domínio
2. Confirme os headers CORS no server-side
3. Teste com a extensão CORS desabilitada

---

## 📝 Checklist Final

### Variáveis
- [ ] `dl_user_data` - Data Layer Variable
- [ ] `dl_user_data_raw` - Data Layer Variable
- [ ] `Event ID` - Custom JavaScript
- [ ] `Page URL` - Page URL
- [ ] `Page Title` - Document Title
- [ ] `Timestamp` - Custom JavaScript

### Triggers
- [ ] `Server Event - Page View` - Custom Event
- [ ] `Server Event - Initiate Checkout` - Custom Event
- [ ] `Server Event - View Content` - Custom Event

### Tags
- [ ] `Forward to Server - Page View` - HTTP Request
- [ ] `Forward to Server - Initiate Checkout` - HTTP Request
- [ ] `Forward to Server - View Content` - HTTP Request

### Testes
- [ ] Preview Mode do GTM Web funcionando
- [ ] Eventos aparecendo no preview
- [ ] Requisições sendo enviadas para o server
- [ ] Dados corretos no payload
- [ ] Status 200 nas respostas

### Publicação
- [ ] Versão criada e publicada
- [ ] Configuração ativa no site

---

## 🔄 Fluxo Completo de Dados

Após a configuração completa, o fluxo será:

```
Frontend (Seu Site)
    ↓ (DataLayer com user_data e user_data_raw)
GTM Web (Client-side)
    ↓ (HTTP Request com dados completos)
GTM Server-side
    ↓ (Processamento e hash dos dados)
Facebook Conversions API
    ↓ (Dados completos para matching avançado)
Facebook Event Manager (Qualidade: 8.5-9.5/10)
```

### Exemplo de Dados Enviados para o Server:

```json
{
  "event": "initiate_checkout",
  "event_id": "lx1a2b3c4d5",
  "user_data": {
    "fbc": "fb.1.1234567890.abc123def456",
    "fbp": "fb.1.1234567890.1234567890",
    "external_id": "user123"
  },
  "user_data_raw": {
    "email": "usuario@exemplo.com",
    "phone": "+5511999999999",
    "firstName": "João",
    "lastName": "Silva",
    "city": "São Paulo",
    "state": "SP",
    "zip": "01310-100",
    "country": "BR"
  },
  "ecommerce": {
    "items": [{
      "item_id": "6080425",
      "item_name": "Sistema de Controle de Trips - Maracujá",
      "price": 39.90,
      "quantity": 1,
      "currency": "BRL"
    }]
  },
  "page_location": "https://seusite.com/checkout",
  "page_title": "Checkout - Sistema de Controle de Trips",
  "timestamp": 1234567890000
}
```

Com esta configuração manual, você terá controle total sobre o envio de dados e não precisará depender de importação de contêineres!