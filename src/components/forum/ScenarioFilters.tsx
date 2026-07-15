import { useMemo } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, RotateCcw, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
const LATEST_READING_DATE = (() => {
  const max = FORUM_READINGS.reduce(
    (acc, r) => (r.date > acc ? r.date : acc),
    FORUM_DATE_MIN,
  );
  return new Date(max + "T00:00:00");
})();

const PRESETS = [
  { value: "7", label: "Últimos 7 dias", days: 7 },
  { value: "30", label: "Últimos 30 dias", days: 30 },
  { value: "90", label: "Últimos 90 dias", days: 90 },
  { value: "365", label: "Último ano", days: 365 },
  { value: "all", label: "Todo o período", days: -1 },
  { value: "custom", label: "Personalizado", days: 0 },
];

const ScenarioFilters = ({ value, onChange, onReset }: Props) => {
  const togglePoint = (id: string) => {
    const has = value.pointIds.includes(id);
    onChange({
      ...value,
      pointIds: has ? value.pointIds.filter((p) => p !== id) : [...value.pointIds, id],
    });
  };

  const pointsLabel =
    value.pointIds.length === 0
      ? "Nenhum ponto"
      : value.pointIds.length === FORUM_POINTS.length
      ? "Todos os pontos"
      : `${value.pointIds.length} de ${FORUM_POINTS.length}`;

  const currentPreset = useMemo(() => {
    const fromMs = value.dateFrom.getTime();
    const toMs = value.dateTo.getTime();
    if (fromMs === MIN_DATE.getTime() && toMs === MAX_DATE.getTime()) return "all";
    for (const p of PRESETS) {
      if (p.days <= 0) continue;
      const to = LATEST_READING_DATE;
      const from = new Date(to);
      from.setDate(from.getDate() - p.days);
      const clamped = from < MIN_DATE ? MIN_DATE : from;
      if (clamped.getTime() === fromMs && to.getTime() === toMs) return p.value;
    }
    return "custom";
  }, [value.dateFrom, value.dateTo]);

  const applyPreset = (v: string) => {
    if (v === "custom") return;
    const preset = PRESETS.find((p) => p.value === v);
    if (!preset) return;
    if (preset.days === -1) {
      onChange({ ...value, dateFrom: MIN_DATE, dateTo: MAX_DATE });
      return;
    }
    const to = LATEST_READING_DATE;
    const from = new Date(to);
    from.setDate(from.getDate() - preset.days);
    onChange({
      ...value,
      dateFrom: from < MIN_DATE ? MIN_DATE : from,
      dateTo: to,
    });
  };

  const paramName =
    FORUM_PARAMETERS.find((p) => p.code === value.parameterCodes[0])?.name ?? "—";
  const periodLabel =
    PRESETS.find((p) => p.value === currentPreset)?.label ??
    `${fmt(value.dateFrom)} – ${fmt(value.dateTo)}`;

  const summary = `${pointsLabel} · ${paramName} · ${periodLabel}`;

  return (
    <div className="rounded-lg border border-border bg-card">
      <Accordion type="single" collapsible defaultValue="filters">
        <AccordionItem value="filters" className="border-none">
          <div className="flex items-center gap-1 px-3">
            <AccordionTrigger className="flex-1 py-3 hover:no-underline">
              <div className="flex min-w-0 items-center gap-2 text-left">
                <SlidersHorizontal className="h-4 w-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0">
                  <div className="text-xs font-medium text-muted-foreground">
                    Filtros
                  </div>
                  <div className="truncate text-sm text-foreground">{summary}</div>
                </div>
              </div>
            </AccordionTrigger>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={(e) => {
                e.stopPropagation();
                onReset();
              }}
              aria-label="Restaurar filtros"
              title="Restaurar filtros"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>

          <AccordionContent className="px-3 pb-3 pt-0">
            <ul className="divide-y divide-border rounded-md border border-border/60">
              {/* Pontos */}
              <li className="flex items-center justify-between gap-3 px-3 py-2.5">
                <span className="text-sm font-medium text-foreground">Pontos</span>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 max-w-[60%] justify-between font-normal"
                    >
                      <span className="truncate">{pointsLabel}</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-72 p-2 pointer-events-auto" align="end">
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
                        {value.pointIds.length === FORUM_POINTS.length
                          ? "Limpar"
                          : "Todos"}
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
              </li>

              {/* Parâmetro */}
              <li className="flex items-center justify-between gap-3 px-3 py-2.5">
                <span className="text-sm font-medium text-foreground">Parâmetro</span>
                <Select
                  value={value.parameterCodes[0]}
                  onValueChange={(v) => onChange({ ...value, parameterCodes: [v] })}
                >
                  <SelectTrigger className="h-8 max-w-[60%]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="pointer-events-auto">
                    {FORUM_PARAMETERS.map((p) => (
                      <SelectItem key={p.code} value={p.code}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </li>

              {/* Período */}
              <li className="flex items-center justify-between gap-3 px-3 py-2.5">
                <span className="text-sm font-medium text-foreground">Período</span>
                <Select value={currentPreset} onValueChange={applyPreset}>
                  <SelectTrigger className="h-8 max-w-[60%]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="pointer-events-auto">
                    {PRESETS.map((p) => (
                      <SelectItem key={p.value} value={p.value}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </li>

              {/* Datas personalizadas */}
              {currentPreset === "custom" && (
                <li className="flex items-center justify-between gap-2 px-3 py-2.5">
                  <span className="text-sm font-medium text-foreground">Datas</span>
                  <div className="flex gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 justify-start font-normal"
                        >
                          <CalendarIcon className="mr-1.5 h-3.5 w-3.5" />
                          {fmt(value.dateFrom)}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 pointer-events-auto" align="end">
                        <Calendar
                          mode="single"
                          selected={value.dateFrom}
                          defaultMonth={value.dateFrom}
                          onSelect={(d) => d && onChange({ ...value, dateFrom: d })}
                          disabled={(d) =>
                            d > value.dateTo || d < MIN_DATE || d > MAX_DATE
                          }
                          fromDate={MIN_DATE}
                          toDate={MAX_DATE}
                          className="p-3 pointer-events-auto"
                          locale={ptBR}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 justify-start font-normal"
                        >
                          <CalendarIcon className="mr-1.5 h-3.5 w-3.5" />
                          {fmt(value.dateTo)}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 pointer-events-auto" align="end">
                        <Calendar
                          mode="single"
                          selected={value.dateTo}
                          defaultMonth={value.dateTo}
                          onSelect={(d) => d && onChange({ ...value, dateTo: d })}
                          disabled={(d) =>
                            d < value.dateFrom || d < MIN_DATE || d > MAX_DATE
                          }
                          fromDate={MIN_DATE}
                          toDate={MAX_DATE}
                          className="p-3 pointer-events-auto"
                          locale={ptBR}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </li>
              )}
            </ul>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default ScenarioFilters;
