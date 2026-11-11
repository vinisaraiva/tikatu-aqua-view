import { useEffect, useRef, useState } from "react";
import { AnimatePresence, animate, motion, useInView } from "framer-motion";
import { ATRASO_TELA, Reveal, SceneLabel, usePalco } from "@/components/apresentacao/primitives";
import { useMenosMovimento } from "@/components/apresentacao/useMenosMovimento";
import { formatar, useIdioma, useT, type Bi } from "@/components/apresentacao/idioma";

/** Orçamento estimado agrupado em frentes (soma = TOTAL). Detalhe por item fica para quem pedir. */
/** Cada frente com a entrega concreta que ela viabiliza. */
const FRENTES: { curto: Bi; titulo: Bi; texto: Bi; entrega: Bi; valor: number; pct: number; cor: string }[] = [
  {
    curto: ["Campo", "Field"],
    titulo: ["Ampliação do monitoramento em campo", "Expanding field monitoring"],
    texto: [
      "Sonda automática e turbidímetro, estrutura de campo, calibração, visitas, logística e frete.",
      "Automatic probe and turbidimeter, field infrastructure, calibration, site visits, logistics and freight.",
    ],
    entrega: ["Novas campanhas de coleta e mais pontos acompanhados.", "New sampling campaigns and more sites monitored."],
    valor: 57450,
    pct: 53,
    cor: "#67e8f9",
  },
  {
    curto: ["Tecnologia", "Technology"],
    titulo: ["Novas tecnologias e infraestrutura digital", "New technologies and digital infrastructure"],
    texto: [
      "Integração da sonda automática à plataforma, desenvolvimento, processamento de IA e equipamento.",
      "Integrating the automatic probe into the platform, development, AI processing and equipment.",
    ],
    entrega: [
      "Registros mais completos e as ferramentas avaliadas em uso real.",
      "More complete records and the tools evaluated in real use.",
    ],
    valor: 29428.2,
    pct: 27,
    cor: "#38bdf8",
  },
  {
    curto: ["Laboratório", "Laboratory"],
    titulo: ["Validação laboratorial", "Laboratory validation"],
    texto: [
      "Análises de referência para conferir as medições feitas em campo.",
      "Reference analyses to check the measurements taken in the field.",
    ],
    entrega: ["Medições de campo conferidas com análises de referência.", "Field measurements checked against reference analyses."],
    valor: 18000,
    pct: 16,
    cor: "#efb08c",
  },
  {
    curto: ["Voluntários", "Volunteers"],
    titulo: ["Formação da rede de voluntários", "Training the volunteer network"],
    texto: [
      "Formação e identificação dos voluntários que coletam os dados.",
      "Training and identification of the volunteers who collect the data.",
    ],
    entrega: ["Voluntários formados para coletas regulares.", "Volunteers trained for regular sampling."],
    valor: 3960,
    pct: 4,
    cor: "#5eead4",
  },
];
// Percentuais inteiros que somam 100 (maiores restos).
export const TOTAL = 108838.2;
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
      <svg viewBox="0 0 200 200" className="h-full w-full -rotate-90 overflow-visible" aria-hidden>
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
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-300/80">
          {t(["Total a captar", "Total to raise"])}
        </div>
        <div className="mt-1 font-mono text-2xl font-semibold tabular-nums text-white sm:text-3xl">
          <span className="text-base text-slate-300 sm:text-lg">R$ </span>
          {formatar(total, l, 2)}
        </div>
        <div className="mt-1 text-xs text-slate-400">{t(["valor estimado", "estimated amount"])}</div>
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
        <h2 className="max-w-3xl text-3xl font-semibold leading-tight text-white sm:text-5xl">
          {t(["Para onde vai o apoio.", "Where the support goes."])}
        </h2>
        <p className="mt-4 max-w-3xl text-slate-300 sm:text-lg">
          {t([
            "Mais da metade vai para o campo. O restante fortalece a tecnologia, valida as medições e forma a rede de voluntários.",
            "More than half goes to the field. The rest strengthens the technology, validates the measurements and trains the volunteer network.",
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
                  <span className="text-sm text-slate-400">{t(["do total", "of the total"])}</span>
                </div>
                <h3 className="mt-4 text-2xl font-semibold text-white sm:text-3xl">{t(f.titulo)}</h3>
                <p className="mt-3 text-base text-slate-300 sm:text-lg">{t(f.texto)}</p>
                <p className="mt-4 flex items-baseline gap-2 border-t border-white/10 pt-3 text-base text-white sm:text-lg">
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
            className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4"
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
                <span className="flex items-center gap-2 text-sm font-semibold text-white">
                  <span className="block h-2 w-2 rounded-full" style={{ background: x.cor }} aria-hidden />
                  {t(x.curto)}
                </span>
                <span className="font-mono text-xs tabular-nums text-slate-400">{x.pct}%</span>
              </button>
            ))}
          </div>
          {palco.ativo && (
            <p className="mt-3 text-xs text-slate-500">
              {t(["Use → para ver a próxima frente.", "Press → to see the next area."])}
            </p>
          )}
        </div>
      </div>
      <p className="mt-6 text-xs text-slate-500">
        {t([
          "Valores estimados, sujeitos a cotações e ao plano de aplicação aprovado. Detalhamento por item disponível sob solicitação.",
          "Estimated amounts, subject to quotes and to the approved spending plan. Item-level breakdown available on request.",
        ])}
      </p>
    </section>
  );
};
