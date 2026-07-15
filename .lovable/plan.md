
## Objetivo

Transformar a seção de coletas da página `/forum-economia-do-mar` em um painel exploratório: o usuário ajusta filtros e mapa + gráfico + cards reagem em tempo real. A análise textual passa a ser gerada sob demanda por um botão "Gerar análise com IA".

## Fonte de dados

Substituir os 3 cenários fixos de `src/data/forumScenarios.ts` por um **dataset demonstrativo ampliado**, gerado uma vez e salvo em `src/data/forumDataset.ts` (JSON tipado, rotulado como "adaptado"):

- **6 pontos de coleta** ao longo do Buranhém e afluentes (cabeceira, médio, urbano Eunápolis, jusante Porto Seguro, estuário, e um afluente rural), cada um com nome, rio, ambiente, lat/lng plausíveis.
- **~24 coletas** distribuídas em 12 meses de 2024 (2 por ponto em média), cobrindo períodos seco, chuvoso e transição.
- **8 parâmetros por coleta**: pH, OD, turbidez, DBO, fósforo total, coliformes, temperatura, condutividade — com limites CONAMA já usados nos cenários atuais.
- Valores gerados para dar variedade visível: pontos urbanos com DBO/fósforo/coliformes maiores; estuário com condutividade alta; período chuvoso aumenta turbidez e reduz OD; período seco melhora indicadores.

Cada coleta mantém a estrutura de `ScenarioParameter[]` (com `status` derivado por regra dos limites CONAMA na hora de gerar o dataset). Rótulo `originTag: "adaptado"` permanece visível para não confundir com dado real.

## Filtros (combinam-se, todos ao vivo)

Novo componente `src/components/forum/ScenarioFilters.tsx` acima do painel:

1. **Ponto de coleta** — `Select` multi (checkbox popover) com os 6 pontos + opção "Todos". Default: todos.
2. **Período** — dois `DatePicker` (data inicial / data final) usando o shadcn datepicker com `pointer-events-auto`. Default: ano inteiro.
3. **Parâmetros exibidos** — chips toggle (badges clicáveis) para ligar/desligar cada um dos 8 parâmetros no gráfico e nos cards. Default: todos ligados.

Estado dos filtros vive em `ForumEconomiaDoMar.tsx` via `useState` + `useMemo` para derivar `filteredReadings`. Nada de URL params ou storage — reset ao recarregar é aceitável para evento.

## Reação em tempo real

- **Mapa** (`ForumMiniMap` renomeado para `ForumMap` e ampliado): passa a receber `points: {id, lat, lng, label, latestStatus}[]` e renderiza um marcador por ponto filtrado. Cor do marcador (droplet SVG) reflete o status agregado do ponto no intervalo (verde = tudo dentro da faixa; amarelo = requer acompanhamento; vermelho = requer atenção). Popup mostra nome + nº de coletas no intervalo. Se um único ponto ficar filtrado, dá zoom nele; caso contrário, ajusta `bounds` para caber todos.
- **Gráfico** (`ForumChart`): passa a agregar as coletas filtradas — para cada parâmetro ativo, calcula média no intervalo e monta uma barra normalizada vs. referência CONAMA (mantém a lógica de cores atuais). Quando só uma coleta cai no filtro, mostra os valores brutos daquela coleta.
- **Cards** (`ParameterCard`): grid de cards apenas para parâmetros ativos, mostrando média + range (mín–máx) no intervalo e nº de coletas que compõem.
- **Cabeçalho do painel**: contadores "N coletas · M pontos · intervalo dd/mm–dd/mm" atualizando ao vivo.
- **Empty state**: se filtros zerarem o conjunto, card com "Nenhuma coleta no intervalo selecionado" + botão "Limpar filtros".

## Análise com IA (sob demanda)

`AnalysisPanel` refatorado:

- Botão primário **"Gerar análise com IA"** dentro do card. Enquanto não clicado, mostra apenas um resumo estatístico local (gerado por regra, instantâneo: nº de coletas, parâmetros fora da faixa, ponto mais crítico).
- Ao clicar, chama uma nova **Edge Function** `supabase/functions/forum-analyze/index.ts`:
  - Recebe `{ readings, activeParameters, dateRange, points }` (payload já filtrado, sem PII).
  - Chama Lovable AI Gateway via AI SDK (`@ai-sdk/openai-compatible` + `ai`) modelo `openai/gpt-5.5`, prompt em PT-BR pedindo síntese, pontos de atenção, recomendações e limitação (mesma estrutura do texto atual dos cenários).
  - Retorna JSON `{ sintese, atencao[], recomendacoes[], limitacao }`.
  - Rate limit simples por IP (in-memory) e limite de payload (≤ 40 coletas) para conter custo no evento.
- Frontend chama a função via `supabase.functions.invoke("forum-analyze", ...)`, mostra skeleton enquanto carrega, renderiza o resultado. Erros (429/402/rede) exibem toast e o resumo local permanece.
- A função é **pública** (`verify_jwt = false` no `supabase/config.toml`), pois a página é sem login.

`LOVABLE_API_KEY` já existe nos secrets — nenhum secret novo.

## Alterações de arquivos

- **Criar** `src/data/forumDataset.ts` (pontos + coletas ampliados, tipado).
- **Criar** `src/components/forum/ScenarioFilters.tsx`.
- **Renomear/ampliar** `ForumMiniMap.tsx` → `ForumMap.tsx` (aceita array de pontos, bounds dinâmico, cor por status).
- **Editar** `ForumChart.tsx` para consumir agregado por parâmetro.
- **Editar** `CollectionPanel.tsx` — agora `ExplorerPanel.tsx`: recebe `filteredReadings` e monta header + mapa + gráfico + grid de cards.
- **Editar** `AnalysisPanel.tsx` — botão "Gerar análise com IA", chamada à edge function, estados loading/erro.
- **Editar** `ForumEconomiaDoMar.tsx` — remove `ScenarioSelector`, adiciona `ScenarioFilters`, gerencia estado e `useMemo`.
- **Remover** `ScenarioSelector.tsx` (não mais usado) e o array `FORUM_SCENARIOS` de `forumScenarios.ts` (mantém apenas os tipos, reexportados).
- **Criar** `supabase/functions/forum-analyze/index.ts` + entrada em `supabase/config.toml` com `verify_jwt = false`.

## Fora de escopo

- Nada muda no admin, no AccessGate, em outras rotas, no banco, ou em edge functions existentes.
- Sem persistência de filtros, sem export/PDF, sem login.
- Sem consumo das tabelas `readings`/`reading_values` (mantido demonstrativo, conforme decisão).

## Verificação

Após implementar: rodar Playwright em `/forum-economia-do-mar`, alterar cada filtro e capturar screenshots confirmando que mapa (marcadores/bounds), gráfico e cards reagem; clicar em "Gerar análise com IA" e conferir resposta + logs da edge function.
