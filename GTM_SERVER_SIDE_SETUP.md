# Guia de Configuração GTM Server-side para Dados do Formulário

## Problema Identificado

As informações que chegam ao Facebook vêm do GTM Server-side, não do GTM Web. Você já tem variáveis de geolocalização funcionando no server-side, mas falta configurar as variáveis para os dados do formulário.

## Configuração Atual no Server-side ✅

Você já tem estas variáveis funcionando:
- `{{cs - x-stape-user-id}}` → External ID
- `{{cs - x-geo-city}}` → City  
- `{{cs - x-geo-postalcode}}` → Zip
- `{{cs - x-geo-region}}` → State
- `{{cs - x-geo-country}}` → Country

## O que precisa ser feito 🔧

### Passo 1: Verificar como os dados chegam ao Server-side

Antes de criar as variáveis, precisamos entender como os dados do formulário estão sendo enviados do client-side para o server-side.

Possíveis métodos:
1. **HTTP Request** - Seu código envia os dados via fetch/axios para o servidor
2. **DataLayer Forwarding** - O GTM Web envia eventos para o GTM Server-side
3. **Stape Forwarding** - Sistema específico do Stape

### Passo 2: Criar variáveis no GTM Server-side

No seu GTM Server-side, crie estas variáveis:

#### Variável 1: ss_email
- **Nome:** `ss_email`
- **Tipo:** Variável de Camada de Dados (se vier via dataLayer)
- **Nome da variável da camada de dados:** `user_data.em`
- **Versão da camada de dados:** 2

OU

- **Nome:** `ss_email`
- **Tipo:** Variável de Evento (se vier via HTTP request)
- **Caminho:** `event.data.user_data.em`

#### Variável 2: ss_phone
- **Nome:** `ss_phone`
- **Tipo:** Variável de Camada de Dados
- **Nome da variável da camada de dados:** `user_data.ph`
- **Versão da camada de dados:** 2

#### Variável 3: ss_first_name
- **Nome:** `ss_first_name`
- **Tipo:** Variável de Camada de Dados
- **Nome da variável da camada de dados:** `user_data.fn`
- **Versão da camada de dados:** 2

#### Variável 4: ss_last_name
- **Nome:** `ss_last_name`
- **Tipo:** Variável de Camada de Dados
- **Nome da variável da camada de dados:** `user_data.ln`
- **Versão da camada de dados:** 2

### Passo 3: Atualizar a tag do Facebook no Server-side

Edite sua tag do Facebook Pixel no GTM Server-side e adicione os campos:

```
Property Name    Property Value
Email           {{ss_email}}
Phone           {{ss_phone}}
First Name      {{ss_first_name}}
Last Name       {{ss_last_name}}
External ID     {{cs - x-stape-user-id}}
City            {{cs - x-geo-city}}
Zip             {{cs - x-geo-postalcode}}
State           {{cs - x-geo-region}}
Country         {{cs - x-geo-country}}
```

### Passo 4: Verificar o fluxo de dados

Certifique-se de que seu código client-side está enviando os dados para o server-side. Seu código já faz isso?

Verifique no seu AdvancedTracking.tsx se os eventos estão sendo enviados corretamente para o server-side.

## Importante: Como testar

1. Use o modo de visualização do GTM Server-side
2. Preencha o formulário no site
3. Verifique se os dados estão chegando ao servidor
4. Confirme se as variáveis estão sendo preenchidas
5. Verifique se a tag do Facebook está sendo acionada com todos os dados

## Possíveis problemas e soluções

### Problema 1: Dados não chegam ao server-side
**Solução:** Verifique se seu código client-side está enviando os eventos para o servidor. Talvez precise adicionar um código para enviar os dados via HTTP request.

### Problema 2: Variáveis não funcionam
**Solução:** Verifique o caminho correto dos dados no server-side. Pode ser diferente do client-side.

### Problema 3: Tag não é acionada
**Solução:** Verifique se o acionador no server-side está configurado para o evento `initiate_checkout`.

## Resumo

Você já tem 90% da configuração funcionando no server-side. Só falta:
1. Criar 4 variáveis para os dados do formulário
2. Adicionar esses campos na tag do Facebook
3. Garantir que os dados estão sendo enviados do client-side para o server-side

Isso deve resolver seu problema completamente!