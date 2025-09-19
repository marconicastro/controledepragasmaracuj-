# Guia de Configuração GTM para Facebook Pixel - Solução Simples

## Problema Identificado
Os dados do formulário (nome, email, telefone, cidade, estado, CEP) estão sendo coletados e enviados via dataLayer, mas não estão chegando ao Facebook Pixel porque as variáveis correspondentes não estão configuradas no GTM.

## Solução: Criar Variáveis no GTM

### Passo 1: Acessar o GTM
1. Faça login no seu Google Tag Manager
2. Selecione o container "GTM-567XZCDX"
3. Vá para "Variáveis" no menu lateral

### Passo 2: Criar Variáveis de Dados do Usuário

#### 1. Variável: dl_email
- **Nome:** `dl_email`
- **Tipo:** Variável de Camada de Dados
- **Nome da variável da camada de dados:** `user_data.em`
- **Versão da camada de dados:** 2

#### 2. Variável: dl_phone
- **Nome:** `dl_phone`
- **Tipo:** Variável de Camada de Dados
- **Nome da variável da camada de dados:** `user_data.ph`
- **Versão da camada de dados:** 2

#### 3. Variável: dl_first_name
- **Nome:** `dl_first_name`
- **Tipo:** Variável de Camada de Dados
- **Nome da variável da camada de dados:** `user_data.fn`
- **Versão da camada de dados:** 2

#### 4. Variável: dl_last_name
- **Nome:** `dl_last_name`
- **Tipo:** Variável de Camada de Dados
- **Nome da variável da camada de dados:** `user_data.ln`
- **Versão da camada de dados:** 2

#### 5. Variável: dl_city
- **Nome:** `dl_city`
- **Tipo:** Variável de Camada de Dados
- **Nome da variável da camada de dados:** `user_data.ct`
- **Versão da camada de dados:** 2

#### 6. Variável: dl_state
- **Nome:** `dl_state`
- **Tipo:** Variável de Camada de Dados
- **Nome da variável da camada de dados:** `user_data.st`
- **Versão da camada de dados:** 2

#### 7. Variável: dl_zip
- **Nome:** `dl_zip`
- **Tipo:** Variável de Camada de Dados
- **Nome da variável da camada de dados:** `user_data.zp`
- **Versão da camada de dados:** 2

#### 8. Variável: dl_country
- **Nome:** `dl_country`
- **Tipo:** Variável de Camada de Dados
- **Nome da variável da camada de dados:** `user_data.country`
- **Versão da camada de dados:** 2

### Passo 3: Verificar/Atualizar Tag do Facebook Pixel

1. Vá para "Tags" no menu lateral
2. Encontre sua tag do Facebook Pixel (provavelmente chamada "Facebook Pixel - Base" ou similar)
3. Edite a tag
4. Na seção "Configuração da tag", verifique se os campos de dados do usuário estão mapeados:

#### Mapeamento de Campos para o Facebook Pixel:
- **Email:** `{{dl_email}}`
- **Phone:** `{{dl_phone}}`
- **First Name:** `{{dl_first_name}}`
- **Last Name:** `{{dl_last_name}}`
- **City:** `{{dl_city}}`
- **State:** `{{dl_state}}`
- **Zip:** `{{dl_zip}}`
- **Country:** `{{dl_country}}`

### Passo 4: Testar a Configuração

1. Use o "Modo de Visualização" do GTM para testar
2. Preencha o formulário de pré-checkout na página
3. Verifique se os dados aparecem na camada de dados
4. Confirme se as variáveis estão sendo preenchidas corretamente
5. Verifique se a tag do Facebook Pixel está sendo acionada com os dados

### Passo 5: Publicar as Alterações

1. Salve todas as alterações
2. Crie uma nova versão
3. Publique no ambiente de produção

## Estrutura da Camada de Dados

Seu código já envia os dados no formato correto:

```javascript
// Exemplo do que é enviado para o dataLayer
window.dataLayer.push({
  event: 'initiate_checkout',
  event_id: 'eventIdAqui',
  ecommerce: {
    items: [{
      item_id: '6080425',
      item_name: 'Sistema de Controle de Trips - Maracujá',
      price: 39.90,
      quantity: 1,
      currency: 'BRL'
    }]
  },
  user_data: {
    em: 'email@exemplo.com',        // Email
    ph: '11999999999',              // Telefone
    fn: 'João',                     // Primeiro nome
    ln: 'Silva',                    // Sobrenome
    ct: 'São Paulo',                // Cidade
    st: 'SP',                       // Estado
    zp: '01310100',                 // CEP
    country: 'BR',                  // País
    fbc: 'fb.1.timestamp.fbclid',   // Facebook Click ID
    fbp: 'facebook_pixel_id',       // Facebook Pixel ID
    ga_client_id: 'ga_client_id',  // Google Analytics Client ID
    external_id: 'external_id'      // External ID
  }
});
```

## Resultado Esperado

Após configurar as variáveis no GTM:

1. **PageView e ViewContent** terão FBC覆盖率 de 80%+
2. **InitiateCheckout** terá dados completos do formulário
3. **Score de qualidade** subirá para 8.0+/10
4. **Dados de localização** terão cobertura de 85%+

## Verificação

Use o Facebook Events Manager para verificar:

1. Acesse o Gerenciador de Eventos do Facebook
2. Vá para "Eventos"
3. Clique em "Diagnóstico"
4. Verifique a qualidade dos eventos após as alterações

## Suporte

Se precisar de ajuda adicional, verifique o console do navegador para logs de depuração (estão habilitados no código).