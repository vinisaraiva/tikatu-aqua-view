## Objetivo

Melhorar a visualização mobile da página `/forum-economia-do-mar` com base nas imagens anexas: logo maior/mais legível no header, remover o link "Produção científica" do topo, eliminar a rolagem horizontal (causada pelo diagrama de fluxo no hero) e adicionar um botão "Produção científica" abaixo da seção Responsáveis.

## Alterações

### 1. `src/components/forum/ForumHeader.tsx`
- Aumentar a logo no mobile (`h-11` no mobile, `h-9` em telas maiores) e deixar o texto "Fórum de Economia do Mar" apenas em `md:` (já é `sm:`; mover para `md:` para dar mais respiro em telas pequenas).
- **Remover** o botão "Produção científica" do header.
- Manter apenas o botão "Conheça o Tikatu" à direita, com tamanho compacto no mobile.
- Garantir que o header não estoure a largura (adicionar `min-w-0` / `truncate` onde necessário).

### 2. `src/components/forum/ForumHero.tsx`
- Envolver o `ForumFlowDiagram` num container com `overflow-x-auto` **restrito** (`-mx-4 px-4` para sangrar até a borda sem forçar a página a rolar) **ou** aplicar `overflow-hidden` no `<section>` já existente para conter a rolagem horizontal dentro do próprio hero, sem propagar para o `<body>`.
- Confirmar `overflow-hidden` no `<section>` (já tem `overflow-hidden` — verificar se o diagrama é o culpado; caso sim, adicionar `overflow-x-auto` no wrapper interno do diagrama para que a barra apareça só nele, não na página).

### 3. `src/pages/ForumEconomiaDoMar.tsx` (ou `src/components/forum/Team.tsx`)
- Após o componente `<Team />`, adicionar um botão/CTA "Produção científica" que faz scroll até `#publicacao` (âncora já existente do componente `Publication`).
- Botão centralizado, largura total no mobile (`w-full sm:w-auto`), usando `<Button asChild>` com `<a href="#publicacao">`.

### 4. Prevenção geral de scroll horizontal
- Adicionar `overflow-x-hidden` no container raiz da página (`<div className="min-h-screen ...">` em `ForumEconomiaDoMar.tsx`) como salvaguarda contra qualquer outro elemento que ultrapasse a viewport no mobile.

## Detalhes técnicos

- Nenhuma mudança de lógica ou dados — apenas apresentação/layout.
- Nenhuma outra página é afetada; ajustes ficam contidos em componentes `forum/*` e na página do fórum.
- A âncora `#publicacao` já é usada pelo componente `Publication` e pelo botão antigo do header, então o novo botão reaproveita esse alvo.
