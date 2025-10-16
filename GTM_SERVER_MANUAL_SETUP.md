# 🎯 GTM Server - Configuração Manual Detalhada

## 📋 INFORMAÇÕES DO CONTAINER
- **Nome do Container**: `[SERVER] Ebook Trips`
- **Server URL**: `https://data.maracujazeropragas.com`
- **Web Container ID**: `GTM-567XZCDX`

---

## 🔧 1. CLIENTS (Criar nesta ordem)

### CLIENT 01: GA4 Measurement
- **Nome**: `01 - GA4 Client`
- **Tipo**: `GA4 Measurement`
- **Parâmetros**:
  ```
  Measurement ID: G-CZ0XMXL3RX
  Server Container URL: https://data.maracujazeropragas.com
  Transport URL: https://data.maracujazeropragas.com
  Send to Server Container: true
  ```
- **Trigger**: `All Events` (criar depois)

### CLIENT 02: Meta Conversions API
- **Nome**: `02 - Meta Conversions API Client`
- **Tipo**: `Meta Conversions API`
- **Parâmetros**:
  ```
  Pixel ID: 714277868320104
  Access Token: EAAUsqHMv8GcBPlCK8fZCCwQzeWZCHF7ahXf6ZC98FcbiHFdFTykqE58YUksFpe7kAFkUzimeH178A3cZCng1Y8HafbNFKw12h0UeUKzJ4EL2CkHln15yZBoFf2PuMBEJNKXvAKJn8iyuk3AdelxYYpAyKtVjfoEIK3uWFwHrqwds6M1jIE7CCObThayaV8gZDZD
  Test Event Code: TEST12345
  Enable Test Events: true
  ```
- **Trigger**: `All Events` (criar depois)

### CLIENT 03: HTTP Request
- **Nome**: `03 - HTTP Request Client`
- **Tipo**: `HTTP Request`
- **Parâmetros**:
  ```
  Request URL: https://data.maracujazeropragas.com/api/gtm-server
  Request Method: POST
  Headers:
    - Content-Type: application/json
  Include Event Parameters: true
  Include User Properties: true
  ```
- **Trigger**: `Custom Events` (criar depois)

---

## ⚡ 2. TRIGGERS (Criar nesta ordem)

### TRIGGER 01: All Events
- **Nome**: `All Events`
- **Tipo**: `Custom Event`
- **Filtro**:
  ```
  Event Name contains {{_event_name}}
  ```

### TRIGGER 02: view_content Event
- **Nome**: `view_content Event`
- **Tipo**: `Custom Event`
- **Filtro**:
  ```
  Event Name equals view_content
  ```

### TRIGGER 03: initiate_checkout Event
- **Nome**: `initiate_checkout Event`
- **Tipo**: `Custom Event`
- **Filtro**:
  ```
  Event Name equals initiate_checkout
  ```

### TRIGGER 04: PageView Event
- **Nome**: `PageView Event`
- **Tipo**: `Custom Event`
- **Filtro**:
  ```
  Event Name equals page_view
  ```

---

## 🔧 3. VARIÁVEIS (Criar nesta ordem)

### VARIÁVEIS CONSTANTES
#### Variable 01: GA4 Measurement ID
- **Nome**: `GA4 Measurement ID`
- **Tipo**: `Constant`
- **Valor**: `G-CZ0XMXL3RX`

#### Variable 02: Meta Pixel ID
- **Nome**: `Meta Pixel ID`
- **Tipo**: `Constant`
- **Valor**: `714277868320104`

### VARIÁVEIS DE EVENT DATA
#### Variable 03: Event ID
- **Nome**: `Event ID`
- **Tipo**: `Event Data Parameter`
- **Data Layer Key**: `event_id`

#### Variable 04: Event Timestamp
- **Nome**: `Event Timestamp`
- **Tipo**: `Event Data Parameter`
- **Data Layer Key**: `timestamp`

#### Variable 05: Page URL
- **Nome**: `Page URL`
- **Tipo**: `Event Data Parameter`
- **Data Layer Key**: `page_location`

### VARIÁVEIS DE DADOS DO USUÁRIO
#### Variable 06: Event Email
- **Nome**: `Event Email`
- **Tipo**: `Event Data Parameter`
- **Data Layer Key**: `user_data.email`

#### Variable 07: Event First Name
- **Nome**: `Event First Name`
- **Tipo**: `Event Data Parameter`
- **Data Layer Key**: `user_data.first_name`

#### Variable 08: Event Last Name
- **Nome**: `Event Last Name`
- **Tipo**: `Event Data Parameter`
- **Data Layer Key**: `user_data.last_name`

#### Variable 09: Event Phone
- **Nome**: `Event Phone`
- **Tipo**: `Event Data Parameter`
- **Data Layer Key**: `user_data.phone`

#### Variable 10: City
- **Nome**: `City`
- **Tipo**: `Event Data Parameter`
- **Data Layer Key**: `user_data.city`

#### Variable 11: State
- **Nome**: `State`
- **Tipo**: `Event Data Parameter`
- **Data Layer Key**: `user_data.state`

#### Variable 12: ZIP
- **Nome**: `ZIP`
- **Tipo**: `Event Data Parameter`
- **Data Layer Key**: `user_data.zip`

#### Variable 13: Country
- **Nome**: `Country`
- **Tipo**: `Event Data Parameter`
- **Data Layer Key**: `user_data.country`

### VARIÁVEIS DE ATRIBUIÇÃO
#### Variable 14: FBC Cookie
- **Nome**: `FBC Cookie`
- **Tipo**: `Event Data Parameter`
- **Data Layer Key**: `fbc`

#### Variable 15: FBP Cookie
- **Nome**: `FBP Cookie`
- **Tipo**: `Event Data Parameter`
- **Data Layer Key**: `fbp`

#### Variable 16: External ID
- **Nome**: `External ID`
- **Tipo**: `Event Data Parameter`
- **Data Layer Key**: `external_id`

### VARIÁVEIS DE HASHING (PII)
#### Variable 17: Hashed Email
- **Nome**: `Hashed Email`
- **Tipo**: `Custom JavaScript`
- **Código JavaScript**:
```javascript
function() {
  var email = {{Event Email}};
  if (email) {
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

#### Variable 18: Hashed First Name
- **Nome**: `Hashed First Name`
- **Tipo**: `Custom JavaScript`
- **Código JavaScript**:
```javascript
function() {
  var firstName = {{Event First Name}};
  if (firstName) {
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

#### Variable 19: Hashed Last Name
- **Nome**: `Hashed Last Name`
- **Tipo**: `Custom JavaScript`
- **Código JavaScript**:
```javascript
function() {
  var lastName = {{Event Last Name}};
  if (lastName) {
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

#### Variable 20: Hashed Phone
- **Nome**: `Hashed Phone`
- **Tipo**: `Custom JavaScript`
- **Código JavaScript**:
```javascript
function() {
  var phone = {{Event Phone}};
  if (phone) {
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

## 🏷️ 4. TAGS (Criar nesta ordem)

### TAG 01: GA4 - view_item
- **Nome**: `01 - GA4 - view_item`
- **Tipo**: `GA4 Event`
- **Parâmetros**:
  ```
  Event Name: view_item
  Measurement ID: {{GA4 Measurement ID}}
  Event Parameters:
    - event_id: {{Event ID}}
    - items: 
      {
        "item_id": "ebook-controle-trips",
        "item_name": "E-book Sistema de Controle de Trips",
        "item_category": "E-book",
        "quantity": 1,
        "price": 39.90,
        "currency": "BRL"
      }
    - value: 39.90
    - currency: BRL
  ```
- **Trigger**: `view_content Event`

### TAG 02: GA4 - begin_checkout
- **Nome**: `02 - GA4 - begin_checkout`
- **Tipo**: `GA4 Event`
- **Parâmetros**:
  ```
  Event Name: begin_checkout
  Measurement ID: {{GA4 Measurement ID}}
  Event Parameters:
    - event_id: {{Event ID}}
    - items: 
      {
        "item_id": "ebook-controle-trips",
        "item_name": "E-book Sistema de Controle de Trips",
        "item_category": "E-book",
        "quantity": 1,
        "price": 39.90,
        "currency": "BRL"
      }
    - value: 39.90
    - currency: BRL
  User Properties:
    - email: {{Hashed Email}}
    - first_name: {{Hashed First Name}}
    - last_name: {{Hashed Last Name}}
    - phone: {{Hashed Phone}}
  ```
- **Trigger**: `initiate_checkout Event`

### TAG 03: Meta - ViewContent
- **Nome**: `03 - Meta - ViewContent`
- **Tipo**: `Meta Conversions API Event`
- **Parâmetros**:
  ```
  Pixel ID: {{Meta Pixel ID}}
  Event Name: ViewContent
  Event Time: {{Event Timestamp}}
  Event Source URL: {{Page URL}}
  Action Source: website
  Event ID: {{Event ID}}
  User Data:
    - em: {{Hashed Email}}
    - ph: {{Hashed Phone}}
    - fn: {{Hashed First Name}}
    - ln: {{Hashed Last Name}}
    - ct: {{City}}
    - st: {{State}}
    - zp: {{ZIP}}
    - country: {{Country}}
    - fbc: {{FBC Cookie}}
    - fbp: {{FBP Cookie}}
    - external_id: {{External ID}}
  Custom Data:
    - content_name: E-book Sistema de Controle de Trips
    - content_category: E-book
    - content_ids: ["ebook-controle-trips"]
    - content_type: product
    - value: 39.90
    - currency: BRL
  Test Event Code: TEST12345
  ```
- **Trigger**: `view_content Event`

### TAG 04: Meta - InitiateCheckout
- **Nome**: `04 - Meta - InitiateCheckout`
- **Tipo**: `Meta Conversions API Event`
- **Parâmetros**:
  ```
  Pixel ID: {{Meta Pixel ID}}
  Event Name: InitiateCheckout
  Event Time: {{Event Timestamp}}
  Event Source URL: {{Page URL}}
  Action Source: website
  Event ID: {{Event ID}}
  User Data:
    - em: {{Hashed Email}}
    - ph: {{Hashed Phone}}
    - fn: {{Hashed First Name}}
    - ln: {{Hashed Last Name}}
    - ct: {{City}}
    - st: {{State}}
    - zp: {{ZIP}}
    - country: {{Country}}
    - fbc: {{FBC Cookie}}
    - fbp: {{FBP Cookie}}
    - external_id: {{External ID}}
  Custom Data:
    - content_name: E-book Sistema de Controle de Trips
    - content_category: E-book
    - content_ids: ["ebook-controle-trips"]
    - content_type: product
    - value: 39.90
    - currency: BRL
    - num_items: 1
  Test Event Code: TEST12345
  ```
- **Trigger**: `initiate_checkout Event`

### TAG 05: Meta - PageView
- **Nome**: `05 - Meta - PageView`
- **Tipo**: `Meta Conversions API Event`
- **Parâmetros**:
  ```
  Pixel ID: {{Meta Pixel ID}}
  Event Name: PageView
  Event Time: {{Event Timestamp}}
  Event Source URL: {{Page URL}}
  Action Source: website
  Event ID: {{Event ID}}
  User Data:
    - em: {{Hashed Email}}
    - ph: {{Hashed Phone}}
    - fn: {{Hashed First Name}}
    - ln: {{Hashed Last Name}}
    - ct: {{City}}
    - st: {{State}}
    - zp: {{ZIP}}
    - country: {{Country}}
    - fbc: {{FBC Cookie}}
    - fbp: {{FBP Cookie}}
    - external_id: {{External ID}}
  Test Event Code: TEST12345
  ```
- **Trigger**: `PageView Event`

---

## 🎯 5. ORDEM DE CRIAÇÃO

1. **Criar Variáveis Constantes** (GA4 Measurement ID, Meta Pixel ID)
2. **Criar Variáveis de Event Data** (Event ID, Timestamp, Page URL)
3. **Criar Variáveis de Dados do Usuário** (Email, Name, Phone, Location)
4. **Criar Variáveis de Atribuição** (FBC, FBP, External ID)
5. **Criar Variáveis de Hashing** (Hashed Email, Hashed Name, etc.)
6. **Criar Triggers** (All Events, view_content, initiate_checkout, PageView)
7. **Criar Clients** (GA4, Meta, HTTP Request)
8. **Criar Tags** (GA4 e Meta Events)

---

## 🚀 6. TESTE DE VALIDAÇÃO

### Eventos de Teste:
```javascript
// Test Event 1: view_content
{
  "event": "view_content",
  "event_id": "test_view_12345",
  "timestamp": 1640995200000,
  "page_location": "https://maracujazeropragas.com",
  "user_data": {
    "email": "test@example.com",
    "first_name": "João",
    "last_name": "Silva",
    "phone": "+5511999998888",
    "city": "São Paulo",
    "state": "SP",
    "zip": "01234567",
    "country": "BR"
  },
  "fbc": "fb.1.1640995200.IwAR123456789",
  "fbp": "fb.1.1640995200.1234567890",
  "external_id": "user12345"
}

// Test Event 2: initiate_checkout
{
  "event": "initiate_checkout",
  "event_id": "test_checkout_12345",
  "timestamp": 1640995300000,
  "page_location": "https://maracujazeropragas.com/checkout",
  "user_data": {
    "email": "test@example.com",
    "first_name": "João",
    "last_name": "Silva",
    "phone": "+5511999998888",
    "city": "São Paulo",
    "state": "SP",
    "zip": "01234567",
    "country": "BR"
  },
  "fbc": "fb.1.1640995200.IwAR123456789",
  "fbp": "fb.1.1640995200.1234567890",
  "external_id": "user12345"
}
```

---

## 📊 7. MENSAGENS DE SUCESSO ESPERADAS

### GA4 DebugView:
- ✅ Evento: `view_item`
- ✅ Evento: `begin_checkout`
- ✅ Parâmetros: `event_id`, `items`, `value`, `currency`

### Meta Events Manager:
- ✅ Evento: `ViewContent`
- ✅ Evento: `InitiateCheckout`
- ✅ Evento: `PageView`
- ✅ Test Code: `TEST12345`

### Sua API Next.js:
- ✅ Endpoint: `/api/gtm-server`
- ✅ Status: `200 OK`
- ✅ EMQ Score: `≥ 8.0`

---

## 🔧 8. CONFIGURAÇÃO ADICIONAL

### GA4 API Secret:
1. Vá para GA4 Admin → Data Streams → Configure tag settings
2. Copie o "Measurement Protocol API Secret"
3. Adicione ao Client GA4 no GTM Server

### Meta Test Events:
1. Vá para Meta Events Manager
2. Configure test events com o código: `TEST12345`
3. Verifique eventos chegando em tempo real

### Debug Mode:
1. Use GTM Preview Mode
2. Verifique no DebugView do GA4
3. Monitore Meta Test Events

---

## 🎯 RESUMO FINAL

**Total de Elementos:**
- **3 Clients**: GA4, Meta, HTTP Request
- **5 Tags**: 2 GA4 + 3 Meta
- **4 Triggers**: All Events + 3 Específicos
- **20 Variáveis**: Constantes, Event Data, Hashing

**Mapeamento de Eventos:**
- `view_content` → `view_item` (GA4) + `ViewContent` (Meta)
- `initiate_checkout` → `begin_checkout` (GA4) + `InitiateCheckout` (Meta)
- `page_view` → `PageView` (Meta)

**EMQ Target:** ≥ 8.0 para todos os eventos

**Pronto para produção!** 🚀