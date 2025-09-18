# Instruções Finais - GTM Server-side com Stape

## O que está acontecendo:

Seu evento está chegando ao Facebook, mas os dados do formulário (email, phone, first_name, last_name) não estão no user_data.

## Passo 1: Criar as 4 variáveis no GTM Server-side

Crie estas variáveis exatamente como especificado:

### Variável 1: ss_email
```
Nome da variável: ss_email
Tipo de variável: Variável de Camada de Dados
Nome da variável da camada de dados: user_data.em
Versão da camada de dados: 2
```

### Variável 2: ss_phone
```
Nome da variável: ss_phone
Tipo de variável: Variável de Camada de Dados
Nome da variável da camada de dados: user_data.ph
Versão da camada de dados: 2
```

### Variável 3: ss_first_name
```
Nome da variável: ss_first_name
Tipo de variável: Variável de Camada de Dados
Nome da variável da camada de dados: user_data.fn
Versão da camada de dados: 2
```

### Variável 4: ss_last_name
```
Nome da variável: ss_last_name
Tipo de variável: Variável de Camada de Dados
Nome da variável da camada de dados: user_data.ln
Versão da camada de dados: 2
```

## Passo 2: Atualizar seu código

No arquivo AdvancedTracking.tsx, linha 249, substitua `YOUR_CONTAINER_ID` pelo seu ID real do container Stape.

Procure por esta linha:
```javascript
await fetch('https://collect.stape.io/v2/s/YOUR_CONTAINER_ID/event', {
```

E substitua `YOUR_CONTAINER_ID` pelo seu ID (algo como `GTM-XXXXXXX` ou um número).

## Passo 3: Atualizar a tag do Facebook no Server-side

Na sua tag do Facebook Pixel no GTM Server-side, adicione os campos:

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

## Passo 4: Testar

1. Faça as alterações acima
2. Publique as alterações no GTM Server-side
3. Atualize seu site
4. Preencha o formulário
5. Verifique no Facebook Events Manager se os dados do formulário estão chegando

## O que mudamos:

1. **Adicionamos envio direto para o server-side** via fetch API
2. **Criamos as 4 variáveis** para capturar os dados do formulário
3. **Mapeamos os dados** na tag do Facebook

Agora os dados do formulário devem chegar ao Facebook via server-side!

## Importante:

Se ainda não funcionar, verifique:
1. Se o ID do container Stape está correto
2. Se as variáveis estão sendo criadas no GTM Server-side
3. Se a tag do Facebook está configurada corretamente

Isso deve resolver seu problema completamente! 🚀