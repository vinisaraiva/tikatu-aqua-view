import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { CalendarIcon, Filter, MapPin } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import DateFilter from './DateFilter';
import { useStates, useCities, useRivers, usePoints } from '@/hooks/useGeographicData';
import { useParameters } from '@/hooks/useReadingsData';

interface FilterSectionProps {
  selectedState: string;
  selectedCity: string;
  selectedRiver: string;
  selectedPoints: string[];
  selectedParameter: string; // This will now be the parameter CODE, not description
  onStateChange: (state: string) => void;
  onCityChange: (city: string) => void;
  onRiverChange: (river: string) => void;
  onPointsChange: (points: string[]) => void;
  onParameterChange: (parameter: string) => void; // This will now receive parameter CODE
  onDateChange: (start: Date | undefined, end: Date | undefined) => void;
  showParametersFilter?: boolean;
}

const FilterSection = ({
  selectedState,
  selectedCity,
  selectedRiver,
  selectedPoints,
  selectedParameter,
  onStateChange,
  onCityChange,
  onRiverChange,
  onPointsChange,
  onParameterChange,
  onDateChange,
  showParametersFilter = true,
}: FilterSectionProps) => {
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [previousState, setPreviousState] = useState(selectedState);
  const [previousRiver, setPreviousRiver] = useState(selectedRiver);

  // Fetch real data from Supabase
  const { data: states = [], isLoading: statesLoading } = useStates();
  const { data: cities = [], isLoading: citiesLoading } = useCities(selectedState);
  const selectedCityData = cities.find(city => city.name === selectedCity);
  const { data: rivers = [], isLoading: riversLoading } = useRivers(selectedCityData?.id);
  const selectedRiverData = rivers.find(river => river.name === selectedRiver);
  
  const { data: points = [], isLoading: pointsLoading } = usePoints(selectedRiverData?.id);
  const { data: parameters = [], isLoading: parametersLoading } = useParameters();

  // Find the selected parameter data for display
  const selectedParameterData = parameters.find(param => param.code === selectedParameter);

  // Limpar cidades, rios, pontos e parâmetros quando o estado mudar
  useEffect(() => {
    if (selectedState !== previousState) {
      console.log('FilterSection - Estado mudou, limpando filtros:', { 
        previousState, 
        newState: selectedState 
      });
      onCityChange('');
      onRiverChange('');
      onPointsChange([]);
      onParameterChange(''); // Clear single parameter
    }
    setPreviousState(selectedState);
  }, [selectedState, previousState, onCityChange, onRiverChange, onPointsChange, onParameterChange]);

  // Limpar pontos e parâmetros quando o rio mudar
  useEffect(() => {
    if (selectedRiver !== previousRiver) {
      console.log('FilterSection - Rio mudou, limpando filtros:', { 
        previousRiver, 
        newRiver: selectedRiver 
      });
      onPointsChange([]);
      onParameterChange(''); // Clear single parameter
    }
    setPreviousRiver(selectedRiver);
  }, [selectedRiver, previousRiver, onPointsChange, onParameterChange]);

  // Garantir que pontos sejam limpos se não há rio selecionado
  useEffect(() => {
    if (!selectedRiver && selectedPoints.length > 0) {
      console.log('FilterSection - Sem rio selecionado, limpando pontos');
      onPointsChange([]);
    }
  }, [selectedRiver, selectedPoints.length, onPointsChange]);

  // Debug: Log current state
  console.log('FilterSection Debug:', {
    selectedState,
    selectedCity,
    selectedRiver,
    selectedCityId: selectedCityData?.id,
    selectedRiverId: selectedRiverData?.id,
    pointsCount: points.length,
    selectedPoints,
    selectedParameter,
    selectedParameterData,
  });

  const handlePointChange = (pointName: string, checked: boolean) => {
    console.log('FilterSection - Point change START:', { 
      pointName, 
      checked, 
      currentSelected: selectedPoints,
    });
    
    const currentUniquePoints = [...new Set(selectedPoints)];
    
    let newPoints: string[];
    
    if (checked) {
      if (!currentUniquePoints.includes(pointName)) {
        newPoints = [...currentUniquePoints, pointName];
      } else {
        return;
      }
    } else {
      newPoints = currentUniquePoints.filter(p => p !== pointName);
    }
    
    const finalUniquePoints = [...new Set(newPoints)];
    onPointsChange(finalUniquePoints);
  };

  const handleClearPoints = () => {
    console.log('FilterSection - Clearing all points');
    onPointsChange([]);
  };

  const handleSelectAllPoints = () => {
    const allPointNames = points.map(point => point.name);
    const uniquePointNames = [...new Set(allPointNames)];
    console.log('FilterSection - Selecting all points:', uniquePointNames);
    onPointsChange(uniquePointNames);
  };

  const uniqueSelectedPoints = [...new Set(selectedPoints)];

  return (
    <div className="mb-6 space-y-6">
      {/* Main Filters Card */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros Principais</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Primeira linha: Estado e Cidade (sempre visíveis) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* State Selection */}
            <div>
              <label className="text-sm font-medium mb-2 block">Estado</label>
              <Select value={selectedState} onValueChange={onStateChange} disabled={statesLoading}>
                <SelectTrigger>
                  <SelectValue placeholder={statesLoading ? "Carregando estados..." : "Selecione um estado"} />
                </SelectTrigger>
                <SelectContent>
                  {states.map((state) => (
                    <SelectItem key={state.state} value={state.state}>
                      {state.state} ({state.count} {state.count === 1 ? 'cidade' : 'cidades'})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* City Selection */}
            <div>
              <label className="text-sm font-medium mb-2 block">Cidade</label>
              <Select 
                value={selectedCity} 
                onValueChange={onCityChange} 
                disabled={citiesLoading || !selectedState}
              >
                <SelectTrigger>
                  <SelectValue placeholder={
                    !selectedState 
                      ? "Selecione um estado primeiro" 
                      : citiesLoading 
                        ? "Carregando cidades..." 
                        : "Selecione uma cidade"
                  } />
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
          </div>

          {/* Segunda linha: Rio e Data */}
          {selectedCity && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* River Selection */}
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

              {/* Date Filter */}
              <div>
                <label className="text-sm font-medium mb-2 block">Período</label>
                <Collapsible open={showDateFilter} onOpenChange={setShowDateFilter}>
                  <CollapsibleTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      {showDateFilter ? 'Ocultar Filtro de Data' : 'Filtrar por Data'}
                    </Button>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent className="mt-2">
                    <DateFilter onDateChange={onDateChange} />
                  </CollapsibleContent>
                </Collapsible>
              </div>
            </div>
          )}

          {/* Points and Parameters Filter - Below main filters */}
          {selectedRiver && (
            <div className={`pt-6 border-t ${showParametersFilter ? 'grid grid-cols-1 lg:grid-cols-2 gap-6' : ''}`}>
              {/* Points Filter Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  <h3 className="text-lg font-semibold">Pontos de Coleta</h3>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    {uniqueSelectedPoints.length} de {points.length} selecionados
                  </span>
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
                  <div className="space-y-2 max-h-40 overflow-y-auto border rounded-md p-3 bg-gray-50">
                    {points.map((point) => {
                      const isChecked = uniqueSelectedPoints.includes(point.name);
                      return (
                        <div key={point.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`point-${point.id}`}
                            checked={isChecked}
                            onCheckedChange={(checked) => handlePointChange(point.name, checked as boolean)}
                          />
                          <label
                            htmlFor={`point-${point.id}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                          >
                            {point.name}
                          </label>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Parameters Filter Section - Single selection with CODES */}
              {showParametersFilter && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Filter className="h-5 w-5" />
                    <h3 className="text-lg font-semibold">Parâmetro</h3>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Selecione um parâmetro</label>
                    <Select 
                      value={selectedParameter} 
                      onValueChange={onParameterChange} 
                      disabled={parametersLoading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={parametersLoading ? "Carregando parâmetros..." : "Selecione um parâmetro"} />
                      </SelectTrigger>
                      <SelectContent>
                        {parameters.map((parameter) => (
                          <SelectItem key={parameter.id} value={parameter.code}>
                            {parameter.code} - {parameter.description}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {selectedParameterData && (
                      <div className="mt-2 text-xs text-gray-500">
                        {selectedParameterData.description}
                        {selectedParameterData.unit && (
                          <span> ({selectedParameterData.unit})</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FilterSection;
