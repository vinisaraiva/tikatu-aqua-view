
import { useState, useEffect } from 'react';
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

const DateFilter = ({ onDateChange }: DateFilterProps) => {
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [isRange, setIsRange] = useState(false);

  // Debug: Log when dates change
  useEffect(() => {
    console.log('DateFilter - Dates changed:', { startDate, endDate, isRange });
    if (!isRange) {
      onDateChange(startDate, startDate);
    } else {
      onDateChange(startDate, endDate);
    }
  }, [startDate, endDate, isRange, onDateChange]);

  const handleStartDateChange = (date: Date | undefined) => {
    console.log('DateFilter - Start date selected:', date);
    setStartDate(date);
  };

  const handleEndDateChange = (date: Date | undefined) => {
    console.log('DateFilter - End date selected:', date);
    setEndDate(date);
  };

  const handleRangeToggle = (rangeMode: boolean) => {
    console.log('DateFilter - Range mode changed:', rangeMode);
    setIsRange(rangeMode);
    if (!rangeMode) {
      setEndDate(undefined);
    }
  };

  const clearDates = () => {
    console.log('DateFilter - Clearing dates');
    setStartDate(undefined);
    setEndDate(undefined);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <label className="text-sm font-medium text-gray-700">
          Filtro de Data
        </label>
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
                  "w-[240px] justify-start text-left font-normal",
                  !startDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, "PPP", { locale: ptBR }) : "Selecionar data"}
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
                    "w-[240px] justify-start text-left font-normal",
                    !endDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "PPP", { locale: ptBR }) : "Selecionar data"}
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

      {/* Debug info */}
      {(startDate || endDate) && (
        <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded">
          Debug: Start: {startDate?.toLocaleDateString('pt-BR') || 'N/A'}, 
          End: {endDate?.toLocaleDateString('pt-BR') || 'N/A'}, 
          Range: {isRange ? 'Yes' : 'No'}
        </div>
      )}
    </div>
  );
};

export default DateFilter;
