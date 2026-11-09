import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useMenosMovimento } from "./useMenosMovimento";

/**
 * Selo visível para todo conteúdo que ainda não foi confirmado pelo Vinícius.
 * Nada marcado com este selo deve ser lido como fato.
 */
export const Provisorio = ({ children = "PROVISÓRIO", className }: { children?: ReactNode; className?: string }) => (
  <span
    className={cn(
      "inline-flex items-center gap-1.5 rounded-full border border-dashed border-amber-300/70 bg-amber-300/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-amber-200",
      className,
    )}
  >
    <span className="h-1.5 w-1.5 rounded-full bg-amber-300" aria-hidden />
    {children}
  </span>
);

/** Bloco de texto reservado: mostra o que deve entrar ali. */
export const Lacuna = ({ children, className }: { children: ReactNode; className?: string }) => (
  <span
    className={cn(
      "rounded-md border border-dashed border-amber-300/50 [-webkit-box-decoration-break:clone] [box-decoration-break:clone] bg-amber-300/[0.06] px-1.5 py-0.5 text-amber-100/90",
      className,
    )}
  >
    {children}
  </span>
);

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
