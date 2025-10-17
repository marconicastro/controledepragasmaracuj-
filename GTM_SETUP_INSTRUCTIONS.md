# 🚨 Instruções para Configurar GTM - Correção de Tags Não Disparadas

## 📊 Diagnóstico do Problema

Baseado no Google Tag Assistant, as seguintes tags NÃO estão disparando:
- ❌ GA4 - view_item
- ❌ GA4 - begin_checkout  
- ❌ GTM Server - initiate_checkout
- ❌ GTM Server - view_content
- ❌ Meta - ViewContent
- ❌ Meta - InitiateCheckout

## 🔧 Solução: Configurar Gatilhos no GTM

### Passo 1: Acessar GTM
1. Vá para [Google Tag Manager](https://tagmanager.google.com)
2. Selecione o container: `GTM-567XZCDX`
3. Clique em "Tags" no menu lateral

### Passo 2: Configurar Gatilhos para Eventos Personalizados

#### Para GA4 - view_item:
1. Encontre a tag "GA4 - view_item"
2. Clique na tag > "Triggering" > "Add" > "Trigger Configuration"
3. Selecione "Custom Event"
4. Event Name: `view_item`
5. This trigger fires on: "All Custom Events"
6. Salve como "Custom Event - view_item"

#### Para GA4 - begin_checkout:
1. Encontre a tag "GA4 - begin_checkout"
2. Clique na tag > "Triggering" > "Add" > "Trigger Configuration"
3. Selecione "Custom Event"
4. Event Name: `begin_checkout`
5. This trigger fires on: "All Custom Events"
6. Salve como "Custom Event - begin_checkout"

#### Para Meta - ViewContent:
1. Encontre a tag "Meta - ViewContent"
2. Clique na tag > "Triggering" > "Add" > "Trigger Configuration"
3. Selecione "Custom Event"
4. Event Name: `ViewContent`
5. This trigger fires on: "All Custom Events"
6. Salve como "Custom Event - ViewContent"

#### Para Meta - InitiateCheckout:
1. Encontre a tag "Meta - InitiateCheckout"
2. Clique na tag > "Triggering" > "Add" > "Trigger Configuration"
3. Selecione "Custom Event"
4. Event Name: `InitiateCheckout`
5. This trigger fires on: "All Custom Events"
6. Salve como "Custom Event - InitiateCheckout"

#### Para GTM Server - view_content:
1. Encontre a tag "GTM Server - view_content"
2. Clique na tag > "Triggering" > "Add" > "Trigger Configuration"
3. Selecione "Custom Event"
4. Event Name: `view_content`
5. This trigger fires on: "All Custom Events"
6. Salve como "Custom Event - view_content"

#### Para GTM Server - initiate_checkout:
1. Encontre a tag "GTM Server - initiate_checkout"
2. Clique na tag > "Triggering" > "Add" > "Trigger Configuration"
3. Selecione "Custom Event"
4. Event Name: `initiate_checkout`
5. This trigger fires on: "All Custom Events"
6. Salve como "Custom Event - initiate_checkout"

### Passo 3: Publicar Alterações
1. Clique em "Submit" no canto superior direito
2. Descrição da versão: "Configurar gatilhos para eventos view_item e begin_checkout"
3. Clique em "Publish"

### Passo 4: Testar com Google Tag Assistant
1. Abra o site em uma nova aba
2. Abra o Google Tag Assistant
3. Espere 5 segundos para o evento view_content
4. Clique no botão de checkout para testar initiate_checkout
5. Verifique se todas as tags estão disparando

## 🧪 Testes via Console

Para testar manualmente, use o console do navegador:

```javascript
// Testar view_content
window.advancedTracking.testViewContent();

// Testar initiate_checkout
window.advancedTracking.testCheckout();

// Verificar status do tracking
window.advancedTracking.checkTrackingStatus();

// Testar PageView
window.advancedTracking.testPageView();
```

## 📋 Eventos Enviados pelo Código

O código agora envia os seguintes eventos para o dataLayer:

### Evento view_content:
```javascript
{
  event: 'view_item',           // GA4
  event_id: 'view_content_1234567890_abc123_gtm',
  user_data: { ... },
  custom_data: { ... }
}

{
  event: 'ViewContent',         // Meta
  event_id: 'view_content_1234567890_abc123_gtm',
  user_data: { ... },
  custom_data: { ... }
}

{
  event: 'view_content',        // GTM Server
  event_id: 'view_content_1234567890_abc123_gtm',
  user_data: { ... },
  custom_data: { ... }
}
```

### Evento initiate_checkout:
```javascript
{
  event: 'begin_checkout',      // GA4
  event_id: 'initiate_checkout_1234567890_abc123_gtm',
  user_data: { ... },
  custom_data: { ... }
}

{
  event: 'InitiateCheckout',    // Meta
  event_id: 'initiate_checkout_1234567890_abc123_gtm',
  user_data: { ... },
  custom_data: { ... }
}

{
  event: 'initiate_checkout',   // GTM Server
  event_id: 'initiate_checkout_1234567890_abc123_gtm',
  user_data: { ... },
  custom_data: { ... }
}
```

## ✅ Verificação Final

Após configurar os gatilhos, todas as tags devem disparar:

**Tags que devem disparar:**
- ✅ GA4 Configuration (já funcionando)
- ✅ Meta Pixel Base (já funcionando)
- ✅ GTM Server - page_view (já funcionando)
- ✅ GA4 - view_item (agora configurado)
- ✅ GA4 - begin_checkout (agora configurado)
- ✅ GTM Server - initiate_checkout (agora configurado)
- ✅ GTM Server - view_content (agora configurado)
- ✅ Meta - ViewContent (agora configurado)
- ✅ Meta - InitiateCheckout (agora configurado)

## 🚨 Importante

- Os eventos são enviados após 5 segundos (view_content)
- O evento initiate_checkout é enviado ao clicar no botão de checkout
- Cada evento tem um ID único para evitar duplicação
- O sistema envia múltiplos formatos para compatibilidade

---

*Atualizado: 2025-06-20*  
*Problema: Tags não disparando devido à falta de gatilhos*  
*Solução: Configurar gatilhos de eventos personalizados no GTM*