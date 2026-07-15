import { useState } from "react";
import { ChevronDown, CheckCircle2, AlertCircle, Clock, MinusCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ScenarioParameter } from "@/data/forumScenarios";

const statusConfig: Record<
  ScenarioParameter["status"],
  { icon: typeof CheckCircle2; label: string; badge: string; iconClass: string }
> = {
  "Dentro da faixa adotada": {
    icon: CheckCircle2,
    label: "Dentro da faixa adotada",
    badge: "border-emerald-600/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    iconClass: "text-emerald-600",
  },
  "Condição adequada": {
    icon: CheckCircle2,
    label: "Condição adequada",
    badge: "border-emerald-600/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    iconClass: "text-emerald-600",
  },
  "Requer atenção": {
    icon: AlertCircle,
    label: "Requer atenção",
    badge: "border-amber-600/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
    iconClass: "text-amber-600",
  },
  "Requer acompanhamento": {
    icon: Clock,
    label: "Requer acompanhamento",
    badge: "border-sky-600/30 bg-sky-500/10 text-sky-700 dark:text-sky-300",
    iconClass: "text-sky-600",
  },
  "Não avaliado": {
    icon: MinusCircle,
    label: "Não avaliado",
    badge: "border-border bg-muted text-muted-foreground",
    iconClass: "text-muted-foreground",
  },
};

const ParameterCard = ({ p }: { p: ScenarioParameter }) => {
  const [open, setOpen] = useState(false);
  const cfg = statusConfig[p.status];
  const Icon = cfg.icon;

  return (
    <div className="rounded-lg border border-border bg-card">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-start justify-between gap-3 rounded-lg p-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Icon className={cn("h-4 w-4 shrink-0", cfg.iconClass)} aria-hidden />
            <span className="truncate text-sm font-medium text-foreground">
              {p.name}
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-semibold tabular-nums text-foreground">
              {p.value}
            </span>
            {p.unit && (
              <span className="text-xs text-muted-foreground">{p.unit}</span>
            )}
          </div>
          <span
            className={cn(
              "mt-2 inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium",
              cfg.badge,
            )}
          >
            {cfg.label}
          </span>
        </div>
        <ChevronDown
          aria-hidden
          className={cn(
            "mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform",
            open && "rotate-180",
          )}
        />
      </button>
      {open && (
        <div className="border-t border-border px-4 py-3 text-xs leading-relaxed text-muted-foreground">
          <p>{p.description}</p>
          {(p.conamaMin != null || p.conamaMax != null) && (
            <p className="mt-2 text-[11px] text-muted-foreground/80">
              Referência adotada:{" "}
              {p.conamaMin != null && <>mín. {p.conamaMin}</>}
              {p.conamaMin != null && p.conamaMax != null && " · "}
              {p.conamaMax != null && <>máx. {p.conamaMax}</>}
              {p.unit && ` ${p.unit}`}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default ParameterCard;
