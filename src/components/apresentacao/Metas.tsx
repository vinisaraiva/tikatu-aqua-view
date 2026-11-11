import { useEffect, useRef, useState } from "react";
import { animate, useInView } from "framer-motion";
import { Activity, Footprints } from "lucide-react";
import { ATRASO_TELA, Reveal, SceneLabel, usePalco } from "./primitives";
import { useMenosMovimento } from "./useMenosMovimento";
import { useT, type Bi } from "./idioma";
import { Sonda3D } from "./Sonda3D";

/**
 * Cena 10: a próxima etapa em 12 meses. Plano combinado com o Vinícius em 11/11/2026:
 * sondas portáteis com 2 bolsistas nos 8 pontos; sonda automática em local de acesso difícil,
 * enviando dados pela API do Tikatu; relatórios gerados com a IA e conferidos pela equipe.
 */
const FORMAS: { icon: typeof Activity; titulo: Bi; texto: Bi }[] = [
  {
    icon: Footprints,
    titulo: ["Sondas portáteis", "Portable probes"],
    texto: [
      "Com 2 bolsistas de graduação, medem todo mês os 8 pontos dos 2 rios, com o mesmo protocolo.",
      "Carried by 2 undergraduate fellows, they measure the 8 sites on the 2 rivers every month, with the same protocol.",
    ],
  },
  {
    icon: Activity,
    titulo: ["Sonda automática", "Automatic probe"],
    texto: [
      "Em um local de acesso difícil, mede sem parar e envia os dados à plataforma pela API do Tikatu.",
      "At a hard-to-reach site, it measures non-stop and sends the data to the platform through the Tikatu API.",
    ],
  },
];

const METAS: { valor: number; rotulo: Bi }[] = [
  { valor: 2, rotulo: ["rios acompanhados", "rivers monitored"] },
  { valor: 8, rotulo: ["pontos com coleta mensal", "sites sampled monthly"] },
  { valor: 80, rotulo: ["registros de campo (ponto × visita)", "field records (site × visit)"] },
  { valor: 36, rotulo: ["amostras de laboratório, se necessário", "laboratory samples, if needed"] },
  { valor: 10, rotulo: ["boletins para a comunidade", "bulletins for the community"] },
  { valor: 5, rotulo: ["relatórios bimestrais para gestores", "bimonthly reports for decision-makers"] },
];

/** Número que conta de 0 até o valor quando aparece. */
const Contador = ({ valor, ativo, atraso }: { valor: number; ativo: boolean; atraso: number }) => {
  const reduce = useMenosMovimento();
  const [v, setV] = useState(reduce ? valor : 0);
  useEffect(() => {
    if (!ativo || reduce) return;
    const c = animate(0, valor, { duration: 1.3, delay: atraso, ease: [0.22, 1, 0.36, 1], onUpdate: (x) => setV(Math.round(x)) });
    return () => c.stop();
  }, [ativo, reduce, valor, atraso]);
  return <>{v}</>;
};

export const Metas = () => {
  const t = useT();
  const palco = usePalco();
  const ref = useRef<HTMLDListElement>(null);
  const ativo = useInView(ref, { amount: 0.4, once: true });
  const base = 0.5 + (palco.ativo ? ATRASO_TELA : 0);

  return (
    <section
      id="cena-10"
      className="relative mx-auto flex min-h-[100svh] max-w-6xl flex-col justify-center px-6 py-16"
      aria-label={t(["A próxima etapa", "The next stage"])}
    >
      <Reveal>
        <SceneLabel index={10}>{t(["A próxima etapa", "The next stage"])}</SceneLabel>
        <h2 className="max-w-4xl text-3xl font-semibold leading-tight text-white sm:text-5xl">
          {t(["12 meses de pesquisa, ", "12 months of research, "])}
          <span className="text-cyan-200">{t(["com metas que podem ser conferidas.", "with targets that can be checked."])}</span>
        </h2>
        <p className="mt-4 max-w-3xl text-slate-300 sm:text-lg">
          {t([
            "Acompanhar dois rios (previstos: Buranhém e dos Mangues), complementar com análises de laboratório quando necessário, formar voluntários da comunidade e transformar os dados em relatórios para a comunidade e para gestores. A plataforma recebe os dois tipos de medição num só painel.",
            "Monitor two rivers (planned: the Buranhém and the Mangues), complement with laboratory analyses when needed, train community volunteers and turn the data into reports for the community and for decision-makers. The platform takes in both kinds of measurement in a single dashboard.",
          ])}
        </p>
      </Reveal>

      <div className="mt-7 grid items-stretch gap-6 md:grid-cols-[1.45fr_1fr]">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300/80">
            {t(["Duas formas de medir", "Two ways of measuring"])}
          </div>
          <div className="mt-2 grid gap-3 sm:grid-cols-2">
            {FORMAS.map((f, i) => {
              const Icon = f.icon;
              return (
                <Reveal key={f.titulo[0]} delay={0.1 + i * 0.12}>
                  <div className="h-full rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                    <div className="flex items-center gap-2 font-semibold text-white">
                      <Icon className="h-4 w-4 text-cyan-300" />
                      {t(f.titulo)}
                    </div>
                    <p className="mt-1.5 text-sm text-slate-300">{t(f.texto)}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>

          <div className="mt-5 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300/80">
            {t(["Metas para 12 meses", "Targets for 12 months"])}
          </div>
          <dl ref={ref} className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {METAS.map((m, i) => (
              <Reveal key={m.rotulo[0]} delay={0.3 + i * 0.07}>
                <div className="h-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                  <dd className="font-mono text-3xl font-semibold tabular-nums text-cyan-200 sm:text-4xl">
                    <Contador valor={m.valor} ativo={ativo} atraso={base + i * 0.1} />
                  </dd>
                  <dt className="mt-0.5 text-xs leading-snug text-slate-300 sm:text-sm">{t(m.rotulo)}</dt>
                </div>
              </Reveal>
            ))}
          </dl>
          <p className="mt-2 text-xs text-slate-400">
            {t([
              "Meses 1 e 2: aquisições, instalação, formação e reconhecimento dos locais. Meses 3 a 12: 10 ciclos mensais. Relatórios gerados com a IA e conferidos pela equipe.",
              "Months 1–2: purchasing, installation, training and site reconnaissance. Months 3–12: 10 monthly cycles. Reports generated with AI and checked by the team.",
            ])}
          </p>
        </div>
        <Sonda3D />
      </div>
    </section>
  );
};
