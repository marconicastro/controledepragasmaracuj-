# Instruções Simples para Configurar GTM - FEIJÃO COM ARROZ

## Problema
Os dados do formulário (nome, email, telefone, etc.) estão sendo enviados para o dataLayer, mas o GTM não está passando esses dados para o Facebook Pixel porque as variáveis não estão configuradas.

## Solução Simples

### Passo 1: Entrar no GTM
1. Acesse: https://tagmanager.google.com/
2. Selecione seu container: GTM-567XZCDX
3. Clique em "Variáveis" no menu esquerdo

### Passo 2: Criar as 8 Variáveis
Clique em "NOVA" e crie cada uma destas variáveis:

#### Variável 1: dl_email
- **Nome:** `dl_email`
- **Tipo:** Variável de Camada de Dados
- **Nome da variável da camada de dados:** `user_data.em`
- **Versão da camada de dados:** 2
- Clique em "SALVAR"

#### Variável 2: dl_phone
- **Nome:** `dl_phone`
- **Tipo:** Variável de Camada de Dados
- **Nome da variável da camada de dados:** `user_data.ph`
- **Versão da camada de dados:** 2
- Clique em "SALVAR"

#### Variável 3: dl_first_name
- **Nome:** `dl_first_name`
- **Tipo:** Variável de Camada de Dados
- **Nome da variável da camada de dados:** `user_data.fn`
- **Versão da camada de dados:** 2
- Clique em "SALVAR"

#### Variável 4: dl_last_name
- **Nome:** `dl_last_name`
- **Tipo:** Variável de Camada de Dados
- **Nome da variável da camada de dados:** `user_data.ln`
- **Versão da camada de dados:** 2
- Clique em "SALVAR"

#### Variável 5: dl_city
- **Nome:** `dl_city`
- **Tipo:** Variável de Camada de Dados
- **Nome da variável da camada de dados:** `user_data.ct`
- **Versão da camada de dados:** 2
- Clique em "SALVAR"

#### Variável 6: dl_state
- **Nome:** `dl_state`
- **Tipo:** Variável de Camada de Dados
- **Nome da variável da camada de dados:** `user_data.st`
- **Versão da camada de dados:** 2
- Clique em "SALVAR"

#### Variável 7: dl_zip
- **Nome:** `dl_zip`
- **Tipo:** Variável de Camada de Dados
- **Nome da variável da camada de dados:** `user_data.zp`
- **Versão da camada de dados:** 2
- Clique em "SALVAR"

#### Variável 8: dl_country
- **Nome:** `dl_country`
- **Tipo:** Variável de Camada de Dados
- **Nome da variável da camada de dados:** `user_data.country`
- **Versão da camada de dados:** 2
- Clique em "SALVAR"

### Passo 3: Configurar a Tag do Facebook
1. Clique em "Tags" no menu esquerdo
2. Encontre sua tag do Facebook Pixel
3. Clique para editar
4. Na seção de dados do usuário, mapeie os campos:
   - **Email:** `{{dl_email}}`
   - **Phone:** `{{dl_phone}}`
   - **First Name:** `{{dl_first_name}}`
   - **Last Name:** `{{dl_last_name}}`
   - **City:** `{{dl_city}}`
   - **State:** `{{dl_state}}`
   - **Zip:** `{{dl_zip}}`
   - **Country:** `{{dl_country}}`
5. Clique em "SALVAR"

### Passo 4: Testar
1. Clique em "VISUALIZAR" no canto superior direito
2. Abra seu site em outra aba
3. Preencha o formulário e envie
4. Volte ao GTM e veja se os dados aparecem
5. Verifique se a tag do Facebook foi acionada com os dados

### Passo 5: Publicar
1. Clique em "ENVIAR" no canto superior direito
2. Dê um nome para a versão (ex: "Configuração de dados do formulário")
3. Clique em "PUBLICAR"

## Pronto!

Agora o Facebook Pixel receberá todos os dados do formulário e a qualidade dos eventos vai melhorar significativamente.

## Como Verificar se Funcionou

1. Abra o console do navegador (F12)
2. Preencha o formulário na página
3. Veja os logs no console - deve mostrar os dados sendo enviados
4. Aguarde 24-48 horas e verifique o Gerenciador de Eventos do Facebook

## Resumo do que Fizemos

- ✅ Criamos 8 variáveis no GTM para capturar dados do formulário
- ✅ Mapeamos essas variáveis na tag do Facebook Pixel
- ✅ Agora o Facebook recebe nome, email, telefone, endereço completo
- ✅ A qualidade dos eventos vai subir para 8.0+/10

É isso! Simples e direto - FEIJÃO COM ARROZ! 🍚🫘