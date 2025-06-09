
export interface TimelineEvent {
  date: string;
  title: string;
  description: string;
  mediaUrl?: string;
  type: 'legislation' | 'incident' | 'achievement' | 'discovery';
}

export const timelineEvents: TimelineEvent[] = [
  {
    date: "1981-08-31",
    title: "Lei 6.938 - Política Nacional do Meio Ambiente",
    description: "Criação da Política Nacional do Meio Ambiente no Brasil, estabelecendo princípios e instrumentos para a proteção ambiental.",
    type: "legislation"
  },
  {
    date: "1988-10-05",
    title: "Constituição Federal - Artigo 225",
    description: "A Constituição Brasileira estabelece o direito ao meio ambiente equilibrado como direito fundamental.",
    type: "legislation"
  },
  {
    date: "1997-01-08",
    title: "Lei das Águas (Lei 9.433)",
    description: "Institui a Política Nacional de Recursos Hídricos e cria o Sistema Nacional de Gerenciamento de Recursos Hídricos.",
    type: "legislation"
  },
  {
    date: "2000-03-01",
    title: "Criação da ANA",
    description: "Criação da Agência Nacional de Águas, responsável pela gestão dos recursos hídricos de domínio da União.",
    type: "achievement"
  },
  {
    date: "2005-03-17",
    title: "Resolução CONAMA 357",
    description: "Estabelece classificação e diretrizes ambientais para o enquadramento dos corpos de água superficiais.",
    type: "legislation"
  },
  {
    date: "2015-11-05",
    title: "Rompimento da barragem de Mariana",
    description: "Maior desastre ambiental da história do Brasil, com impactos severos no Rio Doce.",
    type: "incident"
  },
  {
    date: "2019-01-25",
    title: "Rompimento da barragem de Brumadinho",
    description: "Tragédia ambiental e humana que evidenciou a necessidade de maior fiscalização de barragens.",
    type: "incident"
  },
  {
    date: "2020-06-01",
    title: "Marco Legal do Saneamento",
    description: "Nova legislação estabelece metas para universalização do saneamento básico até 2033.",
    type: "legislation"
  },
  {
    date: "2021-03-22",
    title: "Dia Mundial da Água",
    description: "ONU destaca a importância da valorização da água e sua conexão com mudanças climáticas.",
    type: "achievement"
  },
  {
    date: "2023-01-01",
    title: "Implementação de Novas Tecnologias",
    description: "Início do uso de sensores IoT e inteligência artificial para monitoramento em tempo real da qualidade da água.",
    type: "discovery"
  }
];
