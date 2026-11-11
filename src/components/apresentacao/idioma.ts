import { useSyncExternalStore } from "react";

/**
 * Idioma da apresentação (português ou inglês). Ordem de decisão: ?lang=pt|en na URL, depois a
 * escolha salva neste navegador, depois o idioma do navegador (pt* → português; outros → inglês).
 * Trocar o idioma atualiza a URL (?lang=en), então o link copiado já abre no idioma certo.
 */
export type Idioma = "pt" | "en";
/** Texto nos dois idiomas: [português, inglês]. */
export type Bi = readonly [string, string];

const CHAVE = "tikatu-idioma";

const lerInicial = (): Idioma => {
  if (typeof window === "undefined") return "pt";
  const url = new URLSearchParams(window.location.search).get("lang");
  if (url === "pt" || url === "en") return url;
  try {
    const salvo = window.localStorage.getItem(CHAVE);
    if (salvo === "pt" || salvo === "en") return salvo;
  } catch {
    /* armazenamento bloqueado */
  }
  const nav = (window.navigator.language || "pt").toLowerCase();
  return nav.startsWith("pt") ? "pt" : "en";
};

let atual: Idioma = lerInicial();
const ouvintes = new Set<() => void>();

export const definirIdioma = (v: Idioma) => {
  if (v === atual) return;
  atual = v;
  try {
    window.localStorage.setItem(CHAVE, v);
  } catch {
    /* sem armazenamento: vale só nesta visita */
  }
  const u = new URL(window.location.href);
  if (v === "en") u.searchParams.set("lang", "en");
  else u.searchParams.delete("lang");
  window.history.replaceState(null, "", u.pathname + u.search + u.hash);
  ouvintes.forEach((f) => f());
};

const assinar = (f: () => void) => {
  ouvintes.add(f);
  return () => {
    ouvintes.delete(f);
  };
};

export const useIdioma = () => useSyncExternalStore(assinar, () => atual, () => "pt" as Idioma);

/** t(["Olá", "Hello"]) devolve o texto do idioma atual. */
export const useT = () => {
  const l = useIdioma();
  return (x: Bi) => x[l === "en" ? 1 : 0];
};

/** Número no formato do idioma (1.234,5 ou 1,234.5). */
export const formatar = (v: number, l: Idioma, casas?: number) =>
  v.toLocaleString(l === "en" ? "en-US" : "pt-BR", casas === undefined ? undefined : { minimumFractionDigits: casas, maximumFractionDigits: casas });
