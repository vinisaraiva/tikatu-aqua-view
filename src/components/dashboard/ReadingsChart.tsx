
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface Reading {
  id: string;
  parameter: string;
  value: number;
  unit: string;
  datetime: string;
  conamaStatus: 'normal' | 'attention' | 'critical';
  hasAnomaly: boolean;
  point: string;
}

interface ReadingsChartProps {
  readings: Reading[];
}

const ReadingsChart = ({ readings }: ReadingsChartProps) => {
  // Transform readings data for the chart
  const chartData = readings.reduce((acc, reading) => {
    const existingParam = acc.find(item => item.parameter === reading.parameter);
    
    if (existingParam) {
      existingParam[reading.point] = reading.value;
    } else {
      acc.push({
        parameter: reading.parameter,
        [reading.point]: reading.value,
      });
    }
    
    return acc;
  }, [] as any[]);

  // Get unique points for the legend
  const uniquePoints = [...new Set(readings.map(r => r.point))];
  
  // Colors for different points
  const colors = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gráfico de Parâmetros por Ponto</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="parameter" 
                angle={-45}
                textAnchor="end"
                height={80}
                fontSize={12}
              />
              <YAxis />
              <Tooltip />
              <Legend />
              {uniquePoints.map((point, index) => (
                <Bar
                  key={point}
                  dataKey={point}
                  fill={colors[index % colors.length]}
                  name={point}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReadingsChart;
