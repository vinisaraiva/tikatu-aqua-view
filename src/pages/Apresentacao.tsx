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
import { Perguntas } from "@/components/apresentacao/Perguntas";
import { Metas } from "@/components/apresentacao/Metas";
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
        className="fixed inset-x-0 top-0 z-50 h-0.5 origin-left bg-gradient-to-r from-tk-rio via-tk-rio-claro to-tk-terra-clara"
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
            <span className="pointer-events-none text-xs text-tk-nevoa opacity-0 transition-opacity group-hover:opacity-100">
              {t(nome)}
            </span>
            <span
              className={`block rounded-full transition-all duration-300 ${
                atual === i + 1 ? "h-2.5 w-2.5 bg-tk-rio-claro" : "h-1.5 w-1.5 bg-white/30 group-hover:bg-white/60"
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
    titulo: ["Pesquisa e parcerias", "Research and partnerships"],
    texto: [
      "Grupos de pesquisa podem pedir parceria para usar o app e a API, e passam a ter seus dados num repositório aberto, com painel e índices.",
      "Research groups can request a partnership to use the app and the API, and get their data in an open repository, with dashboard and indices.",
    ],
    link: "/indices",
    linkTexto: ["Ver os índices", "See the indices"],
  },
  {
    icon: Ship,
    titulo: ["Economia do mar", "Blue economy"],
    texto: [
      "O extremo sul é um dos principais polos turísticos da Bahia e do Nordeste. Quanto mais dados e projetos reunidos, mais dá para estudar como o turismo e a expansão hoteleira afetam os rios.",
      "The far south of Bahia is one of the leading tourist hubs in Bahia and the Northeast. The more data and projects brought together, the better we can study how tourism and hotel expansion affect the rivers.",
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
        <h2 className="max-w-3xl text-3xl font-semibold leading-tight text-tk-creme sm:text-5xl">
          {t(["Um mesmo dado, quatro portas de valor.", "One dataset, four doors to value."])}
        </h2>
      </Reveal>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {PUBLICOS.map(({ icon: Icon, titulo, texto, link, linkTexto }, i) => (
          <Reveal key={link} delay={0.08 * i}>
            <div className="group flex h-full flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition-colors hover:border-tk-rio-claro/40 hover:bg-white/[0.06]">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-tk-rio-claro/15 text-tk-rio-claro">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-semibold text-tk-creme">{t(titulo)}</h3>
              <p className="mt-2 flex-1 text-tk-nevoa">{t(texto)}</p>
              <Link
                to={link}
                target="_blank"
                rel="noopener"
                className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-tk-rio-claro hover:text-tk-rio-claro"
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
        <h2 className="text-3xl font-semibold leading-tight text-tk-creme sm:text-5xl">
          {t(["Tecnologia e pesquisa ambiental.", "Technology and environmental research."])}
        </h2>
      </Reveal>
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {EQUIPE.map((p, i) => (
          <Reveal key={p.nome} delay={0.1 * i}>
            <div className="h-full rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-tk-rio-claro/80">{t(p.papel)}</div>
              <div className="mt-3 text-2xl font-semibold text-tk-creme">{p.nome}</div>
              <ul className="mt-4 space-y-1.5 text-tk-nevoa">
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
                <span className="block h-3.5 w-3.5 rounded-full bg-[#efb08c] ring-4 ring-[#0d3a5c]" aria-hidden />
                <div className="mt-4 font-semibold text-tk-creme sm:text-lg">{t(f.fase)}</div>
                <div className="text-sm text-tk-nevoa/75">{t(f.texto)}</div>
              </li>
            </Reveal>
          ))}
        </ol>
      </div>

      {/* Quem está por trás: universidade, projeto e grupo de pesquisa (o NuPEcoTropic não tem logo). */}
      <Reveal delay={0.9}>
        <div className="mt-10 flex flex-wrap items-center gap-4 border-t border-white/10 pt-6">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-tk-nevoa/75">
            {t(["Realização", "Carried out by"])}
          </span>
          <img
            src="/apresentacao/logo-ufsb.webp"
            alt={t(["UFSB, Universidade Federal do Sul da Bahia", "UFSB, Federal University of Southern Bahia"])}
            className="h-12 w-auto rounded-lg"
          />
          <span className="rounded-lg bg-[#f4f2ea] px-3 py-2">
            <img src="/apresentacao/logo-tikatu.webp" alt="Tikatu" className="h-8 w-auto" />
          </span>
          <span className="rounded-lg border border-white/15 px-4 py-2.5 text-tk-creme">
            <span className="block text-lg font-semibold leading-none">NuPEcoTropic</span>
            <span className="mt-1 block text-[11px] text-tk-nevoa/75">{t(["Grupo de pesquisa", "Research group"])}</span>
          </span>
        </div>
      </Reveal>
    </section>
  );
};

// Cronograma de 12 meses (metas enviadas pelo Vinícius em 11/11/2026).
const ETAPAS_APOIO: { n: Bi; titulo: Bi; texto: Bi; evidencia: Bi }[] = [
  {
    n: ["Meses 1–2", "Months 1–2"],
    titulo: ["Implantar", "Set up"],
    texto: [
      "Aquisições, instalação da sonda automática e integração pela API, seleção e formação dos bolsistas, oficina com a comunidade e reconhecimento dos locais.",
      "Purchasing, automatic probe installation and API integration, selecting and training the fellows, a community workshop and site reconnaissance.",
    ],
    evidencia: ["Equipamentos e protocolos", "Equipment and protocols"],
  },
  {
    n: ["Meses 3–12", "Months 3–12"],
    titulo: ["Monitorar", "Monitor"],
    texto: [
      "10 ciclos mensais dos bolsistas nos 8 pontos (20 saídas, mais 4 de reserva); sonda automática enviando dados sem parar.",
      "10 monthly cycles by the fellows at the 8 sites (20 trips, plus 4 in reserve); automatic probe sending data non-stop.",
    ],
    evidencia: ["80 registros + série contínua", "80 records + continuous series"],
  },
  {
    n: ["Ao longo da execução", "Throughout"],
    titulo: ["Controlar a qualidade", "Quality control"],
    texto: [
      "Sondas calibradas; análises de laboratório quando o protocolo pedir; leituras portáteis ao lado da sonda automática nas visitas de manutenção.",
      "Calibrated probes; laboratory analyses when the protocol calls for them; portable readings next to the automatic probe during maintenance visits.",
    ],
    evidencia: ["Calibrações e até 36 amostras", "Calibrations and up to 36 samples"],
  },
  {
    n: ["Mensal e bimestral", "Monthly and bimonthly"],
    titulo: ["Informar e prestar contas", "Inform and report"],
    texto: [
      "Boletins para a comunidade e relatórios para gestores, gerados pela plataforma com IA; os de gestores são revisados por um especialista. No fim, o relatório final.",
      "Bulletins for the community and reports for decision-makers, generated by the platform with AI; those for decision-makers are reviewed by a specialist. At the end, the final report.",
    ],
    evidencia: ["10 boletins, 5 relatórios e relatório final", "10 bulletins, 5 reports and a final report"],
  },
];

const ComoApoiar = () => {
  const t = useT();
  const l = useIdioma();
  const total = formatar(TOTAL, l, 2);
  return (
    <section
      id="cena-12"
      className="relative flex min-h-[100svh] flex-col justify-center overflow-hidden py-8"
      aria-label={t(["Como apoiar", "How to support"])}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(70% 50% at 50% 100%, rgba(27,127,192,0.18), transparent 70%)" }}
        aria-hidden
      />
      <div className="relative mx-auto w-full max-w-7xl px-6">
        <Reveal>
          <SceneLabel index={12}>{t(["Como apoiar", "How to support"])}</SceneLabel>
          <h2 className="text-3xl font-semibold leading-tight text-tk-creme sm:text-4xl">
            {t(["Um plano de 12 meses, com etapas que podem ser conferidas.", "A 12-month plan, with stages you can verify."])}
          </h2>
        </Reveal>
        <ol className="mt-5 grid gap-3 sm:grid-cols-2 md:grid-cols-4 md:gap-4">
          {ETAPAS_APOIO.map((e, i) => (
            <Reveal key={e.n[0]} delay={0.1 * i}>
              <li className="h-full rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
                <div className="font-mono text-sm text-tk-rio-claro">{t(e.n)}</div>
                <div className="mt-1 text-lg font-semibold text-tk-creme">{t(e.titulo)}</div>
                <p className="mt-1 text-sm text-tk-creme/90 sm:text-base">{t(e.texto)}</p>
                <div className="mt-3 text-xs font-semibold uppercase tracking-wider text-[#efb08c]">
                  {t(["Evidência", "Evidence"])}
                </div>
                <div className="text-sm text-tk-creme sm:text-base">{t(e.evidencia)}</div>
              </li>
            </Reveal>
          ))}
        </ol>
        <p className="mt-4 text-sm text-tk-creme/90 sm:text-base">
          <span className="font-semibold text-tk-creme">{t(["Depois dos 12 meses, ", "After the 12 months, "])}</span>
          {t([
            "a plataforma, o app, a API e a biblioteca tikatuwq continuam gratuitos e no ar, e os dados seguem disponíveis. O apoio amplia o que já existe.",
            "the platform, the app, the API and the tikatuwq library remain free and online, and the data stays available. The support expands what already exists.",
          ])}
        </p>

        <Reveal delay={0.1}>
          <div className="mt-5 flex flex-col items-center gap-6 rounded-3xl border border-tk-terra-clara/40 bg-gradient-to-br from-tk-terra/25 via-tk-rio/10 to-transparent px-6 py-5 text-center md:flex-row md:justify-between md:px-10 md:text-left">
            <div>
              <h3 className="text-2xl font-semibold text-tk-creme sm:text-3xl">
                {t(["Vamos viabilizar a próxima etapa?", "Shall we make the next stage happen?"])}
              </h3>
              <p className="mt-2 max-w-3xl text-tk-creme/90 sm:text-lg">
                {t([
                  `Buscamos R$ ${total} para 12 meses de pesquisa no território.`,
                  `We are seeking R$ ${total} for 12 months of research in the region.`,
                ])}
              </p>
              <p className="mt-2 max-w-3xl font-medium text-tk-nevoa">
                {t([
                  "O valor é uma referência. Se o apoio possível for menor, adaptamos o plano de campo para aproveitar ao máximo cada recurso; se for maior, ampliamos, por exemplo com um terceiro rio ou mais bolsistas. Em qualquer cenário, a plataforma segue completa e aberta.",
                  "The amount is a reference. If the support available is smaller, we adapt the field plan to make the most of every resource; if it is larger, we expand, for example with a third river or more fellows. In any scenario, the platform remains complete and open.",
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
                className="inline-flex items-center gap-2 rounded-full bg-tk-terra px-6 py-3 font-semibold text-tk-creme transition-colors hover:bg-[#d9683a]"
              >
                {t(["Conhecer o Tikatu", "Visit Tikatu"])}
                <ArrowUpRight className="h-4 w-4" />
              </a>
              <a href="mailto:contato@tikatu.com.br" className="text-sm text-tk-nevoa/90 underline-offset-4 hover:underline">
                contato@tikatu.com.br
              </a>
            </div>
          </div>
        </Reveal>

        <p className="mt-4 text-center text-xs text-tk-nevoa/75">
          {t([
            "Metas propostas; formalização conforme os procedimentos institucionais. Resultados científicos e impacto não são garantidos. Proposta de financiamento de pesquisa aplicada; não representa oferta de serviço contratado.",
            "Proposed targets; formal arrangements follow institutional procedures. Scientific results and impact are not guaranteed. Funding proposal for applied research; not an offer of contracted services.",
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
  { nome: ["Próxima etapa", "Next stage"], el: <Metas />, transicao: "mare" },
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
        <meta name="theme-color" content="#072740" />
      </Helmet>
      <div className="min-h-screen bg-[#0d3a5c] font-sans text-tk-creme antialiased selection:bg-tk-rio-claro/30">
        {telas ? (
          // Telas largas: uma cena por tela, trocando de lado (setas, roda do mouse, gesto).
          <Palco cenas={TELAS} />
        ) : (
          <>
            <Navegacao nomes={TELAS.map((c) => c.nome)} />
            <main className="overflow-x-clip">
              <div className="bg-gradient-to-b from-[#0a2f4c] to-[#0d3a5c]">
                <Hero />
              </div>
              {TELAS.slice(1).map((c) =>
                // Fluxo é "grudado" na rolagem: sem transição para não interferir no sticky.
                c.passos ? <div key={c.nome[0]}>{c.el}</div> : <Transicao key={c.nome[0]}>{c.el}</Transicao>,
              )}
            </main>
            <div className="fixed bottom-3 left-3 z-40 flex items-center gap-1 rounded-full border border-white/10 bg-[#072740]/70 py-0.5 pl-0.5 backdrop-blur">
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
