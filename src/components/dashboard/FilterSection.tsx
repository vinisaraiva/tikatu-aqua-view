
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { Filter, ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';
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

  // Mock data structure: city -> rivers -> points
  const mockData = {
    'São Paulo': {
      'Rio Tietê': ['Ponto SP-TIE-001', 'Ponto SP-TIE-002', 'Ponto SP-TIE-003', 'Ponto SP-TIE-004'],
      'Rio Pinheiros': ['Ponto SP-PIN-001', 'Ponto SP-PIN-002', 'Ponto SP-PIN-003'],
      'Rio Tamanduateí': ['Ponto SP-TAM-001', 'Ponto SP-TAM-002']
    },
    'Rio de Janeiro': {
      'Rio Guandu': ['Ponto RJ-GUA-001', 'Ponto RJ-GUA-002', 'Ponto RJ-GUA-003'],
      'Rio Paraíba do Sul': ['Ponto RJ-PAR-001', 'Ponto RJ-PAR-002', 'Ponto RJ-PAR-003', 'Ponto RJ-PAR-004', 'Ponto RJ-PAR-005']
    },
    'Belo Horizonte': {
      'Rio das Velhas': ['Ponto BH-VEL-001', 'Ponto BH-VEL-002', 'Ponto BH-VEL-003'],
      'Rio Arrudas': ['Ponto BH-ARR-001', 'Ponto BH-ARR-002']
    },
    'Brasília': {
      'Rio Descoberto': ['Ponto DF-DES-001', 'Ponto DF-DES-002', 'Ponto DF-DES-003'],
      'Rio Paranoá': ['Ponto DF-PAR-001', 'Ponto DF-PAR-002']
    }
  };

  const cities = Object.keys(mockData);
  const rivers = selectedCity ? Object.keys(mockData[selectedCity] || {}) : [];
  const points = selectedCity && selectedRiver ? mockData[selectedCity]?.[selectedRiver] || [] : [];

  // Clear dependent selections when parent selection changes
  useEffect(() => {
    if (selectedCity) {
      // If the selected river is not available in the new city, clear it
      const availableRivers = Object.keys(mockData[selectedCity] || {});
      if (selectedRiver && !availableRivers.includes(selectedRiver)) {
        onRiverChange('');
        onPointsChange([]);
      }
    } else {
      // If no city is selected, clear river and points
      onRiverChange('');
      onPointsChange([]);
    }
  }, [selectedCity]);

  useEffect(() => {
    if (selectedCity && selectedRiver) {
      // If the current selected points are not available in the new river, clear them
      const availablePoints = mockData[selectedCity]?.[selectedRiver] || [];
      const validPoints = selectedPoints.filter(point => availablePoints.includes(point));
      if (validPoints.length !== selectedPoints.length) {
        onPointsChange(validPoints);
      }
    } else {
      // If no river is selected, clear points
      onPointsChange([]);
    }
  }, [selectedRiver]);

  const handleCityChange = (value: string) => {
    console.log('City changed to:', value);
    onCityChange(value);
  };

  const handleRiverChange = (value: string) => {
    console.log('River changed to:', value);
    onRiverChange(value);
  };

  const handlePointToggle = (pointId: string) => {
    console.log('Point toggled:', pointId);
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
                <Select value={selectedCity} onValueChange={handleCityChange}>
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
                  onValueChange={handleRiverChange}
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
                  value="" 
                  onValueChange={handlePointToggle}
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
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Pontos selecionados ({selectedPoints.length}):
                </p>
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

            {/* Available Points Display */}
            {selectedRiver && points.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Pontos disponíveis em {selectedRiver} ({points.length}):
                </p>
                <div className="flex flex-wrap gap-2">
                  {points.filter(point => !selectedPoints.includes(point)).map((point) => (
                    <button
                      key={point}
                      onClick={() => handlePointToggle(point)}
                      className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs rounded-full transition-colors"
                    >
                      {point}
                    </button>
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
