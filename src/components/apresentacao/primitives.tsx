import { createContext, useContext, useEffect, useRef, type ReactNode, type RefObject } from "react";
import { animate, motion, useMotionValue, useScroll, useTransform, type MotionValue } from "framer-motion";
import { useMenosMovimento } from "./useMenosMovimento";

/**
 * Modo "telas": cada cena ocupa a janela inteira e as cenas trocam de lado (setas, roda do mouse,
 * gesto). Dentro de uma tela, `passo` diz em que etapa a cena está (ex.: os 4 passos do fluxo).
 */
export const PalcoContext = createContext<{ ativo: boolean; passo: number }>({ ativo: false, passo: 0 });
export const usePalco = () => useContext(PalcoContext);

/** Atraso para as entradas começarem depois que a tela termina de deslizar. */
export const ATRASO_TELA = 0.45;

/** Entrada suave ao aparecer (desligada com menos movimento). No modo telas, repete a cada visita. */
export const Reveal = ({
  children,
  delay = 0,
  y = 28,
  className,
  flutua = false,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  /** Para cartões: chegam inclinados, vindos de baixo, e assentam com uma mola, acima do fundo. */
  flutua?: boolean;
}) => {
  const reduce = useMenosMovimento();
  const palco = usePalco();
  const atraso = delay + (palco.ativo ? ATRASO_TELA : 0);
  const transition = flutua
    ? {
        type: "spring" as const,
        stiffness: 120,
        damping: 15,
        mass: 0.9,
        delay: atraso,
        opacity: { duration: 0.45, delay: atraso },
      }
    : { duration: 0.8, delay: atraso, ease: [0.22, 1, 0.36, 1] };
  const de = flutua ? { opacity: 0, y: 46, scale: 0.94, rotateX: 12 } : { opacity: 0, y };
  const para = flutua ? { opacity: 1, y: 0, scale: 1, rotateX: 0 } : { opacity: 1, y: 0 };
  // A sombra é fixa (não anima): é ela que mantém o cartão "acima" do rio depois de assentar.
  const classe = flutua ? `${className ?? ""} [&>*]:shadow-[0_28px_60px_-34px_rgba(0,0,0,0.8)]` : className;
  const style = flutua ? { transformPerspective: 900 } : undefined;
  if (palco.ativo) {
    return (
      <motion.div className={classe} style={style} initial={reduce ? false : de} animate={para} transition={transition}>
        {children}
      </motion.div>
    );
  }
  return (
    <motion.div
      className={classe}
      style={style}
      initial={reduce ? false : de}
      whileInView={para}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={transition}
    >
      {children}
    </motion.div>
  );
};

export const SceneLabel = ({ index, children }: { index: number; children: ReactNode }) => (
  <div className="mb-5 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.25em] text-tk-rio-claro">
    <span className="tabular-nums text-tk-terra-clara">{String(index).padStart(2, "0")}</span>
    <span className="h-0.5 w-8 bg-tk-terra" aria-hidden />
    <span>{children}</span>
  </div>
);

/**
 * Progresso 0→1 de uma cena. Na rolagem vertical, segue a rolagem; no modo telas, anima sozinho
 * ao entrar na tela.
 */
export const useProgressoCena = (
  ref: RefObject<HTMLElement>,
  offset: NonNullable<Parameters<typeof useScroll>[0]>["offset"],
): MotionValue<number> => {
  const palco = usePalco();
  const reduce = useMenosMovimento();
  const { scrollYProgress } = useScroll({ target: ref, offset });
  const proprio = useMotionValue(palco.ativo && !reduce ? 0 : 1);
  useEffect(() => {
    if (!palco.ativo || reduce) return;
    const c = animate(proprio, 1, { duration: 1.6, delay: ATRASO_TELA, ease: [0.22, 1, 0.36, 1] });
    return () => c.stop();
  }, [palco.ativo, reduce, proprio]);
  return palco.ativo ? proprio : scrollYProgress;
};

/**
 * Transição entre cenas na rolagem vertical: a cena que chega sobe e ganha opacidade; a que sai
 * esmaece. No modo telas quem faz a transição é o palco, então aqui não faz nada.
 */
export const Transicao = ({ children }: { children: ReactNode }) => {
  const reduce = useMenosMovimento();
  const ref = useRef<HTMLDivElement>(null);
  const entrada = useScroll({ target: ref, offset: ["start end", "start 0.4"] }).scrollYProgress;
  const saida = useScroll({ target: ref, offset: ["end 0.6", "end start"] }).scrollYProgress;
  const opacity = useTransform([entrada, saida], ([e, s]: number[]) => (reduce ? 1 : Math.min(0.15 + e * 0.85, 1 - s * 0.8)));
  const y = useTransform(entrada, [0, 1], reduce ? [0, 0] : [70, 0]);
  return (
    <motion.div ref={ref} style={{ opacity, y }}>
      {children}
    </motion.div>
  );
};
