import { motion } from "framer-motion";
import { Check } from "lucide-react";

/**
 * Marcador em forma de gota, como os pinos do mapa do painel do Tikatu. A ponta da gota fica no
 * ponto exato da foto. Na entrada, a gota cai do céu e faz uma onda ao tocar a foto; em repouso,
 * solta uma onda de vez em quando. Tudo anima só com transform e opacity.
 */
export const Gota = ({
  numero,
  rotulo,
  visto,
  ordem,
  reduzir,
}: {
  numero: number;
  rotulo: string;
  visto: boolean;
  ordem: number;
  reduzir: boolean;
}) => {
  const atraso = 0.35 + ordem * 0.16;
  return (
    <span className="flex items-start gap-2">
      <motion.span
        className="relative block h-[34px] w-[26px] md:h-[52px] md:w-[40px]"
        initial={reduzir ? false : { y: -320, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={reduzir ? { duration: 0 } : { type: "spring", stiffness: 210, damping: 17, delay: atraso }}
      >
        {/* Camada interna para o hover não brigar com a animação de entrada. */}
        <span className="block h-full w-full transition-transform duration-200 ease-out group-hover:-translate-y-1 group-focus-visible:-translate-y-1">
          <svg viewBox="0 0 40 52" className="h-full w-full drop-shadow-[0_4px_6px_rgba(0,0,0,0.45)]" aria-hidden>
            <path
              d="M20 50 C 20 50 4 31 4 18 A16 16 0 0 1 36 18 C 36 31 20 50 20 50 Z"
              className={visto ? "fill-[#0d3a5c]" : "fill-[#1b7fc0]"}
              stroke="white"
              strokeWidth="2.5"
            />
            <ellipse cx="11" cy="10" rx="2.2" ry="3.6" fill="white" opacity="0.3" transform="rotate(30 11 10)" />
            <text x="20" y="23.5" textAnchor="middle" className="fill-white text-[15px] font-bold" style={{ fontFamily: "Inter, sans-serif" }}>
              {numero}
            </text>
          </svg>
          {visto && (
            <span className="absolute -right-1.5 -top-1 grid h-4 w-4 place-items-center rounded-full bg-emerald-500 ring-2 ring-white md:h-5 md:w-5">
              <Check className="h-2.5 w-2.5 text-white md:h-3 md:w-3" strokeWidth={4} />
            </span>
          )}
        </span>
      </motion.span>
      <motion.span
        className="mt-0.5 hidden whitespace-nowrap rounded-full bg-[#071f33]/75 px-3 py-1.5 text-sm font-semibold text-white shadow-lg backdrop-blur transition-colors group-hover:bg-tk-terra md:inline lg:text-base"
        initial={reduzir ? false : { opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={reduzir ? { duration: 0 } : { duration: 0.4, ease: "easeOut", delay: atraso + 0.35 }}
      >
        {rotulo}
      </motion.span>
    </span>
  );
};

/** Onda na água, no ponto onde a gota toca: uma ao cair e depois de tempos em tempos. */
export const Onda = ({ ordem, reduzir }: { ordem: number; reduzir: boolean }) => {
  if (reduzir) return null;
  const atraso = 0.35 + ordem * 0.16 + 0.45;
  return (
    <motion.span
      aria-hidden
      className="pointer-events-none absolute left-0 top-0 block h-3 w-9 rounded-[50%] border-2 border-white/80 md:h-4 md:w-12"
      style={{ translateX: "-50%", translateY: "-50%" }}
      initial={{ scale: 0.2, opacity: 0 }}
      animate={{ scale: [0.2, 1.9], opacity: [0.85, 0] }}
      transition={{ duration: 1.6, ease: "easeOut", delay: atraso, repeat: Infinity, repeatDelay: 3.5 + (ordem % 3) * 1.1 }}
    />
  );
};
