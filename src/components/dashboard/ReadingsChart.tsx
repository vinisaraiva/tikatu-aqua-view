
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ReadingsBarChart from './chart/ReadingsBarChart';
import ChartLegend from './chart/ChartLegend';
import ConamaLegend from './chart/ConamaLegend';
import { buildAxisLabels } from './chart/chartLabels';

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

  // Uma barra por coleta, em ordem cronológica, rotulada pela data
  const sortedReadings = [...parameterReadings].sort(
    (a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime()
  );
  const labels = buildAxisLabels(sortedReadings);

  const chartData = sortedReadings.map((reading, index) => {
    let barColor = '#10b981';
    if (reading.conamaStatus === 'attention') {
      barColor = '#f59e0b';
    } else if (reading.conamaStatus === 'critical') {
      barColor = '#ef4444';
    }

    return {
      label: labels[index],
      point: reading.point,
      datetime: reading.datetime,
      value: reading.value,
      unit: reading.unit,
      conamaMin: reading.conamaMin,
      conamaMax: reading.conamaMax,
      status: reading.conamaStatus,
      fill: barColor
    };
  });

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
