# Dashboard: datas, gráficos e desempenho

## O que está errado hoje (verificado)

1. **Filtrar um dia único não mostra nada.** Ao escolher uma data, o filtro usa o mesmo instante (meia-noite) como início e fim, então só apareceria uma coleta feita exatamente à meia-noite. Exemplo real: existe coleta no ponto POÇO-01 em 07/09/2026 às 18:53 (horário da Bahia) e a tela mostra "Nenhuma leitura encontrada".
2. **Gráfico repete o nome do ponto.** As barras são rotuladas pelo nome do ponto de coleta. Com um único ponto e várias datas, aparece "POÇO-01" várias vezes e a data nunca aparece.
3. **Sem data selecionada, traz tudo.** Hoje a tela busca todas as coletas do período inteiro; com anos de histórico isso vai ficar lento.

## O que será feito

### 1. Corrigir o filtro de data
- Data única passa a cobrir o dia inteiro (00:00 até 23:59:59 no horário de Brasília/Bahia).
- Intervalo passa a incluir o dia final completo.
- Remover os textos de "Debug" que aparecem na tela de filtros e na área de leituras.

### 2. Melhorar os gráficos
- Quando houver **um único ponto** selecionado, o eixo horizontal passa a mostrar a **data** de cada coleta (dd/MM, com hora quando houver mais de uma no mesmo dia), em ordem crescente.
- Quando houver **vários pontos**, o eixo mostra `PONTO · dd/MM`, para não repetir rótulos idênticos.
- A dica que aparece ao passar o mouse mostra ponto, data/hora completa e valor com unidade.
- Se houver muitos registros, os rótulos são exibidos de forma espaçada para não embolar.

### 3. Deixar o carregamento leve
- Sem data escolhida, a tela passa a carregar apenas o **período recente padrão (últimos 30 dias)**, com um aviso discreto: "Mostrando os últimos 30 dias — escolha um período para ver mais".
- Botões rápidos de período: 7 dias, 30 dias, 90 dias, 12 meses.
- Teto de segurança de registros por consulta, com aviso quando o período for grande demais e sugestão de reduzir o intervalo.
- As buscas passam a guardar o resultado por alguns minutos, para trocar de aba sem recarregar tudo.

## Detalhes técnicos

- `src/components/dashboard/DateFilter.tsx`: normalizar limites com `startOfDay`/`endOfDay` em `America/Bahia` antes de chamar `onDateChange`; adicionar presets; remover bloco de debug.
- `src/hooks/useReadingsData.ts`: `useReadings` recebe janela padrão (30 dias) quando `startDate`/`endDate` são `undefined`; aplicar `.limit()` explícito e retornar flag `truncated`; `useReadingValues` continua em lote por `reading_id` (mantendo `.in()` fatiado em blocos de 200 ids para não estourar URL); definir `staleTime` (5 min) nas queries.
- `src/pages/Dashboard.tsx`: passar a janela padrão e o aviso; remover `console.log` de estado; evitar refazer o mesmo par de queries no wrapper de relatório (reutilizar os dados já buscados).
- `src/components/dashboard/ReadingsDataTransformer.tsx`: remover os `console.log` por registro (custo alto com muitos dados) e expor `measuredAt` já ordenável.
- `src/components/dashboard/chart/ReadingsBarChart.tsx` + `src/components/dashboard/point/ParameterChart.tsx`: novo campo `label` calculado (data ou `ponto · data`), ordenação por `measured_at`, `XAxis interval="preserveStartEnd"`, tooltip com data completa.
- `src/components/dashboard/RecentReadings.tsx`: remover bloco "Debug Info" e exibir o aviso de período padrão/truncamento.
- Nenhuma alteração no banco de dados.
