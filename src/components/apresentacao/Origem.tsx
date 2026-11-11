import { useEffect, useRef, useState } from "react";
import { animate, useInView } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { ATRASO_TELA, Reveal, SceneLabel, usePalco } from "./primitives";
import { useMenosMovimento } from "./useMenosMovimento";
import { useT, type Bi } from "./idioma";

/**
 * Cena 3: origem e produção científica. Fontes: roteiro do projeto de 10/11/2026; situação dos
 * artigos e temas em andamento informados pelo Vinícius em 11/11/2026. Os trabalhos em andamento
 * aparecem só pelo tema (sem título nem resultado).
 */
const ENTREGAS: { software?: boolean; titulo: Bi; onde: Bi; link?: string }[] = [
  {
    titulo: ["Plataforma Tikatu", "Tikatu platform"],
    onde: ["International Journal of River Basin Management · 2025", "International Journal of River Basin Management · 2025"],
    link: "https://doi.org/10.1080/15715124.2025.2528958",
  },
  {
    titulo: ["Biblioteca tikatuwq", "tikatuwq library"],
    onde: [
      "International Journal of River Basin Management · outubro de 2026",
      "International Journal of River Basin Management · October 2026",
    ],
    link: "https://doi.org/10.1080/15715124.2026.2754836",
  },
  {
    titulo: ["Frequência amostral no Buranhém", "Sampling frequency on the Buranhém River"],
    onde: ["Earth Science Informatics · 11/11/2026", "Earth Science Informatics · 11 Nov 2026"],
  },
  {
    software: true,
    titulo: ["tikatuwq no CRAN", "tikatuwq on CRAN"],
    onde: ["Rotinas abertas, documentação e exemplos reprodutíveis", "Open routines, documentation and reproducible examples"],
    link: "https://cran.r-project.org/package=tikatuwq",
  },
];

const ANDAMENTO: { tema: Bi; texto: Bi }[] = [
  {
    tema: ["Rede de monitoramento", "Monitoring network"],
    texto: [
      "Avalia o quanto os pontos de monitoramento representam os rios da RPGA IV.",
      "Assesses how well the monitoring sites represent the rivers of RPGA IV.",
    ],
  },
  {
    tema: ["Modelagem das bacias", "Basin modelling"],
    texto: [
      "Modelagem hidroambiental para entender o comportamento dos rios.",
      "Hydro-environmental modelling to understand how the rivers behave.",
    ],
  },
  {
    tema: ["Modelo de IA (Miãga)", "AI model (Miãga)"],
    texto: [
      "Uma IA que interpreta os dados da água e mostra de onde vem cada conclusão.",
      "An AI that interprets water data and shows where each conclusion comes from.",
    ],
  },
  {
    tema: ["Ciência cidadã", "Citizen science"],
    texto: [
      "Artigo que integra as frentes: voluntários, plataforma, dados e IA.",
      "A paper that brings it all together: volunteers, platform, data and AI.",
    ],
  },
];

const NUMEROS: { valor: number; rotulo: Bi }[] = [
  { valor: 3, rotulo: ["artigos publicados", "published papers"] },
  { valor: 1, rotulo: ["software aberto no CRAN", "open-source package on CRAN"] },
  { valor: ANDAMENTO.length, rotulo: ["pesquisas em andamento no doutorado", "ongoing studies in the PhD"] },
];

/** Número que conta de 0 até o valor quando aparece. */
const Contador = ({ valor, ativo, atraso }: { valor: number; ativo: boolean; atraso: number }) => {
  const reduce = useMenosMovimento();
  const [v, setV] = useState(reduce ? valor : 0);
  useEffect(() => {
    if (!ativo || reduce) return;
    const c = animate(0, valor, { duration: 1.2, delay: atraso, ease: [0.22, 1, 0.36, 1], onUpdate: (x) => setV(Math.round(x)) });
    return () => c.stop();
  }, [ativo, reduce, valor, atraso]);
  return <>{v}</>;
};

export const Origem = () => {
  const palco = usePalco();
  const t = useT();
  const ref = useRef<HTMLDivElement>(null);
  const ativo = useInView(ref, { amount: 0.5, once: true });
  const base = 0.3 + (palco.ativo ? ATRASO_TELA : 0);

  return (
    <section
      id="cena-3"
      className="relative flex min-h-[100svh] flex-col justify-center overflow-hidden py-16"
      aria-label={t(["A origem", "The origin"])}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(50% 60% at 15% 50%, rgba(45,212,191,0.10), transparent 70%)" }}
        aria-hidden
      />
      <div className="relative mx-auto grid max-w-6xl gap-10 px-6 md:grid-cols-[1fr_1.25fr] md:gap-12">
        <Reveal>
          <SceneLabel index={3}>{t(["A origem", "The origin"])}</SceneLabel>
          <h2 className="text-3xl font-semibold leading-tight text-white sm:text-5xl">
            {t(["Uma base que já existe, ", "A foundation that already exists, "])}
            <span className="text-cyan-200">{t(["e que já gerou ciência.", "and has already produced science."])}</span>
          </h2>
          <p className="mt-5 leading-relaxed text-slate-300 sm:text-lg">
            {t([
              "O Tikatu nasceu no mestrado em Ciências e Tecnologias Ambientais, com a construção da plataforma e a validação inicial no Rio Chamagunga, em Porto Seguro. Hoje é uma pesquisa de doutorado em Biossistemas na UFSB:",
              "Tikatu began in a master's programme in Environmental Sciences and Technologies, with the building of the platform and its first validation on the Chamagunga River, in Porto Seguro. Today it is a PhD research project in Biosystems at UFSB:",
            ])}
          </p>
          <p className="mt-4 border-l-2 border-cyan-300/50 pl-4 text-sm text-slate-200 sm:text-base">
            {t([
              "“Do dado à decisão: desenvolvimento e avaliação do ecossistema Tikatu para monitoramento, análise computacional e interpretação auditável da qualidade da água.”",
              "“From data to decision: development and evaluation of the Tikatu ecosystem for monitoring, computational analysis and auditable interpretation of water quality.”",
            ])}
          </p>
        </Reveal>

        <div ref={ref}>
          {/* Números grandes que contam ao entrar na tela */}
          <dl className="grid grid-cols-3 gap-3">
            {NUMEROS.map((n, i) => (
              <Reveal key={n.rotulo[0]} delay={0.1 + i * 0.12}>
                <div className="h-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
                  <dd className="font-mono text-4xl font-semibold tabular-nums text-cyan-200 sm:text-5xl">
                    <Contador valor={n.valor} ativo={ativo} atraso={base + i * 0.15} />
                  </dd>
                  <dt className="mt-1 text-xs leading-snug text-slate-400 sm:text-sm">{t(n.rotulo)}</dt>
                </div>
              </Reveal>
            ))}
          </dl>

          {/* O que foi publicado, com links para conferir */}
          <ul className="mt-4 divide-y divide-white/10 border-y border-white/10">
            {ENTREGAS.map((e, i) => (
              <Reveal key={e.titulo[0]} delay={0.4 + i * 0.08}>
                <li className="flex items-baseline gap-4 py-2.5">
                  <span
                    className={`w-16 shrink-0 text-[11px] font-semibold uppercase tracking-wider ${
                      e.software ? "text-[#efb08c]" : "text-emerald-300"
                    }`}
                  >
                    {e.software ? "Software" : t(["Artigo", "Paper"])}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-white">
                      {e.link ? (
                        <a
                          href={e.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 hover:text-cyan-200"
                        >
                          {t(e.titulo)}
                          <ArrowUpRight className="h-4 w-4" />
                        </a>
                      ) : (
                        t(e.titulo)
                      )}
                    </div>
                    <div className="text-sm text-slate-400">{t(e.onde)}</div>
                  </div>
                </li>
              </Reveal>
            ))}
          </ul>

          {/* Pesquisas em curso: só o tema e o que estudam, sem antecipar resultado */}
          <div className="mt-4">
            <Reveal delay={0.75}>
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300/80">
                {t(["Em andamento no doutorado", "Ongoing in the PhD"])}
              </div>
            </Reveal>
            <ul className="mt-2 grid gap-2 sm:grid-cols-2">
              {ANDAMENTO.map((a, i) => (
                <Reveal key={a.tema[0]} delay={0.8 + i * 0.08}>
                  <li className="h-full rounded-xl border border-cyan-300/20 bg-cyan-300/[0.05] px-3 py-2">
                    <div className="text-sm font-semibold text-cyan-50">{t(a.tema)}</div>
                    <div className="text-xs leading-snug text-slate-400">{t(a.texto)}</div>
                  </li>
                </Reveal>
              ))}
            </ul>
            <p className="mt-2 text-xs text-slate-500">
              {t([
                "Pesquisas em curso, com avaliação própria; resultados ainda não publicados.",
                "Work in progress, each with its own evaluation; results not yet published.",
              ])}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
