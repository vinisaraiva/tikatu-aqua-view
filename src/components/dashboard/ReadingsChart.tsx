
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ReadingsBarChart from './chart/ReadingsBarChart';
import ChartLegend from './chart/ChartLegend';

interface Reading {
  id: string;
  parameter: string;
  value: number;
  unit: string;
  datetime: string;
  conamaStatus: 'normal' | 'attention' | 'critical';
  hasAnomaly: boolean;
  point: string;
  conamaMin?: number;
  conamaMax?: number;
}

interface ReadingsChartProps {
  readings: Reading[];
  selectedParameter?: string; // This is now the parameter CODE
}

const ReadingsChart = ({ readings, selectedParameter }: ReadingsChartProps) => {
  if (!selectedParameter || readings.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Gráfico de Parâmetros por Ponto</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            {!selectedParameter 
              ? "Selecione um parâmetro para visualizar o gráfico"
              : "Nenhum dado encontrado para os filtros selecionados"
            }
          </div>
        </CardContent>
      </Card>
    );
  }

  // Since we now receive parameter CODE but readings have parameter DESCRIPTION,
  // we need to filter differently. The transformer already filtered by code,
  // so we can use all readings here.
  const parameterReadings = readings;
  
  if (parameterReadings.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Gráfico de {selectedParameter} por Ponto</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            Nenhum dado encontrado para o parâmetro {selectedParameter}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Get the parameter description for display (from the first reading)
  const parameterDescription = parameterReadings[0]?.parameter || selectedParameter;

  // Transform readings data for the chart - one bar per point
  const chartData = parameterReadings.reduce((acc, reading) => {
    const existingPoint = acc.find(item => item.point === reading.point);
    
    if (!existingPoint) {
      // Determine color based on CONAMA limits
      let barColor = '#10b981'; // Default green
      if (reading.conamaMin !== undefined || reading.conamaMax !== undefined) {
        if (reading.conamaMin !== undefined && reading.value < reading.conamaMin) {
          barColor = '#ef4444'; // Red - below minimum
        } else if (reading.conamaMax !== undefined && reading.value > reading.conamaMax) {
          barColor = '#ef4444'; // Red - above maximum
        } else if (reading.conamaMax !== undefined && reading.value > reading.conamaMax * 0.8) {
          barColor = '#f59e0b'; // Yellow - approaching limit (80% of max)
        }
      }

      acc.push({
        point: reading.point,
        value: reading.value,
        unit: reading.unit,
        conamaMin: reading.conamaMin,
        conamaMax: reading.conamaMax,
        status: reading.conamaStatus,
        fill: barColor
      });
    }
    
    return acc;
  }, [] as any[]);

  // Get CONAMA limits for reference lines - ensure we have valid numbers
  const sampleReading = parameterReadings[0];
  const conamaMin = sampleReading?.conamaMin;
  const conamaMax = sampleReading?.conamaMax;
  const unit = sampleReading?.unit || '';

  // Debug log for CONAMA values
  console.log('CONAMA values:', { conamaMin, conamaMax, sampleReading });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gráfico de {parameterDescription} por Ponto de Coleta</CardTitle>
        <p className="text-sm text-gray-600">
          Valores medidos em cada ponto com referências CONAMA
        </p>
      </CardHeader>
      <CardContent>
        <ReadingsBarChart
          chartData={chartData}
          unit={unit}
          parameterDescription={parameterDescription}
          conamaMin={conamaMin}
          conamaMax={conamaMax}
        />
        
        {/* Legend for colors with differentiated CONAMA lines */}
        <ChartLegend conamaMin={conamaMin} conamaMax={conamaMax} />
      </CardContent>
    </Card>
  );
};

export default ReadingsChart;
