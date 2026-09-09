import { useMemo } from 'react';
import ReadingsBarChart from '../chart/ReadingsBarChart';
import ConamaLegend from '../chart/ConamaLegend';
import ChartLegend from '../chart/ChartLegend';
import { buildAxisLabels } from '../chart/chartLabels';

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

interface ParameterChartProps {
  readings: Reading[];
  parameter: string;
  unit: string;
  conamaMin?: number | null;
  conamaMax?: number | null;
}

const ParameterChart = ({ 
  readings, 
  parameter, 
  unit, 
  conamaMin, 
  conamaMax 
}: ParameterChartProps) => {
  // Transform readings data for chart (ordem cronológica, rótulo com data)
  const chartData = useMemo(() => {
    const sorted = [...readings].sort(
      (a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime()
    );
    const labels = buildAxisLabels(sorted);

    return sorted.map((reading, index) => {
      let barColor = '#3b82f6'; // Default blue
      
      // Set color based on CONAMA status
      if (reading.conamaStatus === 'normal') {
        barColor = '#22c55e'; // Green
      } else if (reading.conamaStatus === 'attention') {
        barColor = '#f59e0b'; // Yellow/amber
      } else if (reading.conamaStatus === 'critical') {
        barColor = '#ef4444'; // Red
      }

      return {
        label: labels[index],
        point: reading.point,
        datetime: reading.datetime,
        value: reading.value,
        fill: barColor,
        status: reading.conamaStatus,
        conamaMin: reading.conamaMin,
        conamaMax: reading.conamaMax,
        hasAnomaly: reading.hasAnomaly
      };
    });
  }, [readings]);

  if (readings.length === 0) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        Nenhum dado disponível para este parâmetro
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* CONAMA Legend */}
      <ConamaLegend 
        conamaMin={conamaMin}
        conamaMax={conamaMax}
      />

      {/* Chart */}
      <ReadingsBarChart
        chartData={chartData}
        unit={unit}
        parameterDescription={parameter}
        conamaMin={conamaMin}
        conamaMax={conamaMax}
      />

      {/* Status Legend */}
      <ChartLegend />
    </div>
  );
};

export default ParameterChart;