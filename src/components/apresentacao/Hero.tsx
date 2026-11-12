import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ChevronDown, ChevronRight } from "lucide-react";
import { usePalco } from "./primitives";
import { useMenosMovimento } from "./useMenosMovimento";
import { useT } from "./idioma";
import { BotaoIdioma } from "./BotaoIdioma";

/** Camada de onda: o caminho se repete duas vezes para o loop horizontal não ter emenda. */
const Wave = ({
  d,
  fill,
  duration,
  className,
  reduce,
}: {
  d: string;
  fill: string;
  duration: number;
  className?: string;
  reduce: boolean | null;
}) => (
  <motion.svg
    viewBox="0 0 2880 320"
    preserveAspectRatio="none"
    className={`absolute left-0 h-full w-[200%] ${className ?? ""}`}
    aria-hidden
    animate={reduce ? undefined : { x: ["0%", "-50%"] }}
    transition={reduce ? undefined : { duration, ease: "linear", repeat: Infinity }}
  >
    <path d={d} fill={fill} />
  </motion.svg>
);

// Ondas desenhadas em 1440 de largura e repetidas (1440 → 2880).
const WAVE_A =
  "M0 160 C 240 100 480 220 720 160 S 1200 100 1440 160 C 1680 220 1920 100 2160 160 S 2640 220 2880 160 V320 H0 Z";
const WAVE_B =
  "M0 190 C 180 150 420 250 720 200 S 1260 150 1440 190 C 1620 230 1860 150 2160 200 S 2700 230 2880 190 V320 H0 Z";
const WAVE_C =
  "M0 220 C 300 190 540 260 720 230 S 1140 200 1440 220 C 1740 250 1980 190 2160 230 S 2580 250 2880 220 V320 H0 Z";

export const Hero = () => {
  const ref = useRef<HTMLElement>(null);
  const reduce = useMenosMovimento();
  const palco = usePalco();
  const t = useT();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });

  // Ao rolar, o texto afunda e some enquanto a água sobe: a "câmera" mergulha.
  const textY = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [0, 180]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.6], reduce ? [1, 1] : [1, 0]);
  const waterY = useTransform(scrollYProgress, [0, 1], reduce ? ["0%", "0%"] : ["0%", "-55%"]);
  const videoScale = useTransform(scrollYProgress, [0, 1], reduce ? [1, 1] : [1, 1.12]);

  // Paleta da logo: creme, azul-marinho, azul do rio e laranja da terra (mesma do slide 1 do deck).
  return (
    <section
      ref={ref}
      id="cena-1"
      className="relative flex min-h-[100svh] items-start overflow-hidden bg-[#f4f2ea] md:items-center"
      aria-label={t(["Abertura", "Opening"])}
    >
      {/* Idioma: português ou inglês (troca a apresentação inteira) */}
      <BotaoIdioma claro className="absolute right-4 top-4 z-20 md:right-6 md:top-5" />

      {/* Rio (mesmo vídeo do deck): faixa no topo no celular, metade direita no desktop. */}
      <div className="absolute inset-x-0 top-0 h-[42svh] overflow-hidden md:inset-y-0 md:left-auto md:right-0 md:h-full md:w-[62%]" aria-hidden>
        <motion.div style={{ scale: videoScale }} className="h-full w-full">
          {reduce ? (
            <img src="/apresentacao/rio-poster.webp" alt="" className="h-full w-full object-cover" />
          ) : (
            <video
              className="h-full w-full object-cover"
              src="/apresentacao/rio.mp4"
              poster="/apresentacao/rio-poster.webp"
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
            />
          )}
        </motion.div>
        {/* O rio se dissolve no creme, como no deck */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#f4f2ea] md:bg-gradient-to-r md:from-[#f4f2ea] md:via-[#f4f2ea]/25 md:to-transparent" />
      </div>

      <motion.div
        style={{ y: textY, opacity: textOpacity }}
        className="relative z-10 mx-auto w-full max-w-6xl px-6 pb-36 pt-[36svh] text-center md:pb-36 md:pt-16 md:text-left md:[@media(max-height:760px)]:pb-24 md:[@media(max-height:760px)]:pt-8"
      >
        <motion.img
          src="/apresentacao/logo-tikatu.webp"
          alt="Tikatu"
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mx-auto mb-8 h-10 w-auto md:mx-0 sm:h-12 md:[@media(max-height:760px)]:mb-5"
        />
        <motion.p
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="mb-5 text-xs font-semibold uppercase tracking-[0.3em] text-[#1b7fc0]"
        >
          {t(["Pesquisa aplicada em qualidade da água", "Applied research in water quality"])}
        </motion.p>
        <h1 className="text-balance text-4xl font-bold leading-[1.05] tracking-tight text-[#0d3a5c] sm:text-6xl md:max-w-2xl md:text-7xl md:[@media(max-height:760px)]:text-6xl">
          {(t(["Conheça|o Tikatu.", "Meet|Tikatu."]) as string).split("|").map((line, i) => (
            <motion.span
              key={line}
              className="block"
              initial={reduce ? false : { opacity: 0, y: 40, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 1.1, delay: 0.2 + i * 0.25, ease: [0.22, 1, 0.36, 1] }}
            >
              {line}
            </motion.span>
          ))}
        </h1>
        <motion.p
          initial={reduce ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.75, ease: [0.22, 1, 0.36, 1] }}
          className="mt-3 text-2xl font-semibold text-[#1b7fc0] sm:text-3xl"
        >
          {t(["Da medição à compreensão.", "From measurement to understanding."])}
        </motion.p>
        <motion.p
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.2 }}
          className="mx-auto mt-6 max-w-md text-pretty md:[@media(max-height:760px)]:mt-4 text-base text-slate-600 sm:text-lg md:mx-0"
        >
          {t([
            "Voluntários medem a água dos rios, a plataforma organiza os dados e o painel mostra como está cada ponto.",
            "Volunteers measure the water in rivers, the platform organises the data and the dashboard shows the condition of each site.",
          ])}
        </motion.p>
        <motion.div
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.6 }}
          className="mt-8 text-sm text-slate-600 md:[@media(max-height:760px)]:mt-5"
        >
          <motion.div
            className="mx-auto mb-4 h-[3px] w-28 origin-left bg-[#c4552b] md:mx-0"
            initial={reduce ? false : { scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.9, delay: 1.7, ease: [0.22, 1, 0.36, 1] }}
            aria-hidden
          />
          <p className="text-base font-semibold text-[#0d3a5c]">
            {t(["Buscamos apoio para a próxima etapa.", "We are seeking support for the next stage."])}
          </p>
          <p className="mt-3 font-medium text-[#0d3a5c]">Vinícius Saraiva Santos · UFSB</p>
          <p className="mt-1 text-slate-500">
            {t(["Orientação: Prof. Dr. Fabrício Berton Zanchi", "Supervisor: Dr. Fabrício Berton Zanchi"])}
          </p>
        </motion.div>
      </motion.div>

      {/* Água subindo: do creme da abertura para o azul profundo do resto da página */}
      <motion.div style={{ y: waterY }} className="absolute inset-x-0 bottom-0 h-[22vh]" aria-hidden>
        <Wave d={WAVE_A} fill="rgba(27,127,192,0.22)" duration={22} className="bottom-6" reduce={reduce} />
        <Wave d={WAVE_B} fill="rgba(27,127,192,0.45)" duration={16} className="bottom-2" reduce={reduce} />
        <Wave d={WAVE_C} fill="#0a2f4c" duration={11} className="bottom-0" reduce={reduce} />
        <div className="absolute inset-x-0 -bottom-[60vh] h-[60vh] bg-[#0a2f4c]" />
      </motion.div>

      <motion.a
        href="#cena-2"
        style={{ opacity: textOpacity }}
        className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-1 text-xs text-cyan-100/90"
      >
        <span>{palco.ativo
            ? t(["Avance com → ou a roda do mouse", "Advance with → or the mouse wheel"])
            : t(["Role para mergulhar", "Scroll to dive in"])}</span>
        {!palco.ativo && <span className="hidden text-cyan-100/60 lg:block">
            {t(["ou use as setas ← → do teclado", "or use the ← → keys"])}
          </span>}
        <motion.span
          animate={reduce ? undefined : palco.ativo ? { x: [0, 6, 0] } : { y: [0, 6, 0] }}
          transition={{ duration: 1.8, repeat: Infinity }}
        >
          {palco.ativo ? <ChevronRight className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </motion.span>
      </motion.a>
    </section>
  );
};
