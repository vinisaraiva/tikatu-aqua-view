
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { Filter, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import DateFilter from './DateFilter';

interface FilterSectionProps {
  selectedCity: string;
  selectedRiver: string;
  selectedPoints: string[];
  onCityChange: (value: string) => void;
  onRiverChange: (value: string) => void;
  onPointsChange: (values: string[]) => void;
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
  showDateFilter = true
}: FilterSectionProps) => {
  const [isOpen, setIsOpen] = useState(true);

  // Mock data
  const cities = ['São Paulo', 'Rio de Janeiro', 'Belo Horizonte', 'Brasília'];
  const rivers = selectedCity ? ['Rio Tietê', 'Rio Pinheiros', 'Rio Tamanduateí'] : [];
  const points = selectedRiver ? ['Ponto 001', 'Ponto 002', 'Ponto 003', 'Ponto 004', 'Ponto 005'] : [];

  const handlePointToggle = (pointId: string) => {
    const newSelection = selectedPoints.includes(pointId)
      ? selectedPoints.filter(id => id !== pointId)
      : [...selectedPoints, pointId];
    onPointsChange(newSelection);
  };

  return (
    <Card className="mb-6">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filtros
              </CardTitle>
              <Button variant="ghost" size="sm">
                <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </Button>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {/* City Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Cidade</label>
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

              {/* River Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Rio</label>
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

              {/* Points Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Pontos de Coleta</label>
                <Select 
                  value={selectedPoints[0] || ''} 
                  onValueChange={(value) => handlePointToggle(value)}
                  disabled={!selectedRiver}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione pontos" />
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

              {/* Date Filter */}
              {showDateFilter && onDateChange && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Período</label>
                  <DateFilter onDateChange={onDateChange} />
                </div>
              )}
            </div>

            {/* Selected Points Display */}
            {selectedPoints.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Pontos selecionados:</p>
                <div className="flex flex-wrap gap-2">
                  {selectedPoints.map((point) => (
                    <span
                      key={point}
                      className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                    >
                      {point}
                      <button
                        onClick={() => handlePointToggle(point)}
                        className="ml-1 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default FilterSection;
