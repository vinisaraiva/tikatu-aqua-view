
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { CalendarIcon, Filter, MapPin } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import DateFilter from './DateFilter';
import { useCities, useRivers, usePoints } from '@/hooks/useGeographicData';
import { useParameters } from '@/hooks/useReadingsData';

interface FilterSectionProps {
  selectedCity: string;
  selectedRiver: string;
  selectedPoints: string[];
  selectedParameters: string[];
  onCityChange: (city: string) => void;
  onRiverChange: (river: string) => void;
  onPointsChange: (points: string[]) => void;
  onParametersChange: (parameters: string[]) => void;
  onDateChange: (start: Date | undefined, end: Date | undefined) => void;
}

const FilterSection = ({
  selectedCity,
  selectedRiver,
  selectedPoints,
  selectedParameters,
  onCityChange,
  onRiverChange,
  onPointsChange,
  onParametersChange,
  onDateChange,
}: FilterSectionProps) => {
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [showParametersFilter, setShowParametersFilter] = useState(false);
  const [showPointsFilter, setShowPointsFilter] = useState(false);

  // Fetch real data from Supabase
  const { data: cities = [], isLoading: citiesLoading } = useCities();
  const selectedCityData = cities.find(city => city.name === selectedCity);
  const { data: rivers = [], isLoading: riversLoading } = useRivers(selectedCityData?.id);
  const selectedRiverData = rivers.find(river => river.name === selectedRiver);
  const { data: points = [], isLoading: pointsLoading } = usePoints(selectedRiverData?.id);
  const { data: parameters = [], isLoading: parametersLoading } = useParameters();

  console.log('FilterSection Debug:', {
    selectedCity,
    selectedRiver,
    selectedRiverData,
    pointsCount: points.length,
    pointsLoading,
    showPointsFilter: !!selectedRiver
  });

  const handlePointChange = (pointName: string, checked: boolean) => {
    if (checked) {
      onPointsChange([...selectedPoints, pointName]);
    } else {
      onPointsChange(selectedPoints.filter(p => p !== pointName));
    }
  };

  const handleParameterChange = (parameterCode: string, checked: boolean) => {
    if (checked) {
      onParametersChange([...selectedParameters, parameterCode]);
    } else {
      onParametersChange(selectedParameters.filter(p => p !== parameterCode));
    }
  };

  const handleClearPoints = () => {
    onPointsChange([]);
  };

  const handleSelectAllPoints = () => {
    onPointsChange(points.map(point => point.name));
  };

  const handleClearParameters = () => {
    onParametersChange([]);
  };

  const handleSelectAllParameters = () => {
    onParametersChange(parameters.map(param => param.code));
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

        {/* Points Filter - Collapsible - Show when river is selected */}
        {selectedRiver && (
          <Collapsible open={showPointsFilter} onOpenChange={setShowPointsFilter}>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Pontos de Coleta</label>
              <CollapsibleTrigger asChild>
                <Button variant="outline" size="sm">
                  <MapPin className="h-4 w-4 mr-2" />
                  {showPointsFilter ? 'Ocultar Pontos' : 'Filtrar Pontos'}
                </Button>
              </CollapsibleTrigger>
            </div>
            
            <CollapsibleContent className="space-y-4 mt-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Selecionar pontos:</span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSelectAllPoints}
                    disabled={pointsLoading || points.length === 0}
                  >
                    Todos
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
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Parameters Filter - Collapsible */}
        <Collapsible open={showParametersFilter} onOpenChange={setShowParametersFilter}>
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Parâmetros</label>
            <CollapsibleTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                {showParametersFilter ? 'Ocultar Filtros' : 'Filtrar Parâmetros'}
              </Button>
            </CollapsibleTrigger>
          </div>
          
          <CollapsibleContent className="space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Selecionar parâmetros:</span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAllParameters}
                  disabled={parametersLoading || parameters.length === 0}
                >
                  Todos
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearParameters}
                  disabled={selectedParameters.length === 0}
                >
                  Limpar
                </Button>
              </div>
            </div>
            
            {parametersLoading ? (
              <p className="text-sm text-gray-500">Carregando parâmetros...</p>
            ) : parameters.length === 0 ? (
              <p className="text-sm text-gray-500">Nenhum parâmetro encontrado.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-40 overflow-y-auto">
                {parameters.map((parameter) => (
                  <div key={parameter.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={parameter.code}
                      checked={selectedParameters.includes(parameter.code)}
                      onCheckedChange={(checked) => handleParameterChange(parameter.code, checked as boolean)}
                    />
                    <label
                      htmlFor={parameter.code}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      title={parameter.description}
                    >
                      {parameter.code}
                    </label>
                  </div>
                ))}
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>

        {/* Date Filter - Collapsible */}
        <Collapsible open={showDateFilter} onOpenChange={setShowDateFilter}>
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Período</label>
            <CollapsibleTrigger asChild>
              <Button variant="outline" size="sm">
                <CalendarIcon className="h-4 w-4 mr-2" />
                {showDateFilter ? 'Ocultar Filtro' : 'Filtrar por Data'}
              </Button>
            </CollapsibleTrigger>
          </div>
          
          <CollapsibleContent className="mt-4">
            <DateFilter onDateChange={onDateChange} />
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
};

export default FilterSection;
