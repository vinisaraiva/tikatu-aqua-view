
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ReadingsBarChart from './chart/ReadingsBarChart';
import ChartLegend from './chart/ChartLegend';
import ConamaLegend from './chart/ConamaLegend';

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

interface ReadingsChartProps {
  readings: Reading[];
  selectedParameter?: string; // This is now the parameter CODE
}

const ReadingsChart = ({ readings, selectedParameter }: ReadingsChartProps) => {
  console.log('ReadingsChart - Props recebidas:', {
    readingsCount: readings.length,
    selectedParameter,
    firstReading: readings[0],
    conamaValues: readings.map(r => ({ conamaMin: r.conamaMin, conamaMax: r.conamaMax }))
  });

  if (!selectedParameter || readings.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Valores de Parâmetros em cada ponto de coleta</CardTitle>
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
          <CardTitle className="text-xl">Valores de {selectedParameter} em cada ponto de coleta</CardTitle>
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

  // Get CONAMA limits from the first reading (should be the same for all readings of the same parameter)
  const sampleReading = parameterReadings[0];
  const conamaMin = sampleReading?.conamaMin;
  const conamaMax = sampleReading?.conamaMax;
  const unit = sampleReading?.unit || '';

  // Enhanced debug log for CONAMA values
  console.log('ReadingsChart - CONAMA values extracted:', { 
    conamaMin, 
    conamaMax, 
    sampleReading: {
      parameter: sampleReading?.parameter,
      conamaMin: sampleReading?.conamaMin,
      conamaMax: sampleReading?.conamaMax
    },
    allReadingsConama: parameterReadings.map(r => ({
      point: r.point,
      conamaMin: r.conamaMin,
      conamaMax: r.conamaMax
    }))
  });

  // Transform readings data for the chart - one bar per point
  const chartData = parameterReadings.reduce((acc, reading) => {
    const existingPoint = acc.find(item => item.point === reading.point);
    
    if (!existingPoint) {
      // Determine color based on CONAMA status
      let barColor = '#10b981'; // Default green for normal
      if (reading.conamaStatus === 'attention') {
        barColor = '#f59e0b'; // Yellow/amber for attention
      } else if (reading.conamaStatus === 'critical') {
        barColor = '#ef4444'; // Red for critical
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

  console.log('ReadingsChart - Chart data prepared:', chartData);

  // CRÍTICO: Validar se há dados após transformação
  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Valores de {parameterDescription} em cada ponto de coleta</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Nenhum dado encontrado para exibir o gráfico
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Valores de {parameterDescription} em cada ponto de coleta</CardTitle>
      </CardHeader>
      <CardContent>
        {/* CONAMA Legend above the chart */}
        <ConamaLegend conamaMin={conamaMin} conamaMax={conamaMax} />
        
        <ReadingsBarChart
          chartData={chartData}
          unit={unit}
          parameterDescription={parameterDescription}
          conamaMin={conamaMin}
          conamaMax={conamaMax}
        />
        
        {/* Status Legend below the chart (without CONAMA items) */}
        <ChartLegend />
      </CardContent>
    </Card>
  );
};

export default ReadingsChart;
