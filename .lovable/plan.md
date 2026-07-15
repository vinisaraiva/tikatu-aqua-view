
# Página do evento: Fórum de Economia do Mar de Porto Seguro

Página pública, sem login, integrada ao projeto Tikatu, servida em rota específica dentro do app atual (não é aplicação separada). Reaproveita a identidade visual, tokens e componentes já existentes (Leaflet, gráfico de barras, análise por IA), mas com layout curado, mobile-first e enxuto para uso presencial no evento.

## Rota e acesso

- Nova rota pública: `/forum-economia-do-mar` em `src/App.tsx`, **fora** do `<AccessGate>`, para acesso direto sem código.
- Também pública em `robots.txt` (indexável) e com meta tags próprias via `react-helmet-async` (instalar), sem afetar demais páginas.
- Subdomínio `economiadomar.tikatu.com.br` fica como orientação de DNS pós-publicação — não é criado por código.

## Estrutura de arquivos

```text
src/pages/ForumEconomiaDoMar.tsx          # página única (single page, âncoras)
src/components/forum/
  ForumHeader.tsx                          # cabeçalho fixo compacto com logo
  ForumHero.tsx                            # dobra inicial + selo + botão "Explorar uma coleta"
  ForumFlowDiagram.tsx                     # Bacia → Rio → Estuário → Manguezal → Praia → Mar
  ScenarioSelector.tsx                     # 3 cartões de cenário, controle de estado
  CollectionPanel.tsx                      # dados do ponto + cartões de parâmetros
  ParameterCard.tsx                        # cartão expansível (nome, valor, unidade, situação, ícone+rótulo)
  ForumChart.tsx                           # gráfico de barras usando ReadingsBarChart existente
  ForumMiniMap.tsx                         # wrapper leve sobre LeafletMap com props do cenário
  AnalysisPanel.tsx                        # botão + steps de loading + resultado em 4 blocos
  BlueEconomySection.tsx                   # "Da bacia ao mar" + 4 cartões
  HowItWorks.tsx                           # fluxo Coleta→Validação→…→Comunicação
  AIRoleSection.tsx                        # papel da IA + 4 pontos
  AppliedResearch.tsx                      # Ciência → Tecnologia → Aplicação → Impacto
  Publication.tsx                          # artigo + autores + campos DOI/periódico/link
  Team.tsx                                 # responsáveis
  ContactFooter.tsx                        # site, e-mail, botões, copiar link, compartilhar
src/data/forumScenarios.ts                 # 3 cenários demonstrativos em JSON tipado
```

Uma única página monta as seções em ordem; navegação por âncoras (`#coleta`, `#analise`, `#publicacao`, `#contato`).

## Cenários demonstrativos

Arquivo `src/data/forumScenarios.ts` com 3 objetos tipados. Cada cenário traz:

- id, título, data, período (seco/chuvoso), tipo de ambiente, origem (rotulada como *real*, *adaptado* ou *demonstrativo*), coordenadas;
- lista de parâmetros (pH, OD, turbidez, DBO, fósforo total, coliformes termotolerantes, temperatura, condutividade) com valor, unidade, faixa CONAMA quando aplicável, situação (`Dentro da faixa adotada` / `Requer atenção` / `Requer acompanhamento` / `Não avaliado`) e descrição curta;
- bloco de análise pré-escrita (síntese, atenção, recomendações, limitação) para garantir estabilidade offline no evento.

Cenários:
1. Condições predominantemente adequadas (Rio Buranhém, período seco).
2. Parâmetros que demandam atenção (estuário, período chuvoso).
3. Comparação seco × chuvoso (mesmo ponto, dois conjuntos).

Cenário 1 selecionado por padrão. Trocar cenário atualiza cartões, gráfico, mapa e análise sem recarregar.

## Interatividade

- Estado local via `useState`/`useMemo` na página.
- `ParameterCard` expande explicação ao clicar (accordion controlado).
- `ForumChart` reutiliza `ReadingsBarChart` com CONAMA min/max quando existirem.
- `ForumMiniMap` usa `LeafletMap` existente com `hideBusinessNames`, altura reduzida.
- `AnalysisPanel`: botão "Gerar análise" dispara sequência de 4 passos curtos (~1.6s total) e revela o texto pré-carregado do cenário atual em 4 blocos. Sem chamada de rede — garante estabilidade no evento.
- Compartilhamento: Web Share API com fallback para "Copiar link" (toast do sonner já disponível).

## Identidade visual

- Reutilizar tokens de `src/index.css` / `tailwind.config.ts`. Só semantic tokens; nada de `bg-white`/cores hardcoded.
- Se necessário, adicionar variáveis específicas (`--forum-sand`, `--forum-deep`) derivadas da paleta existente, sem quebrar tema.
- Logo oficial vinda do `Header` atual (mesmo asset).
- Sem gradientes neon; bordas suaves, cartões claros, ícones `lucide-react` já usados no projeto.

## SEO e compartilhamento

- Instalar `react-helmet-async`, adicionar `HelmetProvider` em `src/main.tsx`.
- `<Helmet>` na página com title, description, canonical (`/forum-economia-do-mar`), og:title/description/url/type, twitter:card. Não gerar og:image agora — hosting injeta preview.
- Manter head sitewide de `index.html` intacto.

## Textos e tom

- Copy final embutida nos componentes, revisada para evitar jargão de marketing (lista de termos proibidos aplicada).
- Nenhum lorem/placeholder. Campos DOI/periódico/link do artigo ficam como constantes no topo de `Publication.tsx`, com comentário indicando onde editar.

## Responsividade e acessibilidade

- Mobile-first: uma coluna até `md`, duas colunas em áreas interativas em `lg`.
- Verificar 360/390/tablet/desktop; sem overflow horizontal.
- Foco visível, `aria-label` em botões-ícone, `aria-expanded` nos cartões expansíveis, contraste AA.

## Fora de escopo

- Sem alterações em rotas existentes, admin, banco, edge functions.
- Sem novas dependências além de `react-helmet-async`.
- Sem geração de PDF, sem login, sem chatbot, sem gamificação.

## Critérios de conclusão

Ao final: 3 cenários selecionáveis atualizando cartões/gráfico/mapa/análise; página funcional em 360 px sem rolagem horizontal; console limpo; textos definitivos; botões de compartilhar e "Acessar o Tikatu" funcionais; meta tags específicas ativas.

---

## Detalhes técnicos

- **Roteamento**: adicionar `<Route path="/forum-economia-do-mar" element={<ForumEconomiaDoMar />} />` acima do catch-all, sem `AccessGate`.
- **Helmet**: `bun add react-helmet-async`; provider em `main.tsx`; `<Helmet>` na página do evento e nada mais (fallback continua o `index.html`).
- **Reuso de componentes**: `LeafletMap` (`src/components/dashboard/LeafletMap.tsx`) e `ReadingsBarChart` (`src/components/dashboard/chart/ReadingsBarChart.tsx`) são reutilizados via wrappers finos, sem editá-los.
- **Dados**: JSON estático em `src/data/forumScenarios.ts`, importado direto — zero rede em runtime, tolerante a falha de API.
- **Análise IA**: usa texto pré-escrito do cenário para o evento; se desejado depois, plugar em `useWaterReport` sem mudar UI.
