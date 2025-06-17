
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from 'recharts';

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

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium">{`${label}`}</p>
          <p className="text-blue-600">{`Valor: ${data.value} ${unit}`}</p>
          {data.conamaMin !== undefined && (
            <p className="text-green-600 text-sm">{`Min CONAMA: ${data.conamaMin} ${unit}`}</p>
          )}
          {data.conamaMax !== undefined && (
            <p className="text-orange-600 text-sm">{`Max CONAMA: ${data.conamaMax} ${unit}`}</p>
          )}
          <p className={`text-sm font-medium ${
            data.status === 'normal' ? 'text-green-600' : 
            data.status === 'attention' ? 'text-yellow-600' : 'text-red-600'
          }`}>
            Status: {data.status === 'normal' ? 'Normal' : data.status === 'attention' ? 'Atenção' : 'Crítico'}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gráfico de {parameterDescription} por Ponto de Coleta</CardTitle>
        <p className="text-sm text-gray-600">
          Valores medidos em cada ponto com referências CONAMA
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 40, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="point" 
                angle={-45}
                textAnchor="end"
                height={80}
                fontSize={12}
              />
              <YAxis 
                label={{ value: unit, angle: -90, position: 'insideLeft' }}
              />
              <Tooltip content={<CustomTooltip />} />
              
              <Bar
                dataKey="value"
                name={`${parameterDescription} (${unit})`}
                radius={[4, 4, 0, 0]}
              />

              {/* Reference lines for CONAMA limits with different colors - positioned after Bar */}
              {conamaMin !== undefined && conamaMin !== null && (
                <ReferenceLine 
                  y={conamaMin} 
                  stroke="#22c55e" 
                  strokeWidth={3}
                  strokeDasharray="8 4" 
                  label={{ 
                    value: `Min CONAMA: ${conamaMin}`, 
                    position: "topRight", 
                    offset: 10,
                    style: { 
                      fill: '#22c55e', 
                      fontWeight: 'bold',
                      fontSize: '12px'
                    } 
                  }}
                />
              )}
              {conamaMax !== undefined && conamaMax !== null && (
                <ReferenceLine 
                  y={conamaMax} 
                  stroke="#f97316" 
                  strokeWidth={3}
                  strokeDasharray="8 4" 
                  label={{ 
                    value: `Max CONAMA: ${conamaMax}`, 
                    position: "topRight", 
                    offset: 10,
                    style: { 
                      fill: '#f97316', 
                      fontWeight: 'bold',
                      fontSize: '12px'
                    } 
                  }}
                />
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {/* Legend for colors with differentiated CONAMA lines */}
        <div className="mt-4 flex flex-wrap gap-6 justify-center text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span>Normal</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-500 rounded"></div>
            <span>Atenção</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span>Crítico</span>
          </div>
          {conamaMin !== undefined && conamaMin !== null && (
            <div className="flex items-center gap-2">
              <div className="w-6 h-1 bg-green-500" style={{ borderTop: '3px dashed #22c55e' }}></div>
              <span>Min CONAMA: {conamaMin}</span>
            </div>
          )}
          {conamaMax !== undefined && conamaMax !== null && (
            <div className="flex items-center gap-2">
              <div className="w-6 h-1 bg-orange-500" style={{ borderTop: '3px dashed #f97316' }}></div>
              <span>Max CONAMA: {conamaMax}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ReadingsChart;
