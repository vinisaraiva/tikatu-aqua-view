// Dataset demonstrativo ampliado para o painel do Fórum de Economia do Mar.
// Rótulo "adaptado": valores plausíveis usados para demonstração pública.
// Para atualizar coletas, edite os arrays abaixo mantendo a mesma estrutura.

import type { ScenarioParameter, ParameterStatus } from "./forumScenarios";

export interface CollectionPoint {
  id: string;
  name: string;
  river: string;
  environment: "Rio" | "Estuário" | "Afluente";
  coordinates: { lat: number; lng: number };
  description: string;
}

export interface Reading {
  id: string;
  pointId: string;
  date: string; // ISO YYYY-MM-DD
  season: "Período seco" | "Período chuvoso" | "Transição";
  parameters: ScenarioParameter[];
}

export const FORUM_POINTS: CollectionPoint[] = [
  {
    id: "cabeceira",
    name: "Cabeceira Buranhém",
    river: "Rio Buranhém",
    environment: "Rio",
    coordinates: { lat: -16.2118, lng: -39.5901 },
    description: "Trecho de cabeceira, com influência antrópica reduzida.",
  },
  {
    id: "medio",
    name: "Ponto Buranhém 450",
    river: "Rio Buranhém",
    environment: "Rio",
    coordinates: { lat: -16.4402, lng: -39.0741 },
    description: "Trecho médio, referência de monitoramento contínuo.",
  },
  {
    id: "urbano",
    name: "Trecho urbano Eunápolis",
    river: "Rio Buranhém",
    environment: "Rio",
    coordinates: { lat: -16.3745, lng: -39.5811 },
    description: "Trecho urbano com aporte antrópico maior.",
  },
  {
    id: "jusante",
    name: "Jusante Porto Seguro",
    river: "Rio Buranhém",
    environment: "Rio",
    coordinates: { lat: -16.4460, lng: -39.0805 },
    description: "Trecho jusante, próximo à área urbana costeira.",
  },
  {
    id: "estuario",
    name: "Estuário do Buranhém",
    river: "Rio Buranhém",
    environment: "Estuário",
    coordinates: { lat: -16.4498, lng: -39.0631 },
    description: "Região estuarina com mistura de águas.",
  },
  {
    id: "afluente",
    name: "Afluente rural Santo Antônio",
    river: "Córrego Santo Antônio",
    environment: "Afluente",
    coordinates: { lat: -16.3020, lng: -39.3550 },
    description: "Afluente em área rural com uso agropecuário.",
  },
];

// Definição base dos 8 parâmetros e como cada ponto/estação afeta o valor.
interface ParamSpec {
  code: string;
  name: string;
  unit: string;
  conamaMin?: number;
  conamaMax?: number;
  description: string;
  // valor base por ponto (Rio médio saudável) e modificadores
  base: number;
  byPoint: Record<string, number>; // fator multiplicativo
  bySeason: Record<"Período seco" | "Período chuvoso" | "Transição", number>;
}

const PARAM_SPECS: ParamSpec[] = [
  {
    code: "ph",
    name: "pH",
    unit: "",
    conamaMin: 6,
    conamaMax: 9,
    description: "Grau de acidez ou alcalinidade da água.",
    base: 7.2,
    byPoint: { cabeceira: 1.0, medio: 1.0, urbano: 0.92, jusante: 0.95, estuario: 1.05, afluente: 0.96 },
    bySeason: { "Período seco": 1.0, "Período chuvoso": 0.93, "Transição": 0.97 },
  },
  {
    code: "od",
    name: "Oxigênio dissolvido",
    unit: "mg/L",
    conamaMin: 5,
    description: "Oxigênio disponível para a vida aquática.",
    base: 7.0,
    byPoint: { cabeceira: 1.15, medio: 1.0, urbano: 0.6, jusante: 0.8, estuario: 0.7, afluente: 0.85 },
    bySeason: { "Período seco": 1.05, "Período chuvoso": 0.75, "Transição": 0.9 },
  },
  {
    code: "turb",
    name: "Turbidez",
    unit: "UNT",
    conamaMax: 100,
    description: "Grau de transparência da água.",
    base: 20,
    byPoint: { cabeceira: 0.5, medio: 1.0, urbano: 2.2, jusante: 1.6, estuario: 3.0, afluente: 1.8 },
    bySeason: { "Período seco": 0.7, "Período chuvoso": 2.4, "Transição": 1.3 },
  },
  {
    code: "dbo",
    name: "DBO",
    unit: "mg/L",
    conamaMax: 5,
    description: "Demanda bioquímica de oxigênio; indica matéria orgânica.",
    base: 3.0,
    byPoint: { cabeceira: 0.5, medio: 1.0, urbano: 2.3, jusante: 1.6, estuario: 1.9, afluente: 1.4 },
    bySeason: { "Período seco": 0.85, "Período chuvoso": 1.5, "Transição": 1.1 },
  },
  {
    code: "pt",
    name: "Fósforo total",
    unit: "mg/L",
    conamaMax: 0.1,
    description: "Nutriente associado a eutrofização.",
    base: 0.06,
    byPoint: { cabeceira: 0.4, medio: 1.0, urbano: 2.4, jusante: 1.5, estuario: 1.8, afluente: 1.6 },
    bySeason: { "Período seco": 0.85, "Período chuvoso": 1.6, "Transição": 1.1 },
  },
  {
    code: "colif",
    name: "Coliformes termotolerantes",
    unit: "NMP/100 mL",
    conamaMax: 1000,
    description: "Indicador microbiológico de contaminação.",
    base: 500,
    byPoint: { cabeceira: 0.2, medio: 1.0, urbano: 3.5, jusante: 1.8, estuario: 2.2, afluente: 1.5 },
    bySeason: { "Período seco": 0.7, "Período chuvoso": 1.8, "Transição": 1.1 },
  },
  {
    code: "temp",
    name: "Temperatura",
    unit: "°C",
    description: "Temperatura registrada em campo.",
    base: 25.5,
    byPoint: { cabeceira: 0.94, medio: 1.0, urbano: 1.03, jusante: 1.02, estuario: 1.06, afluente: 0.98 },
    bySeason: { "Período seco": 0.97, "Período chuvoso": 1.02, "Transição": 1.0 },
  },
  {
    code: "cond",
    name: "Condutividade",
    unit: "µS/cm",
    description: "Concentração de íons dissolvidos.",
    base: 110,
    byPoint: { cabeceira: 0.6, medio: 1.0, urbano: 2.5, jusante: 1.4, estuario: 32, afluente: 1.2 },
    bySeason: { "Período seco": 1.1, "Período chuvoso": 0.75, "Transição": 0.95 },
  },
];

const round = (n: number, code: string) => {
  if (code === "ph") return Math.round(n * 10) / 10;
  if (code === "pt") return Math.round(n * 100) / 100;
  if (code === "od" || code === "dbo") return Math.round(n * 10) / 10;
  if (code === "temp") return Math.round(n * 10) / 10;
  return Math.round(n);
};

const deriveStatus = (
  code: string,
  value: number,
  min?: number,
  max?: number,
): ParameterStatus => {
  if (code === "temp" || code === "cond") return "Não avaliado";
  if (min != null && value < min) return "Requer atenção";
  if (max != null) {
    if (value > max) return "Requer atenção";
    if (value > max * 0.9) return "Requer acompanhamento";
  }
  return "Dentro da faixa adotada";
};

const seasonForMonth = (month: number): Reading["season"] => {
  // Sul da Bahia: chuvoso mar–jul; seco ago–jan; transição fev
  if (month >= 3 && month <= 7) return "Período chuvoso";
  if (month === 2) return "Transição";
  return "Período seco";
};

// Gera 24 coletas: 4 por ponto, espalhadas no ano
const buildReadings = (): Reading[] => {
  const months = [1, 4, 7, 10]; // jan, abr, jul, out
  const readings: Reading[] = [];
  let counter = 0;

  FORUM_POINTS.forEach((point) => {
    months.forEach((m, idx) => {
      const day = 12 + ((counter * 3) % 15);
      const date = `2024-${String(m).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const season = seasonForMonth(m);

      // pequena variação pseudo-aleatória determinística por ponto+mês
      const jitterSeed = (point.id.charCodeAt(0) + m * 7 + idx) % 7;
      const jitter = 0.9 + (jitterSeed / 7) * 0.2; // 0.9..1.1

      const parameters: ScenarioParameter[] = PARAM_SPECS.map((spec) => {
        const pointFactor = spec.byPoint[point.id] ?? 1;
        const seasonFactor = spec.bySeason[season];
        const raw = spec.base * pointFactor * seasonFactor * jitter;
        const value = round(raw, spec.code);
        const status = deriveStatus(spec.code, value, spec.conamaMin, spec.conamaMax);
        return {
          code: spec.code,
          name: spec.name,
          value,
          unit: spec.unit,
          conamaMin: spec.conamaMin ?? null,
          conamaMax: spec.conamaMax ?? null,
          status,
          description: spec.description,
        };
      });

      readings.push({
        id: `${point.id}-${date}`,
        pointId: point.id,
        date,
        season,
        parameters,
      });
      counter++;
    });
  });

  return readings;
};

export const FORUM_READINGS: Reading[] = buildReadings();

export const FORUM_PARAMETERS = PARAM_SPECS.map((p) => ({
  code: p.code,
  name: p.name,
  unit: p.unit,
  conamaMin: p.conamaMin ?? null,
  conamaMax: p.conamaMax ?? null,
  description: p.description,
}));

export const FORUM_DATE_MIN = "2024-01-01";
export const FORUM_DATE_MAX = "2024-12-31";
