import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, MapPin, Layers, Database } from "lucide-react";
import type { ForumScenario } from "@/data/forumScenarios";
import ParameterCard from "./ParameterCard";
import ForumMiniMap from "./ForumMiniMap";
import ForumChart from "./ForumChart";

const formatDate = (iso: string) =>
  new Date(iso + "T00:00:00").toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

const CollectionPanel = ({ scenario }: { scenario: ForumScenario }) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle className="text-xl">{scenario.pointName}</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                {scenario.river} · {scenario.environment}
              </p>
            </div>
            <span className="rounded-full border border-border bg-muted px-2.5 py-1 text-xs text-muted-foreground">
              Dados {scenario.originTag}
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
            <div className="flex items-start gap-2">
              <CalendarDays className="mt-0.5 h-4 w-4 text-primary" aria-hidden />
              <div>
                <dt className="text-xs text-muted-foreground">Data</dt>
                <dd className="font-medium">{formatDate(scenario.date)}</dd>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Layers className="mt-0.5 h-4 w-4 text-primary" aria-hidden />
              <div>
                <dt className="text-xs text-muted-foreground">Período</dt>
                <dd className="font-medium">{scenario.season}</dd>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 text-primary" aria-hidden />
              <div>
                <dt className="text-xs text-muted-foreground">Ambiente</dt>
                <dd className="font-medium">{scenario.environment}</dd>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Database className="mt-0.5 h-4 w-4 text-primary" aria-hidden />
              <div>
                <dt className="text-xs text-muted-foreground">Parâmetros</dt>
                <dd className="font-medium">{scenario.parameters.length}</dd>
              </div>
            </div>
          </dl>

          <div className="grid gap-4 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <ForumMiniMap
                lat={scenario.coordinates.lat}
                lng={scenario.coordinates.lng}
                label={scenario.pointName}
              />
              <p className="mt-2 text-xs text-muted-foreground">
                Origem: {scenario.origin}
              </p>
            </div>
            <div className="lg:col-span-3">
              <ForumChart
                parameters={scenario.parameters}
                parametersAlt={scenario.parametersAlt}
                altLabel={scenario.altLabel}
              />
              <p className="mt-2 text-center text-xs text-muted-foreground">
                Valores normalizados em relação ao critério adotado como referência.
                Cores indicam a situação técnica de cada parâmetro.
              </p>
            </div>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold text-foreground">
              Parâmetros avaliados
            </h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {scenario.parameters.map((p) => (
                <ParameterCard key={p.code} p={p} />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CollectionPanel;
