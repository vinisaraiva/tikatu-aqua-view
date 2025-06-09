
export interface GlossaryTerm {
  term: string;
  definition: string;
  mediaUrl?: string;
}

export const glossaryTerms: GlossaryTerm[] = [
  {
    term: "pH",
    definition: "Medida da acidez ou alcalinidade da água em uma escala de 0 a 14. Valores abaixo de 7 indicam acidez, 7 é neutro, e acima de 7 indica alcalinidade. Para a vida aquática, o ideal é entre 6,5 e 8,5."
  },
  {
    term: "Turbidez",
    definition: "Medida da clareza da água. Indica a quantidade de partículas suspensas que reduzem a transparência. Medida em NTU (Unidades Nefelométricas de Turbidez). Águas muito turvas podem indicar poluição ou erosão."
  },
  {
    term: "Oxigênio Dissolvido (OD)",
    definition: "Quantidade de oxigênio disponível na água para a respiração dos organismos aquáticos. Medido em mg/L. Níveis baixos (< 5 mg/L) podem causar mortandade de peixes."
  },
  {
    term: "DBO (Demanda Bioquímica de Oxigênio)",
    definition: "Quantidade de oxigênio necessária para decompor a matéria orgânica presente na água em 5 dias a 20°C. Indica o grau de poluição por matéria orgânica."
  },
  {
    term: "Eutrofização",
    definition: "Processo de enriquecimento de nutrientes (nitrogênio e fósforo) na água, causando crescimento excessivo de algas e plantas aquáticas, que pode levar à diminuição do oxigênio."
  },
  {
    term: "Coliformes Termotolerantes",
    definition: "Bactérias indicadoras de contaminação fecal na água. Sua presença indica possível contaminação por esgoto doméstico ou dejetos animais."
  },
  {
    term: "IQA (Índice de Qualidade da Água)",
    definition: "Índice que varia de 0 a 100, calculado a partir de 9 parâmetros físico-químicos e microbiológicos. Classifica a água como: Excelente (91-100), Boa (71-90), Regular (51-70), Ruim (26-50) ou Péssima (0-25)."
  },
  {
    term: "IET (Índice de Estado Trófico)",
    definition: "Índice que avalia o grau de eutrofização de corpos d'água. Classifica em: Ultraoligotrófico, Oligotrófico, Mesotrófico, Eutrófico, Supereutrófico e Hipereutrófico."
  },
  {
    term: "CONAMA",
    definition: "Conselho Nacional do Meio Ambiente. Órgão que estabelece padrões e diretrizes para a qualidade da água no Brasil através de resoluções, como a Resolução 357/2005."
  },
  {
    term: "Classe de Corpo d'Água",
    definition: "Classificação dos corpos d'água segundo seus usos preponderantes: Classe 1 (consumo humano), Classe 2 (recreação), Classe 3 (consumo humano após tratamento), Classe 4 (navegação e harmonia paisagística)."
  }
];
