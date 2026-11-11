import { useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { motion, useScroll, useSpring } from "framer-motion";
import { ArrowUpRight, Building2, FlaskConical, Globe2, Ship } from "lucide-react";
import { Hero } from "@/components/apresentacao/Hero";
import { Fluxo, PASSOS_FLUXO } from "@/components/apresentacao/Fluxo";
import { AoVivo, AppColeta } from "@/components/apresentacao/AoVivo";
import { Reveal, SceneLabel, Transicao } from "@/components/apresentacao/primitives";
import { Amostragem } from "@/components/apresentacao/Amostragem";
import { Sonda3D } from "@/components/apresentacao/Sonda3D";
import { Perguntas } from "@/components/apresentacao/Perguntas";
import { Confiavel, PASSOS_CONFIAVEL } from "@/components/apresentacao/Confiavel";
import { Investimento, PASSOS_INVESTIMENTO, TOTAL } from "@/components/apresentacao/Investimento";
import { useMenosMovimento } from "@/components/apresentacao/useMenosMovimento";
import { AvisoMovimento, BotaoMovimento, Palco, useModoTelas, type Cena } from "@/components/apresentacao/Palco";
import { formatar, useIdioma, useT, type Bi } from "@/components/apresentacao/idioma";
import { BotaoIdioma } from "@/components/apresentacao/BotaoIdioma";

/** Barra de progresso no topo + pontos de navegação entre cenas (desktop, modo rolagem). */
const Navegacao = ({ nomes }: { nomes: Bi[] }) => {
  const t = useT();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.3 });
  const [atual, setAtual] = useState(1);
  const total = nomes.length;

  useEffect(() => {
    const secoes = Array.from({ length: total }, (_, i) => document.getElementById(`cena-${i + 1}`)).filter(
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
  }, [total]);

  // Setas ← → (e PageUp/PageDown) pulam de cena em cena, como no deck. Cenas com
  // data-paradas="N" (rolagem "grudada") ganham N paradas, uma por passo.
  const reduce = useMenosMovimento();
  const alvo = useRef<{ y: number; quando: number } | null>(null);
  useEffect(() => {
    const paradas = () => {
      const lista: number[] = [];
      for (let i = 0; i < total; i++) {
        const el = document.getElementById(`cena-${i + 1}`);
        if (!el) continue;
        // offsetTop ignora as transformações da transição entre cenas.
        let topo = 0;
        for (let p: HTMLElement | null = el; p; p = p.offsetParent as HTMLElement | null) topo += p.offsetTop;
        const n = Number(el.dataset.paradas ?? 1);
        const vh = window.innerHeight;
        const curso = el.offsetHeight - vh;
        if (n > 1 && curso > 0) {
          for (let k = 0; k < n; k++) lista.push(Math.round(topo + (curso * (k + 0.15)) / n));
        } else {
          lista.push(topo);
          // Cena mais alta que a tela: paradas extras para mostrar o resto do conteúdo.
          if (curso > vh * 0.08) {
            const passo = vh * 0.7;
            for (let y = topo + passo; y < topo + curso; y += passo) lista.push(Math.round(y));
            lista.push(Math.round(topo + curso));
          }
        }
      }
      // Ordena e junta paradas muito próximas (evita "pulinhos" de poucos pixels).
      const minimo = window.innerHeight * 0.2;
      // Mantém o início de cada cena; a última parada (fim da página) sempre fica.
      const ordenada = lista.sort((x, y) => x - y);
      const final: number[] = [];
      ordenada.forEach((v, i) => {
        const ultima = i === ordenada.length - 1;
        if (!final.length || v - final[final.length - 1] >= minimo) final.push(v);
        else if (ultima) final[final.length - 1] = v;
      });
      return final;
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(t.tagName))) return;
      const frente = e.key === "ArrowRight" || e.key === "PageDown";
      const tras = e.key === "ArrowLeft" || e.key === "PageUp";
      if (!frente && !tras) return;
      e.preventDefault();
      // Durante a rolagem suave, conta a partir do destino anterior (permite apertar várias vezes).
      const recente = alvo.current && performance.now() - alvo.current.quando < 900;
      const y = recente && alvo.current ? alvo.current.y : window.scrollY;
      const lista = paradas();
      const destino = frente
        ? lista.find((p) => p > y + 8)
        : [...lista].reverse().find((p) => p < y - 8);
      if (destino === undefined) return;
      alvo.current = { y: destino, quando: performance.now() };
      window.scrollTo({ top: destino, behavior: reduce ? "auto" : "smooth" });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [reduce, total]);

  return (
    <>
      <motion.div
        className="fixed inset-x-0 top-0 z-50 h-0.5 origin-left bg-gradient-to-r from-cyan-300 via-teal-300 to-sky-400"
        style={{ scaleX }}
        aria-hidden
      />
      <nav
        className="fixed right-5 top-1/2 z-40 hidden -translate-y-1/2 flex-col gap-3 lg:flex"
        aria-label={t(["Cenas da apresentação", "Presentation scenes"])}
      >
        {nomes.map((nome, i) => (
          <a
            key={nome[0]}
            href={`#cena-${i + 1}`}
            className="group flex items-center justify-end gap-3"
            aria-current={atual === i + 1 ? "step" : undefined}
          >
            <span className="pointer-events-none text-xs text-slate-300 opacity-0 transition-opacity group-hover:opacity-100">
              {t(nome)}
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

const PUBLICOS = [
  {
    icon: Building2,
    titulo: ["Gestão pública", "Public management"],
    texto: [
      "Mais pontos e mais frequência de dados para apoiar decisões sobre saneamento, outorga e fiscalização.",
      "More sites and more frequent data to support decisions on sanitation, water-use permits and enforcement.",
    ],
    link: "/dashboard",
    linkTexto: ["Ver o painel", "See the dashboard"],
  },
  {
    icon: FlaskConical,
    titulo: ["Pesquisa", "Research"],
    texto: [
      "Séries históricas e índices como IQA e IET, organizados por ponto e período para análise científica.",
      "Time series and indices such as the WQI and TSI, organised by site and period for scientific analysis.",
    ],
    link: "/indices",
    linkTexto: ["Ver os índices", "See the indices"],
  },
  {
    icon: Ship,
    titulo: ["Economia do mar", "Blue economy"],
    texto: [
      "Turismo, pesca e aquicultura dependem de água limpa: dado confiável vira valor econômico.",
      "Tourism, fishing and aquaculture depend on clean water: reliable data becomes economic value.",
    ],
    link: "/forum-economia-do-mar",
    linkTexto: ["Ver o caso do Fórum", "See the Forum case"],
  },
  {
    icon: Globe2,
    titulo: ["Agenda 2030", "2030 Agenda"],
    texto: [
      "Contribui para os ODS 6 (água potável e saneamento), 14 (vida na água) e 17 (parcerias).",
      "Contributes to SDGs 6 (clean water and sanitation), 14 (life below water) and 17 (partnerships).",
    ],
    link: "/agenda-2030",
    linkTexto: ["Ver a Agenda 2030", "See the 2030 Agenda"],
  },
] as const;

const ParaQuem = () => {
  const t = useT();
  return (
    <section
      id="cena-8"
      className="mx-auto flex min-h-[100svh] max-w-6xl flex-col justify-center px-6 py-16"
      aria-label={t(["Para quem e por que importa", "Who it is for and why it matters"])}
    >
      <Reveal>
        <SceneLabel index={8}>{t(["Para quem e por que importa", "Who it is for and why it matters"])}</SceneLabel>
        <h2 className="max-w-3xl text-3xl font-semibold leading-tight text-white sm:text-5xl">
          {t(["Um mesmo dado, quatro portas de valor.", "One dataset, four doors to value."])}
        </h2>
      </Reveal>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {PUBLICOS.map(({ icon: Icon, titulo, texto, link, linkTexto }, i) => (
          <Reveal key={link} delay={0.08 * i}>
            <div className="group flex h-full flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition-colors hover:border-cyan-300/40 hover:bg-white/[0.06]">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/15 text-cyan-200">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-semibold text-white">{t(titulo)}</h3>
              <p className="mt-2 flex-1 text-slate-300">{t(texto)}</p>
              <Link
                to={link}
                target="_blank"
                rel="noopener"
                className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-cyan-300 hover:text-cyan-200"
              >
                {t(linkTexto)}
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
};

// O título acadêmico vai junto do nome (Dr.); embaixo, o cargo e a instituição.
const EQUIPE: { papel: Bi; nome: string; linhas: Bi[] }[] = [
  {
    papel: ["Idealização e desenvolvimento", "Concept and development"],
    nome: "Vinícius Saraiva Santos",
    linhas: [
      ["Administração e Análise de Sistemas", "Systems Analysis and Administration"],
      ["Técnico em TI do IFBA, Campus Porto Seguro", "IT technician at IFBA, Porto Seguro campus"],
      ["Mestre em Ciências e Tecnologias Ambientais", "Master's in Environmental Sciences and Technologies"],
      ["Doutorando em Biossistemas pela UFSB", "PhD candidate in Biosystems at UFSB"],
    ],
  },
  {
    papel: ["Orientação científica", "Scientific supervision"],
    nome: "Dr. Fabrício Berton Zanchi",
    linhas: [
      ["Professor da UFSB", "Professor at UFSB (Federal University of Southern Bahia)"],
      ["Programa de Pós-Graduação em Biossistemas", "Graduate Program in Biosystems"],
      ["Vínculo de pesquisa: NuPEcoTropic", "Research group: NuPEcoTropic"],
    ],
  },
];

const TRAJETORIA: { fase: Bi; texto: Bi }[] = [
  { fase: ["TI", "IT"], texto: ["Experiência profissional", "Professional experience"] },
  { fase: ["Mestrado", "Master's"], texto: ["Construção da plataforma", "Building the platform"] },
  { fase: ["Doutorado", "PhD"], texto: ["Avaliação do ecossistema", "Evaluating the ecosystem"] },
];

const Equipe = () => {
  const reduce = useMenosMovimento();
  const t = useT();
  return (
    <section
      id="cena-9"
      className="mx-auto flex min-h-[100svh] max-w-6xl flex-col justify-center px-6 py-16"
      aria-label={t(["Equipe", "Team"])}
    >
      <Reveal>
        <SceneLabel index={9}>{t(["Equipe", "Team"])}</SceneLabel>
        <h2 className="text-3xl font-semibold leading-tight text-white sm:text-5xl">
          {t(["Tecnologia e pesquisa ambiental.", "Technology and environmental research."])}
        </h2>
      </Reveal>
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {EQUIPE.map((p, i) => (
          <Reveal key={p.nome} delay={0.1 * i}>
            <div className="h-full rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300/80">{t(p.papel)}</div>
              <div className="mt-3 text-2xl font-semibold text-white">{p.nome}</div>
              <ul className="mt-4 space-y-1.5 text-slate-300">
                {p.linhas.map((l) => (
                  <li key={l[0]}>{t(l)}</li>
                ))}
              </ul>
            </div>
          </Reveal>
        ))}
      </div>
      <div className="relative mt-10">
        <motion.div
          className="absolute left-0 right-0 top-1.5 h-0.5 origin-left bg-[#efb08c]"
          initial={reduce ? false : { scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true, margin: "-10% 0px" }}
          transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
          aria-hidden
        />
        <ol className="relative grid grid-cols-3 gap-4">
          {TRAJETORIA.map((f, i) => (
            <Reveal key={f.fase[0]} delay={0.3 + i * 0.25}>
              <li>
                <span className="block h-3.5 w-3.5 rounded-full bg-[#efb08c] ring-4 ring-[#062a3d]" aria-hidden />
                <div className="mt-4 font-semibold text-white sm:text-lg">{t(f.fase)}</div>
                <div className="text-sm text-slate-400">{t(f.texto)}</div>
              </li>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
};

// Cada investimento ligado a uma entrega concreta.
const RECURSOS: { titulo: Bi; texto: Bi }[] = [
  {
    titulo: ["Sonda automática", "Automatic probe"],
    texto: ["Medição contínua no rio, ao lado das coletas dos voluntários", "Continuous measurement in the river, alongside volunteer sampling"],
  },
  {
    titulo: ["Campo e logística", "Field and logistics"],
    texto: ["Novas campanhas e mais pontos acompanhados", "New campaigns and more sites monitored"],
  },
  {
    titulo: ["Tecnologia e IA", "Technology and AI"],
    texto: ["Registros mais completos e ferramentas avaliadas em uso real", "More complete records and tools evaluated in real use"],
  },
  {
    titulo: ["Validação e voluntários", "Validation and volunteers"],
    texto: ["Medições conferidas em laboratório e rede formada", "Lab-checked measurements and a trained network"],
  },
];

const ETAPAS_APOIO: { n: string; titulo: Bi; texto: Bi; evidencia: Bi }[] = [
  {
    n: "01",
    titulo: ["Pactuar", "Agree"],
    texto: ["Escolher a frente e dimensionar a etapa.", "Choose the area of support and size the stage."],
    evidencia: ["Plano de aplicação", "Spending plan"],
  },
  {
    n: "02",
    titulo: ["Preparar", "Prepare"],
    texto: ["Definir locais e métodos; adquirir materiais.", "Define sites and methods; purchase materials."],
    evidencia: ["Protocolos e aquisições", "Protocols and purchases"],
  },
  {
    n: "03",
    titulo: ["Medir e verificar", "Measure and verify"],
    texto: ["Executar as campanhas; conferir dados.", "Run the field campaigns; check the data."],
    evidencia: ["Registros documentados", "Documented records"],
  },
  {
    n: "04",
    titulo: ["Compartilhar", "Share"],
    texto: ["Produzir relatórios e devolutivas.", "Produce reports and share results back."],
    evidencia: ["Relatórios de execução", "Implementation reports"],
  },
];

const ProximosPassos = () => {
  const t = useT();
  return (
    <section
      id="cena-10"
      className="relative mx-auto flex min-h-[100svh] max-w-6xl flex-col justify-center px-6 py-16"
      aria-label={t(["A próxima etapa", "The next stage"])}
    >
      <Reveal>
        <SceneLabel index={10}>{t(["A próxima etapa", "The next stage"])}</SceneLabel>
        <h2 className="max-w-3xl text-3xl font-semibold leading-tight text-white sm:text-5xl">
          {t([
            "A próxima etapa: mais rios medidos, com mais tecnologia.",
            "The next stage: more rivers measured, with more technology.",
          ])}
        </h2>
        <p className="mt-4 max-w-2xl text-slate-300 sm:text-lg">
          {t([
            "A plataforma e o app já funcionam. O financiamento permite ampliar a coleta, com uma sonda automática ao lado das portáteis, e avaliar em condições reais de uso as soluções que a pesquisa está construindo.",
            "The platform and the app already work. The funding makes it possible to expand sampling, with an automatic probe alongside the portable ones, and to evaluate the solutions the research is building under real conditions of use.",
          ])}
        </p>
      </Reveal>

      <div className="mt-8 grid items-stretch gap-6 md:grid-cols-[1fr_1.1fr]">
        <div className="grid content-center gap-3">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300/80">
            {t(["O que o apoio viabiliza", "What the support makes possible"])}
          </div>
          {RECURSOS.map((r, i) => (
            <Reveal key={r.titulo[0]} delay={0.08 * i}>
              <div className="flex h-full items-baseline justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4">
                <span className="shrink-0 font-semibold text-white">{t(r.titulo)}</span>
                <span className="text-right text-sm text-slate-400">{t(r.texto)}</span>
              </div>
            </Reveal>
          ))}
        </div>
        <Sonda3D />
      </div>
    </section>
  );
};

const ComoApoiar = () => {
  const t = useT();
  const l = useIdioma();
  const total = formatar(TOTAL, l, 2);
  return (
    <section
      id="cena-12"
      className="relative flex min-h-[100svh] flex-col justify-center overflow-hidden py-16"
      aria-label={t(["Como apoiar", "How to support"])}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(70% 50% at 50% 100%, rgba(34,211,238,0.18), transparent 70%)" }}
        aria-hidden
      />
      <div className="relative mx-auto w-full max-w-6xl px-6">
        <Reveal>
          <SceneLabel index={12}>{t(["Como apoiar", "How to support"])}</SceneLabel>
          <h2 className="max-w-3xl text-3xl font-semibold leading-tight text-white sm:text-4xl">
            {t(["Um plano. Quatro etapas que podem ser conferidas.", "One plan. Four stages you can verify."])}
          </h2>
        </Reveal>
        <ol className="mt-6 grid gap-3 sm:grid-cols-2 md:grid-cols-4 md:gap-4">
          {ETAPAS_APOIO.map((e, i) => (
            <Reveal key={e.n} delay={0.1 * i}>
              <li className="h-full rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
                <div className="font-mono text-sm text-cyan-300">{e.n}</div>
                <div className="mt-1 text-lg font-semibold text-white">{t(e.titulo)}</div>
                <p className="mt-1 text-sm text-slate-300">{t(e.texto)}</p>
                <div className="mt-3 text-[11px] font-semibold uppercase tracking-wider text-[#efb08c]">
                  {t(["Evidência", "Evidence"])}
                </div>
                <div className="text-sm text-white">{t(e.evidencia)}</div>
              </li>
            </Reveal>
          ))}
        </ol>
        <p className="mt-3 text-xs text-slate-500">
          {t([
            "Cronograma, marcos e formalização pactuados conforme os procedimentos institucionais. Entregas condicionadas ao escopo aprovado; resultados científicos e impacto não são garantidos.",
            "Schedule, milestones and formal arrangements agreed according to institutional procedures. Deliverables depend on the approved scope; scientific results and impact are not guaranteed.",
          ])}
        </p>

        <Reveal delay={0.1}>
          <div className="mt-8 flex flex-col items-center gap-6 rounded-3xl border border-cyan-300/30 bg-gradient-to-br from-cyan-400/15 via-teal-400/10 to-transparent px-6 py-8 text-center md:flex-row md:justify-between md:px-10 md:text-left">
            <div>
              <h3 className="text-2xl font-semibold text-white sm:text-4xl">
                {t(["Vamos viabilizar a próxima etapa?", "Shall we make the next stage happen?"])}
              </h3>
              <p className="mt-3 max-w-xl text-slate-300">
                {t([
                  `Buscamos R$ ${total} para ampliar o monitoramento no território. Próximo passo: definir a frente de apoio e seu plano de aplicação.`,
                  `We are seeking R$ ${total} to expand monitoring in the region. Next step: choose the area of support and its spending plan.`,
                ])}
              </p>
            </div>
            <div className="flex shrink-0 flex-col items-center gap-3">
              <div className="rounded-2xl bg-[#f4f2ea] px-4 py-2.5">
                <img src="/apresentacao/logo-tikatu.webp" alt="Tikatu" className="h-8 w-auto" />
              </div>
              <a
                href="https://www.tikatu.com.br"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-cyan-300 px-6 py-3 font-semibold text-slate-950 transition-colors hover:bg-cyan-200"
              >
                {t(["Conhecer o Tikatu", "Visit Tikatu"])}
                <ArrowUpRight className="h-4 w-4" />
              </a>
              <a href="mailto:contato@tikatu.com.br" className="text-sm text-cyan-100/90 underline-offset-4 hover:underline">
                contato@tikatu.com.br
              </a>
            </div>
          </div>
        </Reveal>

        <p className="mt-6 text-center text-xs text-slate-500">
          {t([
            "Proposta de financiamento de pesquisa aplicada. Não representa oferta de serviço contratado.",
            "Funding proposal for applied research. Not an offer of contracted services.",
          ])}
        </p>
      </div>
    </section>
  );
};

// Roteiro: o que já existe → onde e com que frequência medir → como conferir e explicar →
// como chega ao campo e às pessoas → equipe → o que o financiamento permite.
const TELAS: Cena[] = [
  { nome: ["Abertura", "Opening"], el: <Hero />, cheia: true },
  { nome: ["O que já existe", "What already exists"], el: <AoVivo />, transicao: "mare" },
  { nome: ["As perguntas", "The questions"], el: <Perguntas />, transicao: "cortina" },
  { nome: ["Com que frequência", "How often"], el: <Amostragem />, transicao: "deslizar" },
  { nome: ["Informação confiável", "Reliable information"], el: <Confiavel />, passos: PASSOS_CONFIAVEL, transicao: "mergulho" },
  { nome: ["Como funciona", "How it works"], el: <Fluxo />, passos: PASSOS_FLUXO, transicao: "deslizar" },
  { nome: ["App de coleta", "Sampling app"], el: <AppColeta />, transicao: "mare" },
  { nome: ["Para quem", "Who it is for"], el: <ParaQuem />, transicao: "iris" },
  { nome: ["Equipe", "Team"], el: <Equipe />, transicao: "cortina" },
  { nome: ["Próxima etapa", "Next stage"], el: <ProximosPassos />, transicao: "mare" },
  { nome: ["O investimento", "The investment"], el: <Investimento />, passos: PASSOS_INVESTIMENTO, transicao: "mergulho" },
  { nome: ["Como apoiar", "How to support"], el: <ComoApoiar />, transicao: "iris" },
];

const Apresentacao = () => {
  const reduce = useMenosMovimento();
  const telas = useModoTelas();
  const l = useIdioma();
  const t = useT();

  // Rolagem suave só para os links internos (#cena-N) e só sem prefers-reduced-motion.
  useEffect(() => {
    if (telas) return;
    const html = document.documentElement;
    const anterior = html.style.scrollBehavior;
    if (!reduce) html.style.scrollBehavior = "smooth";
    return () => {
      html.style.scrollBehavior = anterior;
    };
  }, [reduce, telas]);

  return (
    <>
      <Helmet>
        <html lang={l === "en" ? "en" : "pt-BR"} />
        <title>{t(["Tikatu · Apresentação", "Tikatu · Presentation"])}</title>
        <meta name="robots" content="noindex, nofollow" />
        <meta
          name="description"
          content={t([
            "Tikatu: apoio à próxima etapa da pesquisa em qualidade da água.",
            "Tikatu: support for the next stage of water quality research.",
          ])}
        />
        <meta name="theme-color" content="#021019" />
      </Helmet>
      <div className="min-h-screen bg-[#062a3d] font-sans text-slate-100 antialiased selection:bg-cyan-300/30">
        {telas ? (
          // Telas largas: uma cena por tela, trocando de lado (setas, roda do mouse, gesto).
          <Palco cenas={TELAS} />
        ) : (
          <>
            <Navegacao nomes={TELAS.map((c) => c.nome)} />
            <main className="overflow-x-clip">
              <div className="bg-gradient-to-b from-[#021019] via-[#04202f] to-[#062a3d]">
                <Hero />
              </div>
              {TELAS.slice(1).map((c) =>
                // Fluxo é "grudado" na rolagem: sem transição para não interferir no sticky.
                c.passos ? <div key={c.nome[0]}>{c.el}</div> : <Transicao key={c.nome[0]}>{c.el}</Transicao>,
              )}
            </main>
            <div className="fixed bottom-3 left-3 z-40 flex items-center gap-1 rounded-full border border-white/10 bg-[#021019]/70 py-0.5 pl-0.5 backdrop-blur">
              <BotaoIdioma className="border-0" />
              <BotaoMovimento />
            </div>
          </>
        )}
        <AvisoMovimento />
      </div>
    </>
  );
};

export default Apresentacao;
