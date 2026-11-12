import { useEffect, useRef, useState } from "react";
import { AnimatePresence, animate, motion, useInView } from "framer-motion";
import { ATRASO_TELA, Reveal, SceneLabel, usePalco } from "@/components/apresentacao/primitives";
import { useMenosMovimento } from "@/components/apresentacao/useMenosMovimento";
import { formatar, useIdioma, useT, type Bi } from "@/components/apresentacao/idioma";

/**
 * Orçamento estimado em frentes (soma = TOTAL), cada uma com a entrega que viabiliza.
 * Plano de 12 meses combinado com o Vinícius em 11/11/2026 (orçamento anterior + 2 bolsas).
 * O detalhe por item fica para quem pedir.
 */
const FRENTES: { curto: Bi; titulo: Bi; texto: Bi; entrega: Bi; valor: number; pct: number; cor: string }[] = [
  {
    curto: ["Campo", "Field"],
    titulo: ["Monitoramento em campo", "Field monitoring"],
    texto: [
      "Sonda automática com envio de dados, sonda portátil de reserva e reposição, turbidímetro, estrutura de campo, calibração, saídas, logística e frete.",
      "Automatic probe with data transmission, a spare portable probe, turbidimeter, field infrastructure, calibration, field trips, logistics and freight.",
    ],
    entrega: [
      "2 rios, 8 pontos, 10 ciclos mensais e 80 registros, mais a série contínua da sonda automática.",
      "2 rivers, 8 sites, 10 monthly cycles and 80 records, plus the automatic probe's continuous series.",
    ],
    valor: 57450,
    pct: 46,
    cor: "#8fd0f5",
  },
  {
    curto: ["Tecnologia", "Technology"],
    titulo: ["Tecnologia e infraestrutura digital", "Technology and digital infrastructure"],
    texto: [
      "Integração da sonda automática pela API do Tikatu, melhorias na plataforma, IA para relatórios, operação digital, notebook e dispositivo de campo.",
      "Integrating the automatic probe through the Tikatu API, platform improvements, AI for reports, digital operation, a laptop and a field device.",
    ],
    entrega: [
      "Os dois tipos de medição num só painel, 10 boletins para a comunidade e 5 relatórios para gestores.",
      "Both kinds of measurement in one dashboard, 10 community bulletins and 5 reports for decision-makers.",
    ],
    valor: 29428.2,
    pct: 24,
    cor: "#3d9bd9",
  },
  {
    curto: ["Laboratório", "Laboratory"],
    titulo: ["Análises laboratoriais complementares", "Complementary laboratory analyses"],
    texto: [
      "As sondas são calibradas; o laboratório complementa as medições quando o protocolo pedir.",
      "The probes are calibrated; the laboratory complements the measurements when the protocol calls for it.",
    ],
    entrega: ["Até 36 amostras: 32 principais e 4 de controle de qualidade.", "Up to 36 samples: 32 main and 4 for quality control."],
    valor: 18000,
    pct: 14,
    cor: "#f0a37a",
  },
  {
    curto: ["Bolsistas", "Fellows"],
    titulo: ["Bolsistas de coleta", "Sampling fellows"],
    texto: [
      "2 estudantes de graduação com bolsa por 12 meses, responsáveis pela coleta mensal com as sondas portáteis.",
      "2 undergraduate students with a 12-month fellowship, responsible for the monthly sampling with the portable probes.",
    ],
    entrega: [
      "Coleta regular nos 8 pontos durante os 10 ciclos, e estudantes formados em monitoramento.",
      "Regular sampling at the 8 sites over the 10 cycles, and students trained in monitoring.",
    ],
    valor: 16800,
    pct: 13,
    cor: "#f4f2ea",
  },
  {
    curto: ["Comunidade", "Community"],
    titulo: ["Voluntários da comunidade", "Community volunteers"],
    texto: [
      "Oficinas de formação e identificação para quem quiser participar das coletas, com os jogos do Tikatu Educa sobre monitoramento da água.",
      "Training workshops and identification for anyone who wants to take part in the sampling, using the Tikatu Educa games on water monitoring.",
    ],
    entrega: ["2 oficinas (16 h) abertas à comunidade.", "2 workshops (16 h) open to the community."],
    valor: 3960,
    pct: 3,
    cor: "#d9683a",
  },
];
// Percentuais inteiros que somam 100 (maiores restos).
export const TOTAL = 125638.2;
export const PASSOS_INVESTIMENTO = FRENTES.length;

const R = 80;
const C = 2 * Math.PI * R;
const FOLGA = 3; // espaço entre os arcos, em unidades do SVG
const DESENHO = 0.3 + FRENTES.length * 0.45 + 0.9; // segundos até o anel ficar completo

const Anel = ({ ativo, desenhado, sel, reduce }: { ativo: boolean; desenhado: boolean; sel: number; reduce: boolean }) => {
  const t = useT();
  const l = useIdioma();
  const [total, setTotal] = useState(reduce ? TOTAL : 0);
  useEffect(() => {
    if (!ativo || reduce) return;
    const c = animate(0, TOTAL, { duration: 2.2, delay: 0.3, ease: [0.2, 0.75, 0.3, 1], onUpdate: setTotal });
    return () => c.stop();
  }, [ativo, reduce]);

  let acumulado = 0;
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[24rem]">
      <motion.svg
        viewBox="0 0 200 200"
        className="h-full w-full overflow-visible"
        aria-hidden
        initial={false}
        animate={{ rotate: ativo || reduce ? -90 : -150, scale: ativo || reduce ? 1 : 0.86 }}
        transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 60, damping: 13, delay: 0.3 }}
      >
        <circle cx="100" cy="100" r={R} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="22" />
        {FRENTES.map((f, i) => {
          const comp = (f.valor / TOTAL) * C;
          const inicio = acumulado;
          acumulado += comp;
          const visivel = Math.max(comp - FOLGA, 0.5);
          const destaque = !desenhado || i === sel;
          return (
            <motion.circle
              key={f.cor}
              cx="100"
              cy="100"
              r={R}
              fill="none"
              stroke={f.cor}
              strokeDashoffset={-inicio}
              initial={false}
              animate={{
                strokeDasharray: ativo || reduce ? `${visivel} ${C}` : `0 ${C}`,
                strokeWidth: desenhado && i === sel ? 30 : 22,
                opacity: destaque ? 1 : 0.3,
              }}
              transition={
                reduce
                  ? { duration: 0 }
                  : {
                      strokeDasharray: { duration: 0.9, delay: 0.3 + i * 0.45, ease: [0.2, 0.75, 0.3, 1] },
                      default: { duration: 0.5 },
                    }
              }
            />
          );
        })}
      </motion.svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-tk-rio-claro/80">
          {t(["Total a captar", "Total to raise"])}
        </div>
        <div className="mt-1 font-mono text-2xl font-semibold tabular-nums text-tk-creme sm:text-3xl">
          <span className="text-base text-tk-nevoa sm:text-lg">R$ </span>
          {formatar(total, l, 2)}
        </div>
        <div className="mt-1 text-xs text-tk-nevoa/75">{t(["valor estimado", "estimated amount"])}</div>
      </div>
    </div>
  );
};

export const Investimento = () => {
  const reduce = useMenosMovimento();
  const palco = usePalco();
  const t = useT();
  const ref = useRef<HTMLDivElement>(null);
  const ativo = useInView(ref, { amount: 0.4, once: true });
  const [desenhado, setDesenhado] = useState(reduce);
  const [escolhida, setEscolhida] = useState(0);
  const [pausa, setPausa] = useState(false);

  // Depois que o anel termina de se desenhar, uma frente fica em destaque por vez.
  useEffect(() => {
    if (!ativo || reduce) return;
    const id = window.setTimeout(() => setDesenhado(true), (DESENHO + (palco.ativo ? ATRASO_TELA : 0)) * 1000);
    return () => window.clearTimeout(id);
  }, [ativo, reduce, palco.ativo]);

  // Na rolagem, as frentes se alternam sozinhas; no modo telas, cada seta avança uma frente.
  useEffect(() => {
    if (palco.ativo || reduce || !desenhado || pausa) return;
    const id = window.setInterval(() => setEscolhida((v) => (v + 1) % FRENTES.length), 4500);
    return () => window.clearInterval(id);
  }, [palco.ativo, reduce, desenhado, pausa, escolhida]);

  const sel = palco.ativo ? Math.min(palco.passo, FRENTES.length - 1) : escolhida;
  const f = FRENTES[sel];

  return (
    <section
      id="cena-11"
      className="mx-auto flex min-h-[100svh] max-w-6xl flex-col justify-center px-6 py-16"
      aria-label={t(["O investimento", "The investment"])}
    >
      <Reveal>
        <SceneLabel index={11}>{t(["O investimento", "The investment"])}</SceneLabel>
        <h2 className="max-w-3xl text-3xl font-semibold leading-tight text-tk-creme sm:text-5xl">
          {t(["Para onde vai o apoio.", "Where the support goes."])}
        </h2>
        <p className="mt-4 max-w-3xl text-tk-nevoa sm:text-lg">
          {t([
            "Cada parte do apoio vira dado: medido no rio com sondas calibradas, complementado em laboratório e transformado em informação para a comunidade e para quem decide.",
            "Every part of the support becomes data: measured in the river with calibrated probes, complemented in the laboratory and turned into information for the community and for decision-makers.",
          ])}
        </p>
      </Reveal>

      <div ref={ref} className="mt-8 grid items-center gap-8 md:grid-cols-[0.85fr_1.15fr] md:gap-12">
        <Anel ativo={ativo} desenhado={desenhado} sel={sel} reduce={reduce} />

        <div onMouseEnter={() => setPausa(true)} onMouseLeave={() => setPausa(false)}>
          {/* Frente em destaque, em tamanho grande */}
          <div
            className="relative min-h-[15rem] overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-6 sm:p-8"
            aria-live="polite"
          >
            <motion.span
              className="absolute inset-x-0 top-0 h-1"
              initial={false}
              animate={{ backgroundColor: f.cor }}
              transition={{ duration: 0.5 }}
              aria-hidden
            />
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={sel}
                initial={reduce ? false : { opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30, transition: { duration: 0.2 } }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                {/* Só o percentual: o valor de cada frente fica no detalhamento, sob solicitação. */}
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="font-mono text-6xl font-semibold tabular-nums sm:text-7xl" style={{ color: f.cor }}>
                    {f.pct}%
                  </span>
                  <span className="text-sm text-tk-nevoa/75">{t(["do total", "of the total"])}</span>
                </div>
                <h3 className="mt-4 text-2xl font-semibold text-tk-creme sm:text-3xl">{t(f.titulo)}</h3>
                <p className="mt-3 text-base text-tk-nevoa sm:text-lg">{t(f.texto)}</p>
                <p className="mt-4 flex items-baseline gap-2 border-t border-white/10 pt-3 text-base text-tk-creme sm:text-lg">
                  <span className="shrink-0 text-[11px] font-semibold uppercase tracking-wider" style={{ color: f.cor }}>
                    {t(["Entrega", "Delivers"])}
                  </span>
                  {t(f.entrega)}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* As quatro frentes: clicáveis, com a ativa marcada */}
          <div
            className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-5"
            role="tablist"
            aria-label={t(["Frentes do investimento", "Investment areas"])}
          >
            {FRENTES.map((x, k) => (
              <button
                key={x.cor}
                type="button"
                role="tab"
                aria-selected={k === sel}
                onClick={() => setEscolhida(k)}
                disabled={palco.ativo}
                className={`rounded-xl border px-3 py-2 text-left transition-colors disabled:cursor-default ${
                  k === sel ? "border-white/30 bg-white/10" : "border-white/10 bg-white/[0.02] hover:bg-white/[0.06]"
                }`}
              >
                <span className="flex min-w-0 items-center gap-1.5 text-sm font-semibold text-tk-creme">
                  <span className="block h-2 w-2 shrink-0 rounded-full" style={{ background: x.cor }} aria-hidden />
                  {t(x.curto)}
                </span>
                <span className="font-mono text-xs tabular-nums text-tk-nevoa/75">{x.pct}%</span>
              </button>
            ))}
          </div>
          {palco.ativo && (
            <p className="mt-3 text-xs text-tk-nevoa/60">
              {t(["Use → para ver a próxima frente.", "Press → to see the next area."])}
            </p>
          )}
        </div>
      </div>
      <p className="mt-6 text-xs text-tk-nevoa/60">
        {t([
          "Valores estimados, sujeitos a cotações e ao plano de aplicação aprovado. Detalhamento por item disponível sob solicitação.",
          "Estimated amounts, subject to quotes and to the approved spending plan. Item-level breakdown available on request.",
        ])}
      </p>
    </section>
  );
};
