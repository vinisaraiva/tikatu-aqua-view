import { useCallback, useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Sparkles, X } from "lucide-react";
import { FOTO, ROTULO_ESTADO, TOPICOS, type Estado } from "@/components/territorios/topicos";
import { Gota, Onda } from "@/components/territorios/Gota";
import { definirMovimento, useMenosMovimento } from "@/components/apresentacao/useMenosMovimento";

/**
 * Tikatu Territórios: uma tela só, com a foto aérea do estuário do Buranhém.
 * Cada marcador abre um pop-up que explica uma parte do Tikatu para a comunidade.
 * Feita para apresentar ao vivo (setas ← →, Esc) e também para abrir no celular.
 */

const COR_ESTADO: Record<Estado, string> = {
  "em-uso": "bg-emerald-400/15 text-emerald-300 ring-emerald-300/40",
  "no-ar": "bg-emerald-400/15 text-emerald-300 ring-emerald-300/40",
  manual: "bg-emerald-400/15 text-emerald-300 ring-emerald-300/40",
  "em-desenvolvimento": "bg-tk-terra/20 text-tk-terra-clara ring-tk-terra-clara/40",
  pedido: "bg-tk-rio-claro/15 text-tk-rio-claro ring-tk-rio-claro/40",
  convite: "bg-tk-terra/20 text-tk-terra-clara ring-tk-terra-clara/40",
  proposta: "bg-white/10 text-tk-nevoa ring-white/25",
  acuipe: "bg-emerald-400/15 text-emerald-300 ring-emerald-300/40",
  equipe: "bg-tk-rio-claro/15 text-tk-rio-claro ring-tk-rio-claro/40",
};

const SeloEstado = ({ estado }: { estado: Estado }) => (
  <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ring-1 ${COR_ESTADO[estado]}`}>
    {ROTULO_ESTADO[estado]}
  </span>
);

const indicePeloHash = () => {
  if (typeof window === "undefined") return null;
  const id = window.location.hash.replace("#", "");
  const i = TOPICOS.findIndex((t) => t.id === id);
  return i >= 0 ? i : null;
};

/** Botão "Animações": vale para quem apresenta num computador com os efeitos do sistema desligados. */
const BotaoAnimacoes = ({ reduzir }: { reduzir: boolean }) => (
  <button
    type="button"
    onClick={() => definirMovimento(reduzir ? "completo" : "reduzido")}
    aria-pressed={!reduzir}
    className={`inline-flex items-center gap-1.5 rounded-full bg-[#071f33]/75 px-3 py-1.5 text-xs ring-1 ring-white/15 backdrop-blur transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tk-rio-claro ${
      reduzir ? "text-tk-nevoa/80 hover:text-white" : "text-tk-rio-claro hover:text-white"
    }`}
  >
    <Sparkles className="h-3.5 w-3.5" />
    {reduzir ? "Animações: desligadas" : "Animações: ligadas"}
  </button>
);

/** Distância do centro de uma gota até o centro da tela: o pop-up cresce saindo dela. */
const origemDaGota = (id: string) => {
  const el = document.querySelector<HTMLElement>(`[data-gota="${id}"]`);
  if (!el) return { x: 0, y: 0 };
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2 - window.innerWidth / 2, y: r.top + r.height / 2 - window.innerHeight / 2 };
};

const Territorios = () => {
  const reduzir = useMenosMovimento();
  const [aberto, setAberto] = useState<number | null>(indicePeloHash);
  const [ultimo, setUltimo] = useState(-1);
  const [vistos, setVistos] = useState<Set<number>>(() => {
    const i = indicePeloHash();
    return new Set(i === null ? [] : [i]);
  });
  const [origem, setOrigem] = useState({ x: 0, y: 0 });

  const abrir = useCallback((i: number | null) => {
    setAberto((atual) => {
      // Só a abertura (vindo do mapa) parte da gota; trocar de tópico com o pop-up aberto não.
      if (atual === null && i !== null) setOrigem(origemDaGota(TOPICOS[i].id));
      return i;
    });
    if (i !== null) {
      setUltimo(i);
      setVistos((v) => (v.has(i) ? v : new Set(v).add(i)));
    }
    try {
      const base = window.location.pathname + window.location.search;
      window.history.replaceState(null, "", i === null ? base : `${base}#${TOPICOS[i].id}`);
    } catch {
      /* sem histórico: só não atualiza o link */
    }
  }, []);

  // Setas: com o pop-up aberto, passam de tópico; com ele fechado, abrem o próximo.
  useEffect(() => {
    const total = TOPICOS.length;
    const tecla = (e: KeyboardEvent) => {
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      const frente = e.key === "ArrowRight" || e.key === "PageDown";
      const tras = e.key === "ArrowLeft" || e.key === "PageUp";
      if (!frente && !tras) return;
      e.preventDefault();
      if (aberto === null) abrir(frente ? Math.min(ultimo + 1, total - 1) : Math.max(ultimo, 0));
      else abrir((aberto + (frente ? 1 : -1) + total) % total);
    };
    window.addEventListener("keydown", tecla);
    return () => window.removeEventListener("keydown", tecla);
  }, [aberto, ultimo, abrir]);

  useEffect(() => {
    const aoMudar = () => {
      const i = indicePeloHash();
      setAberto(i);
      if (i !== null) setVistos((v) => (v.has(i) ? v : new Set(v).add(i)));
    };
    window.addEventListener("hashchange", aoMudar);
    return () => window.removeEventListener("hashchange", aoMudar);
  }, []);

  const topico = aberto !== null ? TOPICOS[aberto] : null;

  return (
    <>
      <Helmet>
        <html lang="pt-BR" />
        <title>Tikatu Territórios</title>
        <meta name="robots" content="noindex, nofollow" />
        <meta name="description" content="Rios, manguezais e poços: águas que sustentam vidas, culturas e territórios." />
      </Helmet>

      <main className="relative min-h-[100svh] overflow-clip bg-[#071f33] font-sans text-tk-creme antialiased md:h-[100svh]">
        {/* Foto: no celular, faixa 3:2 no topo; em telas largas, cobre a tela inteira. */}
        <div className="relative aspect-[3/2] w-full md:absolute md:left-1/2 md:top-1/2 md:w-[max(100vw,150svh)] md:-translate-x-1/2 md:-translate-y-1/2">
          <img src={FOTO} alt="Vista aérea do estuário do rio Buranhém, com o mangue, a cidade de Porto Seguro e o mar" className="absolute inset-0 h-full w-full object-cover" />
          <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-[#071f33]/70 via-transparent to-[#071f33]/30" />

          {TOPICOS.map((t, i) =>
            t.x === undefined || t.y === undefined ? null : (
              <div key={t.id} className="absolute z-10" style={{ left: `${t.x}%`, top: `${t.y}%` }}>
                <Onda ordem={i} reduzir={reduzir} />
                <button
                  type="button"
                  data-gota={t.id}
                  onClick={() => abrir(i)}
                  className="group absolute left-0 top-0 -translate-x-[13px] -translate-y-full rounded-full focus-visible:outline-none md:-translate-x-[20px]"
                  aria-label={`${i + 1}. ${t.titulo}${vistos.has(i) ? " (já visto)" : ""}`}
                >
                  <Gota numero={i + 1} rotulo={t.curto} visto={vistos.has(i)} ordem={i} reduzir={reduzir} />
                </button>
              </div>
            ),
          )}
        </div>


        {/* Título: no céu da foto em telas largas; abaixo da foto no celular. */}
        <header className="relative z-20 px-5 pt-6 md:absolute md:left-0 md:top-0 md:max-w-[29rem] md:px-10 md:pt-8 2xl:max-w-[40rem]">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 md:w-max md:flex-nowrap">
            <img src="/apresentacao/logo-tikatu.webp" alt="Tikatu" className="h-8 w-auto rounded-md bg-white/90 px-2 py-1 md:h-10" />
            <p className="text-sm font-extrabold uppercase tracking-[0.22em] text-tk-rio-claro drop-shadow">Água, território e pessoas</p>
          </div>
          {/* O nome da página fica para leitores de tela; na tela, a logo já identifica. */}
          <h1 className="sr-only">Tikatu Territórios</h1>
          <p className="mt-5 max-w-xl text-balance text-lg font-semibold leading-snug text-white drop-shadow md:text-xl xl:text-2xl">
            Rios, manguezais e poços: águas que sustentam vidas, culturas e territórios.
          </p>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-tk-creme/90 drop-shadow xl:text-base">
            Começamos pelo sul da Bahia, de olho no Brasil todo. Em Acuípe de Baixo, moradores voluntários já monitoram a água
            do poço e se tornam protagonistas no cuidado com o território.
          </p>
        </header>

        {/* Quem está por trás: os selos são um botão que abre o tópico "Quem está por trás". */}
        <div className="relative z-20 px-5 pt-4 md:absolute md:right-10 md:top-8 md:max-w-[34rem] md:px-0 md:pt-0 2xl:max-w-[46rem]">
          <button
            type="button"
            data-gota="quem-faz"
            onClick={() => abrir(TOPICOS.findIndex((t) => t.id === "quem-faz"))}
            aria-label="Quem está por trás: doutorado, produção científica e dados abertos"
            className="group flex flex-wrap gap-2 rounded-3xl text-left text-xs font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tk-rio-claro md:justify-end xl:text-sm"
          >
            <span className="flex items-center gap-2 rounded-full bg-[#071f33]/75 py-1 pl-1 pr-3 ring-1 ring-white/15 backdrop-blur transition-colors group-hover:bg-tk-terra">
              <img src="/apresentacao/logo-ufsb.webp" alt="" className="h-6 w-auto rounded-full" />
              Doutorado em andamento · Biossistemas · UFSB
            </span>
            <span className="rounded-full bg-[#071f33]/75 px-3 py-1.5 ring-1 ring-white/15 backdrop-blur transition-colors group-hover:bg-tk-terra">
              3 artigos científicos publicados
            </span>
            <span className="rounded-full bg-[#071f33]/75 px-3 py-1.5 ring-1 ring-white/15 backdrop-blur transition-colors group-hover:bg-tk-terra">
              Dados abertos
            </span>
          </button>
        </div>

        {/* Índice dos tópicos: faixa no pé da tela em telas largas; lista no celular. */}
        <nav aria-label="Tópicos" className="relative z-20 px-5 pb-8 pt-6 md:absolute md:bottom-0 md:right-0 md:px-10 md:pb-4 md:pt-0">
          <p className="mb-3 text-sm text-tk-nevoa md:hidden">Toque num tópico para abrir a explicação.</p>
          {/* No celular, a lista é o jeito confortável de navegar; em telas largas, as gotas fazem esse papel. */}
          <ol className="grid gap-2 md:hidden">
            {TOPICOS.map((t, i) => (
              <li key={t.id}>
                <button
                  type="button"
                  onClick={() => abrir(i)}
                  className="flex w-full items-center gap-3 rounded-xl bg-white/[0.07] px-3 py-2.5 text-left text-sm font-semibold text-white ring-1 ring-white/10 transition-colors hover:bg-tk-terra focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tk-rio-claro md:w-auto md:rounded-full md:bg-[#071f33]/75 md:py-2 md:backdrop-blur"
                >
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-tk-terra text-xs">{i + 1}</span>
                  <span className="md:hidden">{t.titulo}</span>
                  <span className="hidden md:inline">{t.curto}</span>
                  {vistos.has(i) && <Check aria-label="já visto" className="h-3.5 w-3.5 shrink-0 text-emerald-300" strokeWidth={3} />}
                </button>
              </li>
            ))}
            <li className="mt-2">
              <BotaoAnimacoes reduzir={reduzir} />
            </li>
          </ol>
          <div className="hidden items-center justify-end gap-3 md:flex">
            <span className="text-xs text-tk-nevoa/85 drop-shadow">Clique numa gota ou use → ←</span>
            <BotaoAnimacoes reduzir={reduzir} />
          </div>
          <p className="mt-4 text-[11px] text-tk-nevoa/70 drop-shadow md:mt-1.5 md:text-right">Foto: estuário do Buranhém, Porto Seguro, paisagem da região (autoria a confirmar)</p>
        </nav>
      </main>

      <DialogPrimitive.Root open={topico !== null} onOpenChange={(o) => !o && abrir(null)}>
        <DialogPrimitive.Portal forceMount>
          {/* O Portal passa uma ref ao filho: um div simples recebe a ref no lugar do AnimatePresence. */}
          <div>
          <AnimatePresence>
            {topico !== null && (
              <DialogPrimitive.Overlay key="fundo" forceMount asChild>
                <motion.div
                  className="fixed inset-0 z-50 bg-[#030d17]/75 backdrop-blur-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: reduzir ? 0.15 : 0.3 }}
                />
              </DialogPrimitive.Overlay>
            )}
            {topico !== null && (
              <DialogPrimitive.Content
                key="janela"
                forceMount
                asChild
                aria-describedby={undefined}
                onClick={(e) => {
                  if (e.target === e.currentTarget) abrir(null);
                }}
              >
                <div className="fixed inset-0 z-50 flex items-center justify-center p-[3vw] focus:outline-none">
                  {/* O pop-up cresce saindo da gota clicada e volta para ela ao fechar. */}
                  <motion.div
                    className="relative max-h-[94svh] w-[min(1180px,94vw)] overflow-y-auto rounded-3xl bg-[#0d3a5c] text-tk-creme shadow-2xl ring-1 ring-white/10"
                    initial={reduzir ? { opacity: 0 } : { opacity: 0, x: origem.x, y: origem.y, scale: 0.12 }}
                    animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
                    exit={reduzir ? { opacity: 0 } : { opacity: 0, x: origem.x, y: origem.y, scale: 0.12 }}
                    transition={reduzir ? { duration: 0.15 } : { type: "spring", stiffness: 240, damping: 28 }}
                  >
                    <motion.div
                      key={topico.id}
                      initial={reduzir ? false : { opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.25 }}
                    >
                      {topico && aberto !== null && (
                        <div className="grid gap-6 p-5 md:grid-cols-[1.1fr_1fr] md:gap-8 md:p-8">
                          <div className="min-w-0 md:order-2">
                            <div className="flex flex-wrap items-center gap-3">
                              <span className="text-sm font-semibold text-tk-nevoa">
                                {aberto + 1} de {TOPICOS.length}
                              </span>
                              <SeloEstado estado={topico.estado} />
                            </div>
                            <DialogPrimitive.Title className="mt-3 text-balance text-3xl font-bold leading-tight tracking-tight text-white md:text-4xl">
                              {topico.titulo}
                            </DialogPrimitive.Title>
                            <p className="mt-4 text-lg leading-relaxed text-tk-creme md:text-xl">{topico.chamada}</p>
                            <ul className="mt-5 grid gap-3">
                              {topico.pontos.map((p) => (
                                <li key={p} className="flex gap-3 text-base leading-snug text-tk-nevoa md:text-[17px]">
                                  <span aria-hidden className="mt-2 h-2 w-2 shrink-0 rounded-full bg-tk-rio-claro" />
                                  <span>{p}</span>
                                </li>
                              ))}
                            </ul>
                            {topico.nota && <p className="mt-5 text-sm text-tk-nevoa/75">{topico.nota}</p>}
                          </div>
                          <div className="min-w-0 md:order-1">{topico.visual}</div>

                          <div className="flex items-center justify-between gap-3 border-t border-white/10 pt-4 md:order-3 md:col-span-2">
                            <button
                              type="button"
                              onClick={() => abrir((aberto - 1 + TOPICOS.length) % TOPICOS.length)}
                              className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-tk-nevoa ring-1 ring-white/15 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tk-rio-claro"
                            >
                              <ArrowLeft className="h-4 w-4" />
                              <span className="hidden sm:inline">{TOPICOS[(aberto - 1 + TOPICOS.length) % TOPICOS.length].curto}</span>
                            </button>
                            <DialogPrimitive.Close className="text-sm text-tk-nevoa/80 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tk-rio-claro">
                              Voltar ao mapa
                            </DialogPrimitive.Close>
                            <button
                              type="button"
                              onClick={() => abrir((aberto + 1) % TOPICOS.length)}
                              className="inline-flex items-center gap-2 rounded-full bg-tk-terra px-4 py-2 text-sm font-semibold text-white hover:bg-[#ad4723] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tk-rio-claro"
                            >
                              <span className="hidden sm:inline">{TOPICOS[(aberto + 1) % TOPICOS.length].curto}</span>
                              <ArrowRight className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    </motion.div>
                      <DialogPrimitive.Close
                        aria-label="Fechar"
                        className="absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tk-rio-claro"
                      >
                        <X className="h-5 w-5" />
                      </DialogPrimitive.Close>
                  </motion.div>
                </div>
              </DialogPrimitive.Content>
            )}
          </AnimatePresence>
          </div>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </>
  );
};

export default Territorios;
