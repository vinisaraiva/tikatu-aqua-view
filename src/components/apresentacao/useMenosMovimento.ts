import { useSyncExternalStore } from "react";
import { useReducedMotion } from "framer-motion";

/**
 * Preferência de movimento. Por padrão segue o sistema (prefers-reduced-motion), mas quem apresenta
 * pode escolher na própria página (botão "Animações"), e a escolha fica salva neste navegador.
 * Também dá para forçar pela URL: ?movimento=completo ou ?movimento=reduzido.
 */
type Escolha = "completo" | "reduzido" | null;
const CHAVE = "tikatu-movimento";

const lerInicial = (): Escolha => {
  if (typeof window === "undefined") return null;
  const url = new URLSearchParams(window.location.search).get("movimento");
  if (url === "completo" || url === "reduzido") return url;
  try {
    const salvo = window.localStorage.getItem(CHAVE);
    if (salvo === "completo" || salvo === "reduzido") return salvo;
  } catch {
    /* armazenamento bloqueado: segue o sistema */
  }
  return null;
};

let escolha: Escolha = lerInicial();
const ouvintes = new Set<() => void>();

export const definirMovimento = (v: Exclude<Escolha, null>) => {
  escolha = v;
  try {
    window.localStorage.setItem(CHAVE, v);
  } catch {
    /* sem armazenamento: vale só nesta visita */
  }
  ouvintes.forEach((f) => f());
};

const assinar = (f: () => void) => {
  ouvintes.add(f);
  return () => {
    ouvintes.delete(f);
  };
};

export const useEscolhaMovimento = () => useSyncExternalStore(assinar, () => escolha, () => null);

export const useMenosMovimento = () => {
  const sistema = useReducedMotion();
  const e = useEscolhaMovimento();
  if (e) return e === "reduzido";
  return Boolean(sistema);
};

/** O sistema pede menos movimento e a pessoa ainda não escolheu nada na página. */
export const useSistemaReduzSemEscolha = () => {
  const sistema = useReducedMotion();
  const e = useEscolhaMovimento();
  return Boolean(sistema) && e === null;
};
