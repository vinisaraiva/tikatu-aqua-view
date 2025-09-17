import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { getStatusBadge } from '../ReadingsStatus';

interface Reading {
  id: string;
  parameter: string;
  value: number;
  unit: string;
  datetime: string;
  conamaStatus: 'normal' | 'attention' | 'critical';
  hasAnomaly: boolean;
  point: string;
  conamaMin?: number | null;
  conamaMax?: number | null;
}

interface PointParametersGridProps {
  readings: Reading[];
}

const PointParametersGrid = ({ readings }: PointParametersGridProps) => {
  if (readings.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">
            Nenhum parâmetro encontrado para este ponto
          </div>
        </CardContent>
      </Card>
    );
  }

  const getProgressValue = (reading: Reading): number => {
    if (!reading.conamaMax || reading.conamaMax <= 0) return 0;
    return Math.min((reading.value / reading.conamaMax) * 100, 100);
  };

  const getProgressColor = (status: string): string => {
    switch (status) {
      case 'critical': return 'bg-red-500';
      case 'attention': return 'bg-yellow-500';
      default: return 'bg-green-500';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {readings.map((reading) => (
        <Card key={reading.id} className="relative">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <CardTitle className="text-sm font-medium line-clamp-2">
                {reading.parameter}
              </CardTitle>
              {reading.hasAnomaly && (
                <Badge variant="outline" className="text-xs border-orange-500 text-orange-700">
                  Anomalia
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">
                {reading.value}
              </span>
              <span className="text-sm text-muted-foreground">
                {reading.unit}
              </span>
            </div>

            {reading.conamaMax && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Limite CONAMA</span>
                  <span>{reading.conamaMax} {reading.unit}</span>
                </div>
                <Progress 
                  value={getProgressValue(reading)} 
                  className="h-2"
                />
              </div>
            )}

            <div className="flex justify-between items-center">
              {getStatusBadge(reading.conamaStatus)}
              <span className="text-xs text-muted-foreground">
                {new Date(reading.datetime).toLocaleDateString('pt-BR')}
              </span>
            </div>

            {(reading.conamaMin || reading.conamaMax) && (
              <div className="text-xs text-muted-foreground space-y-1">
                {reading.conamaMin && (
                  <div>Mín: {reading.conamaMin} {reading.unit}</div>
                )}
                {reading.conamaMax && (
                  <div>Máx: {reading.conamaMax} {reading.unit}</div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default PointParametersGrid;