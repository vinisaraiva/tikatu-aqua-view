import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

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

interface PointRadarChartProps {
  readings: Reading[];
  pointName: string;
}

const PointRadarChart = ({ readings, pointName }: PointRadarChartProps) => {
  if (readings.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Perfil de Parâmetros - {pointName}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Dados insuficientes para gerar o radar
          </div>
        </CardContent>
      </Card>
    );
  }

  // Transform readings for radar chart
  const radarData = readings
    .filter(reading => reading.conamaMax && reading.conamaMax > 0) // Only parameters with CONAMA limits
    .map(reading => {
      const percentage = Math.min((reading.value / (reading.conamaMax || 1)) * 100, 100);
      return {
        parameter: reading.parameter.length > 15 
          ? reading.parameter.substring(0, 15) + '...' 
          : reading.parameter,
        value: percentage,
        fullParameter: reading.parameter,
        actualValue: reading.value,
        unit: reading.unit,
        limit: reading.conamaMax,
        status: reading.conamaStatus
      };
    });

  if (radarData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Perfil de Parâmetros - {pointName}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Nenhum parâmetro com limites CONAMA disponível
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Perfil de Parâmetros - {pointName}</CardTitle>
        <p className="text-sm text-muted-foreground">
          Porcentagem em relação aos limites CONAMA
        </p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <RadarChart data={radarData}>
            <PolarGrid />
            <PolarAngleAxis 
              dataKey="parameter" 
              className="text-xs"
              tick={{ fontSize: 12 }}
            />
            <PolarRadiusAxis 
              angle={90} 
              domain={[0, 100]} 
              className="text-xs"
              tick={{ fontSize: 10 }}
            />
            <Radar
              name="Parâmetros"
              dataKey="value"
              stroke="#3b82f6"
              fill="#3b82f6"
              fillOpacity={0.3}
              strokeWidth={2}
            />
          </RadarChart>
        </ResponsiveContainer>
        <div className="mt-4 text-xs text-muted-foreground">
          <p>• 0-50%: Normal</p>
          <p>• 50-80%: Atenção</p>
          <p>• 80-100%: Crítico</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PointRadarChart;