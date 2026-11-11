import { useEffect, useRef, useState } from "react";
import { animate, useInView } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { ATRASO_TELA, Reveal, SceneLabel, usePalco } from "./primitives";
import { useMenosMovimento } from "./useMenosMovimento";

/**
 * Cena 3: origem e produção científica. Fontes: roteiro do projeto de 10/11/2026; situação dos
 * artigos informada pelo Vinícius em 11/11/2026. Frentes em andamento: apêndice do deck (tese).
 */
const ENTREGAS = [
  {
    estado: "Artigo",
    titulo: "Plataforma Tikatu",
    onde: "International Journal of River Basin Management · 2025",
    link: "https://doi.org/10.1080/15715124.2025.2528958",
  },
  {
    estado: "Artigo",
    titulo: "Biblioteca tikatuwq",
    onde: "International Journal of River Basin Management · outubro de 2026",
    link: "https://doi.org/10.1080/15715124.2026.2754836",
  },
  {
    estado: "Artigo",
    titulo: "Frequência amostral no Buranhém",
    onde: "Earth Science Informatics · 11/11/2026",
  },
  {
    estado: "Software",
    titulo: "tikatuwq no CRAN",
    onde: "Rotinas abertas, documentação e exemplos reprodutíveis",
    link: "https://cran.r-project.org/package=tikatuwq",
  },
];

const ANDAMENTO = [
  "Representatividade da rede de monitoramento (RPGA IV)",
  "Modelagem hidroambiental das bacias",
  "Interpretação verificável com IA (Miãga)",
];

const NUMEROS = [
  { valor: 3, rotulo: "artigos publicados" },
  { valor: 1, rotulo: "software aberto no CRAN" },
  { valor: ANDAMENTO.length, rotulo: "pesquisas em andamento no doutorado" },
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
  const ref = useRef<HTMLDivElement>(null);
  const ativo = useInView(ref, { amount: 0.5, once: true });
  const base = 0.3 + (palco.ativo ? ATRASO_TELA : 0);

  return (
    <section id="cena-3" className="relative flex min-h-[100svh] flex-col justify-center overflow-hidden py-16" aria-label="A origem">
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(50% 60% at 15% 50%, rgba(45,212,191,0.10), transparent 70%)" }}
        aria-hidden
      />
      <div className="relative mx-auto grid max-w-6xl gap-10 px-6 md:grid-cols-[1fr_1.25fr] md:gap-12">
        <Reveal>
          <SceneLabel index={3}>A origem</SceneLabel>
          <h2 className="text-3xl font-semibold leading-tight text-white sm:text-5xl">
            Uma base que já existe, <span className="text-cyan-200">e que já gerou ciência.</span>
          </h2>
          <p className="mt-5 leading-relaxed text-slate-300 sm:text-lg">
            O Tikatu nasceu no mestrado em Ciências e Tecnologias Ambientais, com a construção da plataforma e a validação
            inicial no Rio Chamagunga, em Porto Seguro. Hoje é uma pesquisa de doutorado em Biossistemas na UFSB:
          </p>
          <p className="mt-4 border-l-2 border-cyan-300/50 pl-4 text-sm text-slate-200 sm:text-base">
            “Do dado à decisão: desenvolvimento e avaliação do ecossistema Tikatu para monitoramento, análise
            computacional e interpretação auditável da qualidade da água.”
          </p>
        </Reveal>

        <div ref={ref}>
          {/* Números grandes que contam ao entrar na tela */}
          <dl className="grid grid-cols-3 gap-3">
            {NUMEROS.map((n, i) => (
              <Reveal key={n.rotulo} delay={0.1 + i * 0.12}>
                <div className="h-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4">
                  <dd className="font-mono text-4xl font-semibold tabular-nums text-cyan-200 sm:text-5xl">
                    <Contador valor={n.valor} ativo={ativo} atraso={base + i * 0.15} />
                  </dd>
                  <dt className="mt-1 text-xs leading-snug text-slate-400 sm:text-sm">{n.rotulo}</dt>
                </div>
              </Reveal>
            ))}
          </dl>

          {/* O que foi publicado, com links para conferir */}
          <ul className="mt-5 divide-y divide-white/10 border-y border-white/10">
            {ENTREGAS.map((e, i) => (
              <Reveal key={e.titulo} delay={0.4 + i * 0.08}>
                <li className="flex items-baseline gap-4 py-3">
                  <span
                    className={`w-16 shrink-0 text-[11px] font-semibold uppercase tracking-wider ${
                      e.estado === "Software" ? "text-[#efb08c]" : "text-emerald-300"
                    }`}
                  >
                    {e.estado}
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
                          {e.titulo}
                          <ArrowUpRight className="h-4 w-4" />
                        </a>
                      ) : (
                        e.titulo
                      )}
                    </div>
                    <div className="text-sm text-slate-400">{e.onde}</div>
                  </div>
                </li>
              </Reveal>
            ))}
          </ul>

          {/* Pesquisas em curso, sem antecipar resultado */}
          <Reveal delay={0.8}>
            <div className="mt-5">
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300/80">
                Em andamento no doutorado
              </div>
              <ul className="mt-2 flex flex-wrap gap-2">
                {ANDAMENTO.map((a) => (
                  <li key={a} className="rounded-full border border-cyan-300/25 bg-cyan-300/[0.06] px-3 py-1 text-xs text-cyan-50 sm:text-sm">
                    {a}
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-xs text-slate-500">Pesquisas em curso, com avaliação própria; resultados ainda não publicados.</p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
};
