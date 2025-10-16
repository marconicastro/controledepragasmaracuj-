# 🚀 Guia de Implementação GTM Server - Ebook Trips

## 📋 Visão Geral

Este guia contém as configurações completas para alinhar seu GTM Web (GTM-567XZCDX) com o GTM Server, garantindo 100% de compatibilidade e máxima Event Matching Quality (EMQ).

## 🏗️ Arquitetura Implementada

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   GTM Web       │───▶│  Next.js API     │───▶│   GTM Server    │
│  GTM-567XZCDX   │    │  /api/gtm-server │    │  Stape/Server   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │
                                ▼
                        ┌─────────────────┐
                        │  GA4 + Meta CAPI │
                        │   (Plataformas) │
                        └─────────────────┘
```

## ⚙️ Configurações GTM Server

### 1. Clientes (Clients)

#### 01 - GA4 Client
```json
{
  "name": "01 - GA4 Client",
  "type": "ga4_measurement",
  "parameters": {
    "measurement_id": "G-CZ0XMXL3RX",
    "server_container_url": "https://data.maracujazeropragas.com",
    "transport_url": "https://data.maracujazeropragas.com"
  }
}
```

#### 02 - Meta Conversions API Client
```json
{
  "name": "02 - Meta Conversions API Client",
  "type": "meta_capi",
  "parameters": {
    "pixel_id": "714277868320104",
    "access_token": "EAAUsqHMv8GcBPlCK8fZCCwQzeWZCHF7ahXf6ZC98FcbiHFdFTykqE58YUksFpe7kAFkUzimeH178A3cZCng1Y8HafbNFKw12h0UeUKzJ4EL2CkHln15yZBoFf2PuMBEJNKXvAKJn8iyuk3AdelxYYpAyKtVjfoEIK3uWFwHrqwds6M1jIE7CCObThayaV8gZDZD",
    "test_event_code": "TEST12345"
  }
}
```

### 2. Tags

#### GA4 Events
- **01 - GA4 - view_item**: Dispara em `view_content`
- **02 - GA4 - begin_checkout**: Dispara em `initiate_checkout`

#### Meta CAPI Events  
- **03 - Meta - ViewContent**: Dispara em `view_content`
- **04 - Meta - InitiateCheckout**: Dispara em `initiate_checkout`
- **05 - Meta - PageView**: Dispara em `page_view`

### 3. Triggers

- **view_content Event**: `{{_event_name}} equals view_content`
- **initiate_checkout Event**: `{{_event_name}} equals initiate_checkout`
- **PageView Event**: `{{_event_name}} equals page_view`

### 4. Variáveis Principais

#### Constantes
- `GA4 Measurement ID`: `G-CZ0XMXL3RX`
- `Meta Pixel ID`: `714277868320104`

#### Event Data Parameters
- `Event ID`: `event_id`
- `Page URL`: `page_location`
- `Event Email`: `user_data.email`
- `Event Phone`: `user_data.phone`
- `FBC Cookie`: `fbc`
- `FBP Cookie`: `fbp`

#### Custom JavaScript (Hashing)
- `Hashed Email`: SHA256(email.toLowerCase().trim())
- `Hashed Phone`: SHA256(phone.replace(/[^0-9]/g, ''))
- `Hashed First Name`: SHA256(first_name.toLowerCase().trim())
- `Hashed Last Name`: SHA256(last_name.toLowerCase().trim())

## 🔧 Ajustes no GTM Web

### 1. Tag Google Principal

Certifique-se que a tag "01 - TAG do Google" está configurada com:

```javascript
server_container_url: https://data.maracujazeropragas.com
transport_url: https://data.maracujazeropragas.com
```

### 2. Event Data Layer

Seu dataLayer deve seguir este padrão:

```javascript
// view_content
window.dataLayer = window.dataLayer || [];
dataLayer.push({
  event: 'view_content',
  event_id: 'unique_event_id_12345',
  user_data: {
    em: 'hashed_email@example.com',
    ph: 'hashed_phone',
    fn: 'hashed_first_name',
    ln: 'hashed_last_name'
  },
  fbc: 'fb.123456789.abcdef',
  fbp: 'fb.1.123456789.abcdef'
});

// initiate_checkout
dataLayer.push({
  event: 'initiate_checkout',
  event_id: 'unique_event_id_67890',
  user_data: {
    em: 'user@example.com',
    ph: '+5511999998888',
    fn: 'João',
    ln: 'Silva',
    ct: 'São Paulo',
    st: 'SP',
    zp: '01310-100',
    country: 'BR'
  },
  value: 39.90,
  currency: 'BRL'
});
```

## 📊 Mapeamento de Eventos

| Evento GTM Web | GA4 Event | Meta Event | Trigger |
|----------------|------------|-------------|---------|
| `view_content` | `view_item` | `ViewContent` | Custom Event |
| `initiate_checkout` | `begin_checkout` | `InitiateCheckout` | Custom Event |
| `page_view` | `page_view` | `PageView` | Initialization |

## 🔐 PII Hashing

Todos os dados pessoais são hasheados usando SHA-256:

- **Email**: `sha256(email.toLowerCase().trim())`
- **Phone**: `sha256(phone.replace(/[^0-9]/g, ''))`
- **First Name**: `sha256(first_name.toLowerCase().trim())`
- **Last Name**: `sha256(last_name.toLowerCase().trim())`

## 📈 EMQ Score Calculation

O sistema calcula o Event Matching Quality baseado em:

- **Event ID** (30%): Obrigatório para deduplicação
- **User Data** (30%): Email, phone, first_name, last_name
- **Cookies** (20%): fbc, fbp
- **UTM Parameters** (20%): utm_source, utm_medium, utm_campaign, etc.

**Meta**: EMQ Score ≥ 8.0

## 🚀 Testes e Validação

### 1. Testar API Local

```bash
curl -X POST http://localhost:3000/api/gtm-server \
  -H "Content-Type: application/json" \
  -d '{
    "event_name": "view_content",
    "event_id": "test_12345",
    "timestamp": 1625097600000,
    "page_location": "https://ebooktrips.com.br",
    "user_data": {
      "email": "test@example.com",
      "first_name": "Test",
      "last_name": "User"
    },
    "fbc": "fb.123456789.abcdef",
    "fbp": "fb.1.123456789.abcdef"
  }'
```

### 2. Health Check

```bash
curl http://localhost:3000/api/gtm-server
```

### 3. Monitoramento

Acesse `/performance` para monitorar:
- Taxa de sucesso dos eventos
- EMQ Score médio
- Latência de processamento
- Status dos destinos (GA4, Meta)

## 🎯 Produtos Configurados

```json
{
  "item_id": "ebook-controle-trips",
  "item_name": "E-book Sistema de Controle de Trips",
  "category": "E-book",
  "price": 39.90,
  "currency": "BRL"
}
```

## ⚠️ Configurações Importantes

### 1. GA4 API Secret

Configure no GA4:
1. Vá para Admin → Data Streams → Escolha seu stream
2. Configure measurement protocol
3. Crie um API Secret
4. Atualize `GT M_CONFIG.GA4.API_SECRET`

### 2. Meta Test Events

Use `TEST12345` como `test_event_code` durante os testes.

### 3. Domínios Configurados

- **Server URL**: `https://data.maracujazeropragas.com`
- **Web Container**: `GTM-567XZCDX`

## 🔍 Debug e Troubleshooting

### 1. Verificar Logs

```bash
# Verificar logs de desenvolvimento
npm run dev

# Logs específicos da API
tail -f /home/z/my-project/dev.log
```

### 2. Common Issues

- **EMQ Score Baixo**: Verifique se event_id, user_data e cookies estão presentes
- **Falha GA4**: Confirme API_SECRET e MEASUREMENT_ID
- **Falha Meta**: Verifique ACCESS_TOKEN e PIXEL_ID

### 3. Ferramentas de Debug

- **GTM Preview Mode**: Para testar tags
- **GA4 DebugView**: Para verificar eventos GA4
- **Meta Test Events**: Para testar Conversions API

## 📱 Implementação Mobile

Para implementar em apps mobile:

```javascript
// React Native Example
import { NativeModules } from 'react-native';

const trackEvent = (eventName, userData) => {
  fetch('https://data.maracujazeropragas.com/api/gtm-server', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      event_name: eventName,
      event_id: generateEventId(),
      timestamp: Date.now(),
      user_data: userData,
      // ... outros dados
    })
  });
};
```

## 🎉 Próximos Passos

1. ✅ Configurar GTM Server com as especificações acima
2. ✅ Testar eventos com `test_event_code: "TEST12345"`
3. ✅ Remover test events e ir para produção
4. ✅ Monitorar performance via dashboard `/performance`
5. ✅ Otimizar com base nos EMQ Scores

---

**Suporte**: Se precisar de ajuda, verifique os logs em `/performance` ou use o endpoint `/debug` para testes avançados.