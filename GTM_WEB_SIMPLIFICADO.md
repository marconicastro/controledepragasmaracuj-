# 🌐 GTM WEB - Configuração Simplificada (Apenas 3 Eventos)

## 📋 INFORMAÇÕES INICIAIS
- **Web Container ID**: `GTM-567XZCDX`
- **Produto**: E-book Sistema de Controle de Trips
- **Preço**: R$ 39,90
- **Moeda**: BRL
- **Eventos**: page_view, view_content, initiate_checkout

---

## 🔧 PARTE 1: VARIÁVEIS (Copiar e Colar)

### VARIÁVEL 1: Nome do Produto
```
Nome: Nome do Produto
Tipo: Constante
Valor: E-book Sistema de Controle de Trips
```

### VARIÁVEL 2: ID do Produto
```
Nome: ID do Produto
Tipo: Constante
Valor: ebook-controle-trips
```

### VARIÁVEL 3: Categoria do Produto
```
Nome: Categoria do Produto
Tipo: Constante
Valor: E-book
```

### VARIÁVEL 4: Preço do Produto
```
Nome: Preço do Produto
Tipo: Constante
Valor: 39.90
```

### VARIÁVEL 5: Moeda
```
Nome: Moeda
Tipo: Constante
Valor: BRL
```

### VARIÁVEL 6: URL da Página
```
Nome: URL da Página
Tipo: Variável de JavaScript
Código JavaScript: window.location.href
```

### VARIÁVEL 7: Título da Página
```
Nome: Título da Página
Tipo: Variável de JavaScript
Código JavaScript: document.title
```

### VARIÁVEL 8: GA4 Measurement ID
```
Nome: GA4 Measurement ID
Tipo: Constante
Valor: G-CZ0XMXL3RX
```

### VARIÁVEL 9: Meta Pixel ID
```
Nome: Meta Pixel ID
Tipo: Constante
Valor: 714277868320104
```

### VARIÁVEL 10: User Agent
```
Nome: User Agent
Tipo: Variável de JavaScript
Código JavaScript: navigator.userAgent
```

### VARIÁVEL 11: Timestamp
```
Nome: Timestamp
Tipo: Variável de JavaScript
Código JavaScript: Date.now()
```

### VARIÁVEL 12: Random ID
```
Nome: Random ID
Tipo: Variável de JavaScript
Código JavaScript: 'id_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now()
```

### VARIÁVEL 13: Session ID
```
Nome: Session ID
Tipo: Variável de JavaScript
Código JavaScript: 
function() {
  var sessionId = sessionStorage.getItem('gtm_session_id');
  if (!sessionId) {
    sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    sessionStorage.setItem('gtm_session_id', sessionId);
  }
  return sessionId;
}
```

### VARIÁVEL 14: FBC Cookie
```
Nome: FBC Cookie
Tipo: Cookie de Primeira Parte
Nome do Cookie: _fbc
```

### VARIÁVEL 15: FBP Cookie
```
Nome: FBP Cookie
Tipo: Cookie de Primeira Parte
Nome do Cookie: _fbp
```

### VARIÁVEL 16: Client ID GA4
```
Nome: Client ID GA4
Tipo: Variável de JavaScript
Código JavaScript:
function() {
  try {
    var gaCookie = document.cookie.split('; ').find(function(row) {
      return row.startsWith('_ga=');
    });
    if (gaCookie) {
      var gaValue = gaCookie.split('=')[1];
      var parts = gaValue.split('.');
      if (parts.length >= 4) {
        return parts[2] + '.' + parts[3];
      }
    }
  } catch(e) {
    console.log('Erro ao obter Client ID:', e);
  }
  return 'unknown';
}
```

### VARIÁVEL 17: Email do Usuário
```
Nome: Email do Usuário
Tipo: Variável da Camada de Dados
Nome da Variável da Camada de Dados: user.email
```

### VARIÁVEL 18: Nome do Usuário
```
Nome: Nome do Usuário
Tipo: Variável da Camada de Dados
Nome da Variável da Camada de Dados: user.firstName
```

### VARIÁVEL 19: Sobrenome do Usuário
```
Nome: Sobrenome do Usuário
Tipo: Variável da Camada de Dados
Nome da Variável da Camada de Dados: user.lastName
```

### VARIÁVEL 20: Telefone do Usuário
```
Nome: Telefone do Usuário
Tipo: Variável da Camada de Dados
Nome da Variável da Camada de Dados: user.phone
```

### VARIÁVEL 21: Cidade do Usuário
```
Nome: Cidade do Usuário
Tipo: Variável da Camada de Dados
Nome da Variável da Camada de Dados: user.city
```

### VARIÁVEL 22: Estado do Usuário
```
Nome: Estado do Usuário
Tipo: Variável da Camada de Dados
Nome da Variável da Camada de Dados: user.state
```

### VARIÁVEL 23: CEP do Usuário
```
Nome: CEP do Usuário
Tipo: Variável da Camada de Dados
Nome da Variável da Camada de Dados: user.zip
```

### VARIÁVEL 24: País do Usuário
```
Nome: País do Usuário
Tipo: Variável da Camada de Dados
Nome da Variável da Camada de Dados: user.country
```

---

## ⚡ PARTE 2: TRIGGERS (Copiar e Colar)

### TRIGGER 1: All Pages
```
Nome: All Pages
Tipo: Visualização de Página - Todas as Páginas
Este trigger é acionado em todas as visualizações de página
```

### TRIGGER 2: view_content - Custom Event
```
Nome: view_content - Custom Event
Tipo: Evento Personalizado
Nome do Evento: view_content
Este trigger é acionado quando o evento view_content é enviado para a camada de dados
```

### TRIGGER 3: initiate_checkout - Custom Event
```
Nome: initiate_checkout - Custom Event
Tipo: Evento Personalizado
Nome do Evento: initiate_checkout
Este trigger é acionado quando o evento initiate_checkout é enviado para a camada de dados
```

---

## 🏷️ PARTE 3: TAGS (Copiar e Colar)

### TAG 1: GA4 Configuration
```
Nome: GA4 Configuration
Tipo: Tag do Google Analytics: Configuração do GA4
ID da Medição: {{GA4 Measurement ID}}
Enviar para um servidor: true
URL do servidor: https://data.maracujazeropragas.com
Trigger: All Pages
```

### TAG 2: Meta Pixel Base
```
Nome: Meta Pixel Base
Tipo: Tag de Imagem Personalizada
HTML:
<script>
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '{{Meta Pixel ID}}');
fbq('track', 'PageView');
</script>
<noscript><img height="1" width="1" style="display:none"
src="https://www.facebook.com/tr?id={{Meta Pixel ID}}&ev=PageView&noscript=1"
/></noscript>
Trigger: All Pages
```

### TAG 3: GA4 - view_item
```
Nome: GA4 - view_item
Tipo: Tag do Google Analytics: Evento GA4
ID da Medição: {{GA4 Measurement ID}}
Nome do Evento: view_item
Parâmetros do Evento:
  event_id: {{Random ID}}
  items: [{"item_id":"{{ID do Produto}}","item_name":"{{Nome do Produto}}","item_category":"{{Categoria do Produto}}","quantity":1,"price":{{Preço do Produto}},"currency":"{{Moeda}}"}]
  value: {{Preço do Produto}}
  currency: {{Moeda}}
Trigger: view_content - Custom Event
```

### TAG 4: Meta - ViewContent
```
Nome: Meta - ViewContent
Tipo: Tag de Imagem Personalizada
HTML:
<script>
fbq('track', 'ViewContent', {
  content_name: '{{Nome do Produto}}',
  content_category: '{{Categoria do Produto}}',
  content_ids: ['{{ID do Produto}}'],
  content_type: 'product',
  value: {{Preço do Produto}},
  currency: '{{Moeda}}'
});
</script>
Trigger: view_content - Custom Event
```

### TAG 5: GA4 - begin_checkout
```
Nome: GA4 - begin_checkout
Tipo: Tag do Google Analytics: Evento GA4
ID da Medição: {{GA4 Measurement ID}}
Nome do Evento: begin_checkout
Parâmetros do Evento:
  event_id: {{Random ID}}
  items: [{"item_id":"{{ID do Produto}}","item_name":"{{Nome do Produto}}","item_category":"{{Categoria do Produto}}","quantity":1,"price":{{Preço do Produto}},"currency":"{{Moeda}}"}]
  value: {{Preço do Produto}}
  currency: {{Moeda}}
Trigger: initiate_checkout - Custom Event
```

### TAG 6: Meta - InitiateCheckout
```
Nome: Meta - InitiateCheckout
Tipo: Tag de Imagem Personalizada
HTML:
<script>
fbq('track', 'InitiateCheckout', {
  content_name: '{{Nome do Produto}}',
  content_category: '{{Categoria do Produto}}',
  content_ids: ['{{ID do Produto}}'],
  content_type: 'product',
  value: {{Preço do Produto}},
  currency: '{{Moeda}}',
  num_items: 1
});
</script>
Trigger: initiate_checkout - Custom Event
```

### TAG 7: GTM Server - view_content
```
Nome: GTM Server - view_content
Tipo: Tag de Imagem Personalizada
HTML:
<script>
(function() {
  var eventData = {
    event_name: 'view_content',
    event_id: 'view_content_' + Date.now() + '_{{Random ID}}_gtm_web',
    session_id: '{{Session ID}}',
    timestamp: {{Timestamp}},
    page_location: '{{URL da Página}}',
    user_data: {
      em: '{{Email do Usuário}}' || '',
      ph: '{{Telefone do Usuário}}' || '',
      fn: '{{Nome do Usuário}}' || '',
      ln: '{{Sobrenome do Usuário}}' || '',
      ct: '{{Cidade do Usuário}}' || '',
      st: '{{Estado do Usuário}}' || '',
      zp: '{{CEP do Usuário}}' || '',
      country: '{{País do Usuário}}' || 'BR',
      ga_client_id: '{{Client ID GA4}}',
      fbc: '{{FBC Cookie}}',
      fbp: '{{FBP Cookie}}',
      external_id: null
    },
    custom_data: {
      currency: '{{Moeda}}',
      value: {{Preço do Produto}},
      content_name: '{{Nome do Produto}}',
      content_category: '{{Categoria do Produto}}',
      content_ids: ['{{ID do Produto}}'],
      items: []
    },
    headers: {
      user_agent: '{{User Agent}}'
    }
  };
  
  fetch('https://data.maracujazeropragas.com/api/gtm-server', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(eventData)
  }).catch(function(error) {
    console.log('Erro ao enviar para GTM Server:', error);
  });
})();
</script>
Trigger: view_content - Custom Event
```

### TAG 8: GTM Server - initiate_checkout
```
Nome: GTM Server - initiate_checkout
Tipo: Tag de Imagem Personalizada
HTML:
<script>
(function() {
  var eventData = {
    event_name: 'initiate_checkout',
    event_id: 'initiate_checkout_' + Date.now() + '_{{Random ID}}_gtm_web',
    session_id: '{{Session ID}}',
    timestamp: {{Timestamp}},
    page_location: '{{URL da Página}}',
    user_data: {
      em: '{{Email do Usuário}}' || '',
      ph: '{{Telefone do Usuário}}' || '',
      fn: '{{Nome do Usuário}}' || '',
      ln: '{{Sobrenome do Usuário}}' || '',
      ct: '{{Cidade do Usuário}}' || '',
      st: '{{Estado do Usuário}}' || '',
      zp: '{{CEP do Usuário}}' || '',
      country: '{{País do Usuário}}' || 'BR',
      ga_client_id: '{{Client ID GA4}}',
      fbc: '{{FBC Cookie}}',
      fbp: '{{FBP Cookie}}',
      external_id: null
    },
    custom_data: {
      currency: '{{Moeda}}',
      value: {{Preço do Produto}},
      content_name: '{{Nome do Produto}}',
      content_category: '{{Categoria do Produto}}',
      content_ids: ['{{ID do Produto}}'],
      items: []
    },
    headers: {
      user_agent: '{{User Agent}}'
    }
  };
  
  fetch('https://data.maracujazeropragas.com/api/gtm-server', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(eventData)
  }).catch(function(error) {
    console.log('Erro ao enviar para GTM Server:', error);
  });
})();
</script>
Trigger: initiate_checkout - Custom Event
```

### TAG 9: GTM Server - page_view
```
Nome: GTM Server - page_view
Tipo: Tag de Imagem Personalizada
HTML:
<script>
(function() {
  var eventData = {
    event_name: 'page_view',
    event_id: 'page_view_' + Date.now() + '_{{Random ID}}_gtm_web',
    session_id: '{{Session ID}}',
    timestamp: {{Timestamp}},
    page_location: '{{URL da Página}}',
    user_data: {
      em: '{{Email do Usuário}}' || '',
      ph: '{{Telefone do Usuário}}' || '',
      fn: '{{Nome do Usuário}}' || '',
      ln: '{{Sobrenome do Usuário}}' || '',
      ct: '{{Cidade do Usuário}}' || '',
      st: '{{Estado do Usuário}}' || '',
      zp: '{{CEP do Usuário}}' || '',
      country: '{{País do Usuário}}' || 'BR',
      ga_client_id: '{{Client ID GA4}}',
      fbc: '{{FBC Cookie}}',
      fbp: '{{FBP Cookie}}',
      external_id: null
    },
    custom_data: {
      currency: '{{Moeda}}',
      value: 0,
      page_title: '{{Título da Página}}',
      page_location: '{{URL da Página}}',
      page_path: window.location.pathname
    },
    headers: {
      user_agent: '{{User Agent}}'
    }
  };
  
  fetch('https://data.maracujazeropragas.com/api/gtm-server', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(eventData)
  }).catch(function(error) {
    console.log('Erro ao enviar para GTM Server:', error);
  });
})();
</script>
Trigger: All Pages
```

---

## 📝 PARTE 4: CÓDIGO PARA O SITE (Copiar e Colar)

### CÓDIGO 1: GTM HEAD (Colocar no <head> do site)
```html
<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-567XZCDX');</script>
<!-- End Google Tag Manager -->
```

### CÓDIGO 2: GTM BODY (Colocar após <body>)
```html
<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-567XZCDX"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<!-- End Google Tag Manager (noscript) -->
```

### CÓDIGO 3: Evento view_content (Colocar na página do produto)
```html
<script>
window.dataLayer = window.dataLayer || [];
window.dataLayer.push({
  event: 'view_content',
  user: {
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    city: '',
    state: '',
    zip: '',
    country: 'BR'
  }
});
</script>
```

### CÓDIGO 4: Evento initiate_checkout (Colocar na página de checkout)
```html
<script>
window.dataLayer = window.dataLayer || [];
window.dataLayer.push({
  event: 'initiate_checkout',
  user: {
    email: 'email@exemplo.com',
    firstName: 'João',
    lastName: 'Silva',
    phone: '+5511999998888',
    city: 'São Paulo',
    state: 'SP',
    zip: '01234567',
    country: 'BR'
  }
});
</script>
```

---

## 🎯 PARTE 5: ORDEM DE CRIAÇÃO

### PASSO 1: Criar Variáveis (24 variáveis)
1. Copie e cole cada variável na ordem apresentada
2. Verifique se todas foram criadas corretamente

### PASSO 2: Criar Triggers (3 triggers)
1. Copie e cole cada trigger na ordem apresentada
2. Verifique se todos foram criados corretamente

### PASSO 3: Criar Tags (9 tags)
1. Copie e cole cada tag na ordem apresentada
2. Verifique se todas foram criadas corretamente

### PASSO 4: Adicionar Código ao Site
1. Cole o código GTM HEAD no <head>
2. Cole o código GTM BODY após <body>
3. Cole os eventos nas páginas correspondentes

### PASSO 5: Testar
1. Use o Preview Mode do GTM
2. Verifique se os eventos estão sendo disparados
3. Confirme no DebugView do GA4
4. Confirme no Meta Events Manager

---

## 📊 PARTE 6: VERIFICAÇÃO

### VERIFICAR NO GTM Preview:
- ✅ page_view evento disparado
- ✅ view_content evento disparado
- ✅ initiate_checkout evento disparado

### VERIFICAR NO GA4 DebugView:
- ✅ page_view com parâmetros corretos
- ✅ view_item com parâmetros corretos
- ✅ begin_checkout com parâmetros corretos

### VERIFICAR NO META Events Manager:
- ✅ PageView recebido
- ✅ ViewContent recebido
- ✅ InitiateCheckout recebido

### VERIFICAR NA SUA API:
- ✅ Eventos recebidos em /api/gtm-server
- ✅ EMQ Score calculado
- ✅ Dados processados corretamente

**GTM Web simplificado está pronto! Agora vamos para o GTM Server.** 🚀