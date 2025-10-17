# Guia de Configuração GTM - Correção de Tags Não Disparadas

## 📋 Problemas Identificados
- ✅ Funcionando: GA4 Configuration, Meta Pixel Base, GTM Server - page_view
- ❌ Não funcionando: GA4 view_item/begin_checkout, Meta ViewContent/InitiateCheckout, GTM Server events

## 🔧 Soluções Imediatas

### 1. Configurar Gatilhos no GTM

Acesse seu container GTM-567XZCDX e configure os seguintes gatilhos:

#### Gatilho para view_item (GA4)
1. **Nome**: Evento - view_item
2. **Tipo**: Evento Personalizado
3. **Nome do Evento**: `view_item`
4. **Este gatilho dispara em**: Todos os eventos personalizados

#### Gatilho para begin_checkout (GA4)
1. **Nome**: Evento - begin_checkout
2. **Tipo**: Evento Personalizado
3. **Nome do Evento**: `begin_checkout`
4. **Este gatilho dispara em**: Todos os eventos personalizados

#### Gatilho para ViewContent (Meta)
1. **Nome**: Evento - ViewContent
2. **Tipo**: Evento Personalizado
3. **Nome do Evento**: `ViewContent`
4. **Este gatilho dispara em**: Todos os eventos personalizados

#### Gatilho para InitiateCheckout (Meta)
1. **Nome**: Evento - InitiateCheckout
2. **Tipo**: Evento Personalizado
3. **Nome do Evento**: `InitiateCheckout`
4. **Este gatilho dispara em**: Todos os eventos personalizados

### 2. Configurar Variáveis de E-commerce

Crie as seguintes variáveis de Camada de Dados:

#### Variáveis GA4
- **Nome**: ecommerce.value
  - Tipo: Variável de Camada de Dados
  - Nome da Variável da Camada de Dados: `ecommerce.value`

- **Nome**: ecommerce.currency
  - Tipo: Variável de Camada de Dados
  - Nome da Variável da Camada de Dados: `ecommerce.currency`

- **Nome**: ecommerce.items
  - Tipo: Variável de Camada de Dados
  - Nome da Variável da Camada de Dados: `ecommerce.items`

#### Variáveis Meta
- **Nome**: content_name
  - Tipo: Variável de Camada de Dados
  - Nome da Variável da Camada de Dados: `content_name`

- **Nome**: content_category
  - Tipo: Variável de Camada de Dados
  - Nome da Variável da Camada de Dados: `content_category`

- **Nome**: value
  - Tipo: Variável de Camada de Dados
  - Nome da Variável da Camada de Dados: `value`

### 3. Atualizar Configuração das Tags

#### Para GA4 - view_item
- **Tipo**: Tag do Google Analytics: GA4 Evento
- **ID de Medição**: G-CZ0XMXL3RX
- **Nome do Evento**: view_item
- **Parâmetros do Evento**:
  - currency: {{ecommerce.currency}}
  - value: {{ecommerce.value}}
  - items: {{ecommerce.items}}
- **Gatilho**: Evento - view_item

#### Para GA4 - begin_checkout
- **Tipo**: Tag do Google Analytics: GA4 Evento
- **ID de Medição**: G-CZ0XMXL3RX
- **Nome do Evento**: begin_checkout
- **Parâmetros do Evento**:
  - currency: {{ecommerce.currency}}
  - value: {{ecommerce.value}}
  - items: {{ecommerce.items}}
- **Gatilho**: Evento - begin_checkout

#### Para Meta - ViewContent
- **Tipo**: HTML Personalizado
- **HTML**: 
```html
<script>
fbq('track', 'ViewContent', {
  content_name: '{{content_name}}',
  content_category: '{{content_category}}',
  content_ids: ['ebook-controle-trips'],
  content_type: 'product',
  value: '{{value}}',
  currency: 'BRL'
});
</script>
```
- **Gatilho**: Evento - ViewContent

#### Para Meta - InitiateCheckout
- **Tipo**: HTML Personalizado
- **HTML**: 
```html
<script>
fbq('track', 'InitiateCheckout', {
  content_name: '{{content_name}}',
  content_category: '{{content_category}}',
  content_ids: ['ebook-controle-trips'],
  content_type: 'product',
  value: '{{value}}',
  currency: 'BRL'
});
</script>
```
- **Gatilho**: Evento - InitiateCheckout

### 4. Verificar Ordem de Carregamento

1. **GA4 Configuration** deve carregar primeiro
2. **Meta Pixel Base** deve carregar segundo
3. **Outras tags** podem carregar em qualquer ordem após as bases

### 5. Testar com Preview Mode

1. Abra o GTM Preview Mode
2. Digite sua URL
3. Navegue pelo site
4. Clique nos botões de checkout
5. Verifique se os eventos aparecem no dataLayer
6. Confirme se as tags são acionadas

## 🚀 Como Usar a Ferramenta de Diagnóstico

1. Acesse `/diagnostic` no seu site
2. Clique em "Abrir Ferramenta de Diagnóstico"
3. Use a aba "Testar" para enviar eventos manualmente
4. Verifique os resultados em tempo real
5. Acompanhe o dataLayer na aba "Eventos"

## 📊 Estrutura dos Eventos Enviados

### view_item
```javascript
{
  event: 'view_item',
  event_id: 'viewcontent_1234567890_gtm',
  ecommerce: {
    currency: 'BRL',
    value: 39.90,
    items: [{
      item_id: 'ebook-controle-trips',
      item_name: 'E-book Sistema de Controle de Trips',
      category: 'E-book',
      price: 39.90,
      quantity: 1
    }]
  },
  user_data: { ... },
  timestamp: '2025-01-20T...'
}
```

### begin_checkout
```javascript
{
  event: 'begin_checkout',
  event_id: 'checkout_1234567890_gtm',
  ecommerce: {
    currency: 'BRL',
    value: 39.90,
    items: [{
      item_id: 'ebook-controle-trips',
      item_name: 'E-book Sistema de Controle de Trips',
      category: 'E-book',
      price: 39.90,
      quantity: 1
    }]
  },
  user_data: { ... },
  timestamp: '2025-01-20T...'
}
```

## ⚡ Ações Imediatas

1. **Configure os gatilhos** conforme descrito acima
2. **Crie as variáveis** de e-commerce
3. **Teste no Preview Mode** antes de publicar
4. **Use a ferramenta de diagnóstico** para verificar em tempo real
5. **Monitore os resultados** no Google Tag Assistant

Após seguir estes passos, todas as tags devem disparar corretamente!