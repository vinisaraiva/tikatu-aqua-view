## Objetivo

Trocar o fundo da primeira seção (hero) da página `/forum-economia-do-mar` pela mesma imagem usada na página de acesso, mas com um overlay claro para não atrapalhar a leitura do texto.

## Alterações

**Arquivo:** `src/components/forum/ForumHero.tsx`

1. Adicionar dentro do `<section>` uma camada absoluta com a imagem de fundo:
   - `url('/lovable-uploads/6c1c5451-5d11-445d-ac6a-b3c2450303b6.png')` (mesma da `SiteAccess`)
   - `bg-cover bg-center bg-no-repeat`
2. Adicionar por cima uma camada de overlay clara para suavizar a imagem:
   - `bg-white/75` com um leve `backdrop-blur-sm` (mais claro que o overlay escuro da página de acesso, garantindo contraste do texto escuro atual).
3. Manter o conteúdo (`max-w-6xl ...`) com `relative z-10` para ficar acima das camadas.
4. Manter o gradiente atual `from-primary/5 via-background to-background` removido (ou mantido bem sutil) — a imagem passa a ser o fundo principal.

Nenhuma outra seção da página é afetada, e nenhuma lógica é alterada.
