# AGENTS.md — Tikatu Aqua View (plataforma web)

Instruções para agentes de código (Hermes/Carcará, Claude Code, Codex e similares) que trabalham neste
repositório sem supervisão em tempo real. Leia este arquivo inteiro antes de começar qualquer tarefa.

## O projeto

Plataforma web do Tikatu: painel de qualidade da água, administração de pontos, voluntários e coletas.
Divide o Supabase `okduzgpkahddkdpzibua` com o app de coleta `vinisaraiva/tikatu-coleta`, então mudanças
de banco aqui afetam o app dos voluntários.

| Pasta / arquivo | O que é |
|---|---|
| `src/` | React + Vite + TypeScript + shadcn/ui |
| `src/integrations/supabase/` | Cliente Supabase com a chave **pública** (anon) e tipos gerados |
| `supabase/migrations/`, `supabase/functions/` | Banco e Edge Functions (compartilhados com o app de coleta) |
| `render.yaml` | Deploy de produção: Render static site `tikatu-aqua-view` (`bun install && bun run build`) |

Projeto ligado ao **Lovable**: commits na `main` sincronizam com o editor do Lovable. Nunca reescrever
histórico publicado.

## Como trabalhar

1. Nunca commitar direto na `main`: branch (`feat/…`, `fix/…`, `docs/…`, `chore/…`; agentes do Hermes usam
   `hermes/*`) → commits pequenos → PR.
2. Nunca reescrever histórico publicado (sem force push, rebase ou amend de commits enviados).
3. Nunca fazer merge do próprio PR. O merge é do Vinícius ou do auto-merge do Hermes (`automerge-apps.py`),
   quando estiver ligado para esta aplicação em `ci-apps.json`: branch `hermes/*`, revisão "Revisão: Marina …
   aprovada", Fiscal ✅ no commit atual, entre 7h e 22h (Bahia), e o PR não toca `supabase/`,
   `src/integrations/supabase/`, `render.yaml`, `.github/` nem este arquivo (esses esperam o Vinícius).
4. Uma tarefa por branch/PR; sem refatorações não pedidas junto da entrega.
5. Siga o estilo do código ao redor (português nos textos de interface).
6. Mensagens de commit: `tipo(escopo): resumo`.

## Segurança (inegociável)

- O navegador é não confiável. Só a chave **anon** pode estar no cliente. Nunca colocar no código, em
  variável `VITE_*` ou no `render.yaml` a service role ou qualquer segredo (ex.: o segredo do botão
  "atualizar app" deve ficar numa Edge Function, nunca em `VITE_APP_UPDATE_SECRET`).
- Dados de voluntários (código, senha, sessões) só passam pelas Edge Functions; nunca ler `volunteers`
  nem `volunteer_sessions` direto do cliente.
- Mudanças de banco ou RLS: só por migration versionada e revisada; nunca SQL direto na produção.
  Lembre que o banco é compartilhado com o app de coleta.
- Nunca enfraquecer RLS para algo funcionar. Nunca commitar `.env` com segredos, chaves, tokens ou dados reais.

## Antes de dizer "pronto"

Os mesmos passos que o Fiscal roda (`.github/workflows/quality-gates.yml`):

```bash
bun install
bunx tsc --noEmit -p tsconfig.app.json
bun run build
```

`bun run lint` ainda tem erros antigos: não é gate, mas não aumente a quantidade.
Na descrição do PR: o que mudou, por quê, o que foi testado (navegador desktop e celular) e o que não foi.

## Quando parar e perguntar

- Qualquer mudança em banco, RLS, Edge Functions, login ou dados de voluntários.
- Qualquer mudança que afete o app de coleta (tabelas e funções compartilhadas).
- Pedido ambíguo ou decisão de produto não registrada.
