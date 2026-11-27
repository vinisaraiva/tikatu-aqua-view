import type { ReactNode } from "react";
import { RelatorioExemplo } from "./RelatorioExemplo";

/** Foto aérea do estuário do Buranhém. Autoria ainda a confirmar (uso interno por enquanto). */
export const FOTO = "/territorios/buranhem-aereo.webp";

export type Estado = "em-uso" | "no-ar" | "em-desenvolvimento" | "pedido" | "convite" | "manual" | "proposta" | "acuipe" | "equipe";

export const ROTULO_ESTADO: Record<Estado, string> = {
  "em-uso": "Em uso",
  "no-ar": "No ar",
  "em-desenvolvimento": "Em desenvolvimento",
  pedido: "Pedido da comunidade",
  convite: "Convite",
  manual: "Com manual próprio",
  proposta: "Proposta",
  acuipe: "Já acontece em Acuípe de Baixo",
  equipe: "Quem faz",
};

export type Topico = {
  id: string;
  titulo: string;
  curto: string;
  estado: Estado;
  /** Posição do marcador na foto, em % da largura e da altura. Sem posição, o tópico não tem marcador. */
  x?: number;
  y?: number;
  chamada: string;
  pontos: string[];
  nota?: string;
  visual: ReactNode;
};

/** Ilustração gerada por IA, sempre com a etiqueta "Ilustração". Opcionalmente, uma tela real por cima. */
/** Foto real, com legenda. Fotos verticais ficam inteiras, sem corte. */
const Foto = ({
  src,
  alt,
  legenda,
  tela,
}: {
  src: string;
  alt: string;
  legenda: string;
  tela?: { src: string; alt: string };
}) => (
  <figure className="relative flex justify-center overflow-hidden rounded-2xl bg-[#071f33]">
    <img src={src} alt={alt} className="max-h-[66svh] w-auto object-contain md:max-h-[64svh]" />
    {tela && (
      <img src={tela.src} alt={tela.alt} className="absolute right-3 top-3 w-[22%] rounded-xl border-4 border-[#0b2236] shadow-2xl" />
    )}
    <figcaption className="absolute bottom-2 left-2 right-2 rounded-xl bg-black/60 px-3 py-1.5 text-xs text-white backdrop-blur">
      {legenda}
    </figcaption>
  </figure>
);

const Ilustracao = ({ nome, alt, tela }: { nome: string; alt: string; tela?: { src: string; alt: string } }) => (
  <figure className="relative overflow-hidden rounded-2xl">
    <img src={`/territorios/ilustracao-${nome}.webp`} alt={alt} className="aspect-[4/3] w-full object-cover" />
    <figcaption className="absolute left-2 top-2 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur">
      Ilustração
    </figcaption>
    {tela && (
      <img
        src={tela.src}
        alt={tela.alt}
        className="absolute bottom-3 right-3 w-[24%] rounded-xl border-4 border-[#0b2236] shadow-2xl"
      />
    )}
  </figure>
);

const ARTIGOS = [
  {
    resumo: "Como a plataforma Tikatu foi construída para reunir, analisar e mostrar os dados da água.",
    titulo: "Tikatu: development of a web platform with artificial intelligence for monitoring and analyzing water quality data",
    revista: "International Journal of River Basin Management, 2025",
  },
  {
    resumo: "Uma biblioteca livre de análise da água, que compara os dados com a legislação. Também está no CRAN.",
    titulo: "tikatuwq: an R package for reproducible freshwater quality monitoring with integrated regulatory compliance assessment",
    revista: "International Journal of River Basin Management, 2026",
    link: "https://doi.org/10.1080/15715124.2026.2754836",
  },
  {
    resumo: "Quantas coletas por ano bastam para não deixar passar quando a água de um rio ultrapassa os limites? Análise estatística com dados do rio Buranhém.",
    titulo:
      "Annual sampling frequency and false-negative probability in water-quality threshold-exceedance detection: an exact conditional analysis of the Buranhém River, Bahia, Brazil",
    revista: "Earth Science Informatics, 2026",
  },
];

const Bloco = ({ titulo, children }: { titulo: string; children: ReactNode }) => (
  <section className="grid gap-2.5">
    <h3 className="text-xs font-bold uppercase tracking-widest text-tk-rio-claro">{titulo}</h3>
    {children}
  </section>
);

const Cartao = ({ children }: { children: ReactNode }) => (
  <article className="rounded-2xl bg-white/[0.06] p-3.5 ring-1 ring-white/10">{children}</article>
);

/** Produção científica e dados abertos: aberto pelos selos do topo e pelo tópico 9. */
const QuemFaz = () => (
  <div className="grid gap-5">
    <Bloco titulo="Produção científica">
      {ARTIGOS.map((a) => (
        <Cartao key={a.revista + a.resumo}>
          <p className="text-[15px] font-semibold leading-snug text-white">{a.resumo}</p>
          {a.titulo && <p className="mt-1 text-[11px] italic leading-snug text-tk-nevoa/80">{a.titulo}</p>}
          <p className="mt-1.5 text-xs text-tk-rio-claro">
            {a.link ? (
              <a href={a.link} target="_blank" rel="noreferrer" className="underline underline-offset-2 hover:text-white">
                {a.revista}
              </a>
            ) : (
              a.revista
            )}
          </p>
        </Cartao>
      ))}
      <Cartao>
        <p className="text-[15px] font-semibold leading-snug text-white">
          Biblioteca tikatuwq, livre para qualquer pessoa usar na análise da água.
        </p>
        <p className="mt-1.5 text-xs text-tk-rio-claro">
          <a href="https://cran.r-project.org/package=tikatuwq" target="_blank" rel="noreferrer" className="underline underline-offset-2 hover:text-white">
            Publicada no CRAN, o repositório oficial da linguagem R
          </a>
        </p>
      </Cartao>
    </Bloco>
    <Bloco titulo="Dados abertos">
      <Cartao>
        <ul className="grid gap-2 text-sm leading-snug text-tk-nevoa">
          <li>
            No painel público,{" "}
            <a href="https://tikatu.com.br" target="_blank" rel="noreferrer" className="text-tk-rio-claro underline underline-offset-2 hover:text-white">
              tikatu.com.br
            </a>
            , qualquer pessoa vê o mapa dos pontos e as leituras de cada coleta, comparadas com as referências.
          </li>
          <li>A comunidade decide junto com a equipe o que é publicado sobre o seu território.</li>
        </ul>
      </Cartao>
    </Bloco>
  </div>
);

export const TOPICOS: Topico[] = [
  {
    id: "treinamento",
    titulo: "Treinamento dos voluntários",
    curto: "Treinamento",
    estado: "acuipe",
    x: 9,
    y: 63,
    chamada: "Quem mede a água é gente da própria comunidade. Em Acuípe de Baixo, em Ilhéus, os voluntários acompanham o poço que abastece as casas.",
    pontos: [
      "Encontro prático na própria comunidade, com o manual do voluntário Tikatu.",
      "Como coletar a água num copo limpo, medir com a sonda e repetir a medida quando algo parece estranho.",
      "Como registrar tudo no celular, com data, hora e ponto.",
      "Cada voluntário tem seu ponto e seus dias de coleta combinados.",
    ],
    nota: "Foto real do treinamento em Acuípe de Baixo.",
    visual: (
      <Foto
        src="/territorios/foto-treinamento-acuipe.webp"
        alt="Treinamento em Acuípe de Baixo: duas pessoas com a camiseta do Tikatu Coleta medem a água do poço num copo, junto à torneira"
        legenda="Treinamento em Acuípe de Baixo (Ilhéus), na torneira do poço da comunidade"
      />
    ),
  },
  {
    id: "coleta-manual",
    titulo: "Coleta manual com a sonda",
    curto: "Coleta manual",
    estado: "em-uso",
    x: 17,
    y: 73,
    chamada: "No dia combinado, o voluntário vai ao ponto, mede com a sonda e registra no app Tikatu Coleta. O mesmo método serve para poços, rios e mangues.",
    pontos: [
      "Em Acuípe de Baixo, a coleta é feita no poço que abastece a comunidade.",
      "Os voluntários medem pH, oxigênio dissolvido, condutividade, sólidos dissolvidos, salinidade e temperatura.",
      "As leituras entram no app, com data, hora e ponto, e o app avisa antes do horário da coleta.",
      "A sonda não mede bactérias. Para saber se a água do poço é segura para beber, é preciso análise de laboratório.",
    ],
    nota: "Foto real de uma coleta em campo; no canto, a tela real do app Tikatu Coleta (dados de teste).",
    visual: (
      <Foto
        src="/territorios/foto-coleta-porto-seguro.webp"
        alt="Coleta em campo: a pessoa agachada na margem mede a água do rio Itinga com a sonda"
        legenda="Coleta no rio Itinga, em Porto Seguro, perto da Reserva Pataxó da Jaqueira (setembro de 2023)"
        tela={{ src: "/apresentacao/coleta-inicio.webp", alt: "Tela inicial do app Tikatu Coleta" }}
      />
    ),
  },
  {
    id: "coleta-automatica",
    titulo: "Coleta automática",
    curto: "Coleta automática",
    estado: "em-desenvolvimento",
    x: 38.5,
    y: 52,
    chamada: "Uma sonda que fica na água e mede sozinha, dia e noite.",
    pontos: [
      "A coleta manual mostra como a água estava naquele momento. Entre duas coletas, muita coisa pode mudar.",
      "Ela pode ficar no rio, no poço ou no mangue e registra em intervalos curtos o que acontece com a chuva, a maré e a noite.",
      "Mede também o oxigênio dissolvido e a turbidez (o quanto a água está turva), que mudam muito ao longo do dia.",
      "Ela complementa o trabalho dos voluntários, que seguem conferindo e cuidando do ponto.",
    ],
    nota: "Em desenvolvimento. Com recursos, os primeiros equipamentos vão para os pontos que a comunidade escolher.",
    visual: <Ilustracao nome="coleta-automatica" alt="Estação automática presa a uma estaca no canal do mangue, medindo de dia e de noite" />,
  },
  {
    id: "mangue",
    titulo: "Mangue e água salobra",
    curto: "Mangue",
    estado: "pedido",
    x: 55,
    y: 71,
    chamada: "No mangue, a água do rio se mistura com a do mar. Por isso ela precisa de um olhar próprio.",
    pontos: [
      "A água muda ao longo do dia com a maré: fica mais doce ou mais salgada.",
      "A água salobra tem referências próprias na Resolução CONAMA 357, diferentes das de água doce.",
      "A sonda dos voluntários já mede a salinidade, o primeiro passo para acompanhar essa mistura.",
      "O mangue é berçário de peixes, caranguejos e mariscos e sustenta quem vive dele.",
      "Os pontos de coleta no mangue seriam escolhidos junto com a comunidade.",
    ],
    visual: <Ilustracao nome="mangue" alt="Corte do mangue: a água do rio e a do mar se misturam entre as raízes, com peixes, caranguejos e ostras" />,
  },
  {
    id: "painel",
    titulo: "Do dado ao painel",
    curto: "Painel",
    estado: "no-ar",
    x: 51,
    y: 45,
    chamada: "Cada medição vai para a plataforma e aparece no painel público do Tikatu.",
    pontos: [
      "A plataforma compara cada valor com as referências oficiais.",
      "As cores dizem a situação: Normal, Atenção ou Crítico.",
      "O mapa mostra os pontos de coleta, e qualquer pessoa pode consultar.",
    ],
    nota: "Captura real do painel (Porto Seguro, leituras de agosto de 2024).",
    visual: (
      <div className="flex h-full min-h-[220px] items-center rounded-2xl bg-white p-2">
        <img src="/apresentacao/painel-ph.webp" alt="Painel do Tikatu com o pH por ponto e o mapa dos pontos" className="w-full rounded-xl" />
      </div>
    ),
  },
  {
    id: "relatorio",
    titulo: "O relatório",
    curto: "Relatório",
    estado: "em-desenvolvimento",
    x: 44,
    y: 38.5,
    chamada: "Um resumo do ponto em linguagem simples, para a comunidade ler e usar.",
    pontos: [
      "Ponto, período e parâmetros medidos, comparados com a referência de cada água: rio e mangue pela Resolução CONAMA 357 (água doce e salobra), poço de consumo pela Portaria GM/MS 888/2021.",
      "Uma leitura simples da situação e o que vale observar.",
      "Não é laudo: serve para acompanhar a água e embasar pedidos aos órgãos.",
    ],
    nota: "Modelo com dados ilustrativos. A geração automática está em desenvolvimento.",
    visual: <RelatorioExemplo />,
  },
  {
    id: "comunidade",
    titulo: "O que a comunidade faz com isso",
    curto: "Comunidade",
    estado: "proposta",
    x: 87,
    y: 58,
    chamada: "Informação sobre a própria água é uma ferramenta para cuidar do território.",
    pontos: [
      "Perceber cedo quando algo muda e repetir a medição.",
      "Para a água de beber, pedir análise de laboratório à saúde indígena (SESAI) ou à Vigilância Sanitária.",
      "Levar o relatório à Secretaria de Meio Ambiente, ao INEMA ou ao Ministério Público e pedir vistoria.",
      "Usar os dados em escolas, associações e conversas da comunidade.",
      "A comunidade decide junto com a equipe o que é publicado sobre o seu território.",
    ],
    visual: <Ilustracao nome="comunidade" alt="Reunião na associação de moradores com o gráfico do relatório; pelo vão, o mangue e os barcos" />,
  },
  {
    id: "apoio",
    titulo: "Como apoiar",
    curto: "Apoio",
    estado: "convite",
    x: 81,
    y: 37,
    chamada: "Com recursos para a sonda automática, a comunidade passa a acompanhar de perto o rio, o poço e o mangue.",
    pontos: [
      "Instalar a sonda automática num ponto escolhido com a comunidade.",
      "Formar mais voluntários ribeirinhos e indígenas.",
      "Parcerias com escolas, universidades e associações para usar os dados.",
      "Para conversar, fale com Vinícius Saraiva (próximo tópico).",
    ],
    visual: <Ilustracao nome="apoio" alt="Moradora, pesquisadora e professor no píer olhando a estação automática no mangue ao pôr do sol" />,
  },
  {
    id: "quem-faz",
    titulo: "Quem está por trás",
    curto: "Quem faz",
    estado: "equipe",
    chamada:
      "O Tikatu é uma iniciativa de pesquisa, tecnologia e inovação desenvolvida no âmbito do doutorado em Biossistemas da UFSB, por Vinícius Saraiva. Seu propósito é democratizar o acesso às informações sobre a qualidade da água, aproximando a ciência das comunidades e transformando dados ambientais em conhecimento acessível para a sociedade, pesquisadores e tomadores de decisão.",
    pontos: [
      "Mais do que monitorar a água, o Tikatu busca fortalecer a autonomia das comunidades e contribuir para a proteção dos recursos hídricos.",
      "Vinícius Saraiva é doutorando no Programa de Pós-Graduação em Biossistemas da Universidade Federal do Sul da Bahia (UFSB).",
      "Ciência revisada por pares: três artigos publicados em revistas internacionais e uma biblioteca livre no CRAN.",
    ],
    nota: "Quer levar o Tikatu para a sua comunidade ou apoiar a sonda automática? Fale com Vinícius Saraiva.",
    visual: <QuemFaz />,
  },
];
