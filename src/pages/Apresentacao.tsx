import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { motion, useScroll, useSpring } from "framer-motion";
import { ArrowUpRight, Building2, FlaskConical, Globe2, Ship } from "lucide-react";
import { Hero } from "@/components/apresentacao/Hero";
import { Fluxo } from "@/components/apresentacao/Fluxo";
import { AoVivo } from "@/components/apresentacao/AoVivo";
import { Reveal, SceneLabel } from "@/components/apresentacao/primitives";
import { Amostragem } from "@/components/apresentacao/Amostragem";
import { useMenosMovimento } from "@/components/apresentacao/useMenosMovimento";

const CENAS = [
  "Abertura",
  "O problema",
  "A origem",
  "Como funciona",
  "Ao vivo",
  "Para quem",
  "Equipe",
  "Próxima etapa",
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

/** Cena 3: origem e o que já foi construído (fonte: roteiro do projeto de 10/11/2026). */
const ENTREGAS = [
  {
    estado: "Publicado",
    titulo: "Plataforma Tikatu",
    onde: "International Journal of River Basin Management · 2025",
    link: "https://doi.org/10.1080/15715124.2025.2528958",
  },
  {
    estado: "Software disponível",
    titulo: "tikatuwq no CRAN",
    onde: "Rotinas abertas, documentação e exemplos reprodutíveis",
    link: "https://cran.r-project.org/package=tikatuwq",
  },
  {
    estado: "Aceito",
    titulo: "Artigo da biblioteca tikatuwq",
    onde: "International Journal of River Basin Management · aceite em 22/10/2026",
  },
  {
    estado: "Aceito",
    titulo: "Frequência amostral no Buranhém",
    onde: "Earth Science Informatics · aceite em 07/11/2026",
  },
];

const Origem = () => (
  <section id="cena-3" className="relative overflow-hidden py-24 sm:py-36" aria-label="A origem">
    <div
      className="pointer-events-none absolute inset-0"
      style={{ background: "radial-gradient(50% 60% at 15% 50%, rgba(45,212,191,0.10), transparent 70%)" }}
      aria-hidden
    />
    <div className="relative mx-auto grid max-w-6xl gap-12 px-6 md:grid-cols-[1fr_1.25fr]">
      <Reveal>
        <SceneLabel index={3}>A origem</SceneLabel>
        <h2 className="text-3xl font-semibold leading-tight text-white sm:text-5xl">Uma base que já existe.</h2>
        <p className="mt-5 text-lg leading-relaxed text-slate-300">
          O Tikatu nasceu no mestrado em Ciências e Tecnologias Ambientais, com a construção da plataforma e a validação
          inicial no Rio Chamagunga, em Porto Seguro. Hoje é uma pesquisa de doutorado em Biossistemas na UFSB:
        </p>
        <p className="mt-4 border-l-2 border-cyan-300/50 pl-4 text-slate-200">
          “Do dado à decisão: desenvolvimento e avaliação do ecossistema Tikatu para monitoramento, análise
          computacional e interpretação auditável da qualidade da água.”
        </p>
      </Reveal>
      <div>
        <Reveal delay={0.1}>
          <div className="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-cyan-300/80">
            Entregas que sustentam o percurso
          </div>
        </Reveal>
        <ul className="divide-y divide-white/10 border-y border-white/10">
          {ENTREGAS.map((e, i) => (
            <Reveal key={e.titulo} delay={0.1 + i * 0.08}>
              <li className="flex items-start gap-4 py-5">
                <span
                  className={`mt-1 w-28 shrink-0 text-[11px] font-semibold uppercase tracking-wider ${
                    e.estado === "Aceito" ? "text-[#efb08c]" : "text-emerald-300"
                  }`}
                >
                  {e.estado}
                </span>
                <div className="flex-1">
                  <div className="font-semibold text-white">
                    {e.link ? (
                      <a
                        href={e.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 hover:text-cyan-200"
                      >
                        {e.titulo}
                        <ArrowUpRight className="h-4 w-4" />
                      </a>
                    ) : (
                      e.titulo
                    )}
                  </div>
                  <div className="mt-1 text-sm text-slate-400">{e.onde}</div>
                </div>
              </li>
            </Reveal>
          ))}
        </ul>
        <p className="mt-3 text-xs text-slate-500">Aceite e publicação são situações distintas.</p>
      </div>
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

const EQUIPE = [
  {
    papel: "Idealização e desenvolvimento",
    nome: "Vinícius Saraiva Santos",
    linhas: [
      "Administração e Análise de Sistemas",
      "Técnico em TI do IFBA, Campus Porto Seguro",
      "Mestre em Ciências e Tecnologias Ambientais",
      "Doutorando em Biossistemas pela UFSB",
    ],
  },
  {
    papel: "Orientação científica",
    nome: "Fabrício Berton Zanchi",
    linhas: ["Professor doutor da UFSB", "Programa de Pós-Graduação em Biossistemas", "Vínculo de pesquisa: NuPEcoTropic"],
  },
];

const TRAJETORIA = [
  { fase: "TI", texto: "Experiência profissional" },
  { fase: "Mestrado", texto: "Construção da plataforma" },
  { fase: "Doutorado", texto: "Avaliação do ecossistema" },
];

const Equipe = () => {
  const reduce = useMenosMovimento();
  return (
    <section id="cena-7" className="mx-auto max-w-6xl px-6 py-24 sm:py-36" aria-label="Equipe">
      <Reveal>
        <SceneLabel index={7}>Equipe</SceneLabel>
        <h2 className="text-3xl font-semibold leading-tight text-white sm:text-5xl">Tecnologia e pesquisa ambiental.</h2>
      </Reveal>
      <div className="mt-12 grid gap-6 md:grid-cols-2">
        {EQUIPE.map((p, i) => (
          <Reveal key={p.nome} delay={0.1 * i}>
            <div className="h-full rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300/80">{p.papel}</div>
              <div className="mt-3 text-2xl font-semibold text-white">{p.nome}</div>
              <ul className="mt-4 space-y-1.5 text-slate-300">
                {p.linhas.map((l) => (
                  <li key={l}>{l}</li>
                ))}
              </ul>
            </div>
          </Reveal>
        ))}
      </div>
      <div className="relative mt-14">
        <motion.div
          className="absolute left-0 right-0 top-1.5 h-0.5 origin-left bg-[#efb08c]"
          initial={reduce ? false : { scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true, margin: "-10% 0px" }}
          transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
          aria-hidden
        />
        <ol className="relative grid grid-cols-3 gap-4">
          {TRAJETORIA.map((t, i) => (
            <Reveal key={t.fase} delay={0.3 + i * 0.25}>
              <li>
                <span className="block h-3.5 w-3.5 rounded-full bg-[#efb08c] ring-4 ring-[#062a3d]" aria-hidden />
                <div className="mt-4 font-semibold text-white sm:text-lg">{t.fase}</div>
                <div className="text-sm text-slate-400">{t.texto}</div>
              </li>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
};

const RECURSOS = [
  { titulo: "Instrumentação", texto: "Sondas e acessórios de medição" },
  { titulo: "Materiais e calibração", texto: "Soluções, frascos e consumíveis" },
  { titulo: "Campo e logística", texto: "Transporte e deslocamentos da equipe" },
  { titulo: "Validação", texto: "Comparações e análises de referência" },
];

const ETAPAS_APOIO = [
  { n: "01", titulo: "Pactuar", texto: "Escolher a frente e dimensionar a etapa.", evidencia: "Plano de aplicação" },
  { n: "02", titulo: "Preparar", texto: "Definir locais e métodos; adquirir materiais.", evidencia: "Protocolos e aquisições" },
  { n: "03", titulo: "Medir e verificar", texto: "Executar as campanhas; conferir dados.", evidencia: "Registros documentados" },
  { n: "04", titulo: "Compartilhar", texto: "Produzir relatórios e devolutivas.", evidencia: "Relatórios de execução" },
];

const ProximosPassos = () => (
  <section id="cena-8" className="relative overflow-hidden pb-16 pt-24 sm:pt-36" aria-label="A próxima etapa">
    <div
      className="pointer-events-none absolute inset-0"
      style={{ background: "radial-gradient(70% 50% at 50% 100%, rgba(34,211,238,0.18), transparent 70%)" }}
      aria-hidden
    />
    <div className="relative mx-auto max-w-6xl px-6">
      <Reveal>
        <SceneLabel index={8}>A próxima etapa</SceneLabel>
        <h2 className="max-w-3xl text-3xl font-semibold leading-tight text-white sm:text-5xl">
          A próxima etapa acontece no campo.
        </h2>
        <p className="mt-4 max-w-2xl text-slate-300 sm:text-lg">
          A base computacional já existe. Falta ampliar a capacidade de medir, registrar e validar em contexto.
        </p>
      </Reveal>

      <div className="mt-10 grid gap-3 sm:grid-cols-2">
        {RECURSOS.map((r, i) => (
          <Reveal key={r.titulo} delay={0.08 * i}>
            <div className="flex h-full items-baseline justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4">
              <span className="font-semibold text-white">{r.titulo}</span>
              <span className="text-right text-sm text-slate-400">{r.texto}</span>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal delay={0.1}>
        <h3 className="mt-16 text-2xl font-semibold text-white sm:text-3xl">
          Um plano. Quatro etapas que podem ser conferidas.
        </h3>
      </Reveal>
      <ol className="mt-8 grid gap-4 md:grid-cols-4">
        {ETAPAS_APOIO.map((e, i) => (
          <Reveal key={e.n} delay={0.1 * i}>
            <li className="h-full rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <div className="font-mono text-sm text-cyan-300">{e.n}</div>
              <div className="mt-2 text-lg font-semibold text-white">{e.titulo}</div>
              <p className="mt-1 text-sm text-slate-300">{e.texto}</p>
              <div className="mt-4 text-[11px] font-semibold uppercase tracking-wider text-[#efb08c]">Evidência</div>
              <div className="text-sm text-white">{e.evidencia}</div>
            </li>
          </Reveal>
        ))}
      </ol>
      <p className="mt-4 text-xs text-slate-500">
        Cronograma, marcos e formalização pactuados conforme os procedimentos institucionais. Entregas condicionadas ao
        escopo aprovado; resultados científicos e impacto não são garantidos.
      </p>

      <Reveal delay={0.1}>
        <div className="mt-20 flex flex-col items-center rounded-3xl border border-cyan-300/30 bg-gradient-to-br from-cyan-400/15 via-teal-400/10 to-transparent px-6 py-12 text-center sm:px-12">
          <div className="rounded-2xl bg-white px-5 py-3">
            <img
              src="/lovable-uploads/d62bdfd0-6fc8-4075-ac93-580e7557f424.png"
              alt="Tikatu"
              className="h-10 w-auto"
              loading="lazy"
            />
          </div>
          <h3 className="mt-8 text-3xl font-semibold text-white sm:text-5xl">Vamos viabilizar a próxima etapa?</h3>
          <p className="mt-4 max-w-xl text-slate-300 sm:text-lg">
            Buscamos apoio para sondas, materiais e campanhas de campo. Próximo passo: definir a frente de apoio e seu
            plano de aplicação.
          </p>
          <a
            href="https://www.tikatu.com.br"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-cyan-300 px-6 py-3 font-semibold text-slate-950 transition-colors hover:bg-cyan-200"
          >
            Conhecer o Tikatu
            <ArrowUpRight className="h-4 w-4" />
          </a>
        </div>
      </Reveal>

      <p className="mt-16 text-center text-xs text-slate-500">
        Proposta de financiamento de pesquisa aplicada. Não fixa valor total nem representa oferta de serviço contratado.
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
        <meta name="description" content="Tikatu: apoio à próxima etapa da pesquisa em qualidade da água." />
        <meta name="theme-color" content="#021019" />
      </Helmet>
      <div className="min-h-screen bg-[#062a3d] font-sans text-slate-100 antialiased selection:bg-cyan-300/30">
        <Navegacao />
        <main className="overflow-x-clip">
          <div className="bg-gradient-to-b from-[#021019] via-[#04202f] to-[#062a3d]">
            <Hero />
          </div>
          <Amostragem />
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
