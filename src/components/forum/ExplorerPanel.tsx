import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays, MapPin, Layers, Database } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import ForumMap, { type MapPoint } from "./ForumMap";
import ForumChart, { type ChartRow } from "./ForumChart";
import ParameterCard from "./ParameterCard";
import type { ScenarioParameter } from "@/data/forumScenarios";
import { FORUM_POINTS, FORUM_PARAMETERS, type Reading } from "@/data/forumDataset";

interface Props {
  filteredReadings: Reading[];
  activePointIds: string[];
  activeParameterCodes: string[];
  dateFrom: Date;
  dateTo: Date;
  onResetFilters: () => void;
}

const aggregate = (
  readings: Reading[],
  activeCodes: string[],
): { chartRows: ChartRow[]; cards: (ScenarioParameter & { min: number; max: number; count: number })[] } => {
  const specs = FORUM_PARAMETERS.filter((p) => activeCodes.includes(p.code));
  const chartRows: ChartRow[] = [];
  const cards: (ScenarioParameter & { min: number; max: number; count: number })[] = [];

  for (const spec of specs) {
    const values: number[] = [];
    const statuses: ScenarioParameter["status"][] = [];
    let description = spec.description;
    let unit = spec.unit;

    for (const r of readings) {
      const p = r.parameters.find((x) => x.code === spec.code);
      if (!p) continue;
      values.push(p.value);
      statuses.push(p.status);
      description = p.description;
      unit = p.unit;
    }

    if (values.length === 0) continue;

    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const rounded = Number(avg.toFixed(spec.code === "colif" || spec.code === "cond" ? 0 : 2));

    // status agregado: pior status entre as leituras
    const priority: Record<ScenarioParameter["status"], number> = {
      "Requer atenção": 3,
      "Requer acompanhamento": 2,
      "Não avaliado": 1,
      "Condição adequada": 0,
      "Dentro da faixa adotada": 0,
    };
    const worst = statuses.reduce((acc, s) => (priority[s] > priority[acc] ? s : acc), statuses[0]);

    // Referência p/ normalização
    let ref = spec.conamaMax ?? undefined;
    if (!ref && spec.conamaMin) ref = spec.conamaMin * 2;
    if (!ref) ref = max || 1;

    chartRows.push({
      code: spec.code,
      name: spec.name,
      avg: rounded,
      min: Number(min.toFixed(2)),
      max: Number(max.toFixed(2)),
      unit,
      conamaMax: spec.conamaMax,
      conamaMin: spec.conamaMin,
      status: worst,
      normalized: Number(((avg / ref) * 100).toFixed(1)),
      count: values.length,
    });

    cards.push({
      code: spec.code,
      name: spec.name,
      value: rounded,
      unit,
      conamaMin: spec.conamaMin,
      conamaMax: spec.conamaMax,
      status: worst,
      description,
      min: Number(min.toFixed(2)),
      max: Number(max.toFixed(2)),
      count: values.length,
    });
  }

  return { chartRows, cards };
};

const worstStatusToMapStatus = (readings: Reading[]): MapPoint["status"] => {
  if (readings.length === 0) return "empty";
  let hasAttention = false;
  let hasWarn = false;
  for (const r of readings) {
    for (const p of r.parameters) {
      if (p.status === "Requer atenção") hasAttention = true;
      else if (p.status === "Requer acompanhamento") hasWarn = true;
    }
  }
  if (hasAttention) return "attention";
  if (hasWarn) return "warn";
  return "ok";
};

const ExplorerPanel = ({
  filteredReadings,
  activePointIds,
  activeParameterCodes,
  dateFrom,
  dateTo,
  onResetFilters,
}: Props) => {
  const uniquePointIds = Array.from(new Set(filteredReadings.map((r) => r.pointId)));

  const mapPoints: MapPoint[] = FORUM_POINTS.filter((p) => activePointIds.includes(p.id)).map(
    (p) => {
      const rs = filteredReadings.filter((r) => r.pointId === p.id);
      return {
        id: p.id,
        lat: p.coordinates.lat,
        lng: p.coordinates.lng,
        label: p.name,
        sublabel: `${p.river} · ${p.environment}`,
        status: worstStatusToMapStatus(rs),
        readingsCount: rs.length,
      };
    },
  );

  const { chartRows, cards } = aggregate(filteredReadings, activeParameterCodes);

  const empty = filteredReadings.length === 0;

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="text-xl">Painel exploratório</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              {filteredReadings.length} coleta{filteredReadings.length === 1 ? "" : "s"} ·{" "}
              {uniquePointIds.length} ponto{uniquePointIds.length === 1 ? "" : "s"} ·{" "}
              {format(dateFrom, "dd/MM/yy", { locale: ptBR })} a{" "}
              {format(dateTo, "dd/MM/yy", { locale: ptBR })}
            </p>
          </div>
          <span className="rounded-full border border-border bg-muted px-2.5 py-1 text-xs text-muted-foreground">
            Dados adaptado
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
          <div className="flex items-start gap-2">
            <CalendarDays className="mt-0.5 h-4 w-4 text-primary" aria-hidden />
            <div>
              <dt className="text-xs text-muted-foreground">Período</dt>
              <dd className="font-medium">
                {format(dateFrom, "dd/MM", { locale: ptBR })} –{" "}
                {format(dateTo, "dd/MM/yy", { locale: ptBR })}
              </dd>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <MapPin className="mt-0.5 h-4 w-4 text-primary" aria-hidden />
            <div>
              <dt className="text-xs text-muted-foreground">Pontos</dt>
              <dd className="font-medium">
                {uniquePointIds.length} / {FORUM_POINTS.length}
              </dd>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Database className="mt-0.5 h-4 w-4 text-primary" aria-hidden />
            <div>
              <dt className="text-xs text-muted-foreground">Coletas</dt>
              <dd className="font-medium">{filteredReadings.length}</dd>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Layers className="mt-0.5 h-4 w-4 text-primary" aria-hidden />
            <div>
              <dt className="text-xs text-muted-foreground">Parâmetros</dt>
              <dd className="font-medium">
                {activeParameterCodes.length} / {FORUM_PARAMETERS.length}
              </dd>
            </div>
          </div>
        </dl>

        {empty ? (
          <div className="rounded-lg border border-dashed border-border p-8 text-center">
            <p className="text-sm text-muted-foreground">
              Nenhuma coleta corresponde aos filtros selecionados.
            </p>
            <Button variant="outline" size="sm" onClick={onResetFilters} className="mt-3">
              Limpar filtros
            </Button>
          </div>
        ) : (
          <>
            <div className="grid gap-4 lg:grid-cols-5">
              <div className="lg:col-span-2">
                <ForumMap points={mapPoints} />
                <p className="mt-2 text-xs text-muted-foreground">
                  Cor do marcador reflete o pior status observado no período.
                </p>
              </div>
              <div className="lg:col-span-3">
                <ForumChart rows={chartRows} />
                <p className="mt-2 text-center text-xs text-muted-foreground">
                  Barras: média de cada parâmetro no período, normalizada em % da referência
                  CONAMA. Linha vermelha = 100%.
                </p>
              </div>
            </div>

            <div>
              <h3 className="mb-3 text-sm font-semibold text-foreground">
                Parâmetros avaliados
              </h3>
              {cards.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Nenhum parâmetro selecionado. Ative pelo menos um chip acima.
                </p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {cards.map((c) => (
                    <div key={c.code} className="relative">
                      <ParameterCard p={c} />
                      <p className="mt-1 px-1 text-[11px] text-muted-foreground">
                        {c.count} coleta{c.count === 1 ? "" : "s"} · faixa {c.min}–{c.max}{" "}
                        {c.unit}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ExplorerPanel;
