
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { FilterIcon, XIcon } from 'lucide-react';

interface FilterSectionProps {
  selectedCity: string;
  selectedRiver: string;
  selectedPoint: string;
  onCityChange: (city: string) => void;
  onRiverChange: (river: string) => void;
  onPointChange: (point: string) => void;
}

const FilterSection = ({
  selectedCity,
  selectedRiver,
  selectedPoint,
  onCityChange,
  onRiverChange,
  onPointChange,
}: FilterSectionProps) => {
  const [isFiltersOpen, setIsFiltersOpen] = useState(true);

  // Mock data for demonstration
  const cities = ['São Paulo', 'Rio de Janeiro', 'Belo Horizonte', 'Salvador'];
  const rivers = selectedCity ? ['Rio Tietê', 'Rio Pinheiros', 'Rio Tamanduateí'] : [];
  const points = selectedRiver ? ['Ponto 001', 'Ponto 002', 'Ponto 003'] : [];

  const clearFilters = () => {
    onCityChange('');
    onRiverChange('');
    onPointChange('');
  };

  const hasFilters = selectedCity || selectedRiver || selectedPoint;

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
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Ponto de Coleta
              </label>
              <Select 
                value={selectedPoint} 
                onValueChange={onPointChange}
                disabled={!selectedRiver}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um ponto" />
                </SelectTrigger>
                <SelectContent>
                  {points.map((point) => (
                    <SelectItem key={point} value={point}>
                      {point}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default FilterSection;
