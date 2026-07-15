import { useState } from "react";
import { Helmet } from "react-helmet-async";
import ForumHeader from "@/components/forum/ForumHeader";
import ForumHero from "@/components/forum/ForumHero";
import ScenarioSelector from "@/components/forum/ScenarioSelector";
import CollectionPanel from "@/components/forum/CollectionPanel";
import AnalysisPanel from "@/components/forum/AnalysisPanel";
import BlueEconomySection from "@/components/forum/BlueEconomySection";
import HowItWorks from "@/components/forum/HowItWorks";
import AIRoleSection from "@/components/forum/AIRoleSection";
import AppliedResearch from "@/components/forum/AppliedResearch";
import Publication from "@/components/forum/Publication";
import Team from "@/components/forum/Team";
import ContactFooter from "@/components/forum/ContactFooter";
import { FORUM_SCENARIOS, type ForumScenario } from "@/data/forumScenarios";

const ForumEconomiaDoMar = () => {
  const [scenario, setScenario] = useState<ForumScenario>(FORUM_SCENARIOS[0]);

  return (
    <>
      <Helmet>
        <title>Tikatu no Fórum de Economia do Mar de Porto Seguro</title>
        <meta
          name="description"
          content="Demonstração interativa do Tikatu, projeto de pesquisa aplicada em inteligência artificial e monitoramento da qualidade da água."
        />
        <link rel="canonical" href="/forum-economia-do-mar" />
        <meta
          property="og:title"
          content="Tikatu no Fórum de Economia do Mar de Porto Seguro"
        />
        <meta
          property="og:description"
          content="Demonstração interativa do Tikatu, projeto de pesquisa aplicada em inteligência artificial e monitoramento da qualidade da água."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="/forum-economia-do-mar" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="Tikatu no Fórum de Economia do Mar de Porto Seguro"
        />
        <meta
          name="twitter:description"
          content="Demonstração interativa do Tikatu, projeto de pesquisa aplicada em inteligência artificial e monitoramento da qualidade da água."
        />
      </Helmet>

      <div className="min-h-screen bg-background text-foreground">
        <ForumHeader />
        <main>
          <ForumHero />

          <section id="coleta" className="mx-auto max-w-6xl px-4 py-14">
            <h2 className="text-2xl font-semibold sm:text-3xl">
              Escolha uma coleta para explorar
            </h2>
            <p className="mt-2 max-w-3xl text-sm text-muted-foreground sm:text-base">
              Selecione um cenário para atualizar os dados, o gráfico, o mapa e
              a análise abaixo.
            </p>
            <div className="mt-6">
              <ScenarioSelector
                selectedId={scenario.id}
                onSelect={setScenario}
              />
            </div>

            <div className="mt-8">
              <CollectionPanel scenario={scenario} />
            </div>

            <div className="mt-8">
              <AnalysisPanel scenario={scenario} />
            </div>
          </section>

          <BlueEconomySection />
          <HowItWorks />
          <AIRoleSection />
          <AppliedResearch />
          <Publication />
          <Team />
          <ContactFooter />
        </main>
      </div>
    </>
  );
};

export default ForumEconomiaDoMar;
