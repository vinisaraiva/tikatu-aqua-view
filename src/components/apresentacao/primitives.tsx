import type { ReactNode } from "react";
import { motion } from "framer-motion";
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
