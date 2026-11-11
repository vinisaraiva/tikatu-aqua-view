import { useEffect, useRef, useState, type MouseEvent, type ReactNode } from "react";
import {
  AnimatePresence,
  motion,
  useInView,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { Gauge, MapPin, ShieldCheck } from "lucide-react";
import { Reveal, SceneLabel, useProgressoCena } from "./primitives";
import { useMenosMovimento } from "./useMenosMovimento";
import { useT, type Bi } from "./idioma";

/**
 * Cenas 5 e 6. Capturas reais (10/11/2026): painel em produção com o pH do Rio Chamagunga
 * (6 pontos, coleta de 25/08/2024) e telas do Tikatu Coleta 1.6.2 com usuário de teste
 * (código do voluntário ocultado). Nenhuma consulta ao banco é feita por esta página.
 */
const FATOS: { icon: typeof MapPin; valor: string; rotulo: Bi }[] = [
  { icon: MapPin, valor: "6", rotulo: ["pontos de coleta no Rio Chamagunga", "sampling sites on the Chamagunga River"] },
  { icon: Gauge, valor: "13", rotulo: ["parâmetros disponíveis no painel", "parameters available in the dashboard"] },
  { icon: ShieldCheck, valor: "CONAMA", rotulo: ["referência legal em cada gráfico", "legal reference in every chart"] },
];

const TELAS: { src: string; titulo: Bi; legenda: Bi }[] = [
  {
    src: "/apresentacao/coleta-inicio.webp",
    titulo: ["Lembrete de coleta", "Sampling reminder"],
    legenda: ["Dia, horário e janela de coleta de cada voluntário.", "Each volunteer's sampling day, time and window."],
  },
  {
    src: "/apresentacao/coleta-importar.webp",
    titulo: ["Importa a sonda", "Imports the probe"],
    legenda: ["Lê o arquivo XLSX da sonda, sem redigitar valores.", "Reads the probe's XLSX file, with no retyping."],
  },
  {
    src: "/apresentacao/coleta-historico.webp",
    titulo: ["Histórico", "History"],
    legenda: ["Cada coleta enviada, com os parâmetros medidos.", "Every sample sent, with the measured parameters."],
  },
  {
    src: "/apresentacao/coleta-perfil.webp",
    titulo: ["Perfil e avisos", "Profile and alerts"],
    legenda: ["Ponto de coleta e notificações no aparelho.", "Sampling site and notifications on the phone."],
  },
];
const INTERVALO = 3600;

/** Inclinação 3D que segue o mouse (desligada com menos movimento ou toque). */
const useInclinacao = (reduce: boolean) => {
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 120, damping: 18 });
  const sry = useSpring(ry, { stiffness: 120, damping: 18 });
  const mover = (e: MouseEvent<HTMLElement>) => {
    if (reduce) return;
    const r = e.currentTarget.getBoundingClientRect();
    ry.set(((e.clientX - r.left) / r.width - 0.5) * 10);
    rx.set(-((e.clientY - r.top) / r.height - 0.5) * 8);
  };
  const sair = () => {
    rx.set(0);
    ry.set(0);
  };
  return { srx, sry, mover, sair };
};

const Navegador = ({ children }: { children: ReactNode }) => (
  <>
    <div className="flex items-center gap-2 bg-slate-200 px-4 py-2.5">
      <span className="h-2.5 w-2.5 rounded-full bg-slate-400" />
      <span className="h-2.5 w-2.5 rounded-full bg-slate-400" />
      <span className="h-2.5 w-2.5 rounded-full bg-slate-400" />
      <span className="ml-3 truncate rounded-full bg-white px-3 py-0.5 text-xs text-slate-600">tikatu.com.br/dashboard</span>
    </div>
    {children}
  </>
);

/** Cena 5: o painel em produção, com profundidade (painel ao fundo, tabela de leituras à frente). */
export const AoVivo = () => {
  const ref = useRef<HTMLElement>(null);
  const reduce = useMenosMovimento();
  const scrollYProgress = useProgressoCena(ref, ["start end", "center center"]);
  const giro = useTransform(scrollYProgress, [0, 1], reduce ? [-8, -8] : [-28, -8]);
  const entrada = useTransform(scrollYProgress, [0, 1], reduce ? [1, 1] : [0.85, 1]);
  const tabelaY = useTransform(scrollYProgress, [0.3, 1], reduce ? [0, 0] : [80, 0]);
  const tabelaOp = useTransform(scrollYProgress, [0.3, 0.9], reduce ? [1, 1] : [0, 1]);
  const { srx, sry, mover, sair } = useInclinacao(reduce);
  const ry = useTransform([giro, sry], ([g, s]: number[]) => g + s);
  const t = useT();

  return (
    <section
      ref={ref}
      id="cena-5"
      className="mx-auto grid min-h-[100svh] max-w-7xl content-center items-center gap-10 px-6 py-20 lg:grid-cols-[0.8fr_1.5fr] lg:gap-12"
      aria-label={t(["O painel ao vivo", "The live dashboard"])}
    >
      <Reveal>
        <SceneLabel index={5}>{t(["O painel ao vivo", "The live dashboard"])}</SceneLabel>
        <h2 className="text-3xl font-semibold text-white sm:text-5xl">
          {t(["Dados reais.", "Real data."])}{" "}
          <span className="block text-cyan-200">{t(["Painel no ar.", "Live dashboard."])}</span>
        </h2>
        <p className="mt-4 text-slate-300">
          {t([
            "O pH dos pontos do Rio Chamagunga, em Porto Seguro, comparado à faixa do CONAMA, com o mapa dos pontos de coleta.",
            "pH at the Chamagunga River sites in Porto Seguro, compared with the CONAMA range, with a map of the sampling sites.",
          ])}
        </p>
        <ul className="mt-6 grid grid-cols-3 gap-2 lg:grid-cols-1 lg:gap-3">
          {FATOS.map(({ icon: Icon, valor, rotulo }) => (
            <li
              key={rotulo[0]}
              className="rounded-xl border border-white/10 bg-white/[0.04] p-3 lg:flex lg:items-center lg:gap-4 lg:px-4"
            >
              <Icon className="mb-2 h-4 w-4 shrink-0 text-cyan-300 lg:mb-0 lg:h-5 lg:w-5" />
              <span className="block text-lg font-semibold text-white sm:text-2xl lg:min-w-[6.5rem]">{valor}</span>
              <span className="mt-0.5 block text-[11px] leading-tight text-slate-400 sm:text-sm">{t(rotulo)}</span>
            </li>
          ))}
        </ul>
      </Reveal>

      <div className="relative pb-16 [perspective:1400px] sm:pb-24" onMouseMove={mover} onMouseLeave={sair}>
        <motion.figure
          style={{ rotateY: ry, rotateX: srx, scale: entrada, transformStyle: "preserve-3d" }}
          className="origin-center overflow-hidden rounded-2xl bg-white shadow-[0_50px_120px_-30px_rgba(34,211,238,0.45)] ring-1 ring-white/10"
        >
          <Navegador>
            <img
              src="/apresentacao/painel-ph.webp"
              alt={t([
                "Painel do Tikatu: pH dos pontos 2 a 6 do Rio Chamagunga comparados à faixa do CONAMA e mapa com os 6 pontos de coleta",
                "Tikatu dashboard: pH at sites 2 to 6 on the Chamagunga River compared with the CONAMA range, and a map of the 6 sampling sites",
              ])}
              className="block w-full"
              loading="lazy"
            />
          </Navegador>
        </motion.figure>
        <motion.figure
          style={{ y: tabelaY, opacity: tabelaOp }}
          className="absolute -bottom-2 left-4 w-[62%] overflow-hidden rounded-xl bg-white shadow-2xl shadow-black/50 ring-1 ring-white/20 sm:left-[-2rem]"
        >
          <img
            src="/apresentacao/painel-leituras.webp"
            alt={t([
              "Tabela de leituras de pH do Rio Chamagunga em 25/08/2024 com status CONAMA e verificação de anomalia",
              "Table of pH readings on the Chamagunga River on 25 Aug 2024 with CONAMA status and anomaly check",
            ])}
            className="block w-full"
            loading="lazy"
          />
        </motion.figure>
      </div>

      <p className="text-xs text-slate-500 lg:col-span-2">
        {t([
          "Captura do painel em produção em 10/11/2026 (Rio Chamagunga, pH, coleta de 25/08/2024). Cada leitura chega com ponto, data e hora, status em relação ao CONAMA e verificação de anomalia.",
          "Screenshot of the live dashboard on 10 Nov 2026 (Chamagunga River, pH, sampled on 25 Aug 2024). Each reading arrives with site, date and time, CONAMA status and an anomaly check. Interface in Portuguese.",
        ])}
      </p>
    </section>
  );
};

/** Cena 6: o app de coleta. O celular troca de tela sozinho; a lista ao lado acompanha e pode ser clicada. */
export const AppColeta = () => {
  const reduce = useMenosMovimento();
  const ref = useRef<HTMLElement>(null);
  const visivel = useInView(ref, { amount: 0.4 });
  const [i, setI] = useState(0);
  const [pausa, setPausa] = useState(false);
  const { srx, sry, mover, sair } = useInclinacao(reduce);
  const t = useT();

  useEffect(() => {
    if (reduce || !visivel || pausa) return;
    const id = window.setInterval(() => setI((v) => (v + 1) % TELAS.length), INTERVALO);
    return () => window.clearInterval(id);
  }, [reduce, visivel, pausa, i]);

  return (
    <section
      ref={ref}
      id="cena-6"
      className="mx-auto grid min-h-[100svh] max-w-6xl items-center gap-10 px-6 py-20 md:grid-cols-[1fr_1.1fr] md:gap-16"
      aria-label={t(["O app de coleta", "The sampling app"])}
    >
      <div className="order-2 flex justify-center [perspective:1200px] md:order-1" onMouseMove={mover} onMouseLeave={sair}>
        <motion.div style={{ rotateX: srx, rotateY: sry }}>
          <motion.div
            className="relative w-[min(15rem,34svh)] rounded-[2.4rem] bg-[#0d1b24] p-2.5 shadow-[0_40px_80px_-30px_rgba(34,211,238,0.5)] ring-1 ring-white/15 sm:w-[min(17rem,38svh)]"
            animate={reduce ? undefined : { y: [0, -12, 0], rotate: [-2, 1.5, -2] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="absolute left-1/2 top-4 z-10 h-5 w-20 -translate-x-1/2 rounded-full bg-[#0d1b24]" aria-hidden />
            <div className="relative aspect-[9/17] overflow-hidden rounded-[2rem] bg-[#f6f7f9]">
              <AnimatePresence initial={false} mode="popLayout">
                <motion.img
                  key={TELAS[i].src}
                  src={TELAS[i].src}
                  alt={`${t(["Tela real do Tikatu Coleta", "Real Tikatu Coleta screen"])}: ${t(TELAS[i].titulo)}`}
                  className="absolute left-0 top-0 block w-full"
                  initial={reduce ? false : { x: "30%", opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: "-20%", opacity: 0 }}
                  transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                  loading="lazy"
                />
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      </div>

      <div className="order-1 md:order-2">
        <Reveal>
          <SceneLabel index={6}>{t(["O app de coleta", "The sampling app"])}</SceneLabel>
          <h2 className="text-3xl font-semibold text-white sm:text-5xl">
            {t(["No rio, o voluntário usa o ", "At the river, volunteers use the "])}
            <span className="text-cyan-200">{t(["Tikatu Coleta.", "Tikatu Coleta app."])}</span>
          </h2>
          <p className="mt-4 text-slate-300">
            {t([
              "Versão 1.6.2. O app envia as leituras para o mesmo banco de dados do painel.",
              "Version 1.6.2. The app sends readings to the same database as the dashboard.",
            ])}
          </p>
        </Reveal>
        <ul className="mt-6 space-y-2" onMouseEnter={() => setPausa(true)} onMouseLeave={() => setPausa(false)}>
          {TELAS.map((tela, k) => (
            <li key={tela.src}>
              <button
                type="button"
                onClick={() => setI(k)}
                aria-pressed={k === i}
                className={`relative w-full overflow-hidden rounded-xl border px-4 py-3 text-left transition-colors ${
                  k === i ? "border-cyan-300/50 bg-cyan-300/10" : "border-white/10 bg-white/[0.02] hover:bg-white/[0.05]"
                }`}
              >
                <span className={`block font-semibold ${k === i ? "text-white" : "text-slate-300"}`}>{t(tela.titulo)}</span>
                <span className="mt-0.5 hidden text-sm text-slate-400 sm:block">{t(tela.legenda)}</span>
                {k === i && !reduce && !pausa && visivel && (
                  <motion.span
                    key={`barra-${i}`}
                    className="absolute bottom-0 left-0 h-0.5 bg-cyan-300"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: INTERVALO / 1000, ease: "linear" }}
                    aria-hidden
                  />
                )}
              </button>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs text-slate-500">
          {t([
            "Telas reais com usuário de teste; código do voluntário ocultado.",
            "Real screens with a test user; volunteer code hidden. App interface in Portuguese.",
          ])}
        </p>
      </div>
    </section>
  );
};
