import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useScroll, useTransform } from "framer-motion";
import { Gauge, MapPin, ShieldCheck, Smartphone } from "lucide-react";
import { Reveal, SceneLabel } from "./primitives";
import { useMenosMovimento } from "./useMenosMovimento";

/**
 * Cena 5. Capturas reais (10/11/2026): painel em produção com o pH do Rio Chamagunga
 * (6 pontos, coleta de 25/08/2024) e telas do Tikatu Coleta 1.6.2 com usuário de teste
 * (código do voluntário ocultado). Nenhuma consulta ao banco é feita por esta página.
 */
const FATOS = [
  { icon: MapPin, valor: "6", rotulo: "pontos de coleta no Rio Chamagunga" },
  { icon: Gauge, valor: "13", rotulo: "parâmetros disponíveis no painel" },
  { icon: ShieldCheck, valor: "CONAMA", rotulo: "referência legal em cada gráfico" },
  { icon: Smartphone, valor: "1.6.2", rotulo: "versão do app Tikatu Coleta" },
];

const TELAS = [
  { src: "/apresentacao/coleta-inicio.webp", legenda: "Lembrete com dia, horário e janela de coleta" },
  { src: "/apresentacao/coleta-importar.webp", legenda: "Importa o arquivo XLSX da sonda" },
  { src: "/apresentacao/coleta-historico.webp", legenda: "Histórico com os parâmetros medidos" },
  { src: "/apresentacao/coleta-perfil.webp", legenda: "Perfil e avisos de coleta no aparelho" },
];

/** Celular com as telas reais do Coleta, trocando sozinho enquanto está visível. */
const Celular = () => {
  const reduce = useMenosMovimento();
  const ref = useRef<HTMLDivElement>(null);
  const visivel = useInView(ref, { margin: "-20% 0px" });
  const [i, setI] = useState(0);

  useEffect(() => {
    if (reduce || !visivel) return;
    const id = window.setInterval(() => setI((v) => (v + 1) % TELAS.length), 3200);
    return () => window.clearInterval(id);
  }, [reduce, visivel]);

  return (
    <div ref={ref} className="flex flex-col items-center">
      <motion.div
        className="relative w-56 rounded-[2.4rem] bg-[#0d1b24] p-2.5 shadow-[0_40px_80px_-30px_rgba(34,211,238,0.45)] ring-1 ring-white/15 sm:w-64"
        animate={reduce ? undefined : { y: [0, -10, 0], rotate: [-2, 1, -2] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="absolute left-1/2 top-4 z-10 h-5 w-20 -translate-x-1/2 rounded-full bg-[#0d1b24]" aria-hidden />
        <div className="relative aspect-[9/17] overflow-hidden rounded-[2rem] bg-[#f6f7f9]">
          <AnimatePresence initial={false} mode="popLayout">
            <motion.img
              key={TELAS[i].src}
              src={TELAS[i].src}
              alt={`Tela real do Tikatu Coleta: ${TELAS[i].legenda}`}
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
      <div className="mt-6 flex gap-2" role="tablist" aria-label="Telas do Tikatu Coleta">
        {TELAS.map((t, k) => (
          <button
            key={t.src}
            type="button"
            role="tab"
            aria-selected={k === i}
            aria-label={t.legenda}
            onClick={() => setI(k)}
            className={`h-2 rounded-full transition-all ${k === i ? "w-6 bg-cyan-300" : "w-2 bg-white/30"}`}
          />
        ))}
      </div>
      <p className="mt-3 min-h-[3rem] max-w-[16rem] text-center text-sm text-slate-300" aria-live="polite">
        {TELAS[i].legenda}
      </p>
    </div>
  );
};

export const AoVivo = () => {
  const ref = useRef<HTMLElement>(null);
  const reduce = useMenosMovimento();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const tilt = useTransform(scrollYProgress, [0, 0.35], reduce ? [0, 0] : [18, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.35], reduce ? [1, 1] : [0.88, 1]);

  return (
    <section ref={ref} id="cena-5" className="mx-auto max-w-6xl px-6 py-24 sm:py-32" aria-label="A plataforma ao vivo">
      <Reveal>
        <SceneLabel index={5}>A plataforma ao vivo</SceneLabel>
        <h2 className="max-w-3xl text-3xl font-semibold text-white sm:text-5xl">
          Dados reais. <span className="text-cyan-200">Painel no ar.</span>
        </h2>
        <p className="mt-4 max-w-2xl text-slate-300">
          O app de coleta e o painel funcionam hoje, ligados ao mesmo banco de dados. Abaixo, o pH dos 6 pontos do Rio
          Chamagunga, em Porto Seguro, comparado à faixa do CONAMA.
        </p>
      </Reveal>

      <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {FATOS.map(({ icon: Icon, valor, rotulo }, i) => (
          <Reveal key={rotulo} delay={0.08 * i}>
            <div className="h-full rounded-2xl border border-white/10 bg-white/[0.04] p-4 sm:p-6">
              <Icon className="mb-3 h-5 w-5 text-cyan-300" />
              <div className="text-2xl font-semibold tracking-tight text-white sm:text-4xl">{valor}</div>
              <div className="mt-1 text-xs text-slate-400 sm:text-sm">{rotulo}</div>
            </div>
          </Reveal>
        ))}
      </div>

      <div className="mt-10 [perspective:1200px]">
        <motion.figure
          style={{ rotateX: tilt, scale }}
          className="overflow-hidden rounded-2xl bg-white shadow-[0_40px_120px_-30px_rgba(34,211,238,0.35)] ring-1 ring-white/10"
        >
          <div className="flex items-center gap-2 bg-slate-200 px-4 py-2.5">
            <span className="h-2.5 w-2.5 rounded-full bg-slate-400" />
            <span className="h-2.5 w-2.5 rounded-full bg-slate-400" />
            <span className="h-2.5 w-2.5 rounded-full bg-slate-400" />
            <span className="ml-3 truncate rounded-full bg-white px-3 py-0.5 text-xs text-slate-600">tikatu.com.br/dashboard</span>
          </div>
          <img
            src="/apresentacao/painel-ph.webp"
            alt="Painel do Tikatu: pH dos pontos 2 a 6 do Rio Chamagunga comparados à faixa do CONAMA e mapa com os 6 pontos de coleta"
            className="block w-full"
            loading="lazy"
          />
        </motion.figure>
      </div>

      <div className="mt-10 grid items-center gap-10 md:grid-cols-[1.4fr_1fr]">
        <Reveal>
          <figure className="overflow-hidden rounded-2xl bg-white ring-1 ring-white/10">
            <img
              src="/apresentacao/painel-leituras.webp"
              alt="Tabela de leituras de pH do Rio Chamagunga em 25/08/2024 com status CONAMA e verificação de anomalia"
              className="block w-full"
              loading="lazy"
            />
          </figure>
          <p className="mt-3 text-sm text-slate-400">
            Cada leitura chega com ponto, data e hora, status em relação ao CONAMA e verificação de anomalia.
          </p>
        </Reveal>
        <Reveal delay={0.1}>
          <Celular />
        </Reveal>
      </div>

      <p className="mt-8 text-center text-xs text-slate-500">
        Capturas de 10/11/2026: painel em produção (Rio Chamagunga, pH, coleta de 25/08/2024) e app Tikatu Coleta 1.6.2
        com usuário de teste, código do voluntário ocultado.
      </p>
    </section>
  );
};
