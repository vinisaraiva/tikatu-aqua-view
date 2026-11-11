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
    simples: "No ponto do rio, o voluntário mede com a sonda e envia a leitura pelo app Tikatu Coleta.",
    tecnico: "O app importa o arquivo XLSX da sonda, sem redigitar valores.",
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
    simples: "Os números brutos viram informação: cada leitura é organizada e comparada à referência legal.",
    tecnico: "Comparação com a faixa do CONAMA e índices como o IQA (Qualidade da Água) e o IET (Estado Trófico).",
  },
  {
    icon: LayoutDashboard,
    titulo: "O painel mostra",
    simples: "Qualquer pessoa vê no mapa e nos gráficos como está a água daquele lugar.",
    tecnico: "Painel web com mapa, referência do CONAMA e status de cada leitura por ponto de coleta.",
  },
];

/** Ilustração de cada etapa. Passos 1 e 4 usam telas reais (Coleta e painel em produção). */
const Ilustracao = ({ etapa }: { etapa: number }) => {
  if (etapa === 0) {
    return (
      <div className="mx-auto w-24 rounded-[1.4rem] bg-[#0d1b24] p-1.5 shadow-2xl shadow-cyan-500/20 ring-1 ring-white/15 sm:w-56 sm:rounded-[2rem] sm:p-2">
        <div className="overflow-hidden rounded-[1.6rem] bg-[#f6f7f9]">
          <img
            src="/apresentacao/coleta-importar.webp"
            alt="Tela real do Tikatu Coleta para importar o arquivo XLSX da sonda"
            className="block w-full"
            loading="lazy"
          />
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
    // Leituras reais de pH do Rio Chamagunga (25/08/2024), comparadas à faixa do CONAMA (6 a 9).
    const linhas: [string, number][] = [["Ponto 2", 5], ["Ponto 3", 5.9], ["Ponto 4", 6], ["Ponto 5", 6.5], ["Ponto 6", 7]];
    const cor = (v: number) => (v < 5.5 ? "bg-red-400" : v < 6.6 ? "bg-amber-400" : "bg-emerald-400");
    return (
      <div className="mx-auto w-full max-w-xs space-y-2">
        <div className="text-[11px] uppercase tracking-wider text-teal-100/80">pH · faixa CONAMA 6 a 9</div>
        {linhas.map(([ponto, v], i) => (
          <motion.div
            key={ponto}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 + i * 0.12 }}
            className="flex items-center gap-3 rounded-lg bg-white/5 px-3 py-2 text-sm"
          >
            <span className="w-16 text-slate-300">{ponto}</span>
            <span className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
              <motion.span
                className={`block h-full rounded-full ${cor(v)}`}
                initial={{ width: 0 }}
                animate={{ width: `${(v / 9) * 100}%` }}
                transition={{ delay: 0.3 + i * 0.12, duration: 0.6 }}
              />
            </span>
            <span className="w-8 text-right font-mono text-white">{v.toLocaleString("pt-BR")}</span>
          </motion.div>
        ))}
      </div>
    );
  }
  return (
    <div className="mx-auto w-full max-w-[15rem] overflow-hidden rounded-xl bg-white sm:max-w-sm shadow-2xl shadow-cyan-500/20 ring-1 ring-white/15">
      <div className="flex items-center gap-1.5 bg-slate-200 px-3 py-2">
        <span className="h-2 w-2 rounded-full bg-slate-400" />
        <span className="h-2 w-2 rounded-full bg-slate-400" />
        <span className="h-2 w-2 rounded-full bg-slate-400" />
        <span className="ml-2 truncate text-[10px] text-slate-600">tikatu.com.br/dashboard</span>
      </div>
      <img
        src="/apresentacao/painel-ph.webp"
        alt="Painel real: pH dos pontos do Rio Chamagunga e mapa de coleta"
        className="block w-full"
        loading="lazy"
      />
    </div>
  );
};

const Trilha = ({ ativa, progresso }: { ativa: number; progresso: ReturnType<typeof useSpring> | null }) => (
  <div className="relative mx-auto mb-5 flex max-w-xl items-center justify-between sm:mb-8">
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
    <h3 className="text-xl font-semibold text-white sm:text-3xl">{etapa.titulo}</h3>
    <p className="mt-2 text-[15px] text-slate-200 sm:mt-3 sm:text-lg">{etapa.simples}</p>
    <p className="mt-2 inline-flex items-start gap-2 rounded-lg bg-white/5 px-3 py-2 text-left text-xs sm:mt-3 text-cyan-100/80 sm:text-sm">
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
            <h2 className="mb-4 text-2xl font-semibold text-white sm:mb-12 sm:text-5xl">
              Do rio ao painel, em quatro passos.
            </h2>
          </motion.div>

          <Trilha ativa={ativa} progresso={suave} />

          <div className="grid items-center gap-3 sm:gap-6 md:grid-cols-2 md:gap-12">
            <div className="order-2 min-h-[11rem] text-center sm:min-h-[13rem] md:order-1 md:text-left" aria-live="polite">
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
            <div className="order-1 flex min-h-[10rem] items-center sm:min-h-[14rem] md:order-2 md:min-h-[18rem]">
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
