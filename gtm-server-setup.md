# Configuração GTM Server-side para Facebook Conversions API

## Problema Identificado
Os dados de usuário (email, telefone, nome, sobrenome) não estão sendo enviados corretamente para o Facebook Conversions API através do GTM Server-side.

## Solução: Configurar Variáveis e Tags no GTM Server-side

### 1. Variáveis Necessárias no GTM Server-side

#### 1.1 Variáveis de Dados do Usuário (Data Layer)

**Variável: dl_user_data_email**
- Tipo: Data Layer Variable
- Nome da Variável do Data Layer: `user_data_raw.email`
- Versão do Data Layer: 2

**Variável: dl_user_data_phone**
- Tipo: Data Layer Variable
- Nome da Variável do Data Layer: `user_data_raw.phone`
- Versão do Data Layer: 2

**Variável: dl_user_data_firstName**
- Tipo: Data Layer Variable
- Nome da Variável do Data Layer: `user_data_raw.firstName`
- Versão do Data Layer: 2

**Variável: dl_user_data_lastName**
- Tipo: Data Layer Variable
- Nome da Variável do Data Layer: `user_data_raw.lastName`
- Versão do Data Layer: 2

**Variável: dl_user_data_city**
- Tipo: Data Layer Variable
- Nome da Variável do Data Layer: `user_data_raw.city`
- Versão do Data Layer: 2

**Variável: dl_user_data_state**
- Tipo: Data Layer Variable
- Nome da Variável do Data Layer: `user_data_raw.state`
- Versão do Data Layer: 2

**Variável: dl_user_data_zip**
- Tipo: Data Layer Variable
- Nome da Variável do Data Layer: `user_data_raw.zip`
- Versão do Data Layer: 2

**Variável: dl_user_data_country**
- Tipo: Data Layer Variable
- Nome da Variável do Data Layer: `user_data_raw.country`
- Versão do Data Layer: 2

#### 1.2 Variáveis de Dados de Rastreamento

**Variável: dl_user_data_fbc**
- Tipo: Data Layer Variable
- Nome da Variável do Data Layer: `user_data.fbc`
- Versão do Data Layer: 2

**Variável: dl_user_data_fbp**
- Tipo: Data Layer Variable
- Nome da Variável do Data Layer: `user_data.fbp`
- Versão do Data Layer: 2

**Variável: dl_user_data_external_id**
- Tipo: Data Layer Variable
- Nome da Variável do Data Layer: `user_data.external_id`
- Versão do Data Layer: 2

#### 1.3 Variáveis de Hash (para dados sensíveis)

**Variável: hashed_email**
- Tipo: Custom JavaScript
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

**Variável: hashed_phone**
- Tipo: Custom JavaScript
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

**Variável: hashed_firstName**
- Tipo: Custom JavaScript
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

**Variável: hashed_lastName**
- Tipo: Custom JavaScript
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

**Variável: hashed_city**
- Tipo: Custom JavaScript
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

**Variável: hashed_state**
- Tipo: Custom JavaScript
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

**Variável: hashed_zip**
- Tipo: Custom JavaScript
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

**Variável: hashed_country**
- Tipo: Custom JavaScript
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

### 2. Configuração da Tag do Facebook Conversions API

**Tag: Facebook Conversions API - Initiate Checkout**

**Configuração Básica:**
- Tipo: Facebook Conversions API
- Event Name: InitiateCheckout
- Pixel ID: [SEU_PIXEL_ID]
- Access Token: [SEU_ACCESS_TOKEN]

**Configuração de Dados do Usuário:**

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

**Configuração de Dados do Evento:**

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

**Disparador:**
- Nome: Initiate Checkout Event
- Tipo: Custom Event
- Nome do Evento: initiate_checkout

### 3. Configuração do Cliente (Client)

**Cliente: Facebook Conversions API**

**Configuração:**
- Nome: Facebook Server-side API
- ID do Pixel: [SEU_PIXEL_ID]
- Token de Acesso: [SEU_ACCESS_TOKEN]

### 4. Importante: Biblioteca SHA-256

É necessário incluir a biblioteca SHA-256 no GTM Server-side. Adicione este código como uma tag HTML personalizada:

**Tag: SHA-256 Library**
- Tipo: Custom HTML
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

**Disparador:**
- Tipo: All Pages

### 5. Ordem de Execução das Tags

1. **SHA-256 Library** (All Pages)
2. **Facebook Conversions API - Initiate Checkout** (Initiate Checkout Event)

### 6. Teste

Após configurar tudo, teste usando o Facebook Event Manager ou Tag Assistant para verificar se os dados estão sendo enviados corretamente:

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

### 7. Resumo da Solução

1. **Frontend já está correto** - envia dados brutos e formatados
2. **GTM Server-side precisa ser configurado** com as variáveis acima
3. **Dados serão hasheados** no server-side para privacidade
4. **Facebook receberá todos os dados** necessários para matching avançado

Com esta configuração, o Facebook Conversions API receberá todos os dados de usuário necessários e a pontuação de qualidade dos eventos deve melhorar significativamente.