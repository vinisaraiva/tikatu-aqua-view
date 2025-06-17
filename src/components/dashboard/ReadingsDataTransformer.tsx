
import { ReadingValue } from '@/hooks/useReadingsData';

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

interface TransformReadingsParams {
  readingValues: ReadingValue[];
  readings: any[];
  selectedPointsData: any[];
  parameter: string;
}

export const transformReadingsData = ({ 
  readingValues, 
  readings, 
  selectedPointsData, 
  parameter 
}: TransformReadingsParams): Reading[] => {
  // Filter reading values by selected parameter
  const filteredReadingValues = readingValues.filter(value => {
    if (!parameter) return true; // Show all if no parameter selected
    return parameter === (value.parameter?.code || '');
  });

  // Transform data for display
  const transformedReadings: Reading[] = filteredReadingValues.map((value) => {
    const reading = readings.find(r => r.id === value.reading_id);
    const point = selectedPointsData.find(p => p.id === reading?.point_id);
    
    if (!reading || !point) return null;

    // Determine CONAMA status based on parameter limits
    let conamaStatus: 'normal' | 'attention' | 'critical' = 'normal';
    let hasAnomaly = false;

    if (value.parameter) {
      const { conama_min, conama_max } = value.parameter;
      
      if (conama_min !== null && value.value < conama_min) {
        conamaStatus = 'critical';
        hasAnomaly = true;
      } else if (conama_max !== null && value.value > conama_max) {
        conamaStatus = 'critical';
        hasAnomaly = true;
      } else if (conama_min !== null && value.value < conama_min * 1.2) {
        conamaStatus = 'attention';
        hasAnomaly = true;
      } else if (conama_max !== null && value.value > conama_max * 0.8) {
        conamaStatus = 'attention';
        hasAnomaly = true;
      }
    }

    return {
      id: `${reading.id}-${value.parameter_id}`,
      parameter: value.parameter?.description || 'Parâmetro Desconhecido',
      value: value.value,
      unit: value.parameter?.unit || '',
      datetime: reading.measured_at,
      conamaStatus,
      hasAnomaly,
      point: point.name,
    };
  }).filter(Boolean) as Reading[];

  return transformedReadings;
};
