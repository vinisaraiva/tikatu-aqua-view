
export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export const quizQuestions: QuizQuestion[] = [
  {
    question: "Qual é o valor ideal de pH para a vida aquática?",
    options: ["4,0 - 5,0", "6,5 - 8,5", "9,0 - 10,0", "11,0 - 12,0"],
    correctIndex: 1,
    explanation: "O pH ideal para a vida aquática está entre 6,5 e 8,5, pois valores muito ácidos ou muito alcalinos podem ser tóxicos para os organismos."
  },
  {
    question: "O que indica um alto valor de DBO na água?",
    options: ["Baixa poluição", "Alta concentração de oxigênio", "Alta poluição orgânica", "Água pura"],
    correctIndex: 2,
    explanation: "Um alto valor de DBO indica alta poluição orgânica, pois significa que há muita matéria orgânica que consome oxigênio para se decompor."
  },
  {
    question: "Qual é a principal causa da eutrofização?",
    options: ["Excesso de oxigênio", "Falta de luz solar", "Excesso de nutrientes", "Baixa temperatura"],
    correctIndex: 2,
    explanation: "A eutrofização é causada principalmente pelo excesso de nutrientes como nitrogênio e fósforo, que promovem o crescimento excessivo de algas."
  },
  {
    question: "O que são coliformes termotolerantes?",
    options: ["Algas microscópicas", "Bactérias indicadoras de poluição fecal", "Peixes tropicais", "Plantas aquáticas"],
    correctIndex: 1,
    explanation: "Coliformes termotolerantes são bactérias que indicam contaminação fecal na água, sendo importantes indicadores de poluição por esgoto."
  },
  {
    question: "Em que unidade é medida a turbidez?",
    options: ["mg/L", "NTU", "pH", "°C"],
    correctIndex: 1,
    explanation: "A turbidez é medida em NTU (Unidades Nefelométricas de Turbidez), que indica a quantidade de partículas suspensas na água."
  },
  {
    question: "Qual classe de água é adequada para consumo humano com tratamento convencional?",
    options: ["Classe 1", "Classe 2", "Classe 3", "Classe 4"],
    correctIndex: 1,
    explanation: "A Classe 2 é adequada para consumo humano após tratamento convencional, recreação de contato primário e outros usos."
  },
  {
    question: "O que acontece quando o oxigênio dissolvido fica abaixo de 5 mg/L?",
    options: ["A água fica mais limpa", "Os peixes podem morrer", "A temperatura aumenta", "O pH diminui"],
    correctIndex: 1,
    explanation: "Quando o oxigênio dissolvido fica abaixo de 5 mg/L, pode ocorrer mortandade de peixes e outros organismos aquáticos."
  },
  {
    question: "O que significa IQA 85?",
    options: ["Água péssima", "Água ruim", "Água boa", "Água excelente"],
    correctIndex: 2,
    explanation: "IQA 85 indica água de qualidade boa, pois está na faixa de 71-90 da classificação do Índice de Qualidade da Água."
  },
  {
    question: "Qual é o principal responsável por estabelecer padrões de qualidade da água no Brasil?",
    options: ["IBAMA", "CONAMA", "ANVISA", "ANA"],
    correctIndex: 1,
    explanation: "O CONAMA (Conselho Nacional do Meio Ambiente) é o principal responsável por estabelecer padrões de qualidade da água no Brasil."
  },
  {
    question: "O que caracteriza um corpo d'água hipereutrófico?",
    options: ["Ausência total de nutrientes", "Níveis moderados de nutrientes", "Excesso extremo de nutrientes", "Presença de oxigênio"],
    correctIndex: 2,
    explanation: "Um corpo d'água hipereutrófico apresenta excesso extremo de nutrientes, resultando em proliferação intensa de algas e desequilíbrio ecológico."
  }
];
