import { useState, useEffect } from 'react';
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
  showParametersFilter?: boolean;
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
  showParametersFilter = true,
}: FilterSectionProps) => {
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [showParametersFilterCollapsed, setShowParametersFilterCollapsed] = useState(true); // Changed to true to show by default
  const [previousRiver, setPreviousRiver] = useState(selectedRiver);

  // Fetch real data from Supabase
  const { data: cities = [], isLoading: citiesLoading } = useCities();
  const selectedCityData = cities.find(city => city.name === selectedCity);
  const { data: rivers = [], isLoading: riversLoading } = useRivers(selectedCityData?.id);
  const selectedRiverData = rivers.find(river => river.name === selectedRiver);
  
  // CORREÇÃO: Usar o ID do rio selecionado para filtrar apenas os pontos desse rio
  const { data: points = [], isLoading: pointsLoading } = usePoints(selectedRiverData?.id);
  const { data: parameters = [], isLoading: parametersLoading } = useParameters();

  // Limpar pontos e parâmetros quando o rio mudar
  useEffect(() => {
    if (selectedRiver !== previousRiver) {
      console.log('FilterSection - Rio mudou, limpando filtros:', { 
        previousRiver, 
        newRiver: selectedRiver 
      });
      onPointsChange([]);
      onParametersChange([]);
    }
    setPreviousRiver(selectedRiver);
  }, [selectedRiver, previousRiver, onPointsChange, onParametersChange]);

  // CORREÇÃO ADICIONAL: Garantir que pontos sejam limpos se não há rio selecionado
  useEffect(() => {
    if (!selectedRiver && selectedPoints.length > 0) {
      console.log('FilterSection - Sem rio selecionado, limpando pontos');
      onPointsChange([]);
    }
  }, [selectedRiver, selectedPoints.length, onPointsChange]);

  console.log('FilterSection Debug - VERIFICAÇÃO ANTI-DUPLICATA:', {
    selectedCity,
    selectedRiver,
    selectedCityId: selectedCityData?.id,
    selectedRiverId: selectedRiverData?.id,
    pointsCount: points.length,
    pointsLoading,
    availablePoints: points.map(p => ({ id: p.id, name: p.name, river_id: p.river_id })),
    selectedPoints,
    selectedPointsLength: selectedPoints.length,
    selectedPointsUnique: [...new Set(selectedPoints)],
    uniqueLength: [...new Set(selectedPoints)].length,
    isDuplicated: selectedPoints.length !== [...new Set(selectedPoints)].length
  });

  const handlePointChange = (pointName: string, checked: boolean) => {
    console.log('FilterSection - Point change START:', { 
      pointName, 
      checked, 
      currentSelected: selectedPoints,
      currentLength: selectedPoints.length 
    });
    
    // CORREÇÃO PRINCIPAL: Sempre garantir que trabalhamos com lista única
    const currentUniquePoints = [...new Set(selectedPoints)];
    console.log('FilterSection - Current unique points:', currentUniquePoints);
    
    let newPoints: string[];
    
    if (checked) {
      // Verificar se o ponto já está selecionado para evitar duplicatas
      if (!currentUniquePoints.includes(pointName)) {
        newPoints = [...currentUniquePoints, pointName];
        console.log('FilterSection - Adding point, new list:', newPoints);
      } else {
        console.log('FilterSection - Point already selected, ignoring:', pointName);
        return; // Não fazer nada se já existe
      }
    } else {
      newPoints = currentUniquePoints.filter(p => p !== pointName);
      console.log('FilterSection - Removing point, new list:', newPoints);
    }
    
    // GARANTIR que a nova lista não tem duplicatas antes de passar adiante
    const finalUniquePoints = [...new Set(newPoints)];
    console.log('FilterSection - Final unique points to set:', finalUniquePoints);
    
    onPointsChange(finalUniquePoints);
  };

  const handleParameterChange = (parameterCode: string, checked: boolean) => {
    if (checked) {
      onParametersChange([...selectedParameters, parameterCode]);
    } else {
      onParametersChange(selectedParameters.filter(p => p !== parameterCode));
    }
  };

  const handleClearPoints = () => {
    console.log('FilterSection - Clearing all points');
    onPointsChange([]);
  };

  const handleSelectAllPoints = () => {
    const allPointNames = points.map(point => point.name);
    // Garantir que não há duplicatas ao selecionar todos
    const uniquePointNames = [...new Set(allPointNames)];
    console.log('FilterSection - Selecting all points:', uniquePointNames);
    onPointsChange(uniquePointNames);
  };

  const handleClearParameters = () => {
    onParametersChange([]);
  };

  const handleSelectAllParameters = () => {
    onParametersChange(parameters.map(param => param.code));
  };

  // CORREÇÃO: Sempre usar lista única para verificações e exibições
  const uniqueSelectedPoints = [...new Set(selectedPoints)];

  return (
    <div className="mb-6 space-y-6">
      {/* Main Filters Card */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros Principais</CardTitle>
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

          {/* Points and Parameters Filter - Side by Side within Main Card */}
          {selectedRiver && (
            <div className={`pt-4 border-t ${showParametersFilter ? 'grid grid-cols-1 lg:grid-cols-2 gap-6' : ''}`}>
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

              {/* Parameters Filter Section - Only show if showParametersFilter is true */}
              {showParametersFilter && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Filter className="h-5 w-5" />
                    <h3 className="text-lg font-semibold">Parâmetros</h3>
                  </div>

                  <Collapsible open={showParametersFilterCollapsed} onOpenChange={setShowParametersFilterCollapsed}>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        {showParametersFilter ? `${selectedParameters.length} de ${parameters.length} selecionados` : 'Filtros avançados'}
                      </span>
                      <CollapsibleTrigger asChild>
                        <Button variant="outline" size="sm">
                          {showParametersFilterCollapsed ? 'Ocultar' : 'Mostrar'}
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
                        <div className="max-h-40 overflow-y-auto border rounded-md p-3 bg-gray-50">
                          <div className="grid grid-cols-2 gap-2">
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
                        </div>
                      )}
                    </CollapsibleContent>
                  </Collapsible>
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

</edits_to_apply>
