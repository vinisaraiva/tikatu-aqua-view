import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ParameterChart from './ParameterChart';
import ReadingsFilters from '../ReadingsFilters';

interface Reading {
  id: string;
  parameter: string;
  parameterCode: string;
  value: number;
  unit: string;
  datetime: string;
  conamaStatus: 'normal' | 'attention' | 'critical';
  hasAnomaly: boolean;
  point: string;
  conamaMin?: number | null;
  conamaMax?: number | null;
}

interface ParameterChartsViewProps {
  readings: Reading[];
  selectedPoints: string[];
  city: string;
  river: string;
}

const ParameterChartsView = ({ readings, selectedPoints, city, river }: ParameterChartsViewProps) => {
  // Group readings by parameter
  const parameterGroups = useMemo(() => {
    const groups: Record<string, Reading[]> = {};
    
    readings.forEach(reading => {
      if (!groups[reading.parameter]) {
        groups[reading.parameter] = [];
      }
      groups[reading.parameter].push(reading);
    });
    
    return groups;
  }, [readings]);

  // Check which selected points have data
  const pointsWithData = useMemo(() => {
    const pointsSet = new Set<string>();
    readings.forEach(reading => pointsSet.add(reading.point));
    return Array.from(pointsSet);
  }, [readings]);

  const pointsWithoutData = useMemo(() => {
    return selectedPoints.filter(point => !pointsWithData.includes(point));
  }, [selectedPoints, pointsWithData]);

  const hasData = Object.keys(parameterGroups).length > 0;

  if (!hasData) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>Nenhum dado encontrado para os filtros selecionados.</p>
        <p className="text-sm mt-2">Verifique se há leituras disponíveis para os pontos de coleta e período selecionados.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters display */}
      <ReadingsFilters 
        city={city}
        river={river}
        points={selectedPoints}
        parameter="Todos os parâmetros"
      />

      {/* Parameter charts grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Object.entries(parameterGroups).map(([parameter, parameterReadings]) => {
          // Get unit and CONAMA values from first reading
          const firstReading = parameterReadings[0];
          const unit = firstReading?.unit || '';
          const conamaMin = firstReading?.conamaMin;
          const conamaMax = firstReading?.conamaMax;

          return (
            <Card key={parameter} className="p-0">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold">
                  {firstReading?.parameterCode && <span className="font-bold text-primary">{firstReading.parameterCode}</span>} - {parameter} {unit && `(${unit})`}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <ParameterChart
                  readings={parameterReadings}
                  parameter={parameter}
                  unit={unit}
                  conamaMin={conamaMin}
                  conamaMax={conamaMax}
                />
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Points without data info */}
      {pointsWithoutData.length > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-amber-800 mb-2">
              <span className="text-sm font-medium">Pontos sem dados disponíveis:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {pointsWithoutData.map(point => (
                <span key={point} className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded">
                  {point}
                </span>
              ))}
            </div>
            <p className="text-xs text-amber-600 mt-2">
              Estes pontos não possuem leituras registradas para o período e parâmetros selecionados.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Summary info */}
      <div className="text-sm text-muted-foreground text-center border-t pt-4">
        Mostrando {Object.keys(parameterGroups).length} parâmetro(s) para {pointsWithData.length} de {selectedPoints.length} ponto(s) de coleta
        {pointsWithoutData.length > 0 && (
          <span className="text-amber-600 ml-2">
            ({pointsWithoutData.length} sem dados)
          </span>
        )}
      </div>
    </div>
  );
};

export default ParameterChartsView;