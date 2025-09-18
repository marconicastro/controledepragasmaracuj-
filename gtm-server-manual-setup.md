# Configuração Manual GTM Server-side para Facebook Conversions API
## (Sem Importação de Contêiner)

## 🎯 Objetivo
Configurar manualmente o GTM Server-side para enviar dados completos para o Facebook Conversions API, resolvendo o problema de dados faltantes (email, telefone, nome) que estão causando baixa pontuação de qualidade (6.4/10).

## 📋 Pré-requisitos
1. Contêiner GTM Server-side já criado
2. Pixel ID do Facebook
3. Access Token do Facebook
4. URL do seu GTM Server-side (ex: https://gtm.seusite.com)

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

### 1.3 Variáveis de Hash (Importante para Privacidade)

**Variável: `hashed_email`**
- Tipo: **Custom JavaScript**
```javascript
function() {
  var email = {{dl_user_data_email}};
  if (!email) return '';
  
  // Normalizar email
  email = email.toLowerCase().trim();
  
  // Hash SHA-256
  return sha256(email);
}
```

**Variável: `hashed_phone`**
- Tipo: **Custom JavaScript**
```javascript
function() {
  var phone = {{dl_user_data_phone}};
  if (!phone) return '';
  
  // Normalizar telefone - remover caracteres não numéricos
  phone = phone.replace(/\D/g, '');
  
  // Hash SHA-256
  return sha256(phone);
}
```

**Variável: `hashed_firstName`**
- Tipo: **Custom JavaScript**
```javascript
function() {
  var firstName = {{dl_user_data_firstName}};
  if (!firstName) return '';
  
  // Normalizar nome
  firstName = firstName.toLowerCase().trim();
  
  // Hash SHA-256
  return sha256(firstName);
}
```

**Variável: `hashed_lastName`**
- Tipo: **Custom JavaScript**
```javascript
function() {
  var lastName = {{dl_user_data_lastName}};
  if (!lastName) return '';
  
  // Normalizar sobrenome
  lastName = lastName.toLowerCase().trim();
  
  // Hash SHA-256
  return sha256(lastName);
}
```

**Variável: `hashed_city`**
- Tipo: **Custom JavaScript**
```javascript
function() {
  var city = {{dl_user_data_city}};
  if (!city) return '';
  
  // Normalizar cidade
  city = city.toLowerCase().trim();
  
  // Hash SHA-256
  return sha256(city);
}
```

**Variável: `hashed_state`**
- Tipo: **Custom JavaScript**
```javascript
function() {
  var state = {{dl_user_data_state}};
  if (!state) return '';
  
  // Normalizar estado
  state = state.toLowerCase().trim();
  
  // Hash SHA-256
  return sha256(state);
}
```

**Variável: `hashed_zip`**
- Tipo: **Custom JavaScript**
```javascript
function() {
  var zip = {{dl_user_data_zip}};
  if (!zip) return '';
  
  // Normalizar CEP
  zip = zip.replace(/\D/g, '');
  
  // Hash SHA-256
  return sha256(zip);
}
```

**Variável: `hashed_country`**
- Tipo: **Custom JavaScript**
```javascript
function() {
  var country = {{dl_user_data_country}};
  if (!country) return '';
  
  // Normalizar país
  country = country.toLowerCase().trim();
  
  // Hash SHA-256
  return sha256(country);
}
```

---

## 🔧 Passo 2: Configurar Biblioteca SHA-256

**Tag: `SHA-256 Library`**
- Tipo: **Custom HTML**
```html
<script>
// SHA-256 Implementation
function sha256(ascii) {
  function rightRotate(value, amount) {
    var tmp = (value & 0xFFFFFFFF) << (32 - amount);
    return (value >>> amount) | tmp;
  };

  function mathPow(x, n) {
    if (n < 0) return 0;
    if (n === 0) return 1;
    if (n === 1) return x;
    if (n % 2 === 0) return mathPow(x * x, n / 2);
    return x * mathPow(x * x, (n - 1) / 2);
  };

  var maxWord = mathPow(2, 32);
  var lengthProperty = 'length';
  var i, j;
  var result = '';

  var words = [];
  var asciiBitLength = ascii[lengthProperty] * 8;

  var hash = sha256.h = sha256.h || [];
  var k = sha256.k = sha256.k || [];
  var primeCounter = k[lengthProperty];

  var isComposite = {};
  for (var candidate = 2; primeCounter < 64; candidate++) {
    if (!isComposite[candidate]) {
      for (i = 0; i < 313; i += candidate) {
        isComposite[i] = candidate;
      }
      hash[primeCounter] = (mathPow(candidate, 0.5) * maxWord) | 0;
      k[primeCounter++] = (mathPow(candidate, 1 / 3) * maxWord) | 0;
    }
  }

  ascii += '\x80';
  while (ascii[lengthProperty] % 64 - 56) ascii += '\x00';
  for (i = 0; i < ascii[lengthProperty]; i++) {
    j = ascii.charCodeAt(i);
    if (j >> 8) return;
    words[i >> 2] |= j << ((3 - i) % 4) * 8;
  }
  words[words[lengthProperty]] = ((asciiBitLength / maxWord) | 0);
  words[words[lengthProperty]] = (asciiBitLength);

  for (j = 0; j < words[lengthProperty];) {
    var w = words.slice(j, j += 16);
    var oldHash = hash.slice(0);

    hash = hash.slice(0, 8);

    for (i = 0; i < 64; i++) {
      var i2 = i + j;
      var w15 = w[i - 15], w2 = w[i - 2];

      var a = hash[0], e = hash[4];
      var temp1 = hash[7]
        + (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25))
        + ((e & hash[5]) ^ ((~e) & hash[6]))
        + k[i]
        + (w[i] = (i < 16) ? w[i] : (w[i - 16]
        + (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3))
        + w[i - 7]
        + (rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10))) | 0
      );
      var temp2 = (rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22))
        + ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2]));

      hash = [(temp1 + temp2) | 0].concat(hash);
      hash[4] = (hash[4] + temp1) | 0;
    }

    for (i = 0; i < 8; i++) {
      hash[i] = (hash[i] + oldHash[i]) | 0;
    }
  }

  for (i = 0; i < 8; i++) {
    for (j = 3; j + 1; j--) {
      var b = (hash[i] >> (j * 8)) & 255;
      result += ((b < 16) ? 0 : '') + b.toString(16);
    }
  }
  return result;
}
</script>
```

**Trigger:** All Pages

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

### Configuração de Dados do Usuário:
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

## 📊 Passo 6: Ordem de Execução (Importante!)

1. **SHA-256 Library** (All Pages) - **Prioridade 1**
2. **Facebook Conversions API - Initiate Checkout** (Initiate Checkout Event) - **Prioridade 2**

### Como configurar a ordem:
1. Na tag "Facebook Conversions API - Initiate Checkout"
2. Clique em "Tag Sequencing"
3. Marque "Fire a tag before this tag fires"
4. Selecione "SHA-256 Library"
5. Salve

---

## 🧪 Passo 7: Testar a Configuração

### 7.1 Usar Preview Mode
1. No GTM Server-side, clique em **Preview**
2. Digite a URL do seu site
3. Clique em **Connect**
4. No seu site, preencha o formulário e clique em checkout
5. Verifique se o evento `initiate_checkout` aparece no preview

### 7.2 Verificar Dados
No preview, clique na tag "Facebook Conversions API - Initiate Checkout" e verifique:

**User Data:**
- Todos os campos devem ter valores (não vazios)
- Valores devem estar hasheados (64 caracteres hexadecimais)

**Event Data:**
- content_name, content_ids, value, currency devem estar preenchidos

### 7.3 Verificar no Facebook Event Manager
1. Acesse o Facebook Event Manager
2. Vá para "Testar Eventos"
3. Clique em "Enviar eventos de teste"
4. Preencha o formulário no seu site
5. Verifique se o evento InitiateCheckout aparece com todos os dados

---

## 🚀 Passo 8: Publicar

1. No GTM Server-side, clique em **Submit**
2. Nome da versão: "Facebook Conversions API Setup - Dados Completos"
3. Descrição: "Configuração manual para envio de dados completos (email, telefone, nome) para Facebook Conversions API"
4. Clique em **Publish**

---

## ✅ Resultado Esperado

Após a configuração, o Facebook receberá todos os dados necessários:

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

### Melhoria Esperada:
- **Pontuação de Qualidade:** De 6.4/10 para 8.5-9.5/10
- **Matching Avançado:** Ativado
- **Cobertura de Dados:** Próxima de 100% para todos os campos
- **Recursos Habilitados:** Cross-device tracking, advanced matching, retargeting preciso

---

## 🔍 Troubleshooting

### Problema: Variáveis não aparecem no preview
**Solução:**
1. Verifique se os nomes das variáveis estão exatamente como especificados
2. Confirme se o DataLayer está sendo enviado corretamente do frontend
3. Use o console do navegador para verificar: `console.log(dataLayer)`

### Problema: Hash não funciona
**Solução:**
1. Verifique se a tag SHA-256 Library está disparando em todas as páginas
2. Confirme a ordem de execução (SHA-256 Library antes da tag do Facebook)
3. Teste a função hash manualmente no preview

### Problema: Eventos não chegam no Facebook
**Solução:**
1. Verifique Pixel ID e Access Token
2. Confirme se o cliente (Client) está configurado corretamente
3. Teste usando o Facebook Event Manager

### Problema: Dados aparecem como vazios
**Solução:**
1. Verifique se o frontend está enviando os dados no DataLayer
2. Confirme os nomes das variáveis no DataLayer
3. Use o preview do GTM Web para verificar os dados antes do envio

---

## 📝 Checklist Final

- [ ] Todas as 19 variáveis configuradas
- [ ] Biblioteca SHA-256 adicionada
- [ ] Tag do Facebook Conversions API configurada
- [ ] Trigger para initiate_checkout criado
- [ ] Cliente (Client) do Facebook configurado
- [ ] Ordem de execução das tags definida
- [ ] Testado em preview mode
- [ ] Verificado no Facebook Event Manager
- [ ] Publicado com sucesso

Com esta configuração manual, você não precisa importar contêineres e terá controle total sobre todos os aspectos da implementação!