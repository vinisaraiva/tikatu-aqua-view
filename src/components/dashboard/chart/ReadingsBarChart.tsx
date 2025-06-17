
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import ChartTooltip from './ChartTooltip';
import ConamaReferenceLines from './ConamaReferenceLines';

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
          
          {/* Reference lines for CONAMA limits - positioned AFTER Bar to appear ON TOP */}
          <ConamaReferenceLines conamaMin={conamaMin} conamaMax={conamaMax} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ReadingsBarChart;
