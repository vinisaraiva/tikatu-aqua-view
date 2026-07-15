import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays, MapPin, Layers, Database } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import ForumMap, { type MapPoint } from "./ForumMap";
import ForumChart, { type ChartDatum } from "./ForumChart";
import ParameterCard from "./ParameterCard";
import type { ScenarioParameter } from "@/data/forumScenarios";
import { FORUM_POINTS, FORUM_PARAMETERS, type Reading } from "@/data/forumDataset";
import { cn } from "@/lib/utils";

interface Props {
  filteredReadings: Reading[];
  activePointIds: string[];
  activeParameterCodes: string[];
  dateFrom: Date;
  dateTo: Date;
  onResetFilters: () => void;
}

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

const statusPriority: Record<ScenarioParameter["status"], number> = {
  "Requer atenção": 3,
  "Requer acompanhamento": 2,
  "Não avaliado": 1,
  "Condição adequada": 0,
  "Dentro da faixa adotada": 0,
};

const buildCards = (readings: Reading[], activeCodes: string[]) => {
  const specs = FORUM_PARAMETERS.filter((p) => activeCodes.includes(p.code));
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
    const decimals = spec.code === "colif" || spec.code === "cond" ? 0 : 2;
    const worst = statuses.reduce(
      (acc, s) => (statusPriority[s] > statusPriority[acc] ? s : acc),
      statuses[0],
    );

    cards.push({
      code: spec.code,
      name: spec.name,
      value: Number(avg.toFixed(decimals)),
      unit,
      conamaMin: spec.conamaMin,
      conamaMax: spec.conamaMax,
      status: worst,
      description,
      min: Number(min.toFixed(decimals)),
      max: Number(max.toFixed(decimals)),
      count: values.length,
    });
  }

  return cards;
};

const buildChartData = (
  readings: Reading[],
  paramCode: string,
): ChartDatum[] => {
  const pointNames = new Map(FORUM_POINTS.map((p) => [p.id, p.name]));
  return readings
    .map((r) => {
      const p = r.parameters.find((x) => x.code === paramCode);
      if (!p) return null;
      return {
        label: pointNames.get(r.pointId) ?? r.pointId,
        sublabel: format(new Date(r.date + "T00:00:00"), "dd/MM/yy", { locale: ptBR }),
        value: p.value,
        status: p.status,
      } as ChartDatum;
    })
    .filter((x): x is ChartDatum => x !== null)
    .sort((a, b) => (a.sublabel ?? "").localeCompare(b.sublabel ?? ""));
};

const ExplorerPanel = ({
  filteredReadings,
  activePointIds,
  activeParameterCodes,
  dateFrom,
  dateTo,
  onResetFilters,
}: Props) => {
  const [chartParamCode, setChartParamCode] = useState<string>(
    activeParameterCodes[0] ?? FORUM_PARAMETERS[0].code,
  );

  // Se o parâmetro do gráfico for desativado, escolhe o primeiro ativo
  useEffect(() => {
    if (!activeParameterCodes.includes(chartParamCode) && activeParameterCodes.length > 0) {
      setChartParamCode(activeParameterCodes[0]);
    }
  }, [activeParameterCodes, chartParamCode]);

  const chartParam = useMemo(
    () => FORUM_PARAMETERS.find((p) => p.code === chartParamCode) ?? FORUM_PARAMETERS[0],
    [chartParamCode],
  );

  const chartData = useMemo(
    () => buildChartData(filteredReadings, chartParam.code),
    [filteredReadings, chartParam.code],
  );

  const cards = useMemo(
    () => buildCards(filteredReadings, activeParameterCodes),
    [filteredReadings, activeParameterCodes],
  );

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

  const empty = filteredReadings.length === 0;
  const hasActiveParams = activeParameterCodes.length > 0;

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
            <div className="grid gap-6 lg:grid-cols-5">
              <div className="lg:col-span-2">
                <ForumMap points={mapPoints} />
                <p className="mt-2 text-xs text-muted-foreground">
                  Cor do marcador reflete o pior status observado no período.
                </p>
              </div>
              <div className="lg:col-span-3 space-y-3">
                {/* Seletor de parâmetro do gráfico */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground">
                    Parâmetro no gráfico:
                  </span>
                  {hasActiveParams ? (
                    FORUM_PARAMETERS.filter((p) => activeParameterCodes.includes(p.code)).map(
                      (p) => {
                        const active = p.code === chartParam.code;
                        return (
                          <button
                            key={p.code}
                            type="button"
                            onClick={() => setChartParamCode(p.code)}
                            aria-pressed={active}
                            className={cn(
                              "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                              active
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-border bg-muted/40 text-muted-foreground hover:text-foreground",
                            )}
                          >
                            {p.name}
                          </button>
                        );
                      },
                    )
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      Ative pelo menos um parâmetro nos filtros acima.
                    </span>
                  )}
                </div>

                {hasActiveParams && (
                  <>
                    <ForumChart
                      data={chartData}
                      parameterName={chartParam.name}
                      unit={chartParam.unit}
                      conamaMin={chartParam.conamaMin}
                      conamaMax={chartParam.conamaMax}
                    />
                    <p className="text-center text-xs text-muted-foreground">
                      {chartParam.name}
                      {chartParam.unit && ` (${chartParam.unit})`} · valor por coleta ·
                      limites CONAMA aplicados
                    </p>
                  </>
                )}
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
