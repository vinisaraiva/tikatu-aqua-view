import { useEffect, useMemo, useRef, useState } from "react";
import { animate, motion, useInView, useMotionValue, type MotionValue } from "framer-motion";
import { SceneLabel } from "./primitives";
import { useMenosMovimento } from "./useMenosMovimento";
import { useT } from "./idioma";

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
  const t = useT();
  const lista = coletas ? pontos(coletas) : [];
  return (
    <svg
      viewBox="0 0 1000 340"
      className="h-auto w-full"
      role="img"
      aria-label={t([
        "Curva didática com dois picos acima de um limiar e os momentos de coleta",
        "Teaching curve with two peaks above a threshold and the sampling moments",
      ])}
    >
      <rect x="0" y="0" width="1000" height="340" rx="18" fill="rgba(255,255,255,0.04)" />
      <line x1={X0} y1={BASE} x2={X0 + LARG} y2={BASE} stroke="rgba(255,255,255,0.18)" strokeWidth="2" />
      <line x1={X0} y1={Y_LIMIAR} x2={X0 + LARG} y2={Y_LIMIAR} stroke="#efb08c" strokeWidth="2" strokeDasharray="9 7" />
      <text x={X0 + LARG} y={Y_LIMIAR - 12} textAnchor="end" fontSize="15" fontWeight="600" fill="#efb08c" letterSpacing="1.5">
        {t(["LIMIAR ILUSTRATIVO", "ILLUSTRATIVE THRESHOLD"])}
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
          transition={{ delay: i * 0.12, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        />
      ))}
      <text x={X0} y={BASE + 30} fontSize="14" fill="rgba(255,255,255,0.5)" letterSpacing="1.5">
        {t(["INÍCIO DO PERÍODO", "START OF PERIOD"])}
      </text>
      <text x={X0 + LARG} y={BASE + 30} textAnchor="end" fontSize="14" fill="rgba(255,255,255,0.5)" letterSpacing="1.5">
        {t(["FIM DO PERÍODO", "END OF PERIOD"])}
      </text>
    </svg>
  );
};

const Status = ({ coletas }: { coletas: 0 | 3 | 12 }) => {
  const t = useT();
  if (!coletas) return <p className="text-lg text-slate-400">{t(["O rio muda o tempo todo…", "The river changes all the time…"])}</p>;
  const acima = pontos(coletas).filter((p) => p.acima).length;
  return coletas === 3 ? (
    <p className="text-lg font-semibold text-white sm:text-xl">
      {t(["3 coletas: a mudança passou sem registro.", "3 samples: the change went unrecorded."])}
    </p>
  ) : (
    <p className="text-lg font-semibold text-[#efb08c] sm:text-xl">
      {t([`12 coletas: ${acima} registros acima do limiar.`, `12 samples: ${acima} readings above the threshold.`])}
    </p>
  );
};

const Cabecalho = () => {
  const t = useT();
  return (
    <>
      <SceneLabel index={4}>{t(["Com que frequência?", "How often?"])}</SceneLabel>
      <h2 className="max-w-3xl text-3xl font-semibold leading-tight text-white sm:text-5xl">
        {t(["Entre duas coletas, algo pode mudar.", "Between two samples, things can change."])}
      </h2>
      <p className="mt-4 max-w-2xl text-slate-300 sm:text-lg">
        {t([
          "Uma medição registra um momento. A frequência de coleta decide o que fica registrado.",
          "A measurement captures a single moment. Sampling frequency decides what gets recorded.",
        ])}
      </p>
    </>
  );
};

const Rodape = () => {
  const t = useT();
  return (
    <p className="mt-4 text-xs text-slate-500">
      {t([
        "Exemplo didático, não é série real. O estudo do Rio Buranhém (Earth Science Informatics, 2026) analisa essa relação com cálculo exato de probabilidades.",
        "Teaching example, not a real time series. The Buranhém River study (Earth Science Informatics, 2026) analyses this relationship with exact probability calculations.",
      ])}
    </p>
  );
};

/** Botões 3 / 12 coletas (e "Rever", na versão animada). */
const Controles = ({
  coletas,
  escolher,
  rever,
}: {
  coletas: 0 | 3 | 12;
  escolher: (n: 3 | 12) => void;
  rever?: () => void;
}) => {
  const t = useT();
  return (
  <div className="flex flex-wrap items-center gap-3">
    {([3, 12] as const).map((n) => (
      <button
        key={n}
        type="button"
        onClick={() => escolher(n)}
        aria-pressed={coletas === n}
        className={`rounded-full border px-5 py-2.5 text-sm font-semibold transition-colors ${
          coletas === n ? "border-cyan-300 bg-cyan-300 text-slate-950" : "border-cyan-300/60 text-cyan-200"
        }`}
      >
        {n} {t(["coletas", "samples"])}
      </button>
    ))}
    {rever && (
      <button
        type="button"
        onClick={rever}
        className="rounded-full px-4 py-2.5 text-sm text-cyan-100/80 underline-offset-4 hover:underline"
      >
        {t(["Rever animação", "Replay animation"])}
      </button>
    )}
  </div>
  );
};

/** Versão sem movimento: o visitante alterna 3 e 12 coletas. */
const Estatica = () => {
  const [coletas, setColetas] = useState<3 | 12>(3);
  return (
    <section id="cena-4" className="mx-auto max-w-6xl px-6 py-24">
      <Cabecalho />
      <div className="mt-10">
        <Grafico coletas={coletas} tracado={1} />
      </div>
      <div className="mt-6 flex flex-wrap items-center gap-4">
        <Controles coletas={coletas} escolher={setColetas} />
        <Status coletas={coletas} />
      </div>
      <Rodape />
    </section>
  );
};

/**
 * Versão animada: ao entrar na tela, a linha do rio se desenha sozinha; depois aparecem 3 coletas
 * e, em seguida, 12. No fim, o apresentador pode alternar 3/12 ou rever.
 */
export const Amostragem = () => {
  const reduce = useMenosMovimento();
  const ref = useRef<HTMLElement>(null);
  const visto = useInView(ref, { amount: 0.45, once: true });
  const tracado = useMotionValue(0);
  const [coletas, setColetas] = useState<0 | 3 | 12>(0);
  const [fim, setFim] = useState(false);
  const [rodada, setRodada] = useState(0);

  useEffect(() => {
    if (!visto || reduce) return;
    const linha = animate(tracado, 1, { delay: 0.6, duration: 2.6, ease: [0.45, 0, 0.2, 1] });
    const t3 = window.setTimeout(() => setColetas(3), 3600);
    const t12 = window.setTimeout(() => {
      setColetas(12);
      setFim(true);
    }, 6800);
    return () => {
      linha.stop();
      window.clearTimeout(t3);
      window.clearTimeout(t12);
    };
  }, [visto, reduce, rodada, tracado]);

  if (reduce) return <Estatica />;

  const rever = () => {
    tracado.set(0);
    setColetas(0);
    setFim(false);
    setRodada((r) => r + 1);
  };

  return (
    <section
      ref={ref}
      id="cena-4"
      className="mx-auto flex min-h-[100svh] max-w-6xl flex-col justify-center px-6 py-20 md:[@media(max-height:760px)]:py-10"
    >
      <Cabecalho />
      <div className="mt-8 w-full sm:mt-10 md:[@media(max-height:760px)]:mt-6 md:[@media(max-height:760px)]:max-w-3xl">
        <Grafico coletas={coletas} tracado={tracado} />
      </div>
      <div className="mt-5 flex min-h-[3.5rem] flex-wrap items-center gap-4">
        <motion.div
          key={coletas}
          aria-live="polite"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: coletas ? 0.3 + coletas * 0.12 : 0, duration: 0.4 }}
        >
          <Status coletas={coletas} />
        </motion.div>
        <motion.div
          initial={false}
          animate={{ opacity: fim ? 1 : 0 }}
          transition={{ duration: 0.5 }}
          className={fim ? "" : "pointer-events-none"}
        >
          <Controles
            coletas={coletas}
            escolher={(n) => {
              tracado.set(1);
              setColetas(n);
            }}
            rever={rever}
          />
        </motion.div>
      </div>
      <Rodape />
    </section>
  );
};
