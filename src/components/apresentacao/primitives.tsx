import { useRef, type ReactNode } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useMenosMovimento } from "./useMenosMovimento";

/** Entrada suave ao aparecer na tela (desligada com prefers-reduced-motion). */
export const Reveal = ({
  children,
  delay = 0,
  y = 28,
  className,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) => {
  const reduce = useMenosMovimento();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
};

export const SceneLabel = ({ index, children }: { index: number; children: ReactNode }) => (
  <div className="mb-5 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.25em] text-cyan-300/80">
    <span className="tabular-nums">{String(index).padStart(2, "0")}</span>
    <span className="h-px w-8 bg-cyan-300/50" aria-hidden />
    <span>{children}</span>
  </div>
);

/**
 * Transição entre cenas, presa à rolagem: a cena que chega sobe e ganha opacidade; a que sai
 * esmaece. Só opacidade e deslocamento (nada de escala), para não pesar nem mexer no layout.
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
