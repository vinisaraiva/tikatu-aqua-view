# Botão "Forçar atualização do app"

Objetivo: permitir que um admin dispare, com um clique, a atualização do PWA **Tikatu Coleta** em todos os aparelhos dos voluntários, incrementando o campo `reload_token` da tabela `public.app_config` (já existente e compartilhada via Supabase `okduzgpkahddkdpzibua`).

## Abordagem escolhida: Opção B (escrita direta com RLS)

A plataforma já autentica admins via Supabase Auth + tabela `user_roles` com função `has_role(uuid, app_role)`. Isso permite dispensar Edge Function e segredo no bundle — a RLS garante que só admins escrevem em `app_config`.

## Passos

### 1. Migração de RLS em `public.app_config`
Adicionar política de UPDATE restrita a admins usando a função `has_role` já existente:

```sql
CREATE POLICY "Admins can update app_config"
ON public.app_config
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

GRANT SELECT, UPDATE ON public.app_config TO authenticated;
```

(Antes de rodar vou verificar via `supabase--read_query` as políticas atuais da tabela para não duplicar e confirmar que a leitura pública permanece.)

### 2. Novo componente `ForceAppUpdateCard.tsx`
Em `src/components/admin/volunteers/ForceAppUpdateCard.tsx`:
- Card shadcn com título "Atualização do aplicativo" e descrição curta.
- Botão "Forçar atualização do app (todos)" que:
  1. Abre `ConfirmDialog` (já existe em `src/components/admin/ConfirmDialog.tsx`).
  2. Lê `reload_token` atual de `app_config` id=1.
  3. Faz update com `reload_token = String(atual + 1)` e `updated_at = now()`.
  4. Toast de sucesso/erro via `useToast`.
- Estado de loading no botão.

### 3. Integração na página Voluntários
Em `src/pages/admin/volunteers/VolunteersPage.tsx`, renderizar `<ForceAppUpdateCard />` no topo (acima da `DataTable`), separado por espaçamento existente.

## Segurança
- Escrita bloqueada por RLS para qualquer não-admin — mesmo que o componente vaze para outra tela.
- Leitura pública de `app_config` preservada (o app dos voluntários lê como anon).
- Nenhum segredo no bundle.

## Fora de escopo
- Campo para alterar `min_version` (spec marca como opcional; posso adicionar depois se pedir).
- Edge Function (Opção A) — desnecessária dado o modelo de auth atual.
