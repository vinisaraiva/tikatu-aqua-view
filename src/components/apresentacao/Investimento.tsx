import { useEffect, useRef, useState } from "react";
import { animate, motion, useInView } from "framer-motion";
import { Reveal, SceneLabel } from "@/components/apresentacao/primitives";
import { useMenosMovimento } from "@/components/apresentacao/useMenosMovimento";

/** Orçamento estimado agrupado em frentes (soma = TOTAL). Detalhe por item fica para quem pedir. */
const FRENTES = [
  {
    titulo: "Ampliação do monitoramento em campo",
    texto: "Sonda automática e turbidímetro, estrutura de campo, calibração, visitas, logística e frete.",
    valor: 57450,
    cor: "#67e8f9",
  },
  {
    titulo: "Novas tecnologias e infraestrutura digital",
    texto: "Integração da sonda automática à plataforma, desenvolvimento, processamento de IA e equipamento.",
    valor: 29428.2,
    cor: "#38bdf8",
  },
  {
    titulo: "Validação laboratorial",
    texto: "Análises de referência para conferir as medições feitas em campo.",
    valor: 18000,
    cor: "#efb08c",
  },
  {
    titulo: "Formação da rede de voluntários",
    texto: "Formação e identificação dos voluntários que coletam os dados.",
    valor: 3960,
    cor: "#5eead4",
  },
];
const TOTAL = 108838.2;
// Percentuais inteiros que somam 100 (maiores restos).
const PCT = [53, 27, 16, 4];

const brl = (v: number) => v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const R = 80;
const C = 2 * Math.PI * R;
const FOLGA = 3; // espaço entre os arcos, em unidades do SVG

const Anel = ({ ativo, reduce }: { ativo: boolean; reduce: boolean }) => {
  const [total, setTotal] = useState(reduce ? TOTAL : 0);
  useEffect(() => {
    if (!ativo || reduce) return;
    const c = animate(0, TOTAL, { duration: 2.4, delay: 0.3, ease: [0.2, 0.75, 0.3, 1], onUpdate: setTotal });
    return () => c.stop();
  }, [ativo, reduce]);

  let acumulado = 0;
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[22rem]">
      <svg viewBox="0 0 200 200" className="h-full w-full -rotate-90" aria-hidden>
        <circle cx="100" cy="100" r={R} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="22" />
        {FRENTES.map((f, i) => {
          const comp = (f.valor / TOTAL) * C;
          const inicio = acumulado;
          acumulado += comp;
          const visivel = Math.max(comp - FOLGA, 0.5);
          return (
            <motion.circle
              key={f.titulo}
              cx="100"
              cy="100"
              r={R}
              fill="none"
              stroke={f.cor}
              strokeWidth="22"
              strokeDashoffset={-inicio}
              initial={false}
              animate={{ strokeDasharray: ativo || reduce ? `${visivel} ${C}` : `0 ${C}` }}
              transition={reduce ? { duration: 0 } : { duration: 0.9, delay: 0.3 + i * 0.55, ease: [0.2, 0.75, 0.3, 1] }}
            />
          );
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-300/80">Total a captar</div>
        <div className="mt-1 font-mono text-2xl font-semibold tabular-nums text-white sm:text-3xl">
          <span className="text-base text-slate-300 sm:text-lg">R$ </span>
          {brl(total)}
        </div>
        <div className="mt-1 text-xs text-slate-400">valor estimado</div>
      </div>
    </div>
  );
};

export const Investimento = () => {
  const reduce = useMenosMovimento();
  const ref = useRef<HTMLDivElement>(null);
  const ativo = useInView(ref, { amount: 0.4, once: true });

  return (
    <section
      id="cena-10"
      className="mx-auto flex min-h-[100svh] max-w-6xl flex-col justify-center px-6 py-16"
      aria-label="O investimento"
    >
      <Reveal>
        <SceneLabel index={10}>O investimento</SceneLabel>
        <h2 className="max-w-3xl text-3xl font-semibold leading-tight text-white sm:text-5xl">
          Ampliar a capacidade de monitorar os rios do território.
        </h2>
        <p className="mt-4 max-w-2xl text-slate-300 sm:text-lg">
          Uma sonda automática instalada no rio, somada às sondas portáteis dos voluntários: mais pontos, mais
          frequência e mais rios acompanhados, com medições validadas.
        </p>
      </Reveal>

      <div ref={ref} className="mt-8 grid items-center gap-8 md:grid-cols-[0.9fr_1.1fr] md:gap-12">
        <Anel ativo={ativo} reduce={reduce} />
        <ul className="grid gap-3" aria-label={`Total estimado: R$ ${brl(TOTAL)}`}>
          {FRENTES.map((f, i) => (
            <motion.li
              key={f.titulo}
              className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-3.5"
              initial={reduce ? false : { opacity: 0, x: 24 }}
              animate={ativo || reduce ? { opacity: 1, x: 0 } : undefined}
              transition={{ duration: 0.6, delay: 0.3 + i * 0.55, ease: [0.2, 0.75, 0.3, 1] }}
            >
              <div className="flex items-baseline justify-between gap-4">
                <span className="flex items-center gap-2.5 font-semibold text-white">
                  <span className="block h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: f.cor }} aria-hidden />
                  {f.titulo}
                </span>
                <span className="shrink-0 font-mono text-sm tabular-nums" style={{ color: f.cor }}>
                  {PCT[i]}%
                </span>
              </div>
              <div className="mt-1 flex items-baseline justify-between gap-4 pl-5">
                <span className="text-sm text-slate-400">{f.texto}</span>
                <span className="shrink-0 font-mono text-sm tabular-nums text-slate-200">R$ {brl(f.valor)}</span>
              </div>
            </motion.li>
          ))}
        </ul>
      </div>
      <p className="mt-6 text-xs text-slate-500">
        Valores estimados, sujeitos a cotações e ao plano de aplicação aprovado. Detalhamento por item disponível sob
        solicitação.
      </p>
    </section>
  );
};
