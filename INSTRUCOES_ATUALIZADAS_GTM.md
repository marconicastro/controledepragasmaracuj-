# Instruções Atualizadas para seu GTM - Com base nas suas tags existentes

## Sua Configuração Atual ✅

Você já tem as tags do Facebook Pixel configuradas:
- `02 - Meta - Pixel - PageView` (para todas as páginas)
- `1 - Meta - Pixel - view_content` (para evento view_content)
- `2 - Meta - Pixel - begin_checkout` (para evento begin_checkout)
- Outras tags para eventos de tráfego de alta qualidade

## O que precisa ser feito 🔧

### Passo 1: Criar as 8 Variáveis (IGUAL ANTES)

Clique em "Variáveis" > "NOVA" e crie:

| Variável GTM | Caminho da dataLayer | Dado Capturado |
|-------------|-------------------|----------------|
| `dl_email` | `user_data.em` | Email |
| `dl_phone` | `user_data.ph` | Telefone |
| `dl_first_name` | `user_data.fn` | Primeiro Nome |
| `dl_last_name` | `user_data.ln` | Sobrenome |
| `dl_city` | `user_data.ct` | Cidade |
| `dl_state` | `user_data.st` | Estado |
| `dl_zip` | `user_data.zp` | CEP |
| `dl_country` | `user_data.country` | País |

### Passo 2: Editar as Tags do Facebook Pixel Existente

Você precisa editar **ESPECIFICAMENTE** estas tags:

#### 1. Editar `2 - Meta - Pixel - begin_checkout`
Esta é a tag mais importante porque é onde os dados do formulário são enviados.

1. Vá para "Tags"
2. Encontre `2 - Meta - Pixel - begin_checkout`
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

#### 2. Editar `1 - Meta - Pixel - view_content` (Opcional mas recomendado)
1. Vá para "Tags"
2. Encontre `1 - Meta - Pixel - view_content`
3. Clique para editar
4. Na seção de dados do usuário, mapeie os campos:
   - **City:** `{{dl_city}}`
   - **State:** `{{dl_state}}`
   - **Zip:** `{{dl_zip}}`
   - **Country:** `{{dl_country}}`
   - (Os outros campos geralmente não estão disponíveis no view_content)
5. Clique em "SALVAR"

#### 3. Editar `02 - Meta - Pixel - PageView` (Opcional)
1. Vá para "Tags"
2. Encontre `02 - Meta - Pixel - PageView`
3. Clique para editar
4. Na seção de dados do usuário, mapeie os campos:
   - **City:** `{{dl_city}}`
   - **State:** `{{dl_state}}`
   - **Zip:** `{{dl_zip}}`
   - **Country:** `{{dl_country}}`
5. Clique em "SALVAR"

### Passo 3: Testar

1. Clique em "VISUALIZAR" no canto superior direito
2. Abra seu site e preencha o formulário
3. Verifique se as variáveis estão sendo preenchidas
4. Confirme se as tags do Facebook estão sendo acionadas com os dados

### Passo 4: Publicar

1. Clique em "ENVIAR"
2. Dê um nome: "Configuração de dados do formulário - Meta Pixel"
3. Clique em "PUBLICAR"

## Importante: Seu Acionador

Pelo que você mostrou, suas tags já estão configuradas com os acionadores corretos:
- `All Pages` para PageView
- `Evento - view_content` para view_content
- `Evento - begin_checkout` para begin_checkout

Isso significa que seu código já está enviando os eventos corretamente para o dataLayer. Você só precisa fazer o mapeamento dos dados!

## Resumo do que você já tem e o que falta

### ✅ Você já tem:
- Tags do Facebook Pixel configuradas
- Acionadores corretos
- Código enviando eventos para dataLayer
- Dados do formulário sendo coletados

### ❌ O que falta:
- Variáveis para extrair dados do dataLayer
- Mapeamento dos dados nas tags do Facebook

## Resultado Esperado

Após fazer essas configurações:
- O evento `begin_checkout` terá todos os dados do formulário
- Os eventos `view_content` e `PageView` terão dados de localização
- A qualidade dos eventos no Facebook aumentará significativamente

É isso! Simples e direto - FEIJÃO COM ARROZ! 🍚🫘