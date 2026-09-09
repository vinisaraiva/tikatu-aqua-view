
import { useCallback, useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface DateFilterProps {
  onDateChange: (startDate: Date | undefined, endDate: Date | undefined) => void;
}

// Horário de Brasília/Bahia (UTC-3)
const BAHIA_OFFSET = '-03:00';

const pad = (value: number) => String(value).padStart(2, '0');

const dayKey = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

const startOfDayBahia = (date: Date) => new Date(`${dayKey(date)}T00:00:00${BAHIA_OFFSET}`);
const endOfDayBahia = (date: Date) => new Date(`${dayKey(date)}T23:59:59.999${BAHIA_OFFSET}`);

const PRESETS = [
  { label: '7 dias', days: 7 },
  { label: '30 dias', days: 30 },
  { label: '90 dias', days: 90 },
  { label: '12 meses', days: 365 },
];

const DateFilter = ({ onDateChange }: DateFilterProps) => {
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [isRange, setIsRange] = useState(false);

  const emit = useCallback(
    (start: Date | undefined, end: Date | undefined, range: boolean) => {
      if (!start && !end) {
        onDateChange(undefined, undefined);
        return;
      }

      if (!range) {
        // Data única cobre o dia inteiro
        onDateChange(
          start ? startOfDayBahia(start) : undefined,
          start ? endOfDayBahia(start) : undefined
        );
        return;
      }

      onDateChange(
        start ? startOfDayBahia(start) : undefined,
        end ? endOfDayBahia(end) : undefined
      );
    },
    [onDateChange]
  );

  const handleStartDateChange = (date: Date | undefined) => {
    setStartDate(date);
    emit(date, endDate, isRange);
  };

  const handleEndDateChange = (date: Date | undefined) => {
    setEndDate(date);
    emit(startDate, date, isRange);
  };

  const handleRangeToggle = (rangeMode: boolean) => {
    setIsRange(rangeMode);
    const nextEnd = rangeMode ? endDate : undefined;
    if (!rangeMode) setEndDate(undefined);
    emit(startDate, nextEnd, rangeMode);
  };

  const applyPreset = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - (days - 1));
    setIsRange(true);
    setStartDate(start);
    setEndDate(end);
    emit(start, end, true);
  };

  const clearDates = () => {
    setStartDate(undefined);
    setEndDate(undefined);
    onDateChange(undefined, undefined);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {PRESETS.map((preset) => (
          <Button
            key={preset.days}
            variant="secondary"
            size="sm"
            onClick={() => applyPreset(preset.days)}
          >
            {preset.label}
          </Button>
        ))}
      </div>

      <div className="flex items-center gap-4">
        <label className="text-sm font-medium text-gray-700">Filtro de Data</label>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1 text-sm">
            <input
              type="radio"
              name="dateType"
              checked={!isRange}
              onChange={() => handleRangeToggle(false)}
            />
            Data única
          </label>
          <label className="flex items-center gap-1 text-sm">
            <input
              type="radio"
              name="dateType"
              checked={isRange}
              onChange={() => handleRangeToggle(true)}
            />
            Intervalo
          </label>
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="space-y-2">
          <label className="text-sm text-gray-600">
            {isRange ? 'Data inicial' : 'Data'}
          </label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full sm:w-[240px] justify-start text-left font-normal",
                  !startDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                {startDate ? format(startDate, "dd/MM/yyyy", { locale: ptBR }) : "Selecionar data"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={handleStartDateChange}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>

        {isRange && (
          <div className="space-y-2">
            <label className="text-sm text-gray-600">Data final</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full sm:w-[240px] justify-start text-left font-normal",
                    !endDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                  {endDate ? format(endDate, "dd/MM/yyyy", { locale: ptBR }) : "Selecionar data"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={handleEndDateChange}
                  initialFocus
                  className="pointer-events-auto"
                  disabled={(date) => startDate ? date < startDate : false}
                />
              </PopoverContent>
            </Popover>
          </div>
        )}

        {(startDate || endDate) && (
          <div className="flex items-end">
            <Button variant="outline" size="sm" onClick={clearDates}>
              Limpar datas
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DateFilter;
