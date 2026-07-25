## Objetivo

Manter o mesmo botão "Forçar atualização do app (todos)", mas trocar o que ele grava: em vez de incrementar `reload_token` (que hoje está causando logoff no app), ele passa a **incrementar `min_version`** em `public.app_config`. O app Tikatu Coleta compara a própria versão com `min_version` e recarrega preservando a sessão apenas quando estiver abaixo.

Estado atual em `app_config` (id=1): `min_version = "1.0.0"`, `reload_token = "1"`.

## Mudança na plataforma web

Arquivo único: `src/components/admin/volunteers/ForceAppUpdateCard.tsx`

- UX igual: mesmo card, mesmo título, mesmo botão "Forçar atualização do app (todos)", mesmo `ConfirmDialog`.
- Handler passa a:
  1. Ler `min_version` de `app_config` id=1.
  2. Calcular próxima versão fazendo bump do patch (`x.y.z` → `x.y.(z+1)`; se o valor não bater com o regex `^\d+\.\d+\.\d+$`, cai para `1.0.1`).
  3. `UPDATE app_config SET min_version = <novo>, updated_at = now() WHERE id = 1`.
  4. Toast informando a nova versão mínima publicada.
- Remove a leitura/escrita de `reload_token`.
- Descrição do card atualizada: "Publica uma nova versão mínima. Aparelhos com versão inferior recarregam na próxima abertura, sem perder o login."

Nenhuma migração; RLS de admin sobre `app_config` já foi criada anteriormente e continua válida (o `UPDATE` roda no cliente sob a sessão do admin autenticado).

## Instrução a repassar ao time do app Tikatu Coleta (fora deste repo)

Para o mecanismo funcionar sem logoff, o app precisa:

- Ler `min_version` de `app_config` na abertura.
- Comparar com a versão embutida no bundle (ex.: constante `APP_VERSION`).
- Se `APP_VERSION < min_version`: `window.location.reload()` **uma vez** (flag em `sessionStorage` para não loopar). **Não** chamar `supabase.auth.signOut()`, **não** limpar `localStorage`, **não** desregistrar o service worker de forma destrutiva.
- Ignorar `reload_token` (era o gatilho que derrubava a sessão).

## Fora de escopo

- Alterações no app mobile/PWA.
- Remoção da coluna `reload_token` do banco.
