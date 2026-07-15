import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, CheckCircle2 } from "lucide-react";
import type { ForumScenario } from "@/data/forumScenarios";
import { cn } from "@/lib/utils";

const STEPS = [
  "Validando os dados",
  "Verificando indicadores",
  "Organizando os resultados",
  "Gerando a interpretação",
];

const AnalysisPanel = ({ scenario }: { scenario: ForumScenario }) => {
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");
  const [stepIndex, setStepIndex] = useState(0);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    // Ao trocar cenário, reseta
    setState("idle");
    setStepIndex(0);
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  }, [scenario.id]);

  useEffect(() => () => {
    timers.current.forEach((t) => window.clearTimeout(t));
  }, []);

  const start = () => {
    setState("loading");
    setStepIndex(0);
    timers.current.forEach((t) => window.clearTimeout(t));
    STEPS.forEach((_, i) => {
      const t = window.setTimeout(() => setStepIndex(i + 1), (i + 1) * 400);
      timers.current.push(t);
    });
    const done = window.setTimeout(() => setState("done"), STEPS.length * 400 + 200);
    timers.current.push(done);
  };

  const a = scenario.analysis;

  return (
    <Card id="analise">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" aria-hidden />
          Análise da coleta
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {state === "idle" && (
          <>
            <p className="text-sm text-muted-foreground">
              Gere uma interpretação organizada dos dados desta coleta, com
              síntese, pontos de atenção, recomendações e limitações.
            </p>
            <Button onClick={start} size="lg">
              <Sparkles className="mr-2 h-4 w-4" aria-hidden />
              Gerar análise
            </Button>
          </>
        )}

        {state === "loading" && (
          <ul className="space-y-2" aria-live="polite">
            {STEPS.map((s, i) => {
              const done = i < stepIndex;
              const active = i === stepIndex;
              return (
                <li
                  key={s}
                  className={cn(
                    "flex items-center gap-2 text-sm",
                    done && "text-foreground",
                    active && "text-primary",
                    !done && !active && "text-muted-foreground",
                  )}
                >
                  {done ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden />
                  ) : active ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  ) : (
                    <span className="h-4 w-4 rounded-full border border-border" />
                  )}
                  {s}
                </li>
              );
            })}
          </ul>
        )}

        {state === "done" && (
          <div className="grid gap-4 md:grid-cols-2">
            <section className="rounded-lg border border-border bg-muted/40 p-4">
              <h3 className="text-sm font-semibold text-foreground">
                Síntese geral
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {a.sintese}
              </p>
            </section>
            <section className="rounded-lg border border-border bg-muted/40 p-4">
              <h3 className="text-sm font-semibold text-foreground">
                Parâmetros que demandam atenção
              </h3>
              {a.atencao.length > 0 ? (
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                  {a.atencao.map((x) => (
                    <li key={x}>{x}</li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-sm text-muted-foreground">
                  Nenhum ponto de atenção nesta coleta.
                </p>
              )}
            </section>
            <section className="rounded-lg border border-border bg-muted/40 p-4">
              <h3 className="text-sm font-semibold text-foreground">
                Recomendações de acompanhamento
              </h3>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                {a.recomendacoes.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            </section>
            <section className="rounded-lg border border-border bg-muted/40 p-4">
              <h3 className="text-sm font-semibold text-foreground">
                Limitações da análise
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {a.limitacao}
              </p>
            </section>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AnalysisPanel;
