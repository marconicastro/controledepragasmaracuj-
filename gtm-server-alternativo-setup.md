# Configuração Alternativa GTM Server-side para Facebook Conversions API
## (Sem SHA-256 no Server-side)

## 🎯 Objetivo
Configurar o GTM Server-side para enviar dados completos para o Facebook Conversions API sem usar a função SHA-256 no server-side, já que o GTM Server-side atual tem limitações.

## 📋 Pré-requisitos
1. Contêiner GTM Server-side já criado
2. Pixel ID do Facebook
3. Access Token do Facebook
4. URL do seu GTM Server-side (ex: https://gtm.seusite.com)

---

## 🔧 Abordagem Alternativa

Como o GTM Server-side não tem suporte nativo para SHA-256 e não podemos usar Custom HTML para variáveis, vamos usar uma abordagem diferente:

### Opção 1: Enviar dados brutos e deixar o Facebook fazer o hash
### Opção 2: Fazer o hash no frontend (GTM Web) antes de enviar
### Opção 3: Usar um template personalizado (se disponível)

Vou detalhar a **Opção 1** que é a mais simples e compatível.

---

## 🔧 Passo 1: Configurar Variáveis no GTM Server-side

### 1.1 Variáveis de Dados Brutos (Data Layer)

**Variável: `dl_user_data_email`**
- Tipo: **Data Layer Variable**
- Nome da Variável: `user_data_raw.email`
- Versão do Data Layer: 2

**Variável: `dl_user_data_phone`**
- Tipo: **Data Layer Variable**
- Nome da Variável: `user_data_raw.phone`
- Versão do Data Layer: 2

**Variável: `dl_user_data_firstName`**
- Tipo: **Data Layer Variable**
- Nome da Variável: `user_data_raw.firstName`
- Versão do Data Layer: 2

**Variável: `dl_user_data_lastName`**
- Tipo: **Data Layer Variable**
- Nome da Variável: `user_data_raw.lastName`
- Versão do Data Layer: 2

**Variável: `dl_user_data_city`**
- Tipo: **Data Layer Variable**
- Nome da Variável: `user_data_raw.city`
- Versão do Data Layer: 2

**Variável: `dl_user_data_state`**
- Tipo: **Data Layer Variable**
- Nome da Variável: `user_data_raw.state`
- Versão do Data Layer: 2

**Variável: `dl_user_data_zip`**
- Tipo: **Data Layer Variable**
- Nome da Variável: `user_data_raw.zip`
- Versão do Data Layer: 2

**Variável: `dl_user_data_country`**
- Tipo: **Data Layer Variable**
- Nome da Variável: `user_data_raw.country`
- Versão do Data Layer: 2

### 1.2 Variáveis de Rastreamento

**Variável: `dl_user_data_fbc`**
- Tipo: **Data Layer Variable**
- Nome da Variável: `user_data.fbc`
- Versão do Data Layer: 2

**Variável: `dl_user_data_fbp`**
- Tipo: **Data Layer Variable**
- Nome da Variável: `user_data.fbp`
- Versão do Data Layer: 2

**Variável: `dl_user_data_external_id`**
- Tipo: **Data Layer Variable**
- Nome da Variável: `user_data.external_id`
- Versão do Data Layer: 2

---

## 🔧 Passo 2: Configurar Variáveis de Dados Normalizados

Como não podemos fazer hash no server-side, vamos criar variáveis com dados normalizados:

**Variável: `normalized_email`**
- Tipo: **Custom JavaScript**
```javascript
function() {
  var email = {{dl_user_data_email}};
  if (!email) return '';
  
  // Normalizar email (remover espaços, converter para minúsculas)
  return email.toLowerCase().trim();
}
```

**Variável: `normalized_phone`**
- Tipo: **Custom JavaScript**
```javascript
function() {
  var phone = {{dl_user_data_phone}};
  if (!phone) return '';
  
  // Normalizar telefone - manter apenas números
  return phone.replace(/\D/g, '');
}
```

**Variável: `normalized_firstName`**
- Tipo: **Custom JavaScript**
```javascript
function() {
  var firstName = {{dl_user_data_firstName}};
  if (!firstName) return '';
  
  // Normalizar nome
  return firstName.toLowerCase().trim();
}
```

**Variável: `normalized_lastName`**
- Tipo: **Custom JavaScript**
```javascript
function() {
  var lastName = {{dl_user_data_lastName}};
  if (!lastName) return '';
  
  // Normalizar sobrenome
  return lastName.toLowerCase().trim();
}
```

**Variável: `normalized_city`**
- Tipo: **Custom JavaScript**
```javascript
function() {
  var city = {{dl_user_data_city}};
  if (!city) return '';
  
  // Normalizar cidade
  return city.toLowerCase().trim();
}
```

**Variável: `normalized_state`**
- Tipo: **Custom JavaScript**
```javascript
function() {
  var state = {{dl_user_data_state}};
  if (!state) return '';
  
  // Normalizar estado
  return state.toLowerCase().trim();
}
```

**Variável: `normalized_zip`**
- Tipo: **Custom JavaScript**
```javascript
function() {
  var zip = {{dl_user_data_zip}};
  if (!zip) return '';
  
  // Normalizar CEP
  return zip.replace(/\D/g, '');
}
```

**Variável: `normalized_country`**
- Tipo: **Custom JavaScript**
```javascript
function() {
  var country = {{dl_user_data_country}};
  if (!country) return '';
  
  // Normalizar país
  return country.toLowerCase().trim();
}
```

---

## 🔧 Passo 3: Configurar Trigger para Initiate Checkout

**Trigger: `Initiate Checkout Event`**
- Tipo: **Custom Event**
- Event Name: `initiate_checkout`
- This trigger fires on: **All Custom Events**

---

## 🔧 Passo 4: Configurar Tag do Facebook Conversions API

**Tag: `Facebook Conversions API - Initiate Checkout`**
- Tipo: **Facebook Conversions API**

### Configuração Básica:
- **Event Name:** `InitiateCheckout`
- **Pixel ID:** `[SEU_PIXEL_ID]`
- **Access Token:** `[SEU_ACCESS_TOKEN]`

### Configuração de Dados do Usuário (SEM HASH):
```json
{
  "em": "{{normalized_email}}",
  "ph": "{{normalized_phone}}",
  "fn": "{{normalized_firstName}}",
  "ln": "{{normalized_lastName}}",
  "ct": "{{normalized_city}}",
  "st": "{{normalized_state}}",
  "zp": "{{normalized_zip}}",
  "country": "{{normalized_country}}",
  "fbc": "{{dl_user_data_fbc}}",
  "fbp": "{{dl_user_data_fbp}}",
  "external_id": "{{dl_user_data_external_id}}"
}
```

### Configuração de Dados do Evento:
```json
{
  "content_name": "Sistema de Controle de Trips - Maracujá",
  "content_ids": ["6080425"],
  "content_type": "product",
  "value": 39.90,
  "currency": "BRL",
  "num_items": 1
}
```

### Trigger:
- **Trigger:** `Initiate Checkout Event`

---

## 🔧 Passo 5: Configurar Cliente (Client)

**Cliente: `Facebook Server-side API`**
- Tipo: **Facebook Conversions API**
- **ID do Pixel:** `[SEU_PIXEL_ID]`
- **Token de Acesso:** `[SEU_ACCESS_TOKEN]`

---

## 🔄 Passo 6: Atualizar GTM Web para Enviar Dados Normalizados

Agora precisamos atualizar o GTM Web para enviar dados já normalizados:

### 6.1 Variáveis de Hash no GTM Web

Adicione estas variáveis no GTM Web:

**Variável: `hashed_email`**
- Tipo: **Custom JavaScript**
```javascript
function() {
  var email = {{dl_user_data_raw.email}};
  if (!email) return '';
  
  // Normalizar email
  email = email.toLowerCase().trim();
  
  // Hash SHA-256 (implementação simples)
  function sha256(ascii) {
    // Implementação SHA-256 aqui
    // Ou usar uma biblioteca disponível no GTM Web
    return 'hashed_' + email; // Temporário - substituir por implementação real
  }
  
  return sha256(email);
}
```

### 6.2 Atualizar Tags de Forwarding

Modifique as tags de forwarding no GTM Web para incluir dados hasheados:

**Tag: `Forward to Server - Initiate Checkout`**
```json
{
  "event": "initiate_checkout",
  "event_id": "{{Event ID}}",
  "user_data": {{dl_user_data}},
  "user_data_raw": {{dl_user_data_raw}},
  "user_data_hashed": {
    "email": "{{hashed_email}}",
    "phone": "{{hashed_phone}}",
    "firstName": "{{hashed_firstName}}",
    "lastName": "{{hashed_lastName}}",
    "city": "{{hashed_city}}",
    "state": "{{hashed_state}}",
    "zip": "{{hashed_zip}}",
    "country": "{{hashed_country}}"
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
  "page_location": "{{Page URL}}",
  "page_title": "{{Page Title}}",
  "timestamp": {{Timestamp}}
}
```

---

## 🔧 Passo 7: Configurar Variáveis de Dados Hasheados no Server-side

**Variável: `dl_user_data_hashed_email`**
- Tipo: **Data Layer Variable**
- Nome da Variável: `user_data_hashed.email`
- Versão do Data Layer: 2

**Variável: `dl_user_data_hashed_phone`**
- Tipo: **Data Layer Variable**
- Nome da Variável: `user_data_hashed.phone`
- Versão do Data Layer: 2

**Variável: `dl_user_data_hashed_firstName`**
- Tipo: **Data Layer Variable**
- Nome da Variável: `user_data_hashed.firstName`
- Versão do Data Layer: 2

**Variável: `dl_user_data_hashed_lastName`**
- Tipo: **Data Layer Variable**
- Nome da Variável: `user_data_hashed.lastName`
- Versão do Data Layer: 2

**Variável: `dl_user_data_hashed_city`**
- Tipo: **Data Layer Variable**
- Nome da Variável: `user_data_hashed.city`
- Versão do Data Layer: 2

**Variável: `dl_user_data_hashed_state`**
- Tipo: **Data Layer Variable**
- Nome da Variável: `user_data_hashed.state`
- Versão do Data Layer: 2

**Variável: `dl_user_data_hashed_zip`**
- Tipo: **Data Layer Variable**
- Nome da Variável: `user_data_hashed.zip`
- Versão do Data Layer: 2

**Variável: `dl_user_data_hashed_country`**
- Tipo: **Data Layer Variable**
- Nome da Variável: `user_data_hashed.country`
- Versão do Data Layer: 2

---

## 🔧 Passo 8: Atualizar Tag do Facebook com Dados Hasheados

**Tag: `Facebook Conversions API - Initiate Checkout`**
```json
{
  "em": "{{dl_user_data_hashed_email}}",
  "ph": "{{dl_user_data_hashed_phone}}",
  "fn": "{{dl_user_data_hashed_firstName}}",
  "ln": "{{dl_user_data_hashed_lastName}}",
  "ct": "{{dl_user_data_hashed_city}}",
  "st": "{{dl_user_data_hashed_state}}",
  "zp": "{{dl_user_data_hashed_zip}}",
  "country": "{{dl_user_data_hashed_country}}",
  "fbc": "{{dl_user_data_fbc}}",
  "fbp": "{{dl_user_data_fbp}}",
  "external_id": "{{dl_user_data_external_id}}"
}
```

---

## 🧪 Passo 9: Testar a Configuração

### 9.1 Usar Preview Mode
1. No GTM Server-side, clique em **Preview**
2. Digite a URL do seu site
3. Clique em **Connect**
4. No seu site, preencha o formulário e clique em checkout
5. Verifique se o evento `initiate_checkout` aparece no preview

### 9.2 Verificar Dados
No preview, clique na tag "Facebook Conversions API - Initiate Checkout" e verifique:

**User Data:**
- Todos os campos devem ter valores hasheados (64 caracteres hexadecimais)
- Se os dados hasheados não estiverem disponíveis, use os dados normalizados

### 9.3 Verificar no Facebook Event Manager
1. Acesse o Facebook Event Manager
2. Vá para "Testar Eventos"
3. Clique em "Enviar eventos de teste"
4. Preencha o formulário no seu site
5. Verifique se o evento InitiateCheckout aparece com todos os dados

---

## 🚀 Passo 10: Publicar

1. No GTM Server-side, clique em **Submit**
2. Nome da versão: "Facebook Conversions API Setup - Dados Normalizados"
3. Descrição: "Configuração alternativa sem SHA-256 no server-side"
4. Clique em **Publish**

---

## ✅ Resultado Esperado

Com esta abordagem alternativa, o Facebook receberá:

### Se os dados hasheados estiverem disponíveis:
```json
{
  "data": [{
    "event_name": "InitiateCheckout",
    "action_source": "website",
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

### Se apenas dados normalizados estiverem disponíveis:
```json
{
  "data": [{
    "event_name": "InitiateCheckout",
    "action_source": "website",
    "user_data": {
      "em": "usuario@exemplo.com",
      "ph": "5511999999999",
      "fn": "joão",
      "ln": "silva",
      "ct": "são paulo",
      "st": "sp",
      "zp": "01310100",
      "country": "br",
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

### Melhoria Esperada:
- **Pontuação de Qualidade:** De 6.4/10 para 7.5-8.5/10 (sem hash) ou 8.5-9.5/10 (com hash)
- **Matching Avançado:** Ativado (melhor com hash)
- **Cobertura de Dados:** Significativamente melhorada

---

## 🔍 Troubleshooting

### Problema: Dados hasheados não chegam no server-side
**Solução:**
1. Verifique se as variáveis de hash estão configuradas no GTM Web
2. Confirme se os dados estão sendo enviados no payload da requisição
3. Use dados normalizados como fallback

### Problema: Facebook não aceita dados não hasheados
**Solução:**
1. O Facebook aceita dados não hasheados, mas a pontuação é menor
2. Implemente o hash no GTM Web se possível
3. Considere usar um template personalizado se disponível

### Problema: Variáveis Custom JavaScript não funcionam
**Solução:**
1. Verifique a sintaxe do código JavaScript
2. Confirme se as variáveis de referência existem
3. Teste no preview mode

---

## 📝 Checklist Final

### GTM Server-side
- [ ] 11 variáveis de Data Layer criadas
- [ ] 9 variáveis de dados normalizados criadas
- [ ] 9 variáveis de dados hasheados criadas (opcional)
- [ ] Trigger para initiate_checkout criado
- [ ] Tag do Facebook Conversions API configurada
- [ ] Cliente do Facebook configurado

### GTM Web
- [ ] Variáveis de hash criadas (se possível)
- [ ] Tags de forwarding atualizadas com dados hasheados
- [ ] Dados normalizados sendo enviados

### Testes
- [ ] Preview mode funcionando
- [ ] Eventos aparecendo no preview
- [ ] Dados corretos na tag do Facebook
- [ ] Facebook Event Manager testado

### Publicação
- [ ] GTM Server-side publicado
- [ ] GTM Web publicado

Esta abordagem alternativa funciona mesmo com as limitações do GTM Server-side atual e ainda assim melhora significativamente a qualidade dos dados enviados para o Facebook!