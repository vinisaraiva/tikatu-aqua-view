
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
  console.log('TransformReadingsData - Iniciando transformação:', {
    readingValuesCount: readingValues.length,
    readingsCount: readings.length,
    selectedPointsCount: selectedPointsData.length,
    selectedParameter: parameter
  });

  // Debug: log all reading values with their parameters
  readingValues.forEach((value, index) => {
    console.log(`ReadingValue ${index}:`, {
      reading_id: value.reading_id,
      parameter_id: value.parameter_id,
      value: value.value,
      parameter_code: value.parameter?.code,
      parameter_description: value.parameter?.description
    });
  });

  // Filter reading values by selected parameter
  const filteredReadingValues = readingValues.filter(value => {
    const parameterCode = value.parameter?.code || '';
    const shouldInclude = !parameter || parameter === parameterCode;
    
    console.log('Filtro de parâmetro:', {
      valueParameterCode: parameterCode,
      selectedParameter: parameter,
      shouldInclude
    });
    
    return shouldInclude;
  });

  console.log('ReadingValues após filtro de parâmetro:', filteredReadingValues.length);

  // Transform data for display
  const transformedReadings: Reading[] = filteredReadingValues.map((value) => {
    const reading = readings.find(r => r.id === value.reading_id);
    const point = selectedPointsData.find(p => p.id === reading?.point_id);
    
    console.log('Transformando value:', {
      reading_id: value.reading_id,
      reading_found: !!reading,
      point_found: !!point,
      point_id: reading?.point_id
    });

    if (!reading || !point) {
      console.log('Dados faltando - pulando:', { reading: !!reading, point: !!point });
      return null;
    }

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

    const transformedReading = {
      id: `${reading.id}-${value.parameter_id}`,
      parameter: value.parameter?.description || 'Parâmetro Desconhecido',
      value: value.value,
      unit: value.parameter?.unit || '',
      datetime: reading.measured_at,
      conamaStatus,
      hasAnomaly,
      point: point.name,
    };

    console.log('Reading transformado:', transformedReading);
    return transformedReading;
  }).filter(Boolean) as Reading[];

  console.log('Total de readings transformados:', transformedReadings.length);
  return transformedReadings;
};
