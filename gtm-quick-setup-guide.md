# Guia Rápido: Configuração GTM Server-side para Facebook Conversions API

## 🎯 Problema a Resolver
Facebook Conversions API não está recebendo dados de usuário (email, telefone, nome), causando baixa pontuação de qualidade (6.4/10).

## 📋 Visão Geral da Solução
1. **GTM Web** → Envia eventos com dados brutos para o server-side
2. **GTM Server-side** → Processa dados, aplica hash e envia para Facebook
3. **Facebook** → Recebe todos os dados necessários para matching avançado

---

## 🔧 GTM Server-side - Passos Essenciais

### 1. Variáveis de Dados (9 variáveis)
Criar estas variáveis do tipo **Data Layer Variable**:
- `dl_user_data_email` → `user_data_raw.email`
- `dl_user_data_phone` → `user_data_raw.phone`
- `dl_user_data_firstName` → `user_data_raw.firstName`
- `dl_user_data_lastName` → `user_data_raw.lastName`
- `dl_user_data_city` → `user_data_raw.city`
- `dl_user_data_state` → `user_data_raw.state`
- `dl_user_data_zip` → `user_data_raw.zip`
- `dl_user_data_country` → `user_data_raw.country`
- `dl_user_data_fbc` → `user_data.fbc`
- `dl_user_data_fbp` → `user_data.fbp`
- `dl_user_data_external_id` → `user_data.external_id`

### 2. Variáveis de Hash (9 variáveis)
Criar estas variáveis do tipo **Custom JavaScript**:
```javascript
// Exemplo para hashed_email
function() {
  var email = {{dl_user_data_email}};
  if (!email) return '';
  email = email.toLowerCase().trim();
  return sha256(email);
}
```

⚠️ **Importante:** Se o Custom JavaScript com SHA-256 não funcionar no seu GTM Server-side, use a abordagem alternativa:
- Crie variáveis de dados normalizados (sem hash)
- Ou faça o hash no GTM Web e envie os dados já hasheados

Repetir para: `hashed_phone`, `hashed_firstName`, `hashed_lastName`, `hashed_city`, `hashed_state`, `hashed_zip`, `hashed_country`

### 3. Biblioteca SHA-256 (Opcional)
Se o seu GTM Server-side suportar Custom HTML:
- Criar tag **Custom HTML** com o código SHA-256
- Trigger: **All Pages**

⚠️ **Alternativa:** Se não suportar Custom HTML, pule este passo e use dados normalizados ou faça o hash no GTM Web.

### 4. Trigger para Evento
Criar trigger **Custom Event**:
- Nome: `Initiate Checkout Event`
- Event Name: `initiate_checkout`

### 5. Tag do Facebook
Criar tag **Facebook Conversions API**:
- Event Name: `InitiateCheckout`
- Pixel ID: `[SEU_PIXEL_ID]`
- Access Token: `[SEU_ACCESS_TOKEN]`

**User Data (se hash estiver disponível):**
```json
{
  "em": "{{hashed_email}}",
  "ph": "{{hashed_phone}}",
  "fn": "{{hashed_firstName}}",
  "ln": "{{hashed_lastName}}",
  "ct": "{{hashed_city}}",
  "st": "{{hashed_state}}",
  "zp": "{{hashed_zip}}",
  "country": "{{hashed_country}}",
  "fbc": "{{dl_user_data_fbc}}",
  "fbp": "{{dl_user_data_fbp}}",
  "external_id": "{{dl_user_data_external_id}}"
}
```

**User Data (alternativa sem hash):**
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

**Event Data:**
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

- Trigger: `Initiate Checkout Event`
- **Importante:** Se usar SHA-256, configure Tag Sequencing para disparar SHA-256 Library primeiro

---

## 🔧 GTM Web - Passos Essenciais

### 1. Variáveis (6 variáveis)
- `dl_user_data` → Data Layer Variable → `user_data`
- `dl_user_data_raw` → Data Layer Variable → `user_data_raw`
- `Event ID` → Custom JavaScript → `Date.now().toString(36) + Math.random().toString(36).substr(2)`
- `Page URL` → Page URL → Full URL
- `Page Title` → Document Title
- `Timestamp` → Custom JavaScript → `Date.now()`

### 2. Triggers (3 triggers)
Criar triggers **Custom Event**:
- `Server Event - Page View` → `page_view_server`
- `Server Event - Initiate Checkout` → `initiate_checkout`
- `Server Event - View Content` → `view_content`

### 3. Tags de Forwarding (3 tags)
Criar tags **HTTP Request**:

**Tag 1 - Page View:**
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

**Tag 2 - Initiate Checkout:**
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

**Tag 3 - View Content:**
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

---

## 🧪 Teste Rápido

### 1. Ativar Preview Mode
- GTM Web: Preview → URL do site → Connect
- GTM Server-side: Preview → URL do site → Connect

### 2. Testar no Site
- Acessar site
- Preencher formulário
- Clicar em checkout

### 3. Verificar
- **GTM Web:** Eventos `initiate_checkout` aparecendo
- **GTM Server-side:** Tag Facebook Conversions API disparando
- **Console:** Requisições para server-side aparecendo
- **Facebook Event Manager:** Eventos com dados completos

---

## 🚀 Publicação

1. **GTM Server-side:** Submit → "Facebook Conversions API Setup" → Publish
2. **GTM Web:** Submit → "Server-side Forwarding Setup" → Publish

---

## ✅ Resultado Esperado

### Antes:
```json
{
  "user_data": {
    "ct": "são paulo",
    "st": "sp",
    "zp": "01310100",
    "country": "br"
  }
}
```
**Qualidade: 6.4/10**

### Depois:
```json
{
  "user_data": {
    "em": "2c26b46b68ffc68ff99b453c1d30413413422d706483bfa0f98a5e886266e7ae",
    "ph": "4e732ced3467dca7c13c80a9e6e8b5d4c6a9e5e6a7e8f9a0b1c2d3e4f5a6b7c8d",
    "fn": "a7d8b9c0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8",
    "ln": "b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9",
    "ct": "c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3",
    "st": "d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4",
    "zp": "e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5",
    "country": "f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6",
    "fbc": "fb.1.1234567890.abc123def456",
    "fbp": "fb.1.1234567890.1234567890",
    "external_id": "user123"
  }
}
```
**Qualidade: 8.5-9.5/10**

---

## 📝 Checklist de Implementação

### GTM Server-side
- [ ] 11 variáveis de Data Layer criadas
- [ ] 9 variáveis de hash criadas
- [ ] Biblioteca SHA-256 adicionada
- [ ] Trigger initiate_checkout criado
- [ ] Tag Facebook Conversions API configurada
- [ ] Ordem de execução definida
- [ ] Cliente Facebook configurado

### GTM Web
- [ ] 6 variáveis criadas
- [ ] 3 triggers criados
- [ ] 3 tags de forwarding criadas
- [ ] URLs do server-side configuradas

### Testes
- [ ] Preview mode ativado em ambos GTMs
- [ ] Eventos testados no site
- [ ] Dados verificados no preview
- [ ] Facebook Event Manager testado

### Publicação
- [ ] GTM Server-side publicado
- [ ] GTM Web publicado
- [ ] Monitoramento pós-publicação

---

## 🔍 Dicas Importantes

1. **Nomes Exatos:** Use exatamente os nomes especificados para variáveis e eventos
2. **Ordem de Execução:** SHA-256 Library deve disparar antes da tag do Facebook
3. **URL do Server:** Substitua `https://seu-gtm-server.com/collect` pela sua URL real
4. **Pixel ID e Token:** Substitua `[SEU_PIXEL_ID]` e `[SEU_ACCESS_TOKEN]` pelos valores reais
5. **Teste Sempre:** Use preview mode antes de publicar

Com este guia rápido, você pode implementar a solução completa em cerca de 1-2 horas!