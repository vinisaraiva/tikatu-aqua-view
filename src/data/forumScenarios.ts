// Dados demonstrativos para a página do Fórum de Economia do Mar.
// Rótulo de origem: "adaptado" indica valores plausíveis usados para demonstração.
// Para atualizar coletas, edite os objetos abaixo mantendo a mesma estrutura.

export type ParameterStatus =
  | "Dentro da faixa adotada"
  | "Condição adequada"
  | "Requer atenção"
  | "Requer acompanhamento"
  | "Não avaliado";

export interface ScenarioParameter {
  code: string;
  name: string;
  value: number;
  unit: string;
  conamaMin?: number | null;
  conamaMax?: number | null;
  status: ParameterStatus;
  description: string;
}

export interface ScenarioAnalysis {
  sintese: string;
  atencao: string[];
  recomendacoes: string[];
  limitacao: string;
}

export interface ForumScenario {
  id: string;
  title: string;
  shortLabel: string;
  environment: string;
  date: string; // ISO
  season: "Período seco" | "Período chuvoso" | "Comparação seco × chuvoso";
  origin: string;
  originTag: "adaptado" | "demonstrativo" | "real";
  coordinates: { lat: number; lng: number };
  pointName: string;
  river: string;
  description: string;
  parameters: ScenarioParameter[];
  // Segunda série (para o cenário comparativo)
  parametersAlt?: ScenarioParameter[];
  altLabel?: string;
  analysis: ScenarioAnalysis;
}

export const FORUM_SCENARIOS: ForumScenario[] = [
  {
    id: "buranhem-seco",
    title: "Rio Buranhém — trecho fluvial",
    shortLabel: "Condições predominantemente adequadas",
    environment: "Rio",
    date: "2024-08-14",
    season: "Período seco",
    origin: "Base demonstrativa do projeto",
    originTag: "adaptado",
    coordinates: { lat: -16.4402, lng: -39.0741 },
    pointName: "Ponto Buranhém 450",
    river: "Rio Buranhém",
    description:
      "Coleta em trecho médio do rio, em condições de vazão reduzida típicas do período seco.",
    parameters: [
      { code: "ph", name: "pH", value: 7.2, unit: "", conamaMin: 6, conamaMax: 9, status: "Dentro da faixa adotada", description: "Grau de acidez ou alcalinidade da água." },
      { code: "od", name: "Oxigênio dissolvido", value: 6.8, unit: "mg/L", conamaMin: 5, status: "Dentro da faixa adotada", description: "Oxigênio disponível para a vida aquática." },
      { code: "turb", name: "Turbidez", value: 18, unit: "UNT", conamaMax: 100, status: "Dentro da faixa adotada", description: "Grau de transparência da água." },
      { code: "dbo", name: "DBO", value: 3.1, unit: "mg/L", conamaMax: 5, status: "Dentro da faixa adotada", description: "Demanda bioquímica de oxigênio; indica matéria orgânica." },
      { code: "pt", name: "Fósforo total", value: 0.08, unit: "mg/L", conamaMax: 0.1, status: "Requer acompanhamento", description: "Nutriente associado a eutrofização." },
      { code: "colif", name: "Coliformes termotolerantes", value: 620, unit: "NMP/100 mL", conamaMax: 1000, status: "Dentro da faixa adotada", description: "Indicador microbiológico de contaminação." },
      { code: "temp", name: "Temperatura", value: 25.4, unit: "°C", status: "Não avaliado", description: "Temperatura registrada em campo." },
      { code: "cond", name: "Condutividade", value: 92, unit: "µS/cm", status: "Não avaliado", description: "Concentração de íons dissolvidos." },
    ],
    analysis: {
      sintese:
        "Os dados desta coleta indicam condições predominantemente adequadas para o trecho fluvial avaliado, com pH neutro, oxigênio dissolvido em nível compatível com a manutenção de vida aquática e turbidez baixa. Os valores de matéria orgânica e microbiológicos permanecem dentro da faixa adotada como referência.",
      atencao: [
        "Fósforo total próximo do limite superior, sugerindo acompanhamento em coletas seguintes.",
      ],
      recomendacoes: [
        "Manter coletas periódicas no mesmo ponto para acompanhar a evolução do fósforo total.",
        "Ampliar a leitura de temperatura e condutividade em campo para compor série histórica.",
      ],
      limitacao:
        "A interpretação considera apenas os dados disponíveis nesta coleta e não substitui avaliação técnica de campo ou análise laboratorial complementar.",
    },
  },
  {
    id: "estuario-chuvoso",
    title: "Estuário do Buranhém",
    shortLabel: "Parâmetros que demandam atenção",
    environment: "Estuário",
    date: "2024-05-12",
    season: "Período chuvoso",
    origin: "Base demonstrativa do projeto",
    originTag: "adaptado",
    coordinates: { lat: -16.4498, lng: -39.0631 },
    pointName: "Estuário Ponto 12",
    river: "Rio Buranhém",
    description:
      "Ponto próximo à foz durante o período chuvoso, com maior aporte continental e mistura estuarina.",
    parameters: [
      { code: "ph", name: "pH", value: 6.4, unit: "", conamaMin: 6, conamaMax: 9, status: "Requer atenção", description: "Grau de acidez ou alcalinidade da água." },
      { code: "od", name: "Oxigênio dissolvido", value: 4.2, unit: "mg/L", conamaMin: 5, status: "Requer atenção", description: "Oxigênio disponível para a vida aquática." },
      { code: "turb", name: "Turbidez", value: 132, unit: "UNT", conamaMax: 100, status: "Requer atenção", description: "Grau de transparência da água." },
      { code: "dbo", name: "DBO", value: 6.8, unit: "mg/L", conamaMax: 5, status: "Requer atenção", description: "Demanda bioquímica de oxigênio; indica matéria orgânica." },
      { code: "pt", name: "Fósforo total", value: 0.14, unit: "mg/L", conamaMax: 0.1, status: "Requer atenção", description: "Nutriente associado a eutrofização." },
      { code: "colif", name: "Coliformes termotolerantes", value: 1450, unit: "NMP/100 mL", conamaMax: 1000, status: "Requer atenção", description: "Indicador microbiológico de contaminação." },
      { code: "temp", name: "Temperatura", value: 27.1, unit: "°C", status: "Não avaliado", description: "Temperatura registrada em campo." },
      { code: "cond", name: "Condutividade", value: 3200, unit: "µS/cm", status: "Não avaliado", description: "Concentração de íons dissolvidos; influenciada pela mistura estuarina." },
    ],
    analysis: {
      sintese:
        "A coleta indica conjunto de parâmetros que demandam atenção no ambiente estuarino avaliado. Turbidez, DBO e fósforo total apresentam valores acima da faixa adotada como referência, acompanhados por oxigênio dissolvido reduzido e indicador microbiológico elevado. O quadro é compatível com maior aporte continental típico de período chuvoso.",
      atencao: [
        "Oxigênio dissolvido abaixo da faixa adotada.",
        "Turbidez, DBO e fósforo total acima do valor de referência.",
        "Coliformes termotolerantes elevados.",
      ],
      recomendacoes: [
        "Programar nova coleta após o período chuvoso para comparação.",
        "Verificar possíveis fontes de aporte de matéria orgânica na bacia contribuinte.",
        "Registrar condições de campo (chuva recente, maré, vento) junto às próximas coletas.",
      ],
      limitacao:
        "A interpretação considera apenas os dados disponíveis nesta coleta e não substitui avaliação técnica de campo ou análise laboratorial complementar.",
    },
  },
  {
    id: "comparacao-sazonal",
    title: "Comparação entre períodos — Ponto Buranhém 450",
    shortLabel: "Comparação seco × chuvoso",
    environment: "Rio",
    date: "2024-08-14",
    season: "Comparação seco × chuvoso",
    origin: "Base demonstrativa do projeto",
    originTag: "adaptado",
    coordinates: { lat: -16.4402, lng: -39.0741 },
    pointName: "Ponto Buranhém 450",
    river: "Rio Buranhém",
    description:
      "Mesmo ponto amostrado em dois momentos: seco (agosto) e chuvoso (março). Barras mostram o período seco.",
    parameters: [
      { code: "ph", name: "pH (seco)", value: 7.2, unit: "", conamaMin: 6, conamaMax: 9, status: "Dentro da faixa adotada", description: "Grau de acidez ou alcalinidade da água." },
      { code: "od", name: "Oxigênio dissolvido (seco)", value: 6.8, unit: "mg/L", conamaMin: 5, status: "Dentro da faixa adotada", description: "Oxigênio disponível para a vida aquática." },
      { code: "turb", name: "Turbidez (seco)", value: 18, unit: "UNT", conamaMax: 100, status: "Dentro da faixa adotada", description: "Grau de transparência da água." },
      { code: "dbo", name: "DBO (seco)", value: 3.1, unit: "mg/L", conamaMax: 5, status: "Dentro da faixa adotada", description: "Demanda bioquímica de oxigênio." },
      { code: "pt", name: "Fósforo total (seco)", value: 0.07, unit: "mg/L", conamaMax: 0.1, status: "Dentro da faixa adotada", description: "Nutriente associado a eutrofização." },
      { code: "colif", name: "Coliformes (seco)", value: 540, unit: "NMP/100 mL", conamaMax: 1000, status: "Dentro da faixa adotada", description: "Indicador microbiológico." },
    ],
    parametersAlt: [
      { code: "ph", name: "pH (chuvoso)", value: 6.6, unit: "", conamaMin: 6, conamaMax: 9, status: "Dentro da faixa adotada", description: "Grau de acidez ou alcalinidade da água." },
      { code: "od", name: "Oxigênio dissolvido (chuvoso)", value: 5.3, unit: "mg/L", conamaMin: 5, status: "Dentro da faixa adotada", description: "Oxigênio disponível para a vida aquática." },
      { code: "turb", name: "Turbidez (chuvoso)", value: 96, unit: "UNT", conamaMax: 100, status: "Requer acompanhamento", description: "Grau de transparência da água." },
      { code: "dbo", name: "DBO (chuvoso)", value: 4.6, unit: "mg/L", conamaMax: 5, status: "Requer acompanhamento", description: "Demanda bioquímica de oxigênio." },
      { code: "pt", name: "Fósforo total (chuvoso)", value: 0.11, unit: "mg/L", conamaMax: 0.1, status: "Requer atenção", description: "Nutriente associado a eutrofização." },
      { code: "colif", name: "Coliformes (chuvoso)", value: 980, unit: "NMP/100 mL", conamaMax: 1000, status: "Requer acompanhamento", description: "Indicador microbiológico." },
    ],
    altLabel: "Período chuvoso (março/2024)",
    analysis: {
      sintese:
        "A comparação entre coletas evidencia diferenças esperadas para um mesmo ponto entre estações. Durante o período seco, os parâmetros permanecem dentro da faixa adotada. No período chuvoso, turbidez, DBO e fósforo total se aproximam ou ultrapassam os valores de referência, com redução do oxigênio dissolvido.",
      atencao: [
        "Aproximação de turbidez e DBO ao limite superior no período chuvoso.",
        "Fósforo total acima do valor de referência no período chuvoso.",
      ],
      recomendacoes: [
        "Ampliar a série sazonal com coletas em transição seco-chuvoso.",
        "Registrar dados hidrológicos simultâneos (vazão, precipitação acumulada).",
      ],
      limitacao:
        "A interpretação considera apenas os dados disponíveis nestas coletas e não substitui avaliação técnica de campo ou análise laboratorial complementar.",
    },
  },
];
