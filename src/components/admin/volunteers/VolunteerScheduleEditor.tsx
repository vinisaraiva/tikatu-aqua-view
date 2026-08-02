import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export interface ScheduleValue {
  weekdays: number[];
  scheduled_time: string;
}

const WEEKDAYS = [
  { value: 0, label: 'D' },
  { value: 1, label: 'S' },
  { value: 2, label: 'T' },
  { value: 3, label: 'Q' },
  { value: 4, label: 'Q' },
  { value: 5, label: 'S' },
  { value: 6, label: 'S' },
];

export const WEEKDAY_SHORT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

interface VolunteerScheduleEditorProps {
  value: ScheduleValue;
  onChange: (value: ScheduleValue) => void;
  invalid?: boolean;
}

export function VolunteerScheduleEditor({ value, onChange, invalid }: VolunteerScheduleEditorProps) {
  const toggleDay = (day: number) => {
    const weekdays = value.weekdays.includes(day)
      ? value.weekdays.filter((d) => d !== day)
      : [...value.weekdays, day].sort((a, b) => a - b);
    onChange({ ...value, weekdays });
  };

  return (
    <div className="mt-2 space-y-2 rounded-md border bg-muted/30 p-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-muted-foreground">Dias:</span>
        {WEEKDAYS.map((day, index) => {
          const selected = value.weekdays.includes(day.value);
          return (
            <Button
              key={index}
              type="button"
              size="sm"
              variant={selected ? 'default' : 'outline'}
              className="h-7 w-7 p-0 text-xs"
              onClick={() => toggleDay(day.value)}
              aria-label={WEEKDAY_SHORT[day.value]}
            >
              {day.label}
            </Button>
          );
        })}
        <span className="ml-auto flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">Horário:</span>
          <Input
            type="time"
            value={value.scheduled_time}
            onChange={(e) => onChange({ ...value, scheduled_time: e.target.value })}
            className="h-8 w-28"
          />
        </span>
      </div>
      <p className="text-xs text-muted-foreground">
        Tolerância: 1h antes / 1h depois (informativo — não bloqueia coletas em outro horário).
      </p>
      {invalid && (
        <p className="text-xs text-destructive">Selecione ao menos um dia e informe o horário.</p>
      )}
    </div>
  );
}

export const formatSchedule = (weekdays?: number[] | null, time?: string | null) => {
  if (!weekdays || weekdays.length === 0 || !time) return null;
  const days = [...weekdays].sort((a, b) => a - b).map((d) => WEEKDAY_SHORT[d]).join('/');
  return `${days} ${String(time).slice(0, 5)}`;
};
