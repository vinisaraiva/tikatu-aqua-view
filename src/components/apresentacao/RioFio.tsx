import { useMemo } from "react";
import { motion } from "framer-motion";
import { ATRASO_TELA } from "./primitives";
import { useMenosMovimento } from "./useMenosMovimento";

/**
 * O rio como fio condutor do modo telas: um único curso d'água atravessa a apresentação e cada tela
 * mostra o seu trecho, ao fundo. Ao chegar, a água entra pela esquerda; um reflexo segue correnteza
 * abaixo, na direção da próxima tela. Com menos movimento, o trecho fica parado.
 */
const LARGURA = 1000; // largura de uma tela, em unidades do desenho
const ALTURA = 562;
const PASSO = 250; // distância entre os pontos que definem o curso

/** Altura do rio em cada ponto: meandros suaves na metade de baixo da tela, sempre os mesmos. */
const alturaEm = (k: number) => ALTURA * (0.76 + 0.11 * Math.sin(k * 1.7) + 0.055 * Math.sin(k * 0.63 + 1));

/** Trecho do curso entre dois pontos, como curva suave (Catmull-Rom convertida em Bézier). */
const trecho = (de: number, ate: number) => {
  const p = (k: number) => [k * PASSO, alturaEm(k)] as const;
  let d = `M ${p(de)[0]} ${p(de)[1].toFixed(1)}`;
  for (let k = de; k < ate; k++) {
    const [p0, p1, p2, p3] = [p(k - 1), p(k), p(k + 1), p(k + 2)];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C ${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0]} ${p2[1].toFixed(1)}`;
  }
  return d;
};

export const RioFio = ({ indice }: { indice: number }) => {
  const reduce = useMenosMovimento();
  const pontosPorTela = LARGURA / PASSO;
  // Um ponto a mais de cada lado, para o rio entrar e sair pela borda da tela.
  const d = useMemo(() => trecho(indice * pontosPorTela - 1, (indice + 1) * pontosPorTela + 1), [indice, pontosPorTela]);
  // Espessuras em unidades do desenho (a tela tem proporção próxima de 16:9, então quase não distorcem).
  const comum = { d, fill: "none", strokeLinecap: "round" as const };

  return (
    <svg
      viewBox={`${indice * LARGURA} 0 ${LARGURA} ${ALTURA}`}
      preserveAspectRatio="none"
      className="pointer-events-none absolute inset-0 h-full w-full"
      aria-hidden
    >
      {/* Leito: faixa larga e bem discreta, para não disputar com o texto */}
      <motion.path
        {...comum}
        stroke="rgba(27,127,192,0.14)"
        strokeWidth={52}
        initial={reduce ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, delay: ATRASO_TELA }}
      />
      <motion.path
        {...comum}
        stroke="rgba(143,208,245,0.07)"
        strokeWidth={22}
        initial={reduce ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, delay: ATRASO_TELA + 0.2 }}
      />
      {/* Fio d'água: chega pela esquerda */}
      <motion.path
        {...comum}
        stroke="rgba(143,208,245,0.24)"
        strokeWidth={1.1}
        initial={reduce ? false : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.8, delay: ATRASO_TELA, ease: [0.45, 0, 0.2, 1] }}
      />
      {/* Reflexo que desce o rio */}
      {!reduce && (
        <motion.path
          {...comum}
          pathLength={1}
          stroke="rgba(244,242,234,0.5)"
          strokeWidth={1.6}
          strokeDasharray="0.05 0.95"
          initial={{ strokeDashoffset: 0.05, opacity: 0 }}
          animate={{ strokeDashoffset: -0.95, opacity: [0, 1, 1, 0] }}
          transition={{ duration: 6, delay: ATRASO_TELA + 1.6, ease: "linear", repeat: Infinity, repeatDelay: 1.5 }}
        />
      )}
    </svg>
  );
};
