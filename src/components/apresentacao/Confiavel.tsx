import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowRight, ArrowUpRight, Calculator, Gauge, MessageSquareText, ShieldCheck } from "lucide-react";
import { ATRASO_TELA, Reveal, SceneLabel, usePalco } from "./primitives";
import { useMenosMovimento } from "./useMenosMovimento";
import { useT, type Bi } from "./idioma";
import { Situacao, type TipoSituacao } from "./Situacao";

/**
 * Cena 5: como transformar medições em informação confiável. Exemplo com uma leitura real
 * (pH 5,0 no Ponto 2 do Rio Chamagunga, 25/08/2024) e a faixa do CONAMA (6 a 9). A etapa de
 * explicação por IA é pesquisa em andamento: o texto do exemplo é ilustrativo.
 */
const QUESTOES: { pergunta: Bi; resposta: Bi; situacao: TipoSituacao; fonte?: Bi; link?: string }[] = [
  {
    pergunta: ["Como conferir os cálculos?", "How do we check the calculations?"],
    resposta: [
      "Pacote tikatuwq: rotinas abertas e reprodutíveis para índices e comparação com a legislação, com um resumo no estilo dos relatórios do R.",
      "The tikatuwq package: open, reproducible routines for indices and comparison with regulations, with an R-style summary report.",
    ],
    situacao: "publicado",
    fonte: ["Artigo no IJRBM, 2026 · software no CRAN", "Paper in IJRBM, 2026 · software on CRAN"],
    link: "https://doi.org/10.1080/15715124.2026.2754836",
  },
  {
    pergunta: ["Como produzir interpretações verificáveis?", "How do we produce verifiable interpretations?"],
    resposta: [
      "Miangá, nosso modelo de linguagem com pré-verificação determinística: regras fixas conferem os fatos antes de a IA escrever. Será disponibilizado de forma aberta.",
      "Miangá, our language model with deterministic pre-checks: fixed rules verify the facts before the AI writes. It will be released openly.",
    ],
    situacao: "andamento",
  },
];

export const PASSOS_CONFIAVEL = 4;

const CADEIA: { icon: typeof Gauge; etapa: Bi; destaque: Bi; texto: Bi }[] = [
  {
    icon: Gauge,
    etapa: ["Medição", "Measurement"],
    destaque: ["pH 5,0", "pH 5.0"],
    texto: ["Ponto 2, Rio Chamagunga, 25/08/2024", "Site 2, Chamagunga River, 25 Aug 2024"],
  },
  {
    icon: Calculator,
    etapa: ["Cálculo", "Calculation"],
    destaque: ["5,0 < 6,0", "5.0 < 6.0"],
    texto: ["Comparação com a faixa do CONAMA (6 a 9), com rotina aberta", "Compared with the CONAMA range (6 to 9) by an open routine"],
  },
  {
    icon: ShieldCheck,
    etapa: ["Regra", "Rule"],
    destaque: ["Fora da faixa", "Out of range"],
    texto: ["Regra fixa confere o resultado antes de qualquer texto", "A fixed rule confirms the result before any text is written"],
  },
  {
    icon: MessageSquareText,
    etapa: ["Explicação", "Explanation"],
    destaque: [
      "“No Ponto 2, o pH ficou em 5,0, abaixo do mínimo de 6 do CONAMA.”",
      "“At Site 2, pH was 5.0, below the CONAMA minimum of 6.”",
    ],
    texto: ["Cada número da frase é conferido com o cálculo e a regra", "Every number in the sentence is checked against the calculation and the rule"],
  },
];

export const Confiavel = () => {
  const t = useT();
  const reduce = useMenosMovimento();
  const palco = usePalco();
  const ref = useRef<HTMLDivElement>(null);
  const visto = useInView(ref, { amount: 0.3, once: true });
  // No modo telas, cada → acende mais um elo; na rolagem, os elos acendem em sequência.
  const ate = palco.ativo ? palco.passo : visto ? CADEIA.length - 1 : -1;
  const base = palco.ativo ? ATRASO_TELA : 0.3;

  return (
    <section
      id="cena-5"
      className="mx-auto flex min-h-[100svh] max-w-6xl flex-col justify-center px-6 py-16"
      aria-label={t(["Informação confiável", "Reliable information"])}
    >
      <Reveal>
        <SceneLabel index={5}>{t(["Informação confiável", "Reliable information"])}</SceneLabel>
        <h2 className="max-w-4xl text-3xl font-semibold leading-tight text-white sm:text-5xl">
          {t(["Da medição a uma explicação ", "From a measurement to an explanation "])}
          <span className="text-cyan-200">{t(["que pode ser conferida.", "that can be checked."])}</span>
        </h2>
      </Reveal>

      <div className="mt-7 grid gap-4 md:grid-cols-2">
        {QUESTOES.map((q, i) => (
          <Reveal key={q.pergunta[0]} delay={0.1 + i * 0.12}>
            <div className="h-full rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-semibold text-white sm:text-xl">{t(q.pergunta)}</h3>
                <Situacao tipo={q.situacao} />
              </div>
              <p className="mt-2 text-sm text-slate-300 sm:text-base">{t(q.resposta)}</p>
              {q.fonte &&
                (q.link ? (
                  <a
                    href={q.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1 text-xs text-slate-400 hover:text-cyan-200"
                  >
                    {t(q.fonte)}
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </a>
                ) : (
                  <p className="mt-2 text-xs text-slate-400">{t(q.fonte)}</p>
                ))}
            </div>
          </Reveal>
        ))}
      </div>

      <div ref={ref} className="mt-6">
        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300/80">
          {t(["Exemplo com uma leitura real", "Example with a real reading"])}
        </div>
        <ol className="mt-3 grid gap-2 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1.5fr] md:items-stretch">
          {CADEIA.map((c, i) => {
            const Icon = c.icon;
            const aceso = i <= ate;
            const atraso = palco.ativo ? (i === ate ? (ate === 0 ? base : 0.05) : 0) : base + i * 0.5;
            return [
              i > 0 && (
                <motion.li
                  key={`seta-${i}`}
                  aria-hidden
                  className="hidden items-center justify-center text-cyan-300 md:flex"
                  initial={false}
                  animate={{ opacity: aceso ? 1 : 0.15, x: aceso || reduce ? 0 : -6 }}
                  transition={{ duration: 0.4, delay: reduce ? 0 : atraso }}
                >
                  <ArrowRight className="h-5 w-5" />
                </motion.li>
              ),
              <motion.li
                key={c.etapa[0]}
                className={`rounded-2xl border p-4 ${i === CADEIA.length - 1 ? "border-cyan-300/40 bg-cyan-300/[0.07]" : "border-white/10 bg-white/[0.04]"}`}
                initial={false}
                animate={{ opacity: aceso ? 1 : 0.18, y: aceso || reduce ? 0 : 10 }}
                transition={{ duration: 0.5, delay: reduce ? 0 : atraso, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-cyan-300/90">
                  <Icon className="h-4 w-4" />
                  {t(c.etapa)}
                </div>
                <div
                  className={`mt-2 font-semibold text-white ${i === CADEIA.length - 1 ? "text-base leading-snug sm:text-lg" : "font-mono text-xl sm:text-2xl"}`}
                >
                  {t(c.destaque)}
                </div>
                <div className="mt-1 text-xs leading-snug text-slate-400 sm:text-sm">{t(c.texto)}</div>
              </motion.li>,
            ];
          })}
        </ol>
        <p className="mt-3 text-xs text-slate-500">
          {palco.ativo && ate < CADEIA.length - 1 ? `${t(["Use → para seguir a cadeia.", "Press → to follow the chain."])} ` : ""}
          {t([
            "Medição e faixa reais; a frase final ilustra o método em pesquisa.",
            "Real measurement and range; the final sentence illustrates the method under research.",
          ])}
        </p>
      </div>
    </section>
  );
};
