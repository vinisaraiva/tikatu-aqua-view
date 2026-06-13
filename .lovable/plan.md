# Senhas de acesso individuais por pessoa

Hoje o site usa **uma única senha** (segredo `SITE_ACCESS_HASH`). Vamos substituir por um sistema de **senhas individuais**: no admin (dentro de Configurações), você informa um rótulo/nome, o sistema gera uma **senha aleatória forte**, exibe **uma única vez** para você compartilhar, e armazena apenas o hash. Cada pessoa terá sua própria senha, que pode ser listada, revogada e expirar.

## Visão geral

```text
Admin (Configurações)
   │  informa rótulo + (opcional) data de expiração
   ▼
Gera senha aleatória forte ──> exibe 1x (copiar) ──> compartilha com a pessoa
   │  guarda só o hash (sha256)
   ▼
Tabela public.site_access_codes
   ▲
   │  pessoa digita a senha em /acesso
verify-site-access  ── procura hash ativo e não expirado, registra último acesso, emite token
```

## Banco de dados (migração)

Nova tabela `public.site_access_codes`:
- `label` (nome/identificação da pessoa)
- `password_hash` (sha256 da senha — texto puro nunca é gravado)
- `is_active` (ativo/revogado)
- `expires_at` (expiração opcional)
- `last_access_at` (último acesso registrado)
- `created_at`, `updated_at`

Regras de acesso (RLS):
- Apenas administradores podem listar, criar, revogar e excluir (via `has_role(auth.uid(),'admin')`).
- `service_role` tem acesso total (usado pela edge function para validar e registrar acesso).
- Sem acesso para visitantes anônimos.
- `GRANT` para `authenticated` (limitado por RLS a admins) e `service_role`.

## Edge function `verify-site-access` (ajuste)

- Deixa de depender do segredo `SITE_ACCESS_HASH`.
- Passa a consultar a tabela com o **service role**: calcula `sha256(senha)` e busca um registro com aquele hash, `is_active = true` e (`expires_at` nulo ou no futuro).
- Se válido: atualiza `last_access_at` e emite o token HMAC (mantém `SITE_ACCESS_TOKEN_SECRET`, rate limiting e o contrato 200/500 atuais).
- Se não houver correspondência/estiver expirado/revogado: retorna `INVALID_PASSWORD` (200), como hoje.
- Continua sem registrar senha/hash em logs.

## Admin — dentro de Configurações

Novo cartão **"Acessos ao Site"** na página de Configurações:
- **Formulário**: campo de rótulo/nome + data de expiração opcional (datepicker) + botão "Gerar senha".
- Ao gerar: cria a senha aleatória forte no navegador, calcula o hash, grava o registro e abre um **diálogo exibindo a senha uma única vez** com botão de copiar (sem armazenar o texto puro).
- **Tabela de acessos**: rótulo, status (Ativo / Revogado / Expirado), expiração, último acesso e data de criação.
- **Ações**: revogar (desativa o acesso) e excluir.

## Frontend — detalhes

- Novo hook `useSiteAccessCodes` (React Query): listar, criar e revogar/excluir.
- Geração da senha com `crypto.getRandomValues` (senha forte, ex. ~16 caracteres) e hash com `crypto.subtle` (sha256), mantendo compatibilidade com a validação da edge function.
- Validação de entrada com `zod` (rótulo 1–100 caracteres).
- Componentes de exibição seguem o padrão existente (estilo do diálogo de API key, datepicker do projeto, locale ptBR).

## Observações

- Após a publicação, é necessário **gerar pelo menos uma senha** no admin, pois a senha única antiga deixará de funcionar. O acesso ao `/admin` é independente do gate, então você consegue criar as senhas normalmente.
- O segredo `SITE_ACCESS_HASH` ficará sem uso (pode ser removido depois, se desejar).

## Entregáveis

1. Migração: tabela `site_access_codes` + grants + RLS.
2. Ajuste da edge function `verify-site-access` para validar contra a tabela e registrar último acesso.
3. Hook `useSiteAccessCodes`.
4. Cartão "Acessos ao Site" na página de Configurações (formulário, diálogo de senha única, tabela com revogar/excluir).