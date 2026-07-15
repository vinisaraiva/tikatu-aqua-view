import { Card } from "@/components/ui/card";
import { FORUM_SCENARIOS, type ForumScenario } from "@/data/forumScenarios";
import { cn } from "@/lib/utils";

interface Props {
  selectedId: string;
  onSelect: (s: ForumScenario) => void;
}

const formatDate = (iso: string) =>
  new Date(iso + "T00:00:00").toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const ScenarioSelector = ({ selectedId, onSelect }: Props) => {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {FORUM_SCENARIOS.map((s) => {
        const active = s.id === selectedId;
        return (
          <Card
            key={s.id}
            role="button"
            tabIndex={0}
            aria-pressed={active}
            onClick={() => onSelect(s)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelect(s);
              }
            }}
            className={cn(
              "cursor-pointer p-5 transition-all hover:border-primary/60 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
              active
                ? "border-primary ring-2 ring-primary/30"
                : "border-border",
            )}
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                {s.environment}
              </span>
              <span className="text-xs text-muted-foreground">
                {s.season}
              </span>
            </div>
            <h3 className="mt-3 text-base font-semibold text-foreground">
              {s.shortLabel}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">{s.title}</p>
            <dl className="mt-4 space-y-1 text-xs text-muted-foreground">
              <div className="flex justify-between">
                <dt>Data</dt>
                <dd className="font-medium text-foreground">
                  {formatDate(s.date)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt>Parâmetros</dt>
                <dd className="font-medium text-foreground">
                  {s.parameters.length}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt>Origem</dt>
                <dd className="font-medium text-foreground capitalize">
                  {s.originTag}
                </dd>
              </div>
            </dl>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              {s.description}
            </p>
          </Card>
        );
      })}
    </div>
  );
};

export default ScenarioSelector;
