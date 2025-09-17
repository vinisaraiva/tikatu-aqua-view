import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Droplets, TrendingUp, AlertTriangle, Clock } from 'lucide-react';

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

interface PointOverviewCardsProps {
  readings: Reading[];
  pointName: string;
}

const PointOverviewCards = ({ readings, pointName }: PointOverviewCardsProps) => {
  const totalParameters = readings.length;
  const criticalCount = readings.filter(r => r.conamaStatus === 'critical').length;
  const attentionCount = readings.filter(r => r.conamaStatus === 'attention').length;
  const normalCount = readings.filter(r => r.conamaStatus === 'normal').length;
  const anomaliesCount = readings.filter(r => r.hasAnomaly).length;
  
  const lastReading = readings.length > 0 ? new Date(readings[0].datetime) : null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Parâmetros Monitorados</CardTitle>
          <Droplets className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalParameters}</div>
          <p className="text-xs text-muted-foreground">para {pointName}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Status CONAMA</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-1">
            {criticalCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                {criticalCount} Crítico{criticalCount > 1 ? 's' : ''}
              </Badge>
            )}
            {attentionCount > 0 && (
              <Badge variant="outline" className="text-xs border-yellow-500 text-yellow-700">
                {attentionCount} Atenção
              </Badge>
            )}
            {normalCount > 0 && (
              <Badge variant="outline" className="text-xs border-green-500 text-green-700">
                {normalCount} Normal
              </Badge>
            )}
            {totalParameters === 0 && (
              <span className="text-sm text-muted-foreground">Sem dados</span>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Anomalias</CardTitle>
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{anomaliesCount}</div>
          <p className="text-xs text-muted-foreground">
            {anomaliesCount === 0 ? 'Nenhuma anomalia' : 'detectadas'}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Última Leitura</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {lastReading ? (
            <>
              <div className="text-sm font-medium">
                {lastReading.toLocaleDateString('pt-BR')}
              </div>
              <p className="text-xs text-muted-foreground">
                {lastReading.toLocaleTimeString('pt-BR')}
              </p>
            </>
          ) : (
            <div className="text-sm text-muted-foreground">Sem dados</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PointOverviewCards;