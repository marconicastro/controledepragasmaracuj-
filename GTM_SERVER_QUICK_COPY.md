# 🎯 GTM Server - Configuração Rápida (Copy & Paste)

## 🔧 CLIENTS

### Client 1: GA4 Measurement
```
Nome: 01 - GA4 Client
Tipo: GA4 Measurement
Measurement ID: G-CZ0XMXL3RX
Server Container URL: https://data.maracujazeropragas.com
Transport URL: https://data.maracujazeropragas.com
Send to Server Container: true
Trigger: All Events
```

### Client 2: Meta Conversions API
```
Nome: 02 - Meta Conversions API Client
Tipo: Meta Conversions API
Pixel ID: 714277868320104
Access Token: EAAUsqHMv8GcBPlCK8fZCCwQzeWZCHF7ahXf6ZC98FcbiHFdFTykqE58YUksFpe7kAFkUzimeH178A3cZCng1Y8HafbNFKw12h0UeUKzJ4EL2CkHln15yZBoFf2PuMBEJNKXvAKJn8iyuk3AdelxYYpAyKtVjfoEIK3uWFwHrqwds6M1jIE7CCObThayaV8gZDZD
Test Event Code: TEST12345
Enable Test Events: true
Trigger: All Events
```

### Client 3: HTTP Request
```
Nome: 03 - HTTP Request Client
Tipo: HTTP Request
Request URL: https://data.maracujazeropragas.com/api/gtm-server
Request Method: POST
Headers: Content-Type: application/json
Include Event Parameters: true
Include User Properties: true
Trigger: Custom Events
```

---

## ⚡ TRIGGERS

### Trigger 1: All Events
```
Nome: All Events
Tipo: Custom Event
Filtro: Event Name contains {{_event_name}}
```

### Trigger 2: view_content Event
```
Nome: view_content Event
Tipo: Custom Event
Filtro: Event Name equals view_content
```

### Trigger 3: initiate_checkout Event
```
Nome: initiate_checkout Event
Tipo: Custom Event
Filtro: Event Name equals initiate_checkout
```

### Trigger 4: PageView Event
```
Nome: PageView Event
Tipo: Custom Event
Filtro: Event Name equals page_view
```

---

## 🔧 VARIÁVEIS

### Constantes
```
GA4 Measurement ID = G-CZ0XMXL3RX
Meta Pixel ID = 714277868320104
```

### Event Data
```
Event ID = event_id
Event Timestamp = timestamp
Page URL = page_location
```

### User Data
```
Event Email = user_data.email
Event First Name = user_data.first_name
Event Last Name = user_data.last_name
Event Phone = user_data.phone
City = user_data.city
State = user_data.state
ZIP = user_data.zip
Country = user_data.country
```

### Attribution
```
FBC Cookie = fbc
FBP Cookie = fbp
External ID = external_id
```

### Hashing JavaScript
```javascript
// Hashed Email
function() {
  var email = {{Event Email}};
  if (email) {
    email = email.toLowerCase().trim();
    var buffer = new TextEncoder().encode(email);
    return crypto.subtle.digest('SHA-256', buffer).then(function(hash) {
      var hashArray = Array.from(new Uint8Array(hash));
      return hashArray.map(function(b) {
        return ('00' + b.toString(16)).slice(-2);
      }).join('');
    });
  }
  return undefined;
}

// Hashed First Name
function() {
  var firstName = {{Event First Name}};
  if (firstName) {
    firstName = firstName.toLowerCase().trim();
    var buffer = new TextEncoder().encode(firstName);
    return crypto.subtle.digest('SHA-256', buffer).then(function(hash) {
      var hashArray = Array.from(new Uint8Array(hash));
      return hashArray.map(function(b) {
        return ('00' + b.toString(16)).slice(-2);
      }).join('');
    });
  }
  return undefined;
}

// Hashed Last Name
function() {
  var lastName = {{Event Last Name}};
  if (lastName) {
    lastName = lastName.toLowerCase().trim();
    var buffer = new TextEncoder().encode(lastName);
    return crypto.subtle.digest('SHA-256', buffer).then(function(hash) {
      var hashArray = Array.from(new Uint8Array(hash));
      return hashArray.map(function(b) {
        return ('00' + b.toString(16)).slice(-2);
      }).join('');
    });
  }
  return undefined;
}

// Hashed Phone
function() {
  var phone = {{Event Phone}};
  if (phone) {
    phone = phone.replace(/[^0-9]/g, '');
    var buffer = new TextEncoder().encode(phone);
    return crypto.subtle.digest('SHA-256', buffer).then(function(hash) {
      var hashArray = Array.from(new Uint8Array(hash));
      return hashArray.map(function(b) {
        return ('00' + b.toString(16)).slice(-2);
      }).join('');
    });
  }
  return undefined;
}
```

---

## 🏷️ TAGS

### Tag 1: GA4 - view_item
```
Nome: 01 - GA4 - view_item
Tipo: GA4 Event
Event Name: view_item
Measurement ID: {{GA4 Measurement ID}}
Event Parameters:
  event_id: {{Event ID}}
  items: {"item_id":"ebook-controle-trips","item_name":"E-book Sistema de Controle de Trips","item_category":"E-book","quantity":1,"price":39.90,"currency":"BRL"}
  value: 39.90
  currency: BRL
Trigger: view_content Event
```

### Tag 2: GA4 - begin_checkout
```
Nome: 02 - GA4 - begin_checkout
Tipo: GA4 Event
Event Name: begin_checkout
Measurement ID: {{GA4 Measurement ID}}
Event Parameters:
  event_id: {{Event ID}}
  items: {"item_id":"ebook-controle-trips","item_name":"E-book Sistema de Controle de Trips","item_category":"E-book","quantity":1,"price":39.90,"currency":"BRL"}
  value: 39.90
  currency: BRL
User Properties:
  email: {{Hashed Email}}
  first_name: {{Hashed First Name}}
  last_name: {{Hashed Last Name}}
  phone: {{Hashed Phone}}
Trigger: initiate_checkout Event
```

### Tag 3: Meta - ViewContent
```
Nome: 03 - Meta - ViewContent
Tipo: Meta Conversions API Event
Pixel ID: {{Meta Pixel ID}}
Event Name: ViewContent
Event Time: {{Event Timestamp}}
Event Source URL: {{Page URL}}
Action Source: website
Event ID: {{Event ID}}
User Data:
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
Custom Data:
  content_name: E-book Sistema de Controle de Trips
  content_category: E-book
  content_ids: ["ebook-controle-trips"]
  content_type: product
  value: 39.90
  currency: BRL
Test Event Code: TEST12345
Trigger: view_content Event
```

### Tag 4: Meta - InitiateCheckout
```
Nome: 04 - Meta - InitiateCheckout
Tipo: Meta Conversions API Event
Pixel ID: {{Meta Pixel ID}}
Event Name: InitiateCheckout
Event Time: {{Event Timestamp}}
Event Source URL: {{Page URL}}
Action Source: website
Event ID: {{Event ID}}
User Data:
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
Custom Data:
  content_name: E-book Sistema de Controle de Trips
  content_category: E-book
  content_ids: ["ebook-controle-trips"]
  content_type: product
  value: 39.90
  currency: BRL
  num_items: 1
Test Event Code: TEST12345
Trigger: initiate_checkout Event
```

### Tag 5: Meta - PageView
```
Nome: 05 - Meta - PageView
Tipo: Meta Conversions API Event
Pixel ID: {{Meta Pixel ID}}
Event Name: PageView
Event Time: {{Event Timestamp}}
Event Source URL: {{Page URL}}
Action Source: website
Event ID: {{Event ID}}
User Data:
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
Test Event Code: TEST12345
Trigger: PageView Event
```

---

## 🎯 ORDEM DE CRIAÇÃO

1. Variáveis Constantes
2. Variáveis Event Data
3. Variáveis User Data
4. Variáveis Attribution
5. Variáveis Hashing (JavaScript)
6. Triggers
7. Clients
8. Tags

---

## 📊 EVENT MAPPING

```
view_content → view_item (GA4) + ViewContent (Meta)
initiate_checkout → begin_checkout (GA4) + InitiateCheckout (Meta)
page_view → PageView (Meta)
```

**EMQ Target: ≥ 8.0**