import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { FORUM_POINTS, FORUM_PARAMETERS, type Reading } from "@/data/forumDataset";

interface Props {
  filteredReadings: Reading[];
  activeParameterCodes: string[];
  dateFrom: Date;
  dateTo: Date;
}

interface AIResponse {
  sintese: string;
  atencao: string[];
  recomendacoes: string[];
  limitacao: string;
}

const localSummary = (readings: Reading[], activeCodes: string[]) => {
  if (readings.length === 0) return null;
  const outByParam: Record<string, number> = {};
  const pointCounts: Record<string, number> = {};
  const pointAttention: Record<string, number> = {};

  for (const r of readings) {
    pointCounts[r.pointId] = (pointCounts[r.pointId] ?? 0) + 1;
    for (const p of r.parameters) {
      if (!activeCodes.includes(p.code)) continue;
      if (p.status === "Requer atenção") {
        outByParam[p.name] = (outByParam[p.name] ?? 0) + 1;
        pointAttention[r.pointId] = (pointAttention[r.pointId] ?? 0) + 1;
      }
    }
  }

  const worstPoint = Object.entries(pointAttention).sort((a, b) => b[1] - a[1])[0];
  const worstPointName = worstPoint
    ? FORUM_POINTS.find((p) => p.id === worstPoint[0])?.name
    : null;
  const topParams = Object.entries(outByParam)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([n]) => n);

  return { outByParam, worstPointName, topParams };
};

const AnalysisPanel = ({ filteredReadings, activeParameterCodes, dateFrom, dateTo }: Props) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AIResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const summary = useMemo(
    () => localSummary(filteredReadings, activeParameterCodes),
    [filteredReadings, activeParameterCodes],
  );

  const canRun = filteredReadings.length > 0 && activeParameterCodes.length > 0 && !loading;

  const run = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const payload = {
        dateFrom: dateFrom.toISOString().slice(0, 10),
        dateTo: dateTo.toISOString().slice(0, 10),
        activeParameterCodes,
        points: FORUM_POINTS.filter((p) =>
          filteredReadings.some((r) => r.pointId === p.id),
        ).map((p) => ({ id: p.id, name: p.name, river: p.river, environment: p.environment })),
        readings: filteredReadings.slice(0, 40).map((r) => ({
          pointId: r.pointId,
          date: r.date,
          season: r.season,
          parameters: r.parameters
            .filter((p) => activeParameterCodes.includes(p.code))
            .map((p) => ({
              code: p.code,
              name: p.name,
              value: p.value,
              unit: p.unit,
              status: p.status,
              conamaMin: p.conamaMin,
              conamaMax: p.conamaMax,
            })),
        })),
        parameters: FORUM_PARAMETERS.filter((p) => activeParameterCodes.includes(p.code)),
      };

      const { data, error: fnError } = await supabase.functions.invoke("forum-analyze", {
        body: payload,
      });

      if (fnError) throw fnError;
      if (!data || typeof data !== "object") throw new Error("Resposta inválida do servidor.");
      setResult(data as AIResponse);
    } catch (e: any) {
      const msg = e?.message ?? "Falha ao gerar a análise.";
      setError(msg);
      toast.error("Não foi possível gerar a análise com IA", { description: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card id="analise">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" aria-hidden />
          Análise com IA
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Resumo local instantâneo */}
        {summary && (
          <section className="rounded-lg border border-border bg-muted/40 p-4">
            <h3 className="text-sm font-semibold text-foreground">Resumo estatístico</h3>
            <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
              <li>
                <strong className="text-foreground">{filteredReadings.length}</strong> coleta
                {filteredReadings.length === 1 ? "" : "s"} nos filtros atuais.
              </li>
              {summary.topParams.length > 0 ? (
                <li>
                  Parâmetros analisados que requerem atenção:{" "}
                  <strong className="text-foreground">
                    {summary.topParams.join(", ")}
                  </strong>
                  .
                </li>
              ) : (
                <li>Nenhum parâmetro analisado ultrapassou o limite de referência.</li>
              )}
              {summary.worstPointName && (
                <li>
                  Ponto com mais registros de atenção:{" "}
                  <strong className="text-foreground">{summary.worstPointName}</strong>.
                </li>
              )}
            </ul>
          </section>
        )}

        {!result && (
          <div className="flex flex-col items-start gap-3">
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="rounded-full border border-border bg-muted/50 px-2.5 py-1 text-muted-foreground">
                {filteredReadings.length} coleta{filteredReadings.length === 1 ? "" : "s"}
              </span>
              <span className="rounded-full border border-border bg-muted/50 px-2.5 py-1 text-muted-foreground">
                {activeParameterCodes.length} parâmetro
                {activeParameterCodes.length === 1 ? "" : "s"}
              </span>
              <span className="rounded-full border border-border bg-muted/50 px-2.5 py-1 text-muted-foreground">
                {dateFrom.toLocaleDateString("pt-BR")} – {dateTo.toLocaleDateString("pt-BR")}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              A análise usa exclusivamente as coletas, o parâmetro e o período selecionados
              acima. Ajuste os filtros para mudar o cenário.
            </p>
            <Button onClick={run} disabled={!canRun} size="lg">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                  Gerando análise...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" aria-hidden />
                  Gerar análise com IA dos dados filtrados
                </>
              )}
            </Button>
            {!canRun && !loading && (
              <p className="text-xs text-muted-foreground">
                Selecione ao menos uma coleta e um parâmetro para habilitar.
              </p>
            )}
          </div>
        )}

        {error && !loading && (
          <div className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            <span>{error}</span>
          </div>
        )}

        {result && (
          <div className="grid gap-4 md:grid-cols-2">
            <section className="rounded-lg border border-border bg-muted/40 p-4">
              <h3 className="text-sm font-semibold text-foreground">Síntese geral</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {result.sintese}
              </p>
            </section>
            <section className="rounded-lg border border-border bg-muted/40 p-4">
              <h3 className="text-sm font-semibold text-foreground">
                Parâmetros que demandam atenção
              </h3>
              {result.atencao.length > 0 ? (
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                  {result.atencao.map((x, i) => (
                    <li key={i}>{x}</li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-sm text-muted-foreground">
                  Nenhum ponto de atenção identificado.
                </p>
              )}
            </section>
            <section className="rounded-lg border border-border bg-muted/40 p-4">
              <h3 className="text-sm font-semibold text-foreground">
                Recomendações de acompanhamento
              </h3>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                {result.recomendacoes.map((x, i) => (
                  <li key={i}>{x}</li>
                ))}
              </ul>
            </section>
            <section className="rounded-lg border border-border bg-muted/40 p-4">
              <h3 className="text-sm font-semibold text-foreground">Limitações da análise</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {result.limitacao}
              </p>
            </section>
            <div className="md:col-span-2">
              <Button variant="outline" onClick={run} disabled={loading}>
                <Sparkles className="mr-2 h-4 w-4" aria-hidden />
                Gerar novamente
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AnalysisPanel;
