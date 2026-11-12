import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { PalcoContext } from "./primitives";
import { definirMovimento, useMenosMovimento, useSistemaReduzSemEscolha } from "./useMenosMovimento";
import { useT, type Bi } from "./idioma";
import { BotaoIdioma } from "./BotaoIdioma";

export interface Cena {
  nome: Bi;
  el: ReactNode;
  /** Etapas dentro da mesma tela (as setas avançam a etapa antes de trocar de tela). */
  passos?: number;
  /** Cena de fundo cheio (abertura): ocupa a tela toda sem encolher; o excesso de baixo é cortado. */
  cheia?: boolean;
  /** Teste: fundo azul-marinho da logo no lugar do azul quase preto. */
  paleta?: "logo";
  /** Como esta tela entra (padrão: deslizar). */
  transicao?: TipoTransicao;
}

const CONSULTA = "(min-width: 900px) and (orientation: landscape)";

/** Telas lado a lado em telas largas; rolagem vertical no celular. ?modo=rolagem|telas força um dos dois. */
export const useModoTelas = () => {
  const forcado = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("modo") : null;
  const [largo, setLargo] = useState(() => typeof window !== "undefined" && window.matchMedia(CONSULTA).matches);
  useEffect(() => {
    const mq = window.matchMedia(CONSULTA);
    const f = () => setLargo(mq.matches);
    mq.addEventListener("change", f);
    return () => mq.removeEventListener("change", f);
  }, []);
  if (forcado === "rolagem") return false;
  if (forcado === "telas") return true;
  return largo;
};

/** Reduz a cena (como um slide) quando ela é mais alta que a janela, para nada ficar cortado. */
const Encaixe = ({ children, cheia = false }: { children: ReactNode; cheia?: boolean }) => {
  const caixa = useRef<HTMLDivElement>(null);
  const [k, setK] = useState(1);
  useLayoutEffect(() => {
    const el = caixa.current;
    if (!el || cheia) return;
    const medir = () => {
      const area = el.parentElement;
      if (!area) return;
      setK(Math.min(1, area.clientHeight / Math.max(el.offsetHeight, 1), area.clientWidth / Math.max(el.offsetWidth, 1)));
    };
    medir();
    const ro = new ResizeObserver(medir);
    ro.observe(el);
    window.addEventListener("resize", medir);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", medir);
    };
  }, [cheia]);
  return (
    // Fica acima da barra de controles (bottom-14) para o rodapé da cena não encostar nela.
    <div
      className={`absolute inset-x-0 top-0 flex justify-center overflow-hidden ${cheia ? "bottom-0 items-start" : "bottom-14 items-center"}`}
    >
      <div ref={caixa} className="w-full shrink-0" style={{ transform: k < 1 ? `scale(${k})` : undefined }}>
        {children}
      </div>
    </div>
  );
};

const EASE = [0.76, 0, 0.24, 1] as const;

/**
 * Transições entre telas. Cada tela tem a sua (definida em Cena.transicao), para não ficar repetitivo;
 * ao voltar, usa-se a da tela que está saindo, ao contrário.
 */
export type TipoTransicao = "deslizar" | "mergulho" | "mare" | "iris" | "cortina";
interface Rumo {
  dir: number;
  tipo: TipoTransicao;
}
const CHEIO = "inset(0% 0% 0% 0%)";
const DURACAO: Record<TipoTransicao, number> = { deslizar: 0.95, mergulho: 0.9, mare: 1.05, iris: 1.15, cortina: 0.95 };
const base = { x: "0%", y: "0%", scale: 1, opacity: 1, filter: "blur(0px)", clipPath: CHEIO };

const VARIANTES: Variants = {
  entra: ({ dir: d, tipo }: Rumo) => {
    const v = { ...base, zIndex: 2 };
    if (tipo === "deslizar") return { ...v, x: `${d * 100}%` };
    if (tipo === "mergulho") return { ...v, scale: d > 0 ? 0.82 : 1.18, opacity: 0, filter: "blur(12px)" };
    if (tipo === "mare") return { ...v, y: `${d * 100}%` };
    if (tipo === "iris") return { ...v, scale: 1.08, clipPath: "circle(0% at 50% 55%)" };
    return { ...v, clipPath: d > 0 ? "inset(0% 0% 0% 100%)" : "inset(0% 100% 0% 0%)" };
  },
  centro: ({ tipo }: Rumo) => ({
    ...base,
    clipPath: tipo === "iris" ? "circle(80% at 50% 55%)" : CHEIO,
    zIndex: 1,
    transition: { duration: DURACAO[tipo], ease: EASE },
  }),
  sai: ({ dir: d, tipo }: Rumo) => {
    const t = { duration: DURACAO[tipo], ease: EASE };
    if (tipo === "deslizar") return { x: `${d * -28}%`, scale: 0.9, opacity: 0.25, zIndex: 0, transition: t };
    if (tipo === "mergulho") return { scale: d > 0 ? 1.18 : 0.82, opacity: 0, filter: "blur(12px)", zIndex: 0, transition: t };
    if (tipo === "mare") return { y: `${d * -22}%`, scale: 0.94, opacity: 0.3, zIndex: 0, transition: t };
    if (tipo === "iris") return { scale: 0.94, opacity: 0.4, zIndex: 0, transition: t };
    return { x: `${d * -12}%`, opacity: 0.35, zIndex: 0, transition: t };
  },
};
const VARIANTES_SUAVES: Variants = {
  entra: { opacity: 0, zIndex: 2 },
  centro: { opacity: 1, zIndex: 1, transition: { duration: 0.35 } },
  sai: { opacity: 0, zIndex: 0, transition: { duration: 0.35 } },
};

/** Convite discreto quando o sistema está com animações reduzidas e ninguém escolheu ainda. */
export const AvisoMovimento = () => {
  const mostrar = useSistemaReduzSemEscolha();
  const t = useT();
  if (!mostrar) return null;
  return (
    <div className="fixed left-1/2 top-4 z-[60] flex w-[min(92vw,34rem)] -translate-x-1/2 flex-wrap items-center justify-center gap-3 rounded-2xl border border-cyan-300/30 bg-[#04202f]/95 px-5 py-3 text-sm text-slate-200 shadow-2xl backdrop-blur">
      <span>{t(["Este computador está com as animações reduzidas.", "Animations are reduced on this computer."])}</span>
      <button
        type="button"
        onClick={() => definirMovimento("completo")}
        className="rounded-full bg-cyan-300 px-4 py-1.5 font-semibold text-slate-950 hover:bg-cyan-200"
      >
        {t(["Ativar animações", "Turn on animations"])}
      </button>
      <button type="button" onClick={() => definirMovimento("reduzido")} className="text-slate-400 hover:text-white">
        {t(["Manter", "Keep"])}
      </button>
    </div>
  );
};

/** Botão para ligar/desligar as animações (salvo neste navegador). */
export const BotaoMovimento = ({ className = "" }: { className?: string }) => {
  const reduce = useMenosMovimento();
  const t = useT();
  return (
    <button
      type="button"
      onClick={() => definirMovimento(reduce ? "completo" : "reduzido")}
      aria-pressed={!reduce}
      title={reduce ? t(["Ativar animações", "Turn on animations"]) : t(["Reduzir animações", "Reduce animations"])}
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs transition-colors ${
        reduce ? "text-slate-400 hover:text-white" : "text-cyan-200 hover:text-white"
      } ${className}`}
    >
      <Sparkles className="h-3.5 w-3.5" />
      {reduce ? t(["Animações: reduzidas", "Animations: reduced"]) : t(["Animações: ligadas", "Animations: on"])}
    </button>
  );
};

const lerHash = (n: number) => {
  const m = /^#cena-(\d+)$/.exec(window.location.hash);
  const i = m ? Number(m[1]) - 1 : 0;
  return i >= 0 && i < n ? i : 0;
};

export const Palco = ({ cenas }: { cenas: Cena[] }) => {
  const reduce = useMenosMovimento();
  const [estado, setEstado] = useState(() => ({ i: lerHash(cenas.length), passo: 0, dir: 1, tipo: "deslizar" as TipoTransicao }));
  const travado = useRef(0);
  const t = useT();

  // Como num slide: em telas maiores que 1366×768 tudo cresce junto (o tamanho base do texto
  // acompanha a janela, até 24px). Abaixo disso, o Encaixe reduz a cena se precisar.
  useEffect(() => {
    const html = document.documentElement;
    const anterior = html.style.fontSize;
    const ajustar = () => {
      const k = Math.min(window.innerWidth / 1366, window.innerHeight / 768);
      html.style.fontSize = `${Math.min(24, Math.max(16, 16 * k)).toFixed(2)}px`;
    };
    ajustar();
    window.addEventListener("resize", ajustar);
    return () => {
      window.removeEventListener("resize", ajustar);
      html.style.fontSize = anterior;
    };
  }, []);

  const ir = useCallback(
    (delta: 1 | -1) => {
      setEstado((s) => {
        const passos = cenas[s.i].passos ?? 1;
        if (delta > 0 && s.passo < passos - 1) return { ...s, passo: s.passo + 1 };
        if (delta < 0 && s.passo > 0) return { ...s, passo: s.passo - 1 };
        const i = s.i + delta;
        if (i < 0 || i >= cenas.length) return s;
        const tipo = cenas[Math.max(i, s.i)].transicao ?? "deslizar";
        return { i, passo: delta > 0 ? 0 : (cenas[i].passos ?? 1) - 1, dir: delta, tipo };
      });
    },
    [cenas],
  );

  const irPara = useCallback((i: number) => {
    setEstado((s) =>
      i === s.i ? s : { i, passo: 0, dir: i > s.i ? 1 : -1, tipo: cenas[Math.max(i, s.i)].transicao ?? "deslizar" },
    );
  }, [cenas]);

  // Endereço #cena-N acompanha a tela (dá para abrir direto numa cena e usar os links internos).
  useEffect(() => {
    const alvo = `#cena-${estado.i + 1}`;
    if (window.location.hash !== alvo) window.history.replaceState(null, "", alvo);
  }, [estado.i]);
  useEffect(() => {
    const f = () => irPara(lerHash(cenas.length));
    window.addEventListener("hashchange", f);
    return () => window.removeEventListener("hashchange", f);
  }, [cenas.length, irPara]);

  // Teclado, roda do mouse e gesto de arrastar.
  useEffect(() => {
    const pode = () => {
      const agora = performance.now();
      if (agora < travado.current) return false;
      travado.current = agora + (reduce ? 350 : 750);
      return true;
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(t.tagName))) return;
      const frente = ["ArrowRight", "ArrowDown", "PageDown", " "].includes(e.key);
      const tras = ["ArrowLeft", "ArrowUp", "PageUp"].includes(e.key);
      if (e.key === "Home") {
        e.preventDefault();
        irPara(0);
        return;
      }
      if (e.key === "End") {
        e.preventDefault();
        irPara(cenas.length - 1);
        return;
      }
      if (!frente && !tras) return;
      e.preventDefault();
      if (e.repeat && !pode()) return;
      ir(frente ? 1 : -1);
    };
    let acumulado = 0;
    let zerar = 0;
    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey) return; // zoom do navegador
      e.preventDefault();
      const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      acumulado += d;
      window.clearTimeout(zerar);
      zerar = window.setTimeout(() => (acumulado = 0), 180);
      if (Math.abs(acumulado) < 40 || !pode()) return;
      ir(acumulado > 0 ? 1 : -1);
      acumulado = 0;
    };
    let inicio: { x: number; y: number } | null = null;
    const onDown = (e: PointerEvent) => {
      const t = e.target as HTMLElement;
      if (e.pointerType === "mouse" || t.closest("canvas, button, a, input")) return;
      inicio = { x: e.clientX, y: e.clientY };
    };
    const onUp = (e: PointerEvent) => {
      if (!inicio) return;
      const dx = e.clientX - inicio.x;
      const dy = e.clientY - inicio.y;
      inicio = null;
      if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.2) ir(dx < 0 ? 1 : -1);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.clearTimeout(zerar);
    };
  }, [cenas.length, ir, irPara, reduce]);

  const { i, passo, dir, tipo } = estado;
  const rumo: Rumo = { dir, tipo };
  const total = cenas.length;
  const passos = cenas[i].passos ?? 1;
  const progresso = (i + (passos > 1 ? passo / passos : 0)) / (total - 1);

  return (
    // As cenas pedem 100svh de altura; aqui descontamos a barra de controles para elas caberem sem encolher.
    <div
      className="fixed inset-0 overflow-hidden bg-[#021019] [&_section]:min-h-[calc(100svh-3.5rem)]"
      aria-roledescription={t(["apresentação", "presentation"])}
    >
      <AnimatePresence initial={false} custom={rumo}>
        <motion.div
          key={i}
          custom={rumo}
          variants={reduce ? VARIANTES_SUAVES : VARIANTES}
          initial="entra"
          animate="centro"
          exit="sai"
          className={`absolute inset-0 overflow-hidden shadow-[-40px_0_80px_rgba(0,0,0,0.55)] ${cenas[i].paleta === "logo" ? "" : "bg-gradient-to-b from-[#04202f] to-[#062a3d]"}`}
          style={
            cenas[i].paleta === "logo"
              ? {
                  background:
                    "radial-gradient(75% 60% at 88% 0%, rgba(27,127,192,0.32), transparent 62%), linear-gradient(180deg, #0a2f4c, #0d3a5c)",
                }
              : undefined
          }
          aria-roledescription={t(["tela", "screen"])}
          aria-label={`${i + 1} / ${total}: ${t(cenas[i].nome)}`}
        >
          <PalcoContext.Provider value={{ ativo: true, passo }}>
            <Encaixe cheia={cenas[i].cheia}>{cenas[i].el}</Encaixe>
          </PalcoContext.Provider>
        </motion.div>
      </AnimatePresence>

      {/* Progresso */}
      <motion.div
        className="fixed inset-x-0 top-0 z-50 h-0.5 origin-left bg-gradient-to-r from-cyan-300 via-teal-300 to-sky-400"
        animate={{ scaleX: Math.max(progresso, 0.002) }}
        transition={{ duration: reduce ? 0 : 0.8, ease: [0.22, 1, 0.36, 1] }}
        aria-hidden
      />

      {/* Controles */}
      <nav
        className="fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-1 rounded-full border border-white/10 bg-[#021019]/70 px-2 py-1.5 shadow-xl backdrop-blur"
        aria-label={t(["Telas da apresentação", "Presentation screens"])}
      >
        <button
          type="button"
          onClick={() => ir(-1)}
          disabled={i === 0 && passo === 0}
          className="rounded-full p-1.5 text-slate-300 hover:bg-white/10 hover:text-white disabled:opacity-30"
          aria-label={t(["Anterior", "Previous"])}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-1.5 px-1">
          {cenas.map((c, k) => (
            <button
              key={c.nome[0]}
              type="button"
              onClick={() => irPara(k)}
              title={t(c.nome)}
              aria-label={t(c.nome)}
              aria-current={k === i ? "step" : undefined}
              className="group flex h-5 items-center"
            >
              <span
                className={`block h-1.5 rounded-full transition-all duration-500 ${
                  k === i ? "w-6 bg-cyan-300" : "w-1.5 bg-white/30 group-hover:bg-white/70"
                }`}
              />
            </button>
          ))}
        </div>
        <span className="min-w-[3.25rem] text-center font-mono text-[11px] tabular-nums text-slate-400">
          {String(i + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </span>
        <button
          type="button"
          onClick={() => ir(1)}
          disabled={i === total - 1 && passo === passos - 1}
          className="rounded-full p-1.5 text-slate-300 hover:bg-white/10 hover:text-white disabled:opacity-30"
          aria-label={t(["Próxima", "Next"])}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
        <span className="mx-1 h-4 w-px bg-white/10" aria-hidden />
        <BotaoMovimento />
        {/* Na abertura o seletor de idioma fica no topo; nas demais telas, aqui. */}
        {i > 0 && <BotaoIdioma className="border-0" />}
      </nav>
    </div>
  );
};
