# 🚀 GTM SERVER - Configuração Simplificada (Apenas 3 Eventos)

## 📋 INFORMAÇÕES INICIAIS
- **Server Container URL**: `https://data.maracujazeropragas.com`
- **Web Container ID**: `GTM-567XZCDX`
- **GA4 Measurement ID**: `G-CZ0XMXL3RX`
- **Meta Pixel ID**: `714277868320104`
- **Eventos**: page_view, view_content, initiate_checkout

---

## 🔧 PARTE 1: CLIENTS (Copiar e Colar)

### CLIENT 1: GA4 Measurement
```
Nome: 01 - GA4 Client
Tipo: GA4 Measurement
Parâmetros:
  - Measurement ID: G-CZ0XMXL3RX
  - Server Container URL: https://data.maracujazeropragas.com
  - Transport URL: https://data.maracujazeropragas.com
  - Send to Server Container: true
Trigger: All Events
```

### CLIENT 2: Meta Conversions API
```
Nome: 02 - Meta Conversions API Client
Tipo: Meta Conversions API
Parâmetros:
  - Pixel ID: 714277868320104
  - Access Token: EAAUsqHMv8GcBPlCK8fZCCwQzeWZCHF7ahXf6ZC98FcbiHFdFTykqE58YUksFpe7kAFkUzimeH178A3cZCng1Y8HafbNFKw12h0UeUKzJ4EL2CkHln15yZBoFf2PuMBEJNKXvAKJn8iyuk3AdelxYYpAyKtVjfoEIK3uWFwHrqwds6M1jIE7CCObThayaV8gZDZD
  - Test Event Code: TEST12345
  - Enable Test Events: true
Trigger: All Events
```

### CLIENT 3: HTTP Request
```
Nome: 03 - HTTP Request Client
Tipo: HTTP Request
Parâmetros:
  - Request URL: https://data.maracujazeropragas.com/api/gtm-server
  - Request Method: POST
  - Headers:
    Content-Type: application/json
  - Include Event Parameters: true
  - Include User Properties: true
Trigger: Custom Events
```

---

## ⚡ PARTE 2: TRIGGERS (Copiar e Colar)

### TRIGGER 1: All Events
```
Nome: All Events
Tipo: Custom Event
Este trigger é acionado em todos os eventos personalizados
Filtro:
  Event Name contains {{_event_name}}
```

### TRIGGER 2: view_content Event
```
Nome: view_content Event
Tipo: Custom Event
Este trigger é acionado no evento view_content
Filtro:
  Event Name equals view_content
```

### TRIGGER 3: initiate_checkout Event
```
Nome: initiate_checkout Event
Tipo: Custom Event
Este trigger é acionado no evento initiate_checkout
Filtro:
  Event Name equals initiate_checkout
```

### TRIGGER 4: page_view Event
```
Nome: page_view Event
Tipo: Custom Event
Este trigger é acionado no evento page_view
Filtro:
  Event Name equals page_view
```

---

## 🔧 PARTE 3: VARIÁVEIS (Copiar e Colar)

### VARIÁVEIS CONSTANTES
#### Variável 1: GA4 Measurement ID
```
Nome: GA4 Measurement ID
Tipo: Constant
Valor: G-CZ0XMXL3RX
```

#### Variável 2: Meta Pixel ID
```
Nome: Meta Pixel ID
Tipo: Constant
Valor: 714277868320104
```

### VARIÁVEIS DE EVENT DATA
#### Variável 3: Event ID
```
Nome: Event ID
Tipo: Event Data Parameter
Data Layer Key: event_id
```

#### Variável 4: Event Timestamp
```
Nome: Event Timestamp
Tipo: Event Data Parameter
Data Layer Key: timestamp
```

#### Variável 5: Page URL
```
Nome: Page URL
Tipo: Event Data Parameter
Data Layer Key: page_location
```

#### Variável 6: Page Title
```
Nome: Page Title
Tipo: Event Data Parameter
Data Layer Key: page_title
```

#### Variável 7: Page Path
```
Nome: Page Path
Tipo: Event Data Parameter
Data Layer Key: page_path
```

### VARIÁVEIS DE DADOS DO USUÁRIO
#### Variável 8: Event Email
```
Nome: Event Email
Tipo: Event Data Parameter
Data Layer Key: user_data.em
```

#### Variável 9: Event First Name
```
Nome: Event First Name
Tipo: Event Data Parameter
Data Layer Key: user_data.fn
```

#### Variável 10: Event Last Name
```
Nome: Event Last Name
Tipo: Event Data Parameter
Data Layer Key: user_data.ln
```

#### Variável 11: Event Phone
```
Nome: Event Phone
Tipo: Event Data Parameter
Data Layer Key: user_data.ph
```

#### Variável 12: City
```
Nome: City
Tipo: Event Data Parameter
Data Layer Key: user_data.ct
```

#### Variável 13: State
```
Nome: State
Tipo: Event Data Parameter
Data Layer Key: user_data.st
```

#### Variável 14: ZIP
```
Nome: ZIP
Tipo: Event Data Parameter
Data Layer Key: user_data.zp
```

#### Variável 15: Country
```
Nome: Country
Tipo: Event Data Parameter
Data Layer Key: user_data.country
```

#### Variável 16: GA Client ID
```
Nome: GA Client ID
Tipo: Event Data Parameter
Data Layer Key: user_data.ga_client_id
```

### VARIÁVEIS DE ATRIBUIÇÃO
#### Variável 17: FBC Cookie
```
Nome: FBC Cookie
Tipo: Event Data Parameter
Data Layer Key: user_data.fbc
```

#### Variável 18: FBP Cookie
```
Nome: FBP Cookie
Tipo: Event Data Parameter
Data Layer Key: user_data.fbp
```

#### Variável 19: External ID
```
Nome: External ID
Tipo: Event Data Parameter
Data Layer Key: user_data.external_id
```

### VARIÁVEIS DE HASHING (PII)
#### Variável 20: Hashed Email
```
Nome: Hashed Email
Tipo: Custom JavaScript
Código JavaScript:
function() {
  var email = {{Event Email}};
  if (email && email !== '') {
    // Normalizar email
    email = email.toLowerCase().trim();
    
    // Hash SHA-256
    var buffer = new TextEncoder().encode(email);
    return crypto.subtle.digest('SHA-256', buffer).then(function(hash) {
      var hashArray = Array.from(new Uint8Array(hash));
      var hashHex = hashArray.map(function(b) {
        return ('00' + b.toString(16)).slice(-2);
      }).join('');
      return hashHex;
    });
  }
  return undefined;
}
```

#### Variável 21: Hashed First Name
```
Nome: Hashed First Name
Tipo: Custom JavaScript
Código JavaScript:
function() {
  var firstName = {{Event First Name}};
  if (firstName && firstName !== '') {
    // Normalizar nome
    firstName = firstName.toLowerCase().trim();
    
    // Hash SHA-256
    var buffer = new TextEncoder().encode(firstName);
    return crypto.subtle.digest('SHA-256', buffer).then(function(hash) {
      var hashArray = Array.from(new Uint8Array(hash));
      var hashHex = hashArray.map(function(b) {
        return ('00' + b.toString(16)).slice(-2);
      }).join('');
      return hashHex;
    });
  }
  return undefined;
}
```

#### Variável 22: Hashed Last Name
```
Nome: Hashed Last Name
Tipo: Custom JavaScript
Código JavaScript:
function() {
  var lastName = {{Event Last Name}};
  if (lastName && lastName !== '') {
    // Normalizar sobrenome
    lastName = lastName.toLowerCase().trim();
    
    // Hash SHA-256
    var buffer = new TextEncoder().encode(lastName);
    return crypto.subtle.digest('SHA-256', buffer).then(function(hash) {
      var hashArray = Array.from(new Uint8Array(hash));
      var hashHex = hashArray.map(function(b) {
        return ('00' + b.toString(16)).slice(-2);
      }).join('');
      return hashHex;
    });
  }
  return undefined;
}
```

#### Variável 23: Hashed Phone
```
Nome: Hashed Phone
Tipo: Custom JavaScript
Código JavaScript:
function() {
  var phone = {{Event Phone}};
  if (phone && phone !== '') {
    // Normalizar telefone - remover caracteres especiais
    phone = phone.replace(/[^0-9]/g, '');
    
    // Hash SHA-256
    var buffer = new TextEncoder().encode(phone);
    return crypto.subtle.digest('SHA-256', buffer).then(function(hash) {
      var hashArray = Array.from(new Uint8Array(hash));
      var hashHex = hashArray.map(function(b) {
        return ('00' + b.toString(16)).slice(-2);
      }).join('');
      return hashHex;
    });
  }
  return undefined;
}
```

---

## 🏷️ PARTE 4: TAGS (Copiar e Colar)

### TAG 1: GA4 - view_item
```
Nome: 01 - GA4 - view_item
Tipo: GA4 Event
Parâmetros:
  - Event Name: view_item
  - Measurement ID: {{GA4 Measurement ID}}
  - Event Parameters:
    event_id: {{Event ID}}
    items: [{"item_id":"ebook-controle-trips","item_name":"E-book Sistema de Controle de Trips","item_category":"E-book","quantity":1,"price":39.90,"currency":"BRL"}]
    value: 39.90
    currency: BRL
    page_location: {{Page URL}}
Trigger: view_content Event
```

### TAG 2: GA4 - begin_checkout
```
Nome: 02 - GA4 - begin_checkout
Tipo: GA4 Event
Parâmetros:
  - Event Name: begin_checkout
  - Measurement ID: {{GA4 Measurement ID}}
  - Event Parameters:
    event_id: {{Event ID}}
    items: [{"item_id":"ebook-controle-trips","item_name":"E-book Sistema de Controle de Trips","item_category":"E-book","quantity":1,"price":39.90,"currency":"BRL"}]
    value: 39.90
    currency: BRL
    page_location: {{Page URL}}
  - User Properties:
    email: {{Hashed Email}}
    first_name: {{Hashed First Name}}
    last_name: {{Hashed Last Name}}
    phone: {{Hashed Phone}}
Trigger: initiate_checkout Event
```

### TAG 3: GA4 - page_view
```
Nome: 03 - GA4 - page_view
Tipo: GA4 Event
Parâmetros:
  - Event Name: page_view
  - Measurement ID: {{GA4 Measurement ID}}
  - Event Parameters:
    event_id: {{Event ID}}
    page_title: {{Page Title}}
    page_location: {{Page URL}}
    page_referrer: document.referrer
Trigger: page_view Event
```

### TAG 4: Meta - ViewContent
```
Nome: 04 - Meta - ViewContent
Tipo: Meta Conversions API Event
Parâmetros:
  - Pixel ID: {{Meta Pixel ID}}
  - Event Name: ViewContent
  - Event Time: {{Event Timestamp}}
  - Event Source URL: {{Page URL}}
  - Action Source: website
  - Event ID: {{Event ID}}
  - User Data:
    em: {{Hashed Email}}
    ph: {{Hashed Phone}}
    fn: {{Hashed First Name}}
    ln: {{Hashed Last Name}}
    ct: {{City}}
    st: {{State}}
    zp: {{ZIP}}
    country: {{Country}}
    fbc: {{FBC Cookie}}
    fbp: {{FBP Cookie}}
    external_id: {{External ID}}
    client_ip_address: {{Client IP Address}}
    client_user_agent: {{User Agent}}
  - Custom Data:
    content_name: E-book Sistema de Controle de Trips
    content_category: E-book
    content_ids: ["ebook-controle-trips"]
    content_type: product
    value: 39.90
    currency: BRL
  - Test Event Code: TEST12345
Trigger: view_content Event
```

### TAG 5: Meta - InitiateCheckout
```
Nome: 05 - Meta - InitiateCheckout
Tipo: Meta Conversions API Event
Parâmetros:
  - Pixel ID: {{Meta Pixel ID}}
  - Event Name: InitiateCheckout
  - Event Time: {{Event Timestamp}}
  - Event Source URL: {{Page URL}}
  - Action Source: website
  - Event ID: {{Event ID}}
  - User Data:
    em: {{Hashed Email}}
    ph: {{Hashed Phone}}
    fn: {{Hashed First Name}}
    ln: {{Hashed Last Name}}
    ct: {{City}}
    st: {{State}}
    zp: {{ZIP}}
    country: {{Country}}
    fbc: {{FBC Cookie}}
    fbp: {{FBP Cookie}}
    external_id: {{External ID}}
    client_ip_address: {{Client IP Address}}
    client_user_agent: {{User Agent}}
  - Custom Data:
    content_name: E-book Sistema de Controle de Trips
    content_category: E-book
    content_ids: ["ebook-controle-trips"]
    content_type: product
    value: 39.90
    currency: BRL
    num_items: 1
  - Test Event Code: TEST12345
Trigger: initiate_checkout Event
```

### TAG 6: Meta - PageView
```
Nome: 06 - Meta - PageView
Tipo: Meta Conversions API Event
Parâmetros:
  - Pixel ID: {{Meta Pixel ID}}
  - Event Name: PageView
  - Event Time: {{Event Timestamp}}
  - Event Source URL: {{Page URL}}
  - Action Source: website
  - Event ID: {{Event ID}}
  - User Data:
    em: {{Hashed Email}}
    ph: {{Hashed Phone}}
    fn: {{Hashed First Name}}
    ln: {{Hashed Last Name}}
    ct: {{City}}
    st: {{State}}
    zp: {{ZIP}}
    country: {{Country}}
    fbc: {{FBC Cookie}}
    fbp: {{FBP Cookie}}
    external_id: {{External ID}}
    client_ip_address: {{Client IP Address}}
    client_user_agent: {{User Agent}}
  - Test Event Code: TEST12345
Trigger: page_view Event
```

---

## 🎯 PARTE 5: ORDEM DE CRIAÇÃO

### PASSO 1: Criar Variáveis Constantes (2 variáveis)
1. GA4 Measurement ID
2. Meta Pixel ID

### PASSO 2: Criar Variáveis de Event Data (5 variáveis)
1. Event ID
2. Event Timestamp
3. Page URL
4. Page Title
5. Page Path

### PASSO 3: Criar Variáveis de Dados do Usuário (9 variáveis)
1. Event Email
2. Event First Name
3. Event Last Name
4. Event Phone
5. City
6. State
7. ZIP
8. Country
9. GA Client ID

### PASSO 4: Criar Variáveis de Atribuição (3 variáveis)
1. FBC Cookie
2. FBP Cookie
3. External ID

### PASSO 5: Criar Variáveis de Hashing (4 variáveis)
1. Hashed Email
2. Hashed First Name
3. Hashed Last Name
4. Hashed Phone

### PASSO 6: Criar Triggers (4 triggers)
1. All Events
2. view_content Event
3. initiate_checkout Event
4. page_view Event

### PASSO 7: Criar Clients (3 clients)
1. GA4 Measurement
2. Meta Conversions API
3. HTTP Request

### PASSO 8: Criar Tags (6 tags)
1. GA4 - view_item
2. GA4 - begin_checkout
3. GA4 - page_view
4. Meta - ViewContent
5. Meta - InitiateCheckout
6. Meta - PageView

---

## 📊 PARTE 6: MAPEAMENTO DE EVENTOS

### EVENTOS MAPEADOS:
```
GTM Web → GTM Server → GA4 → Meta
page_view → page_view → page_view → PageView
view_content → view_content → view_item → ViewContent
initiate_checkout → initiate_checkout → begin_checkout → InitiateCheckout
```

### EMQ TARGET:
- **Mínimo**: 8.0
- **Ideal**: 9.0+
- **Com PII completo**: 10.0

---

## 🧪 PARTE 7: TESTE DE EVENTOS

### EVENTO DE TESTE 1: page_view
```json
{
  "event_name": "page_view",
  "event_id": "test_page_12345",
  "timestamp": 1640995400000,
  "page_location": "https://maracujazeropragas.com",
  "page_title": "Maracujá Zero Pragas - Início",
  "user_data": {
    "em": "",
    "fn": "",
    "ln": "",
    "ph": "",
    "ct": "",
    "st": "",
    "zp": "",
    "country": "BR",
    "ga_client_id": "123456789.987654321",
    "fbc": "fb.1.1640995200.IwAR123456789",
    "fbp": "fb.1.1640995200.1234567890",
    "external_id": ""
  }
}
```

### EVENTO DE TESTE 2: view_content
```json
{
  "event_name": "view_content",
  "event_id": "test_view_12345",
  "timestamp": 1640995200000,
  "page_location": "https://maracujazeropragas.com/produto",
  "user_data": {
    "em": "test@example.com",
    "fn": "João",
    "ln": "Silva",
    "ph": "+5511999998888",
    "ct": "São Paulo",
    "st": "SP",
    "zp": "01234567",
    "country": "BR",
    "ga_client_id": "123456789.987654321",
    "fbc": "fb.1.1640995200.IwAR123456789",
    "fbp": "fb.1.1640995200.1234567890",
    "external_id": "user12345"
  }
}
```

### EVENTO DE TESTE 3: initiate_checkout
```json
{
  "event_name": "initiate_checkout",
  "event_id": "test_checkout_12345",
  "timestamp": 1640995300000,
  "page_location": "https://maracujazeropragas.com/checkout",
  "user_data": {
    "em": "test@example.com",
    "fn": "João",
    "ln": "Silva",
    "ph": "+5511999998888",
    "ct": "São Paulo",
    "st": "SP",
    "zp": "01234567",
    "country": "BR",
    "ga_client_id": "123456789.987654321",
    "fbc": "fb.1.1640995200.IwAR123456789",
    "fbp": "fb.1.1640995200.1234567890",
    "external_id": "user12345"
  }
}
```

---

## ✅ PARTE 8: VERIFICAÇÃO FINAL

### VERIFICAR NO GTM SERVER PREVIEW:
- ✅ Eventos page_view recebidos
- ✅ Eventos view_content recebidos
- ✅ Eventos initiate_checkout recebidos
- ✅ Tags GA4 disparando corretamente
- ✅ Tags Meta disparando corretamente
- ✅ Hashing PII funcionando

### VERIFICAR NO GA4 DEBUGVIEW:
- ✅ page_view recebido
- ✅ view_item recebido
- ✅ begin_checkout recebido
- ✅ Parâmetros corretos
- ✅ User Properties com hash

### VERIFICAR NO META EVENTS MANAGER:
- ✅ PageView recebido
- ✅ ViewContent recebido
- ✅ InitiateCheckout recebido
- ✅ Test Events com código TEST12345
- ✅ EMQ Score ≥ 8.0

### VERIFICAR NA SUA API:
- ✅ Eventos recebidos em /api/gtm-server
- ✅ Status 200 OK
- ✅ EMQ Score calculado
- ✅ Logs de processamento

---

## 🎯 RESUMO FINAL

### TOTAL DE ELEMENTOS CRIADOS:
- **3 Clients**: GA4, Meta, HTTP Request
- **6 Tags**: 3 GA4 + 3 Meta
- **4 Triggers**: All Events + 3 Específicos
- **23 Variáveis**: Constantes, Event Data, Hashing

### EVENTOS CONFIGURADOS:
1. **page_view** → page_view (GA4) + PageView (Meta)
2. **view_content** → view_item (GA4) + ViewContent (Meta)
3. **initiate_checkout** → begin_checkout (GA4) + InitiateCheckout (Meta)

### BENEFÍCIOS:
- **EMQ Score ≥ 8.0** em todos os eventos
- **Hashing SHA-256** para privacidade LGPD
- **Atribuição correta** com FBC/FBP
- **Dados consistentes** entre plataformas

**GTM Server simplificado está pronto para produção!** 🚀