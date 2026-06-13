# Relatório de Acessos (Analytics integrado)

Vamos construir um sistema de analytics próprio, dentro da aplicação, que registra cada visita ao site e exibe um painel profissional na área `/admin`, visível apenas para administradores.

## Visão geral

```text
Visitante navega no site
        │
        ▼
Hook de tracking (frontend)  ── envia evento por rota + duração
        │
        ▼
Edge Function "track-visit"  ── enriquece com país/região (IP) e User-Agent
        │  (usa SERVICE_ROLE, ignora RLS)
        ▼
Tabela public.page_views  ── armazena dados anônimos
        │
        ▼
Painel /admin/analytics  ── gráficos e tabelas (somente admin)
```

## O que será coletado

- **Páginas acessadas**: rota visitada e contagem de visualizações.
- **Duração da sessão**: tempo aproximado em cada página e por sessão.
- **Dispositivo/navegador**: tipo (desktop/mobile/tablet), SO e navegador, derivados do User-Agent.
- **Visitantes e período**: visitas totais e visitantes únicos (via identificador anônimo de sessão) por dia/semana/mês.
- **Geolocalização aproximada**: país e região/cidade derivados do IP no servidor (o IP em si **não** é armazenado).

## Privacidade (LGPD)

- Identificador de sessão **anônimo** (UUID gerado no navegador, sem dados pessoais).
- O IP é usado apenas no servidor para resolver país/região e **descartado** — nunca gravado.
- Recomenda-se um aviso de cookies/privacidade simples no site (posso incluir um banner leve, se desejar).

## Banco de dados (migração)

Nova tabela `public.page_views`:
- `session_id` (texto, UUID anônimo do navegador)
- `path` (rota visitada)
- `referrer` (origem, opcional)
- `duration_seconds` (tempo na página)
- `device_type`, `os`, `browser`
- `country`, `region`, `city`
- `created_at`

Regras de acesso:
- Inserção apenas pela edge function (service role) — sem insert público direto.
- Leitura restrita a administradores, via `has_role(auth.uid(), 'admin')`.
- `GRANT` para `service_role` (insert) e `authenticated` (select), conforme as políticas.

## Edge Function `track-visit`

- Recebe `session_id`, `path`, `duration_seconds`, `referrer`.
- Valida a entrada (Zod).
- Lê o cabeçalho de IP da requisição para obter **país/região/cidade** (via API gratuita de geo por IP) e analisa o User-Agent para dispositivo/SO/navegador.
- Insere o registro com `SERVICE_ROLE`.
- Responde sempre `200` para eventos válidos; `500` apenas em falha real (mantendo o padrão de contrato já adotado no projeto).

## Frontend — coleta

- Hook `usePageTracking` montado em nível global (no `App`/dentro do `BrowserRouter`):
  - Gera/recupera um `session_id` anônimo no `localStorage`.
  - Dispara um evento a cada mudança de rota e calcula a duração ao sair da página (via `visibilitychange`/`beforeunload`).
  - Envia através de `supabase.functions.invoke('track-visit', ...)`.
- Não rastreia rotas de `/admin` nem a tela `/acesso` (foco no público).

## Frontend — painel `/admin/analytics`

Nova página com:
- **Cartões de resumo**: visitas totais, visitantes únicos, duração média, página mais acessada (no período selecionado).
- **Filtro de período**: hoje / 7 dias / 30 dias / intervalo personalizado (datepicker).
- **Gráfico de linha**: visitas por dia.
- **Gráfico de barras**: top páginas acessadas.
- **Gráfico de rosca/barras**: distribuição por dispositivo e por navegador.
- **Tabela**: top localidades (país/região) por número de visitas.

Integração:
- Item "Analytics" adicionado ao `AdminSidebar`.
- Rota `/admin/analytics` adicionada dentro do `AdminLayout` (já protegido por admin).
- Dados buscados com React Query a partir de `page_views`, agregados no cliente (ou via funções SQL agregadoras, se o volume exigir).

## Detalhes técnicos

- Gráficos com `recharts` (já presente nos componentes de dashboard do projeto).
- Datas com `date-fns` + locale `ptBR` (padrão já usado).
- Geo por IP: usaremos um serviço gratuito chamado no servidor; se preferir evitar dependência externa, posso usar apenas país/região aproximados a partir de cabeçalhos disponíveis.
- Componentes de visualização seguirão a regra do projeto: early return + placeholder quando não houver dados.

## Entregáveis

1. Migração: tabela `page_views` + grants + RLS.
2. Edge function `track-visit`.
3. Hook `usePageTracking` integrado globalmente.
4. Página `/admin/analytics` com gráficos e filtros.
5. Item de menu + rota no admin.