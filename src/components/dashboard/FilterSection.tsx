
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { FilterIcon, XIcon } from 'lucide-react';
import DateFilter from './DateFilter';

interface FilterSectionProps {
  selectedCity: string;
  selectedRiver: string;
  selectedPoints: string[];
  onCityChange: (city: string) => void;
  onRiverChange: (river: string) => void;
  onPointsChange: (points: string[]) => void;
  onDateChange: (startDate: Date | undefined, endDate: Date | undefined) => void;
}

const FilterSection = ({
  selectedCity,
  selectedRiver,
  selectedPoints,
  onCityChange,
  onRiverChange,
  onPointsChange,
  onDateChange,
}: FilterSectionProps) => {
  const [isFiltersOpen, setIsFiltersOpen] = useState(true);

  // Mock data for demonstration
  const cities = ['São Paulo', 'Rio de Janeiro', 'Belo Horizonte', 'Salvador'];
  const rivers = selectedCity ? ['Rio Tietê', 'Rio Pinheiros', 'Rio Tamanduateí'] : [];
  const points = selectedRiver ? ['Ponto 001', 'Ponto 002', 'Ponto 003', 'Ponto 004', 'Ponto 005'] : [];

  const clearFilters = () => {
    onCityChange('');
    onRiverChange('');
    onPointsChange([]);
    onDateChange(undefined, undefined);
  };

  const handlePointToggle = (point: string) => {
    const updatedPoints = selectedPoints.includes(point)
      ? selectedPoints.filter(p => p !== point)
      : [...selectedPoints, point];
    onPointsChange(updatedPoints);
  };

  const hasFilters = selectedCity || selectedRiver || selectedPoints.length > 0;

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FilterIcon className="h-5 w-5" />
            Filtros
          </CardTitle>
          <div className="flex items-center gap-2">
            {hasFilters && (
              <Button variant="outline" size="sm" onClick={clearFilters}>
                <XIcon className="h-4 w-4 mr-1" />
                Limpar
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            >
              {isFiltersOpen ? 'Ocultar' : 'Mostrar'}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      {isFiltersOpen && (
        <CardContent className="space-y-6">
          {/* Filtro de Data */}
          <DateFilter onDateChange={onDateChange} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Cidade
              </label>
              <Select value={selectedCity} onValueChange={onCityChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma cidade" />
                </SelectTrigger>
                <SelectContent>
                  {cities.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Rio
              </label>
              <Select 
                value={selectedRiver} 
                onValueChange={onRiverChange}
                disabled={!selectedCity}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um rio" />
                </SelectTrigger>
                <SelectContent>
                  {rivers.map((river) => (
                    <SelectItem key={river} value={river}>
                      {river}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {selectedRiver && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Pontos de Coleta (selecione um ou mais)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 p-4 border rounded-lg bg-gray-50">
                {points.map((point) => (
                  <div key={point} className="flex items-center space-x-2">
                    <Checkbox
                      id={point}
                      checked={selectedPoints.includes(point)}
                      onCheckedChange={() => handlePointToggle(point)}
                    />
                    <label
                      htmlFor={point}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {point}
                    </label>
                  </div>
                ))}
              </div>
              {selectedPoints.length > 0 && (
                <p className="text-sm text-gray-600">
                  {selectedPoints.length} ponto(s) selecionado(s): {selectedPoints.join(', ')}
                </p>
              )}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};

export default FilterSection;
