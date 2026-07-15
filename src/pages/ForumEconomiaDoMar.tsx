import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import ForumHeader from "@/components/forum/ForumHeader";
import ForumHero from "@/components/forum/ForumHero";
import ScenarioFilters, { type FilterState } from "@/components/forum/ScenarioFilters";
import ExplorerPanel from "@/components/forum/ExplorerPanel";
import AnalysisPanel from "@/components/forum/AnalysisPanel";
import BlueEconomySection from "@/components/forum/BlueEconomySection";
import HowItWorks from "@/components/forum/HowItWorks";
import AIRoleSection from "@/components/forum/AIRoleSection";
import AppliedResearch from "@/components/forum/AppliedResearch";
import Publication from "@/components/forum/Publication";
import Team from "@/components/forum/Team";
import ContactFooter from "@/components/forum/ContactFooter";
import EnvironmentalQuiz from "@/components/education/EnvironmentalQuiz";
import RiverChallenge from "@/components/education/RiverChallenge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, WavesIcon, BrainIcon } from "lucide-react";
import {
  FORUM_POINTS,
  FORUM_PARAMETERS,
  FORUM_READINGS,
  FORUM_DATE_MIN,
  FORUM_DATE_MAX,
} from "@/data/forumDataset";

const defaultFilters = (): FilterState => ({
  pointIds: [],
  parameterCodes: [FORUM_PARAMETERS[0].code],
  dateFrom: new Date(FORUM_DATE_MIN + "T00:00:00"),
  dateTo: new Date(FORUM_DATE_MAX + "T00:00:00"),
});

const ForumEconomiaDoMar = () => {
  const [filters, setFilters] = useState<FilterState>(defaultFilters);

  useEffect(() => {
    setFilters(defaultFilters());
  }, []);

  const filteredReadings = useMemo(() => {
    const fromMs = filters.dateFrom.getTime();
    const toMs = filters.dateTo.getTime();
    return FORUM_READINGS.filter((r) => {
      if (!filters.pointIds.includes(r.pointId)) return false;
      const t = new Date(r.date + "T00:00:00").getTime();
      return t >= fromMs && t <= toMs;
    });
  }, [filters]);

  return (
    <>
      <Helmet>
        <title>Tikatu no Fórum de Economia do Mar de Porto Seguro</title>
        <meta
          name="description"
          content="Painel interativo do Tikatu: filtre pontos, período e parâmetros, veja mapa e gráfico em tempo real e gere análise com IA."
        />
        <link rel="canonical" href="/forum-economia-do-mar" />
        <meta property="og:title" content="Tikatu no Fórum de Economia do Mar de Porto Seguro" />
        <meta
          property="og:description"
          content="Painel interativo do Tikatu: filtre pontos, período e parâmetros, veja mapa e gráfico em tempo real e gere análise com IA."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="/forum-economia-do-mar" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>

      <div className="min-h-screen overflow-x-hidden bg-background text-foreground">
        <ForumHeader />
        <main>
          <ForumHero />

          <section id="coleta" className="mx-auto max-w-6xl px-4 py-14">
            <h2 className="text-2xl font-semibold sm:text-3xl">
              Explore as coletas em tempo real
            </h2>
            <p className="mt-2 max-w-3xl text-sm text-muted-foreground sm:text-base">
              Ajuste os filtros e veja o mapa, o gráfico e os cards reagirem à sua seleção.
              Depois, gere uma análise com IA baseada nos dados filtrados.
            </p>

            <div className="mt-6">
              <ScenarioFilters
                value={filters}
                onChange={setFilters}
                onReset={() => setFilters(defaultFilters())}
              />
            </div>

            <div className="mt-6">
              <ExplorerPanel
                filteredReadings={filteredReadings}
                activePointIds={filters.pointIds}
                activeParameterCodes={filters.parameterCodes}
                dateFrom={filters.dateFrom}
                dateTo={filters.dateTo}
                onResetFilters={() => setFilters(defaultFilters())}
              />
            </div>

            <div className="mt-8">
              <AnalysisPanel
                filteredReadings={filteredReadings}
                activeParameterCodes={filters.parameterCodes}
                dateFrom={filters.dateFrom}
                dateTo={filters.dateTo}
              />
            </div>
          </section>

          <BlueEconomySection />
          <HowItWorks />
          <AIRoleSection />
          <AppliedResearch />
          <Publication />

          <section id="jogos" className="mx-auto max-w-6xl px-4 py-14">
            <div className="mb-6 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" aria-hidden />
              <h2 className="text-2xl font-semibold sm:text-3xl">
                Aprenda brincando com os jogos Tikatu
              </h2>
            </div>
            <p className="mb-8 max-w-3xl text-sm text-muted-foreground sm:text-base">
              Escolha um dos jogos abaixo para testar seus conhecimentos e explorar os
              desafios da gestão da água de forma interativa.
            </p>

            <div className="grid gap-6 sm:grid-cols-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Card className="group cursor-pointer transition hover:border-primary hover:shadow-lg">
                    <CardContent className="flex flex-col items-start gap-4 p-6">
                      <div className="rounded-lg bg-primary/10 p-3 text-primary">
                        <BrainIcon className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">Quiz Ambiental</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Responda perguntas sobre qualidade da água, pH, DBO e outros
                          parâmetros ambientais.
                        </p>
                      </div>
                      <span className="text-sm font-medium text-primary group-hover:underline">
                        Jogar agora →
                      </span>
                    </CardContent>
                  </Card>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Quiz Ambiental Tikatu</DialogTitle>
                  </DialogHeader>
                  <EnvironmentalQuiz />
                </DialogContent>
              </Dialog>

              <Dialog>
                <DialogTrigger asChild>
                  <Card className="group cursor-pointer transition hover:border-primary hover:shadow-lg">
                    <CardContent className="flex flex-col items-start gap-4 p-6">
                      <div className="rounded-lg bg-primary/10 p-3 text-primary">
                        <WavesIcon className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">Desafio do Rio</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Assuma o papel de gestor ambiental e tome decisões que impactam
                          a saúde do rio e da comunidade.
                        </p>
                      </div>
                      <span className="text-sm font-medium text-primary group-hover:underline">
                        Jogar agora →
                      </span>
                    </CardContent>
                  </Card>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Desafio do Rio</DialogTitle>
                  </DialogHeader>
                  <RiverChallenge />
                </DialogContent>
              </Dialog>
            </div>
          </section>

          <Team />
          <ContactFooter />
        </main>
      </div>
    </>
  );
};

export default ForumEconomiaDoMar;
