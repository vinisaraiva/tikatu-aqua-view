
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import ChartTooltip from './ChartTooltip';

interface ReadingsBarChartProps {
  chartData: any[];
  unit: string;
  parameterDescription: string;
  conamaMin?: number | null;
  conamaMax?: number | null;
}

const ReadingsBarChart = ({ 
  chartData, 
  unit, 
  parameterDescription, 
  conamaMin, 
  conamaMax 
}: ReadingsBarChartProps) => {
  console.log('ReadingsBarChart - CONAMA values received:', { conamaMin, conamaMax });
  
  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart 
          data={chartData} 
          margin={{ top: 40, right: 30, left: 20, bottom: 5 }}
        >
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
          <Tooltip content={<ChartTooltip unit={unit} />} />
          
          {/* Bar chart */}
          <Bar
            dataKey="value"
            name={`${parameterDescription} (${unit})`}
            radius={[4, 4, 0, 0]}
          />
          
          {/* CONAMA Reference Lines - now directly inside BarChart */}
          {conamaMin !== undefined && conamaMin !== null && (
            <ReferenceLine 
              y={conamaMin} 
              stroke="#22c55e" 
              strokeWidth={3} 
              strokeDasharray="8 4" 
              ifOverflow="extendDomain"
              label={{ 
                value: `Min CONAMA: ${conamaMin}`, 
                position: "top", 
                fill: '#22c55e',
                fontSize: 12,
                fontWeight: 'bold',
                offset: 10
              }}
            />
          )}
          {conamaMax !== undefined && conamaMax !== null && (
            <ReferenceLine 
              y={conamaMax} 
              stroke="#f97316" 
              strokeWidth={3} 
              strokeDasharray="8 4" 
              ifOverflow="extendDomain"
              label={{ 
                value: `Max CONAMA: ${conamaMax}`, 
                position: "top", 
                fill: '#f97316',
                fontSize: 12, 
                fontWeight: 'bold',
                offset: 10
              }}
            />
          )}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ReadingsBarChart;
