import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { MapPinned, Timer } from "lucide-react";
import { ATRASO_TELA, Reveal, SceneLabel, usePalco } from "./primitives";
import { useMenosMovimento } from "./useMenosMovimento";
import { useT, type Bi } from "./idioma";
import { Situacao } from "./Situacao";

/**
 * Cena 3: as duas perguntas que orientam a pesquisa (onde monitorar, com que frequência).
 * Fontes: roteiro enviado pelo Vinícius em 11/11/2026. O desenho da rede é ilustrativo.
 */

// Rede de rios esquemática (ilustrativa) e pontos de monitoramento.
const RIOS = [
  "M10 40 C 70 50 110 30 160 62 S 250 70 310 96",
  "M60 140 C 90 110 120 96 160 62",
  "M120 8 C 130 30 150 44 160 62",
  "M230 150 C 236 120 250 100 262 80",
];
const PONTOS: [number, number, boolean][] = [
  [52, 44, true],
  [160, 62, true],
  [262, 80, true],
  [92, 112, false],
  [134, 30, false],
  [236, 126, false],
];

const Rede = ({ on, reduce, atraso }: { on: boolean; reduce: boolean; atraso: number }) => (
  <svg viewBox="0 0 320 160" className="h-auto w-full" aria-hidden>
    {RIOS.map((d, i) => (
      <motion.path
        key={d}
        d={d}
        fill="none"
        stroke="#79d0f4"
        strokeOpacity={0.7}
        strokeWidth={i === 0 ? 4 : 2.5}
        strokeLinecap="round"
        initial={reduce ? false : { pathLength: 0 }}
        animate={{ pathLength: on || reduce ? 1 : 0 }}
        transition={{ duration: 1.4, delay: atraso + i * 0.2, ease: [0.45, 0, 0.2, 1] }}
      />
    ))}
    {PONTOS.map(([x, y, existe], i) => (
      <g key={`${x}-${y}`}>
        <motion.circle
          cx={x}
          cy={y}
          r={existe ? 20 : 16}
          fill={existe ? "rgba(103,232,249,0.12)" : "rgba(239,176,140,0.10)"}
          initial={reduce ? false : { scale: 0, opacity: 0 }}
          animate={{ scale: on || reduce ? 1 : 0, opacity: on || reduce ? 1 : 0 }}
          transition={{ duration: 0.6, delay: atraso + 1 + i * 0.12 }}
          style={{ transformOrigin: `${x}px ${y}px` }}
        />
        <motion.circle
          cx={x}
          cy={y}
          r={5}
          fill="#062a3d"
          stroke={existe ? "#67e8f9" : "#efb08c"}
          strokeWidth={2.5}
          strokeDasharray={existe ? undefined : "3 2.5"}
          initial={reduce ? false : { scale: 0 }}
          animate={{ scale: on || reduce ? 1 : 0 }}
          transition={{ duration: 0.4, delay: atraso + 1 + i * 0.12 }}
          style={{ transformOrigin: `${x}px ${y}px` }}
        />
      </g>
    ))}
  </svg>
);

// Linha do tempo: um período com 12 coletas possíveis; 3 delas destacadas.
const Tempo = ({ on, reduce, atraso }: { on: boolean; reduce: boolean; atraso: number }) => (
  <svg viewBox="0 0 320 160" className="h-auto w-full" aria-hidden>
    <motion.path
      d="M10 96 C 40 80 60 104 90 92 S 120 30 140 40 S 170 108 200 96 S 240 46 262 52 S 290 100 310 92"
      fill="none"
      stroke="#79d0f4"
      strokeOpacity={0.7}
      strokeWidth={3.5}
      strokeLinecap="round"
      initial={reduce ? false : { pathLength: 0 }}
      animate={{ pathLength: on || reduce ? 1 : 0 }}
      transition={{ duration: 1.6, delay: atraso, ease: [0.45, 0, 0.2, 1] }}
    />
    <line x1="10" y1="132" x2="310" y2="132" stroke="rgba(255,255,255,0.25)" strokeWidth="2" />
    {Array.from({ length: 12 }, (_, i) => {
      const x = 10 + (300 * i) / 11;
      const tres = i === 0 || i === 6 || i === 11;
      return (
        <motion.line
          key={x}
          x1={x}
          x2={x}
          y1={tres ? 120 : 126}
          y2={tres ? 144 : 138}
          stroke={tres ? "#67e8f9" : "#efb08c"}
          strokeWidth={tres ? 3.5 : 2.5}
          strokeLinecap="round"
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: on || reduce ? 1 : 0 }}
          transition={{ duration: 0.3, delay: atraso + 1.1 + (tres ? 0 : 0.4) + i * 0.04 }}
        />
      );
    })}
  </svg>
);

interface Pergunta {
  icon: typeof MapPinned;
  pergunta: Bi;
  estudo: Bi;
  texto: Bi;
  situacao: "andamento" | "publicado";
  fonte?: Bi;
  legenda: Bi;
  Visual: typeof Rede;
}

const PERGUNTAS: Pergunta[] = [
  {
    icon: MapPinned,
    pergunta: ["Onde monitorar?", "Where to monitor?"],
    estudo: ["Estudo espacial da RPGA IV", "Spatial study of RPGA IV"],
    texto: [
      "Avalia o quanto os pontos de monitoramento representam os rios da região de planejamento das águas, e onde faltam pontos.",
      "Assesses how well the monitoring sites represent the rivers of the water planning region, and where sites are missing.",
    ],
    situacao: "andamento",
    legenda: ["Pontos existentes e lacunas (ilustrativo)", "Existing sites and gaps (illustrative)"],
    Visual: Rede,
  },
  {
    icon: Timer,
    pergunta: ["Com que frequência?", "How often?"],
    estudo: ["Frequência amostral no Rio Buranhém", "Sampling frequency on the Buranhém River"],
    texto: [
      "Relaciona o número de coletas à chance de registrar as mudanças que acontecem entre uma coleta e outra.",
      "Relates the number of samples to the chance of recording the changes that happen between one sample and the next.",
    ],
    situacao: "publicado",
    fonte: ["Earth Science Informatics, 2026", "Earth Science Informatics, 2026"],
    legenda: ["3 coletas ou 12 no mesmo período (ilustrativo)", "3 or 12 samples over the same period (illustrative)"],
    Visual: Tempo,
  },
];

export const Perguntas = () => {
  const t = useT();
  const reduce = useMenosMovimento();
  const palco = usePalco();
  const ref = useRef<HTMLDivElement>(null);
  const on = useInView(ref, { amount: 0.3, once: true });
  const atraso = 0.4 + (palco.ativo ? ATRASO_TELA : 0);

  return (
    <section
      id="cena-3"
      className="mx-auto flex min-h-[100svh] max-w-6xl flex-col justify-center px-6 py-16"
      aria-label={t(["As perguntas da pesquisa", "The research questions"])}
    >
      <Reveal>
        <SceneLabel index={3}>{t(["As perguntas da pesquisa", "The research questions"])}</SceneLabel>
        <h2 className="max-w-3xl text-3xl font-semibold leading-tight text-white sm:text-5xl">
          {t(["Medir não basta. ", "Measuring is not enough. "])}
          <span className="text-cyan-200">{t(["Onde e quando medir decide o que se vê.", "Where and when you measure decides what you see."])}</span>
        </h2>
        <p className="mt-4 max-w-4xl text-slate-300 sm:text-lg">
          {t(["Cinco perguntas guiam a pesquisa: ", "Five questions guide the research: "])}
          <strong className="font-semibold text-white">{t(["onde", "where"])}</strong>
          {t([" medir, ", " to measure, "])}
          <strong className="font-semibold text-white">{t(["com que frequência", "how often"])}</strong>
          {", "}
          <strong className="font-semibold text-white">{t(["como conferir os cálculos", "how to check the calculations"])}</strong>
          {", "}
          <strong className="font-semibold text-white">{t(["como comunicar", "how to communicate"])}</strong>
          {t([
            " de forma verificável e acessível, e ",
            " in a verifiable and accessible way, and ",
          ])}
          <strong className="font-semibold text-white">{t(["como envolver a comunidade", "how to involve the community"])}</strong>
          {t([". Aqui, as duas primeiras.", ". Here, the first two."])}
        </p>
      </Reveal>

      <div ref={ref} className="mt-8 grid gap-5 md:grid-cols-2">
        {PERGUNTAS.map((p, i) => {
          const Icon = p.icon;
          return (
            <Reveal key={p.pergunta[0]} delay={0.15 + i * 0.2}>
              <article className="flex h-full flex-col rounded-3xl border border-white/10 bg-white/[0.03] p-6">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/15 text-cyan-200">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="text-2xl font-semibold text-white sm:text-3xl">{t(p.pergunta)}</h3>
                </div>
                <div className="mt-4 rounded-2xl bg-[#021019]/50 px-3 pt-3">
                  <p.Visual on={on} reduce={reduce} atraso={atraso + i * 0.3} />
                  <p className="pb-2 text-center text-[11px] text-slate-500">{t(p.legenda)}</p>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-white">{t(p.estudo)}</span>
                  <Situacao tipo={p.situacao} />
                </div>
                <p className="mt-1 text-sm text-slate-300 sm:text-base">{t(p.texto)}</p>
                {p.fonte && <p className="mt-2 text-xs text-slate-500">{t(p.fonte)}</p>}
              </article>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
};
