import { useReducedMotion } from "framer-motion";

/**
 * Respeita prefers-reduced-motion. Quem apresenta num computador com animações
 * desligadas pode forçar a versão animada abrindo /apresentacao?movimento=completo.
 */
export const useMenosMovimento = () => {
  const reduce = useReducedMotion();
  const forcar =
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("movimento") === "completo";
  return Boolean(reduce) && !forcar;
};
