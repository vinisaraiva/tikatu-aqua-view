import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, RotateCcw, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  FORUM_POINTS,
  FORUM_PARAMETERS,
  FORUM_READINGS,
  FORUM_DATE_MIN,
  FORUM_DATE_MAX,
} from "@/data/forumDataset";

export interface FilterState {
  pointIds: string[];
  parameterCodes: string[];
  dateFrom: Date;
  dateTo: Date;
}

interface Props {
  value: FilterState;
  onChange: (next: FilterState) => void;
  onReset: () => void;
}

const fmt = (d: Date) => format(d, "dd/MM/yyyy", { locale: ptBR });

const MIN_DATE = new Date(FORUM_DATE_MIN + "T00:00:00");
const MAX_DATE = new Date(FORUM_DATE_MAX + "T00:00:00");
// Data da coleta mais recente disponível — usada como âncora dos presets
// para que "7d/30d" sempre incluam pelo menos a última medição.
const LATEST_READING_DATE = (() => {
  const max = FORUM_READINGS.reduce(
    (acc, r) => (r.date > acc ? r.date : acc),
    FORUM_DATE_MIN,
  );
  return new Date(max + "T00:00:00");
})();

const ScenarioFilters = ({ value, onChange, onReset }: Props) => {
  const togglePoint = (id: string) => {
    const has = value.pointIds.includes(id);
    onChange({
      ...value,
      pointIds: has ? value.pointIds.filter((p) => p !== id) : [...value.pointIds, id],
    });
  };

  const selectParam = (code: string) => {
    if (value.parameterCodes[0] === code) return;
    onChange({ ...value, parameterCodes: [code] });
  };

  const pointsLabel =
    value.pointIds.length === FORUM_POINTS.length
      ? "Todos os pontos"
      : value.pointIds.length === 0
      ? "Nenhum ponto"
      : `${value.pointIds.length} de ${FORUM_POINTS.length} pontos`;

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="grid gap-4 md:grid-cols-3">
        {/* Pontos */}
        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground">
            Ponto de coleta
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-between font-normal">
                <span className="truncate">{pointsLabel}</span>
                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-60" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-2 pointer-events-auto" align="start">
              <div className="mb-2 flex items-center justify-between px-1">
                <span className="text-xs font-medium text-muted-foreground">
                  Selecione pontos
                </span>
                <button
                  type="button"
                  onClick={() =>
                    onChange({
                      ...value,
                      pointIds:
                        value.pointIds.length === FORUM_POINTS.length
                          ? []
                          : FORUM_POINTS.map((p) => p.id),
                    })
                  }
                  className="text-xs text-primary hover:underline"
                >
                  {value.pointIds.length === FORUM_POINTS.length ? "Limpar" : "Todos"}
                </button>
              </div>
              <ul className="max-h-64 space-y-1 overflow-y-auto">
                {FORUM_POINTS.map((p) => {
                  const checked = value.pointIds.includes(p.id);
                  return (
                    <li key={p.id}>
                      <label
                        className={cn(
                          "flex cursor-pointer items-start gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted",
                          checked && "bg-muted/60",
                        )}
                      >
                        <Checkbox
                          checked={checked}
                          onCheckedChange={() => togglePoint(p.id)}
                          className="mt-0.5"
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-medium text-foreground">
                            {p.name}
                          </span>
                          <span className="block truncate text-xs text-muted-foreground">
                            {p.river} · {p.environment}
                          </span>
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </PopoverContent>
          </Popover>
        </div>

        {/* Data */}
        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground">
            Período
          </Label>
          <div className="flex gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="flex-1 justify-start font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {fmt(value.dateFrom)}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 pointer-events-auto" align="start">
                <Calendar
                  mode="single"
                  selected={value.dateFrom}
                  defaultMonth={value.dateFrom}
                  onSelect={(d) => d && onChange({ ...value, dateFrom: d })}
                  disabled={(d) => d > value.dateTo || d < MIN_DATE || d > MAX_DATE}
                  fromDate={MIN_DATE}
                  toDate={MAX_DATE}
                  className={cn("p-3 pointer-events-auto")}
                  locale={ptBR}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="flex-1 justify-start font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {fmt(value.dateTo)}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 pointer-events-auto" align="start">
                <Calendar
                  mode="single"
                  selected={value.dateTo}
                  defaultMonth={value.dateTo}
                  onSelect={(d) => d && onChange({ ...value, dateTo: d })}
                  disabled={(d) => d < value.dateFrom || d < MIN_DATE || d > MAX_DATE}
                  fromDate={MIN_DATE}
                  toDate={MAX_DATE}
                  className={cn("p-3 pointer-events-auto")}
                  locale={ptBR}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {[
              { label: "7d", days: 7 },
              { label: "30d", days: 30 },
              { label: "90d", days: 90 },
              { label: "1 ano", days: 365 },
              { label: "Tudo", days: -1 },
            ].map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => {
                  const to = MAX_DATE;
                  const from =
                    preset.days === -1
                      ? MIN_DATE
                      : (() => {
                          const d = new Date(to);
                          d.setDate(d.getDate() - preset.days);
                          return d < MIN_DATE ? MIN_DATE : d;
                        })();
                  onChange({ ...value, dateFrom: from, dateTo: to });
                }}
                className="rounded-full border border-border bg-muted/40 px-2.5 py-0.5 text-xs text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>


        {/* Reset */}
        <div className="flex items-end justify-end">
          <Button variant="ghost" size="sm" onClick={onReset}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Restaurar filtros
          </Button>
        </div>
      </div>

      {/* Parâmetros */}
      <div className="mt-4 space-y-2">
        <Label className="text-xs font-medium text-muted-foreground">
          Parâmetro exibido (selecione um)
        </Label>
        <div role="radiogroup" className="flex flex-wrap gap-2">
          {FORUM_PARAMETERS.map((p) => {
            const active = value.parameterCodes[0] === p.code;
            return (
              <button
                key={p.code}
                type="button"
                role="radio"
                onClick={() => selectParam(p.code)}
                aria-checked={active}
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
          })}
        </div>
      </div>
    </div>
  );
};

export default ScenarioFilters;
