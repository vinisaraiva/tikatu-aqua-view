# Solicitação de acesso + gestão no Admin

## Objetivo
Na tela de acesso (`/acesso`) adicionar um link **"Solicite seu acesso"** que abre um popup onde o visitante informa **nome** e **email**. Essas solicitações aparecem numa nova página do Admin (**Solicitações de Acesso**), onde você pode **gerar automaticamente uma senha de acesso** (sem validade) para cada solicitante e copiá-la para enviar manualmente.

## Fluxo do usuário (visitante)
```text
Tela /acesso
  └─ link "Solicite seu acesso"
       └─ popup: Nome + Email + (mensagem opcional)
            └─ envia → confirma "Solicitação enviada, aguarde liberação"
```

## Fluxo do administrador
```text
Admin → menu "Solicitações de Acesso"
  ├─ lista de solicitações (Pendentes / Histórico)
  └─ por solicitação pendente:
       ├─ botão "Gerar senha de acesso"
       │    └─ sistema cria senha aleatória → mostra em popup p/ copiar
       │       (status vira "Aprovado", senha vira código ativo)
       └─ botão "Rejeitar"
```

## O que será criado / alterado

### 1. Banco de dados (migration)
Nova tabela `public.access_requests`:
- `name` (texto), `email` (texto), `message` (texto, opcional)
- `status` (texto: `pending` / `approved` / `rejected`, padrão `pending`)
- `site_access_code_id` (referência ao código gerado, opcional)
- campos padrão (id, created_at, updated_at) + trigger de updated_at

Regras de acesso (RLS):
- Inserção pública dos pedidos será feita por função de servidor (não exige login do visitante).
- Apenas administradores podem ver, atualizar e excluir solicitações.
- GRANTs apropriados (authenticated/service_role).

### 2. Edge function `request-access` (pública)
- Valida nome e email (Zod), com limite de tentativas por IP.
- Insere a solicitação como `pending`.
- Não expõe dados sensíveis.

### 3. Edge function `approve-access-request` (somente admin)
- Verifica que o chamador é admin.
- Gera uma senha aleatória forte.
- Salva o hash na tabela `site_access_codes` (código ativo, **sem validade**), usando o nome/email como rótulo.
- Atualiza a solicitação para `approved` e vincula ao código criado.
- Retorna a senha em texto **uma única vez** para você copiar.

### 4. Tela de acesso (`src/pages/SiteAccess.tsx`)
- Adicionar link "Solicite seu acesso" abaixo do botão Entrar.
- Novo componente de popup (Dialog) com formulário Nome + Email + mensagem opcional, validação e estado de envio/confirmação.

### 5. Admin — nova página "Solicitações de Acesso"
- Novo item no menu lateral (`AdminSidebar`) com ícone.
- Nova rota `/admin/access-requests` em `App.tsx`.
- Página lista solicitações (pendentes e histórico), com botões "Gerar senha de acesso" e "Rejeitar".
- Popup que exibe a senha gerada com botão de copiar.

## Detalhes técnicos
- A senha de acesso continua sendo armazenada apenas como hash SHA-256 em `site_access_codes` (mesmo padrão atual do `verify-site-access`). A senha em texto só aparece no momento da geração.
- As funções de admin validam a role via `has_role`/JWT; nenhuma chave de serviço é exposta ao frontend.
- Senha gerada **sem validade** (expira só se você desativar o código).
- Envio ao usuário é **manual** (copiar e enviar por fora).

## Fora do escopo
- Envio automático de email com a senha.
- Expiração automática das senhas.
