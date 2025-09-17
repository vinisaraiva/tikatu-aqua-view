import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ParameterChart from './ParameterChart';
import ReadingsFilters from '../ReadingsFilters';

interface Reading {
  id: string;
  parameter: string;
  value: number;
  unit: string;
  datetime: string;
  conamaStatus: string;
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
                  {parameter} {unit && `(${unit})`}
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

      {/* Summary info */}
      <div className="text-sm text-muted-foreground text-center border-t pt-4">
        Mostrando {Object.keys(parameterGroups).length} parâmetro(s) para {selectedPoints.length} ponto(s) de coleta
      </div>
    </div>
  );
};

export default ParameterChartsView;