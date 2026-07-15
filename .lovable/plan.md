## Objetivo
Tornar a seção de filtros (`ScenarioFilters`) mais compacta no painel do Fórum, especialmente no mobile, substituindo os controles atuais (chips grandes de parâmetros e grade de 3 colunas) por um layout tipo lista/accordion que ocupe menos espaço vertical.

## Mudanças propostas

**Arquivo:** `src/components/forum/ScenarioFilters.tsx`

1. **Container colapsável**: envolver todos os filtros em um `Accordion` (shadcn) fechado por padrão no mobile. Cabeçalho enxuto exibindo resumo dos filtros ativos (ex: `"3 pontos · pH · Últimos 30d"`) + ícone de filtro. Abre para revelar controles.

2. **Layout em lista vertical** (dentro do accordion):
   - Trocar o `grid md:grid-cols-3` por lista vertical de linhas compactas, cada uma com label à esquerda e controle à direita (padrão "settings list").
   - Linha "Pontos": mantém o `Popover` com checkboxes, mas o trigger vira uma linha slim.
   - Linha "Período": presets (7d/30d/90d/1 ano/Tudo) como `Select` compacto em vez dos 5 chips; datas customizadas ficam num sub-popover "Personalizar".
   - Linha "Parâmetro": trocar os chips grandes por um `Select` (dropdown) já que só um parâmetro pode ser selecionado por vez — economiza muito espaço vertical.

3. **Botão "Restaurar filtros"**: mover para um ícone `RotateCcw` discreto no cabeçalho do accordion (ao lado do resumo), removendo a coluna dedicada.

## Detalhes técnicos

- Reutilizar `Accordion`, `Select`, `Popover` já disponíveis em `src/components/ui`.
- No desktop (`md:`), o accordion pode iniciar aberto (`defaultValue="filters"`); no mobile, fechado.
- Preservar a `FilterState` e a API `onChange`/`onReset` — apenas UI muda, nenhuma lógica de filtragem é alterada.
- Datas customizadas continuam via `Calendar` em popover, acessíveis por link "Personalizar período".

## Resultado esperado
Bloco de filtros passa de ~4 linhas visíveis para 1 linha (colapsado) ou 3 linhas slim (aberto) no mobile, sem perder funcionalidade.