import { useMemo, useRef, useState } from "react";
import { motion, useMotionValueEvent, useScroll, useTransform, type MotionValue } from "framer-motion";
import { SceneLabel } from "./primitives";
import { useMenosMovimento } from "./useMenosMovimento";

/**
 * Cena 2 — o gancho. Exemplo didático (não é série real): uma curva com dois picos acima de um
 * limiar ilustrativo. Com 3 coletas a mudança passa sem registro; com 12, ela aparece.
 * Mesma curva do deck (cena "Entre duas coletas, algo pode mudar").
 */
const onda = (p: number) =>
  0.18 +
  0.07 * Math.sin(p * 21) +
  0.72 * Math.exp(-Math.pow((p - 0.44) / 0.04, 2)) +
  0.65 * Math.exp(-Math.pow((p - 0.74) / 0.06, 2));

const X0 = 40;
const LARG = 920;
const BASE = 300;
const ESCALA = 230;
const LIMIAR = 0.63; // em unidades da onda
const xy = (p: number): [number, number] => [X0 + LARG * p, BASE - ESCALA * onda(p)];
const Y_LIMIAR = BASE - ESCALA * LIMIAR;

const pontos = (n: number) =>
  Array.from({ length: n }, (_, j) => {
    const p = n === 1 ? 0 : j / (n - 1);
    const [x, y] = xy(p);
    return { x, y, acima: y < Y_LIMIAR };
  });

const Grafico = ({
  coletas,
  tracado,
}: {
  coletas: 0 | 3 | 12;
  tracado: number | MotionValue<number>;
}) => {
  const d = useMemo(() => {
    let s = "";
    for (let j = 0; j <= 250; j++) {
      const [x, y] = xy(j / 250);
      s += `${j ? " L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`;
    }
    return s;
  }, []);
  const lista = coletas ? pontos(coletas) : [];
  return (
    <svg viewBox="0 0 1000 340" className="h-auto w-full" role="img" aria-label="Curva didática com dois picos acima de um limiar e os momentos de coleta">
      <rect x="0" y="0" width="1000" height="340" rx="18" fill="rgba(255,255,255,0.04)" />
      <line x1={X0} y1={BASE} x2={X0 + LARG} y2={BASE} stroke="rgba(255,255,255,0.18)" strokeWidth="2" />
      <line x1={X0} y1={Y_LIMIAR} x2={X0 + LARG} y2={Y_LIMIAR} stroke="#efb08c" strokeWidth="2" strokeDasharray="9 7" />
      <text x={X0 + LARG} y={Y_LIMIAR - 12} textAnchor="end" fontSize="15" fontWeight="600" fill="#efb08c" letterSpacing="1.5">
        LIMIAR ILUSTRATIVO
      </text>
      <motion.path d={d} fill="none" stroke="#79d0f4" strokeWidth="5" strokeLinecap="round" style={{ pathLength: tracado }} />
      {lista.map((pt, i) => (
        <motion.circle
          key={`${coletas}-${i}`}
          cx={pt.x}
          cy={pt.y}
          r="9"
          fill="#062a3d"
          stroke={pt.acima ? "#efb08c" : "#f4f5eb"}
          strokeWidth="3.5"
          initial={{ opacity: 0, scale: 0.4 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.04, duration: 0.35 }}
        />
      ))}
      <text x={X0} y={BASE + 30} fontSize="14" fill="rgba(255,255,255,0.5)" letterSpacing="1.5">
        INÍCIO DO PERÍODO
      </text>
      <text x={X0 + LARG} y={BASE + 30} textAnchor="end" fontSize="14" fill="rgba(255,255,255,0.5)" letterSpacing="1.5">
        FIM DO PERÍODO
      </text>
    </svg>
  );
};

const Status = ({ coletas }: { coletas: 0 | 3 | 12 }) => {
  if (!coletas) return <p className="text-lg text-slate-400">O rio muda o tempo todo…</p>;
  const acima = pontos(coletas).filter((p) => p.acima).length;
  return coletas === 3 ? (
    <p className="text-lg font-semibold text-white sm:text-xl">3 coletas: a mudança passou sem registro.</p>
  ) : (
    <p className="text-lg font-semibold text-[#efb08c] sm:text-xl">12 coletas: {acima} registros acima do limiar.</p>
  );
};

const Cabecalho = () => (
  <>
    <SceneLabel index={2}>O problema</SceneLabel>
    <h2 className="max-w-3xl text-3xl font-semibold leading-tight text-white sm:text-5xl">
      Entre duas coletas, algo pode mudar.
    </h2>
    <p className="mt-4 max-w-2xl text-slate-300 sm:text-lg">
      Uma medição registra um momento. A frequência de coleta decide o que fica registrado.
    </p>
  </>
);

const Rodape = () => (
  <p className="mt-4 text-xs text-slate-500">
    Exemplo didático, não é série real. O estudo do Rio Buranhém analisa essa relação com cálculo exato de
    probabilidades.
  </p>
);

/** Versão sem movimento: o visitante alterna 3 e 12 coletas. */
const Estatica = () => {
  const [coletas, setColetas] = useState<3 | 12>(3);
  return (
    <section id="cena-2" className="mx-auto max-w-6xl px-6 py-24" aria-label="O problema">
      <Cabecalho />
      <div className="mt-10">
        <Grafico coletas={coletas} tracado={1} />
      </div>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        {([3, 12] as const).map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setColetas(n)}
            aria-pressed={coletas === n}
            className={`rounded-full border px-5 py-2.5 text-sm font-semibold transition-colors ${
              coletas === n ? "border-cyan-300 bg-cyan-300 text-slate-950" : "border-cyan-300/60 text-cyan-200"
            }`}
          >
            {n} coletas
          </button>
        ))}
        <Status coletas={coletas} />
      </div>
      <Rodape />
    </section>
  );
};

export const Amostragem = () => {
  const reduce = useMenosMovimento();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const tracado = useTransform(scrollYProgress, [0.02, 0.32], [0, 1]);
  const [coletas, setColetas] = useState<0 | 3 | 12>(0);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const c = v < 0.34 ? 0 : v < 0.64 ? 3 : 12;
    setColetas((atual) => (atual === c ? atual : c));
  });

  if (reduce) return <Estatica />;

  return (
    // A rolagem vira a linha do tempo: desenha o rio, depois 3 coletas, depois 12.
    <section ref={ref} id="cena-2" className="relative h-[320vh]" aria-label="O problema">
      <div className="sticky top-0 flex h-[100svh] flex-col justify-center overflow-hidden px-6">
        <div className="mx-auto w-full max-w-6xl">
          <Cabecalho />
          <div className="mt-8 sm:mt-10">
            <Grafico coletas={coletas} tracado={tracado} />
          </div>
          <div className="mt-5 min-h-[3.5rem]" aria-live="polite">
            <Status coletas={coletas} />
          </div>
          <Rodape />
        </div>
      </div>
    </section>
  );
};
