## Ajustes na página `/forum-economia-do-mar`

### 1. Remover botão "Produção científica" após Responsáveis
**`src/components/forum/Team.tsx`**
- Remover o bloco `<div className="mt-8 flex justify-center">...</div>` com o `<Button>` que aponta para `#publicacao`.
- Remover o import não utilizado do `Button`.
- Justificativa: a seção `Publication` já existe na página e é âncora natural do conteúdo.

### 2. Eliminar a barra de rolagem horizontal
Investigação: o `<div>` raiz da página já tem `overflow-x-hidden`, mas a barra ainda aparece. Causa provável: o `ForumFlowDiagram` usa `overflow-x-auto` com `min-w-max`, que renderiza uma barra dentro do próprio bloco no mobile (o hero e a seção "Da bacia ao mar" repetem o diagrama).

**`src/components/forum/ForumFlowDiagram.tsx`**
- No mobile, permitir que o diagrama quebre em duas linhas em vez de rolar: trocar `flex min-w-max items-center gap-2` por `flex flex-wrap items-center justify-center gap-x-2 gap-y-3 sm:flex-nowrap sm:min-w-max`.
- Ocultar o conector (`<span aria-hidden ...>`) quando o item quebra de linha, mantendo-o só em `sm:` (`hidden sm:inline-block`).
- Remover o `overflow-x-auto` do wrapper externo, já que não haverá mais overflow no mobile.

### 3. Melhorar contraste do texto do hero sobre a imagem
**`src/components/forum/ForumHero.tsx`**
- Substituir o overlay chapado `bg-white/50 backdrop-blur-[2px]` por um gradiente vertical que escurece/clareia estrategicamente:
  `bg-gradient-to-b from-background/85 via-background/70 to-background/85 backdrop-blur-[1px]`.
  Isso deixa a imagem visível ao centro e reforça a leitura do título/parágrafo.
- No `<h1>`, adicionar `drop-shadow-sm` para reforçar bordas do texto.
- No `<p>` de descrição, trocar `text-muted-foreground` por `text-foreground/80` para ganho de contraste sem virar preto puro.
- Manter o bloco de data/local com o mesmo tratamento (`text-foreground/80`).

## Detalhes técnicos
- Nenhuma mudança de lógica ou dados.
- Alterações restritas a `Team.tsx`, `ForumFlowDiagram.tsx` e `ForumHero.tsx`.
- Uso de tokens semânticos (`background`, `foreground`) — sem cores hardcoded.
