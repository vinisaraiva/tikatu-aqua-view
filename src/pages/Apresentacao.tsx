import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { motion, useScroll, useSpring } from "framer-motion";
import { ArrowUpRight, Building2, FlaskConical, Globe2, Mail, Ship, UserRound } from "lucide-react";
import { Hero } from "@/components/apresentacao/Hero";
import { Fluxo } from "@/components/apresentacao/Fluxo";
import { AoVivo } from "@/components/apresentacao/AoVivo";
import { Lacuna, Provisorio, Reveal, SceneLabel } from "@/components/apresentacao/primitives";
import { useMenosMovimento } from "@/components/apresentacao/useMenosMovimento";

const CENAS = [
  "Abertura",
  "O problema",
  "A origem",
  "Como funciona",
  "Ao vivo",
  "Para quem",
  "Equipe",
  "Próximos passos",
];

/** Barra de progresso no topo + pontos de navegação entre cenas (desktop). */
const Navegacao = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.3 });
  const [atual, setAtual] = useState(1);

  useEffect(() => {
    const secoes = CENAS.map((_, i) => document.getElementById(`cena-${i + 1}`)).filter(
      (el): el is HTMLElement => el !== null,
    );
    const obs = new IntersectionObserver(
      (entradas) => {
        entradas.forEach((e) => {
          if (e.isIntersecting) setAtual(Number(e.target.id.replace("cena-", "")));
        });
      },
      { rootMargin: "-50% 0px -50% 0px" },
    );
    secoes.forEach((s) => obs.observe(s));
    return () => obs.disconnect();
  }, []);

  return (
    <>
      <motion.div
        className="fixed inset-x-0 top-0 z-50 h-0.5 origin-left bg-gradient-to-r from-cyan-300 via-teal-300 to-sky-400"
        style={{ scaleX }}
        aria-hidden
      />
      <nav
        className="fixed right-5 top-1/2 z-40 hidden -translate-y-1/2 flex-col gap-3 lg:flex"
        aria-label="Cenas da apresentação"
      >
        {CENAS.map((nome, i) => (
          <a
            key={nome}
            href={`#cena-${i + 1}`}
            className="group flex items-center justify-end gap-3"
            aria-current={atual === i + 1 ? "step" : undefined}
          >
            <span className="pointer-events-none text-xs text-slate-300 opacity-0 transition-opacity group-hover:opacity-100">
              {nome}
            </span>
            <span
              className={`block rounded-full transition-all duration-300 ${
                atual === i + 1 ? "h-2.5 w-2.5 bg-cyan-300" : "h-1.5 w-1.5 bg-white/30 group-hover:bg-white/60"
              }`}
            />
          </a>
        ))}
      </nav>
    </>
  );
};

/** Cena 2: os números ficam como lacunas até haver fonte. */
const PROBLEMAS = [
  {
    numero: "XX%",
    texto: "dos corpos d’água da região sem monitoramento regular",
    falta: "Fonte sugerida: ANA / órgão estadual de meio ambiente",
  },
  {
    numero: "X vezes",
    texto: "por ano é a frequência típica da coleta oficial em cada ponto",
    falta: "Fonte sugerida: rede de monitoramento oficial da bacia",
  },
  {
    numero: "R$ XX",
    texto: "é o custo estimado de uma campanha de coleta tradicional",
    falta: "Fonte sugerida: orçamento de laboratório ou edital público",
  },
];

const Problema = () => (
  <section id="cena-2" className="mx-auto max-w-6xl px-6 py-24 sm:py-36" aria-label="O problema">
    <Reveal>
      <SceneLabel index={2}>O problema</SceneLabel>
      <h2 className="max-w-3xl text-3xl font-semibold leading-tight text-white sm:text-5xl">
        Saber se a água está boa é caro, lento e raro.
      </h2>
      <p className="mt-5 max-w-2xl text-lg text-slate-300">
        A análise depende de equipes técnicas e laboratório, então os pontos são poucos e as coletas, espaçadas.
        Quando o dado chega, muitas vezes o rio já mudou.
      </p>
    </Reveal>

    <div className="mt-14 grid gap-4 md:grid-cols-3">
      {PROBLEMAS.map((p, i) => (
        <Reveal key={p.texto} delay={0.12 * i}>
          <div className="relative h-full rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-transparent p-6">
            <Provisorio className="mb-5">Provisório · sem fonte</Provisorio>
            <div className="text-5xl font-semibold tracking-tight text-amber-200 sm:text-6xl">{p.numero}</div>
            <p className="mt-3 text-slate-200">{p.texto}</p>
            <p className="mt-4 text-xs text-amber-100/70">{p.falta}</p>
          </div>
        </Reveal>
      ))}
    </div>
  </section>
);

const Origem = () => (
  <section id="cena-3" className="relative overflow-hidden py-24 sm:py-36" aria-label="A origem">
    <div
      className="pointer-events-none absolute inset-0"
      style={{ background: "radial-gradient(50% 60% at 15% 50%, rgba(45,212,191,0.10), transparent 70%)" }}
      aria-hidden
    />
    <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-6 md:grid-cols-[1fr_1.2fr]">
      <Reveal>
        <SceneLabel index={3}>A origem</SceneLabel>
        <h2 className="text-3xl font-semibold leading-tight text-white sm:text-5xl">
          E se quem mora perto do rio pudesse medir a água?
        </h2>
      </Reveal>
      <Reveal delay={0.15}>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
          <Provisorio className="mb-5">Texto provisório</Provisorio>
          <p className="text-lg leading-relaxed text-slate-200">
            O Tikatu nasceu <Lacuna>[onde e quando: ex. cidade, ano, instituição]</Lacuna> a partir de{" "}
            <Lacuna>[o episódio ou a percepção que motivou o projeto]</Lacuna>.
          </p>
          <p className="mt-4 text-lg leading-relaxed text-slate-200">
            A ideia central: <Lacuna>[uma frase do Vinícius sobre o porquê do projeto]</Lacuna>.
          </p>
          <p className="mt-6 border-l-2 border-cyan-300/50 pl-4 text-sm text-slate-400">
            O nome “Tikatu” <Lacuna>[significado ou origem do nome, se for contar]</Lacuna>.
          </p>
        </div>
      </Reveal>
    </div>
  </section>
);

const PUBLICOS = [
  {
    icon: Building2,
    titulo: "Gestão pública",
    texto: "Mais pontos e mais frequência de dados para apoiar decisões sobre saneamento, outorga e fiscalização.",
    link: "/dashboard",
    linkTexto: "Ver o painel",
  },
  {
    icon: FlaskConical,
    titulo: "Pesquisa",
    texto: "Séries históricas e índices como IQA e IET, organizados por ponto e período para análise científica.",
    link: "/indices",
    linkTexto: "Ver os índices",
  },
  {
    icon: Ship,
    titulo: "Economia do mar",
    texto: "Turismo, pesca e aquicultura dependem de água limpa: dado confiável vira valor econômico.",
    link: "/forum-economia-do-mar",
    linkTexto: "Ver o caso do Fórum",
  },
  {
    icon: Globe2,
    titulo: "Agenda 2030",
    texto: "Contribui para os ODS 6 (água potável e saneamento), 14 (vida na água) e 17 (parcerias).",
    link: "/agenda-2030",
    linkTexto: "Ver a Agenda 2030",
  },
];

const ParaQuem = () => (
  <section id="cena-6" className="mx-auto max-w-6xl px-6 py-24 sm:py-36" aria-label="Para quem e por que importa">
    <Reveal>
      <SceneLabel index={6}>Para quem e por que importa</SceneLabel>
      <h2 className="max-w-3xl text-3xl font-semibold leading-tight text-white sm:text-5xl">
        Um mesmo dado, quatro portas de valor.
      </h2>
    </Reveal>
    <div className="mt-12 grid gap-4 sm:grid-cols-2">
      {PUBLICOS.map(({ icon: Icon, titulo, texto, link, linkTexto }, i) => (
        <Reveal key={titulo} delay={0.08 * i}>
          <div className="group flex h-full flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition-colors hover:border-cyan-300/40 hover:bg-white/[0.06]">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-400/15 text-cyan-200">
              <Icon className="h-5 w-5" />
            </div>
            <h3 className="text-xl font-semibold text-white">{titulo}</h3>
            <p className="mt-2 flex-1 text-slate-300">{texto}</p>
            <Link
              to={link}
              target="_blank"
              rel="noopener"
              className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-cyan-300 hover:text-cyan-200"
            >
              {linkTexto}
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          </div>
        </Reveal>
      ))}
    </div>
  </section>
);

const Equipe = () => (
  <section id="cena-7" className="mx-auto max-w-6xl px-6 py-24 sm:py-36" aria-label="Equipe">
    <Reveal>
      <SceneLabel index={7}>Equipe</SceneLabel>
      <div className="flex flex-wrap items-end gap-4">
        <h2 className="text-3xl font-semibold leading-tight text-white sm:text-5xl">Quem faz o Tikatu.</h2>
        <Provisorio className="mb-2">Equipe a confirmar</Provisorio>
      </div>
    </Reveal>
    <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-4">
      {[1, 2, 3, 4].map((n, i) => (
        <Reveal key={n} delay={0.08 * i}>
          <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-5 text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white/5 text-slate-500">
              <UserRound className="h-9 w-9" />
            </div>
            <div className="font-semibold text-amber-100/90">[Nome {n}]</div>
            <div className="mt-1 text-sm text-slate-400">[Função · formação]</div>
          </div>
        </Reveal>
      ))}
    </div>
    <Reveal delay={0.2}>
      <p className="mt-8 text-sm text-slate-400">
        Parceiros e instituições: <Lacuna>[logos ou nomes, se puderem ser citados]</Lacuna>
      </p>
    </Reveal>
  </section>
);

const ProximosPassos = () => (
  <section id="cena-8" className="relative overflow-hidden pb-16 pt-24 sm:pt-36" aria-label="Próximos passos">
    <div
      className="pointer-events-none absolute inset-0"
      style={{ background: "radial-gradient(70% 50% at 50% 100%, rgba(34,211,238,0.18), transparent 70%)" }}
      aria-hidden
    />
    <div className="relative mx-auto max-w-6xl px-6">
      <Reveal>
        <SceneLabel index={8}>Próximos passos</SceneLabel>
        <h2 className="max-w-3xl text-3xl font-semibold leading-tight text-white sm:text-5xl">
          Daqui, o rio só aumenta.
        </h2>
      </Reveal>

      <div className="mt-12 grid gap-4 md:grid-cols-3">
        {["Próximos 6 meses", "Em 12 meses", "Em 24 meses"].map((prazo, i) => (
          <Reveal key={prazo} delay={0.1 * i}>
            <div className="h-full rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <div className="text-sm font-semibold text-cyan-300">{prazo}</div>
              <p className="mt-3 text-slate-200">
                <Lacuna>[meta: ex. nº de pontos, cidades, parcerias]</Lacuna>
              </p>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal delay={0.1}>
        <div className="mt-16 rounded-3xl border border-cyan-300/30 bg-gradient-to-br from-cyan-400/15 via-teal-400/10 to-transparent p-8 sm:p-12">
          <Provisorio className="mb-6">Pedido a confirmar</Provisorio>
          <h3 className="text-2xl font-semibold text-white sm:text-4xl">O que buscamos</h3>
          <div className="mt-6 grid gap-6 sm:grid-cols-3">
            <div>
              <div className="text-xs uppercase tracking-wider text-slate-400">Valor</div>
              <div className="mt-1 text-3xl font-semibold text-amber-200">R$ [—]</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-slate-400">Modalidade</div>
              <div className="mt-1 text-lg text-amber-100/90">[investimento, patrocínio, parceria…]</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-slate-400">Uso dos recursos</div>
              <div className="mt-1 text-lg text-amber-100/90">[ex.: kits, expansão, equipe]</div>
            </div>
          </div>
        </div>
      </Reveal>

      <Reveal delay={0.1}>
        <div className="mt-16 flex flex-col items-center text-center">
          <div className="rounded-2xl bg-white px-5 py-3">
            <img
              src="/lovable-uploads/d62bdfd0-6fc8-4075-ac93-580e7557f424.png"
              alt="Tikatu"
              className="h-10 w-auto"
              loading="lazy"
            />
          </div>
          <p className="mt-6 text-2xl font-semibold text-white sm:text-3xl">Vamos conversar?</p>
          <div className="mt-5 flex flex-col items-center gap-3 sm:flex-row">
            <span className="inline-flex items-center gap-2 rounded-full border border-dashed border-amber-300/50 px-5 py-3 text-amber-100/90">
              <Mail className="h-4 w-4" />
              [e-mail de contato]
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-dashed border-amber-300/50 px-5 py-3 text-amber-100/90">
              [WhatsApp ou agenda]
            </span>
          </div>
        </div>
      </Reveal>

      <p className="mt-20 text-center text-xs text-slate-500">
        Tikatu · plataforma de monitoramento da qualidade da água
      </p>
    </div>
  </section>
);

const Apresentacao = () => {
  const reduce = useMenosMovimento();

  // Rolagem suave só para os links internos (#cena-N) e só sem prefers-reduced-motion.
  useEffect(() => {
    const html = document.documentElement;
    const anterior = html.style.scrollBehavior;
    if (!reduce) html.style.scrollBehavior = "smooth";
    return () => {
      html.style.scrollBehavior = anterior;
    };
  }, [reduce]);

  return (
    <>
      <Helmet>
        <title>Tikatu · Apresentação</title>
        <meta name="robots" content="noindex, nofollow" />
        <meta name="description" content="Apresentação do Tikatu: monitoramento cidadão da qualidade da água." />
        <meta name="theme-color" content="#021019" />
      </Helmet>
      <div className="min-h-screen bg-[#062a3d] font-sans text-slate-100 antialiased selection:bg-cyan-300/30">
        <Navegacao />
        <main className="overflow-x-clip">
          <div className="bg-gradient-to-b from-[#021019] via-[#04202f] to-[#062a3d]">
            <Hero />
          </div>
          <Problema />
          <Origem />
          <Fluxo />
          <AoVivo />
          <ParaQuem />
          <Equipe />
          <ProximosPassos />
        </main>
      </div>
    </>
  );
};

export default Apresentacao;
