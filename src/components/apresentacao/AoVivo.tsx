import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Droplets, MapPin, Users, Waves } from "lucide-react";
import { Provisorio, Reveal, SceneLabel } from "./primitives";
import { useMenosMovimento } from "./useMenosMovimento";

/**
 * Cena 5. Os números ficam como lacunas até o Vinícius liberar o uso dos dados
 * reais do Supabase. Nenhuma consulta ao banco é feita aqui.
 */
const INDICADORES = [
  { icon: MapPin, rotulo: "pontos de coleta monitorados" },
  { icon: Droplets, rotulo: "leituras registradas" },
  { icon: Users, rotulo: "voluntários ativos" },
  { icon: Waves, rotulo: "rios e bacias acompanhados" },
];

// Pontos da ilustração do mapa (posições desenhadas à mão, não são coordenadas reais).
const PONTOS = [
  { x: 14, y: 30, c: "#4ade80" },
  { x: 31, y: 44, c: "#4ade80" },
  { x: 47, y: 38, c: "#facc15" },
  { x: 61, y: 56, c: "#fb923c" },
  { x: 76, y: 50, c: "#facc15" },
  { x: 90, y: 66, c: "#4ade80" },
];

export const AoVivo = () => {
  const ref = useRef<HTMLElement>(null);
  const reduce = useMenosMovimento();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const tilt = useTransform(scrollYProgress, [0, 0.45], reduce ? [0, 0] : [18, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.45], reduce ? [1, 1] : [0.88, 1]);

  return (
    <section ref={ref} id="cena-5" className="mx-auto max-w-6xl px-6 py-24 sm:py-32" aria-label="A plataforma ao vivo">
      <Reveal>
        <SceneLabel index={5}>A plataforma ao vivo</SceneLabel>
        <h2 className="max-w-3xl text-3xl font-semibold text-white sm:text-5xl">
          Não é protótipo de slide. <span className="text-cyan-200">Já está no ar.</span>
        </h2>
        <p className="mt-4 max-w-2xl text-slate-300">
          O painel de qualidade da água, o mapa de pontos e o app de coleta funcionam hoje, ligados ao mesmo banco
          de dados.
        </p>
      </Reveal>

      <Reveal delay={0.1}>
        <div className="mt-8 flex flex-wrap items-center gap-3 rounded-xl border border-dashed border-amber-300/40 bg-amber-300/[0.05] px-4 py-3 text-sm text-amber-100/90">
          <Provisorio>Aguardando dados reais</Provisorio>
          <span>Os números entram aqui quando o uso dos dados do Supabase for liberado.</span>
        </div>
      </Reveal>

      <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {INDICADORES.map(({ icon: Icon, rotulo }, i) => (
          <Reveal key={rotulo} delay={0.08 * i}>
            <div className="h-full rounded-2xl border border-white/10 bg-white/[0.04] p-4 sm:p-6">
              <Icon className="mb-3 h-5 w-5 text-cyan-300" />
              <div className="text-3xl font-semibold tracking-tight text-amber-200/90 sm:text-4xl" aria-label="valor a definir">
                — —
              </div>
              <div className="mt-1 text-xs text-slate-400 sm:text-sm">{rotulo}</div>
            </div>
          </Reveal>
        ))}
      </div>

      <div className="mt-10 [perspective:1200px]">
        <motion.div
          style={{ rotateX: tilt, scale }}
          className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950/70 shadow-[0_40px_120px_-30px_rgba(34,211,238,0.35)]"
        >
          <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
            <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
            <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
            <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
            <span className="ml-3 truncate text-xs text-slate-400">Painel Tikatu · ilustração</span>
            <Provisorio className="ml-auto hidden sm:inline-flex">Ilustrativo</Provisorio>
          </div>
          <div className="grid gap-4 p-4 md:grid-cols-5">
            <div className="relative md:col-span-3">
              <svg viewBox="0 0 100 80" className="h-56 w-full rounded-xl bg-gradient-to-br from-[#0b3b52] to-[#0a2e3f] sm:h-72" aria-hidden>
                <defs>
                  <pattern id="grade" width="10" height="10" patternUnits="userSpaceOnUse">
                    <path d="M10 0 L0 0 0 10" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="0.4" />
                  </pattern>
                </defs>
                <rect width="100" height="80" fill="url(#grade)" />
                <motion.path
                  d="M0 26 C 12 28 18 40 30 44 S 44 36 50 40 S 58 56 66 56 S 82 48 90 64 L 100 72"
                  fill="none"
                  stroke="rgb(56 189 248 / 0.55)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  initial={reduce ? false : { pathLength: 0 }}
                  whileInView={{ pathLength: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 2, ease: "easeInOut" }}
                />
                {PONTOS.map((p, i) => (
                  <g key={i}>
                    {!reduce && (
                      <motion.circle
                        cx={p.x}
                        cy={p.y}
                        fill={p.c}
                        initial={{ r: 2, opacity: 0.5 }}
                        animate={{ r: [2, 6, 2], opacity: [0.5, 0, 0.5] }}
                        transition={{ duration: 2.4, delay: i * 0.3, repeat: Infinity }}
                      />
                    )}
                    <circle cx={p.x} cy={p.y} r="2" fill={p.c} stroke="#062a3d" strokeWidth="0.6" />
                  </g>
                ))}
              </svg>
              <div className="absolute bottom-3 left-3 flex gap-3 rounded-md bg-slate-950/70 px-2 py-1 text-[10px] text-slate-300">
                <span className="flex items-center gap-1"><i className="h-2 w-2 rounded-full bg-emerald-400" />Boa</span>
                <span className="flex items-center gap-1"><i className="h-2 w-2 rounded-full bg-yellow-300" />Regular</span>
                <span className="flex items-center gap-1"><i className="h-2 w-2 rounded-full bg-orange-400" />Ruim</span>
              </div>
            </div>
            <div className="space-y-3 md:col-span-2">
              <div className="rounded-xl bg-white/[0.04] p-4">
                <div className="text-xs text-slate-400">IQA por ponto</div>
                <div className="mt-3 space-y-2">
                  {[0.82, 0.64, 0.71, 0.48].map((w, i) => (
                    <div key={i} className="h-2.5 overflow-hidden rounded-full bg-white/5">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-teal-300"
                        initial={reduce ? false : { width: 0 }}
                        whileInView={{ width: `${w * 100}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.2, delay: 0.2 + i * 0.12 }}
                        style={reduce ? { width: `${w * 100}%` } : undefined}
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-xl bg-white/[0.04] p-4">
                <div className="text-xs text-slate-400">Série histórica</div>
                <svg viewBox="0 0 100 30" className="mt-2 h-16 w-full" aria-hidden>
                  <motion.path
                    d="M0 22 L10 18 L20 20 L30 12 L40 15 L50 9 L60 13 L70 7 L80 10 L90 5 L100 8"
                    fill="none"
                    stroke="rgb(45 212 191)"
                    strokeWidth="1.6"
                    initial={reduce ? false : { pathLength: 0 }}
                    whileInView={{ pathLength: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.6 }}
                  />
                </svg>
              </div>
            </div>
          </div>
        </motion.div>
        <p className="mt-3 text-center text-xs text-slate-500">
          Ilustração do painel. Para a demonstração ao vivo, abra o painel real da plataforma.
        </p>
      </div>
    </section>
  );
};
