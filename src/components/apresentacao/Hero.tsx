import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useMenosMovimento } from "./useMenosMovimento";

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

const BUBBLES = Array.from({ length: 14 }, (_, i) => ({
  left: `${(i * 37) % 100}%`,
  size: 4 + ((i * 7) % 10),
  delay: (i * 0.9) % 7,
  duration: 9 + ((i * 5) % 8),
}));

export const Hero = () => {
  const ref = useRef<HTMLElement>(null);
  const reduce = useMenosMovimento();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });

  // Ao rolar, o texto afunda e some enquanto a água sobe: a "câmera" mergulha.
  const textY = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [0, 180]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.6], reduce ? [1, 1] : [1, 0]);
  const waterY = useTransform(scrollYProgress, [0, 1], reduce ? ["0%", "0%"] : ["0%", "-55%"]);

  return (
    <section
      ref={ref}
      id="cena-1"
      className="relative flex min-h-[100svh] items-center justify-center overflow-hidden"
      aria-label="Abertura"
    >
      {/* Luz atravessando a água */}
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(60% 50% at 50% 0%, rgba(103,232,249,0.18), transparent 70%), radial-gradient(40% 40% at 80% 30%, rgba(45,212,191,0.12), transparent 70%)",
        }}
        aria-hidden
      />

      {!reduce && (
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          {BUBBLES.map((b, i) => (
            <motion.span
              key={i}
              className="absolute bottom-0 rounded-full border border-cyan-200/30 bg-cyan-100/10"
              style={{ left: b.left, width: b.size, height: b.size }}
              animate={{ y: ["0vh", "-110vh"], opacity: [0, 0.8, 0] }}
              transition={{ duration: b.duration, delay: b.delay, repeat: Infinity, ease: "easeOut" }}
            />
          ))}
        </div>
      )}

      <motion.div
        style={{ y: textY, opacity: textOpacity }}
        className="relative z-10 mx-auto max-w-4xl px-6 text-center"
      >
        <motion.p
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-6 text-xs font-semibold uppercase tracking-[0.35em] text-cyan-300/90"
        >
          Tikatu · monitoramento cidadão da água
        </motion.p>
        <h1 className="text-balance text-4xl font-semibold leading-[1.05] tracking-tight text-white sm:text-6xl md:text-7xl">
          {["Toda água conta", "uma história."].map((line, i) => (
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
          <motion.span
            className="mt-2 block bg-gradient-to-r from-cyan-200 via-teal-200 to-sky-300 bg-clip-text text-transparent"
            initial={reduce ? false : { opacity: 0, y: 40, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 1.1, delay: 0.75, ease: [0.22, 1, 0.36, 1] }}
          >
            Quase ninguém consegue lê-la.
          </motion.span>
        </h1>
        <motion.p
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.3 }}
          className="mx-auto mt-8 max-w-xl text-pretty text-base text-slate-300 sm:text-lg"
        >
          O Tikatu transforma voluntários com um celular numa rede de monitoramento da qualidade da água, do
          rio ao painel público.
        </motion.p>
      </motion.div>

      {/* Água subindo */}
      <motion.div style={{ y: waterY }} className="absolute inset-x-0 bottom-0 h-[38vh]" aria-hidden>
        <Wave d={WAVE_A} fill="rgba(34,211,238,0.18)" duration={22} className="bottom-6" reduce={reduce} />
        <Wave d={WAVE_B} fill="rgba(14,165,233,0.28)" duration={16} className="bottom-2" reduce={reduce} />
        <Wave d={WAVE_C} fill="#062a3d" duration={11} className="bottom-0" reduce={reduce} />
        <div className="absolute inset-x-0 -bottom-[60vh] h-[60vh] bg-[#062a3d]" />
      </motion.div>

      <motion.a
        href="#cena-2"
        style={{ opacity: textOpacity }}
        className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-1 text-xs text-cyan-100/80"
      >
        <span>Role para mergulhar</span>
        <motion.span
          animate={reduce ? undefined : { y: [0, 6, 0] }}
          transition={{ duration: 1.8, repeat: Infinity }}
        >
          <ChevronDown className="h-5 w-5" />
        </motion.span>
      </motion.a>
    </section>
  );
};
