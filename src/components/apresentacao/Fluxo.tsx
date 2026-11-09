import { useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { CloudUpload, Cpu, LayoutDashboard, Smartphone, type LucideIcon } from "lucide-react";
import { SceneLabel } from "./primitives";
import { useMenosMovimento } from "./useMenosMovimento";

interface Etapa {
  icon: LucideIcon;
  titulo: string;
  simples: string;
  tecnico: string;
}

const ETAPAS: Etapa[] = [
  {
    icon: Smartphone,
    titulo: "O voluntário coleta",
    simples: "No ponto do rio, o voluntário abre o app Tikatu Coleta e registra a amostra da água.",
    tecnico: "App de coleta com ponto georreferenciado, parâmetros medidos e data da leitura.",
  },
  {
    icon: CloudUpload,
    titulo: "O dado sobe",
    simples: "A leitura é enviada para a nuvem do Tikatu, sem planilha nem papel no meio do caminho.",
    tecnico: "Envio para um banco Supabase (Postgres) compartilhado entre o app e a plataforma.",
  },
  {
    icon: Cpu,
    titulo: "A plataforma processa",
    simples: "Os números brutos viram informação: cada leitura é organizada por rio, ponto e período.",
    tecnico: "Cálculo de índices como o IQA (Qualidade da Água) e o IET (Estado Trófico).",
  },
  {
    icon: LayoutDashboard,
    titulo: "O painel mostra",
    simples: "Qualquer pessoa vê no mapa e nos gráficos como está a água daquele lugar.",
    tecnico: "Painel web com mapa, séries históricas e índices por ponto de coleta.",
  },
];

/** Ilustração de cada etapa, desenhada só com CSS (sem imagens pesadas). */
const Ilustracao = ({ etapa }: { etapa: number }) => {
  if (etapa === 0) {
    return (
      <div className="mx-auto w-40 rounded-[1.8rem] border border-white/15 bg-slate-950/80 p-3 shadow-2xl shadow-cyan-500/10 sm:w-48">
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-white/20" />
        <div className="mb-2 text-[10px] font-semibold text-cyan-200">Tikatu Coleta</div>
        {["Ponto", "pH", "Turbidez", "Temperatura"].map((c, i) => (
          <motion.div
            key={c}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 + i * 0.12 }}
            className="mb-1.5 rounded-md bg-white/5 px-2 py-1.5 text-[10px] text-slate-300"
          >
            {c}
            <span className="float-right h-1.5 w-8 translate-y-1 rounded bg-cyan-300/40" />
          </motion.div>
        ))}
        <div className="mt-3 rounded-md bg-cyan-400 py-1.5 text-center text-[10px] font-semibold text-slate-950">
          Enviar leitura
        </div>
      </div>
    );
  }
  if (etapa === 1) {
    return (
      <div className="relative mx-auto flex h-56 w-56 items-center justify-center">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="absolute rounded-full border border-cyan-300/30"
            initial={{ width: 40, height: 40, opacity: 0.8 }}
            animate={{ width: 220, height: 220, opacity: 0 }}
            transition={{ duration: 2.4, delay: i * 0.8, repeat: Infinity, ease: "easeOut" }}
          />
        ))}
        <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-cyan-400/15 ring-1 ring-cyan-300/40">
          <CloudUpload className="h-9 w-9 text-cyan-200" />
        </div>
        {[0, 1, 2, 3].map((i) => (
          <motion.span
            key={`d${i}`}
            className="absolute h-2 w-2 rounded-full bg-cyan-200"
            initial={{ y: 90, opacity: 0 }}
            animate={{ y: 0, opacity: [0, 1, 0] }}
            transition={{ duration: 1.4, delay: i * 0.35, repeat: Infinity }}
            style={{ left: `${38 + i * 8}%` }}
          />
        ))}
      </div>
    );
  }
  if (etapa === 2) {
    const linhas = ["pH 7,1", "OD 6,8", "Turb. 12", "DBO 3,2", "PT 0,08"];
    return (
      <div className="mx-auto flex w-full max-w-xs items-center gap-4">
        <div className="flex-1 space-y-1.5 font-mono text-[10px] text-slate-400">
          {linhas.map((l, i) => (
            <motion.div
              key={l}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: [0, 1, 1, 0.3], x: [-10, 0, 24, 40] }}
              transition={{ duration: 2.6, delay: i * 0.25, repeat: Infinity, repeatDelay: 0.6 }}
              className="rounded bg-white/5 px-2 py-1"
            >
              {l}
            </motion.div>
          ))}
        </div>
        <div className="flex h-28 w-28 shrink-0 flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-teal-400/25 to-cyan-500/10 ring-1 ring-teal-300/40">
          <Cpu className="mb-1 h-6 w-6 text-teal-200" />
          <div className="text-[10px] uppercase tracking-wider text-teal-100/80">Índice</div>
          <div className="text-2xl font-semibold text-white">IQA</div>
        </div>
      </div>
    );
  }
  return (
    <div className="mx-auto w-full max-w-xs rounded-xl border border-white/10 bg-slate-950/70 p-3 shadow-2xl shadow-cyan-500/10">
      <div className="mb-2 flex gap-1.5">
        <span className="h-2 w-2 rounded-full bg-white/20" />
        <span className="h-2 w-2 rounded-full bg-white/20" />
        <span className="h-2 w-2 rounded-full bg-white/20" />
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div className="col-span-2 h-24 rounded-md bg-gradient-to-br from-sky-900/80 to-teal-900/60 p-2">
          <svg viewBox="0 0 100 60" className="h-full w-full" aria-hidden>
            <path d="M0 40 C 20 35 30 20 50 25 S 80 45 100 15" stroke="rgb(103 232 249 / 0.6)" strokeWidth="2.5" fill="none" />
            {[
              [12, 38, "#4ade80"],
              [42, 25, "#facc15"],
              [70, 38, "#4ade80"],
              [90, 20, "#fb923c"],
            ].map(([x, y, c], i) => (
              <motion.circle
                key={i}
                cx={x as number}
                cy={y as number}
                r="3"
                fill={c as string}
                animate={{ r: [3, 4.5, 3] }}
                transition={{ duration: 1.6, delay: i * 0.3, repeat: Infinity }}
              />
            ))}
          </svg>
        </div>
        <div className="space-y-2">
          {["bg-emerald-400/70", "bg-yellow-300/70", "bg-cyan-300/70"].map((c, i) => (
            <motion.div
              key={c}
              className={`h-[26px] rounded ${c}`}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              style={{ originX: 0 }}
              transition={{ delay: 0.2 + i * 0.15, duration: 0.6 }}
            />
          ))}
        </div>
      </div>
      <svg viewBox="0 0 100 24" className="mt-2 h-10 w-full" aria-hidden>
        <motion.path
          d="M0 18 L12 14 L24 16 L36 9 L48 12 L60 6 L72 10 L84 5 L100 8"
          fill="none"
          stroke="rgb(45 212 191)"
          strokeWidth="1.5"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.2 }}
        />
      </svg>
    </div>
  );
};

const Trilha = ({ ativa, progresso }: { ativa: number; progresso: ReturnType<typeof useSpring> | null }) => (
  <div className="relative mx-auto mb-8 flex max-w-xl items-center justify-between">
    <div className="absolute inset-x-6 top-1/2 h-0.5 -translate-y-1/2 bg-white/10" aria-hidden />
    {progresso && (
      <motion.div
        className="absolute left-6 right-6 top-1/2 h-0.5 -translate-y-1/2 bg-gradient-to-r from-cyan-300 to-teal-300"
        style={{ scaleX: progresso, originX: 0 }}
        aria-hidden
      />
    )}
    {ETAPAS.map((e, i) => {
      const Icon = e.icon;
      const on = i <= ativa;
      return (
        <div
          key={e.titulo}
          className={`relative z-10 flex h-11 w-11 items-center justify-center rounded-full border transition-colors duration-500 sm:h-14 sm:w-14 ${
            on
              ? "border-cyan-300 bg-cyan-400/20 text-cyan-100 shadow-[0_0_24px_rgba(34,211,238,0.45)]"
              : "border-white/15 bg-[#062a3d] text-slate-500"
          }`}
        >
          <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
        </div>
      );
    })}
  </div>
);

const TextoEtapa = ({ etapa }: { etapa: Etapa }) => (
  <>
    <h3 className="text-2xl font-semibold text-white sm:text-3xl">{etapa.titulo}</h3>
    <p className="mt-3 text-base text-slate-200 sm:text-lg">{etapa.simples}</p>
    <p className="mt-3 inline-flex items-start gap-2 rounded-lg bg-white/5 px-3 py-2 text-left text-xs text-cyan-100/80 sm:text-sm">
      <span className="mt-0.5 shrink-0 rounded bg-cyan-300/20 px-1.5 text-[10px] font-semibold uppercase tracking-wider text-cyan-200">
        Por dentro
      </span>
      {etapa.tecnico}
    </p>
  </>
);

/** Versão estática para quem pede menos movimento. */
const FluxoEstatico = () => (
  <section id="cena-4" className="mx-auto max-w-5xl px-6 py-24" aria-label="Como funciona">
    <SceneLabel index={4}>Como funciona</SceneLabel>
    <h2 className="mb-12 text-3xl font-semibold text-white sm:text-5xl">Do rio ao painel, em quatro passos.</h2>
    <ol className="grid gap-10 md:grid-cols-2">
      {ETAPAS.map((e, i) => (
        <li key={e.titulo} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <div className="mb-4 text-sm font-semibold text-cyan-300">Passo {i + 1}</div>
          <TextoEtapa etapa={e} />
        </li>
      ))}
    </ol>
  </section>
);

export const Fluxo = () => {
  const reduce = useMenosMovimento();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const suave = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.3 });
  const tituloOpacity = useTransform(scrollYProgress, [0, 0.08], [0.4, 1]);
  const [ativa, setAtiva] = useState(0);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const i = Math.min(ETAPAS.length - 1, Math.max(0, Math.floor(v * ETAPAS.length)));
    setAtiva((atual) => (atual === i ? atual : i));
  });

  if (reduce) return <FluxoEstatico />;

  return (
    // Seção alta + conteúdo "grudado": a rolagem vira a linha do tempo da animação.
    <section ref={ref} id="cena-4" className="relative h-[420vh]" aria-label="Como funciona">
      <div className="sticky top-0 flex h-[100svh] flex-col justify-center overflow-hidden px-6">
        <div className="mx-auto w-full max-w-5xl">
          <motion.div style={{ opacity: tituloOpacity }}>
            <SceneLabel index={4}>Como funciona</SceneLabel>
            <h2 className="mb-8 text-3xl font-semibold text-white sm:mb-12 sm:text-5xl">
              Do rio ao painel, em quatro passos.
            </h2>
          </motion.div>

          <Trilha ativa={ativa} progresso={suave} />

          <div className="grid items-center gap-6 md:grid-cols-2 md:gap-12">
            <div className="order-2 min-h-[13rem] text-center md:order-1 md:text-left" aria-live="polite">
              <div className="mb-2 text-sm font-semibold text-cyan-300">
                Passo {ativa + 1} de {ETAPAS.length}
              </div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={ativa}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20, transition: { duration: 0.18 } }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                >
                  <TextoEtapa etapa={ETAPAS[ativa]} />
                </motion.div>
              </AnimatePresence>
            </div>
            <div className="order-1 flex min-h-[14rem] items-center md:order-2 md:min-h-[18rem]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={ativa}
                  className="w-full"
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.04, transition: { duration: 0.18 } }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Ilustracao etapa={ativa} />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
