
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { CalendarIcon } from 'lucide-react';
import DateFilter from './DateFilter';
import { useCities, useRivers, usePoints } from '@/hooks/useGeographicData';

interface FilterSectionProps {
  selectedCity: string;
  selectedRiver: string;
  selectedPoints: string[];
  onCityChange: (city: string) => void;
  onRiverChange: (river: string) => void;
  onPointsChange: (points: string[]) => void;
  onDateChange?: (start: Date | undefined, end: Date | undefined) => void;
  showDateFilter?: boolean;
}

const FilterSection = ({
  selectedCity,
  selectedRiver,
  selectedPoints,
  onCityChange,
  onRiverChange,
  onPointsChange,
  onDateChange,
  showDateFilter = false,
}: FilterSectionProps) => {
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Fetch real data from Supabase
  const { data: cities = [], isLoading: citiesLoading } = useCities();
  const selectedCityData = cities.find(city => city.name === selectedCity);
  const { data: rivers = [], isLoading: riversLoading } = useRivers(selectedCityData?.id);
  const selectedRiverData = rivers.find(river => river.name === selectedRiver);
  const { data: points = [], isLoading: pointsLoading } = usePoints(selectedRiverData?.id);

  const handlePointChange = (pointName: string, checked: boolean) => {
    if (checked) {
      onPointsChange([...selectedPoints, pointName]);
    } else {
      onPointsChange(selectedPoints.filter(p => p !== pointName));
    }
  };

  const handleClearPoints = () => {
    onPointsChange([]);
  };

  const handleSelectAllPoints = () => {
    onPointsChange(points.map(point => point.name));
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Filtros</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* City Selection */}
        <div>
          <label className="text-sm font-medium mb-2 block">Cidade</label>
          <Select value={selectedCity} onValueChange={onCityChange} disabled={citiesLoading}>
            <SelectTrigger>
              <SelectValue placeholder={citiesLoading ? "Carregando cidades..." : "Selecione uma cidade"} />
            </SelectTrigger>
            <SelectContent>
              {cities.map((city) => (
                <SelectItem key={city.id} value={city.name}>
                  {city.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* River Selection */}
        {selectedCity && (
          <div>
            <label className="text-sm font-medium mb-2 block">Rio</label>
            <Select value={selectedRiver} onValueChange={onRiverChange} disabled={riversLoading}>
              <SelectTrigger>
                <SelectValue placeholder={riversLoading ? "Carregando rios..." : "Selecione um rio"} />
              </SelectTrigger>
              <SelectContent>
                {rivers.map((river) => (
                  <SelectItem key={river.id} value={river.name}>
                    {river.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Points Selection */}
        {selectedRiver && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">Pontos de Coleta</label>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAllPoints}
                  disabled={pointsLoading || points.length === 0}
                >
                  Selecionar Todos
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearPoints}
                  disabled={selectedPoints.length === 0}
                >
                  Limpar
                </Button>
              </div>
            </div>
            
            {pointsLoading ? (
              <p className="text-sm text-gray-500">Carregando pontos...</p>
            ) : points.length === 0 ? (
              <p className="text-sm text-gray-500">Nenhum ponto encontrado para este rio.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                {points.map((point) => (
                  <div key={point.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={point.name}
                      checked={selectedPoints.includes(point.name)}
                      onCheckedChange={(checked) => handlePointChange(point.name, checked as boolean)}
                    />
                    <label
                      htmlFor={point.name}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {point.name}
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Date Filter */}
        {showDateFilter && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">Período</label>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDatePicker(!showDatePicker)}
              >
                <CalendarIcon className="h-4 w-4 mr-2" />
                Filtrar por Data
              </Button>
            </div>
            
            {showDatePicker && onDateChange && (
              <DateFilter onDateChange={onDateChange} />
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FilterSection;
