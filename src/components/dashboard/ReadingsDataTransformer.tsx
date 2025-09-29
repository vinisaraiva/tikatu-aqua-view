
import { ReadingValue } from '@/hooks/useReadingsData';

interface Reading {
  id: string;
  parameter: string;
  parameterCode: string;
  value: number;
  unit: string;
  datetime: string;
  conamaStatus: 'normal' | 'critical';
  hasAnomaly: boolean;
  point: string;
  conamaMin?: number | null;
  conamaMax?: number | null;
}

interface TransformReadingsParams {
  readingValues: ReadingValue[];
  readings: any[];
  selectedPointsData: any[];
  parameter: string; // This is now expected to be a parameter CODE
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
    selectedParameterCode: parameter // Now using parameter CODE
  });

  // Debug: log all reading values with their parameters
  readingValues.forEach((value, index) => {
    console.log(`ReadingValue ${index}:`, {
      reading_id: value.reading_id,
      parameter_id: value.parameter_id,
      value: value.value,
      parameter_code: value.parameter?.code,
      parameter_description: value.parameter?.description,
      conama_min: value.parameter?.conama_min,
      conama_max: value.parameter?.conama_max
    });
  });

  // Filter reading values by selected parameter CODE (not description)
  const filteredReadingValues = readingValues.filter(value => {
    const parameterCode = value.parameter?.code || '';
    const shouldInclude = !parameter || parameter === parameterCode;
    
    console.log('Filtro de parâmetro (usando código):', {
      valueParameterCode: parameterCode,
      selectedParameterCode: parameter,
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
      point_id: reading?.point_id,
      conama_values: {
        min: value.parameter?.conama_min,
        max: value.parameter?.conama_max
      }
    });

    if (!reading || !point) {
      console.log('Dados faltando - pulando:', { reading: !!reading, point: !!point });
      return null;
    }

    // Extract CONAMA values from parameter
    const conamaMin = value.parameter?.conama_min || null;
    const conamaMax = value.parameter?.conama_max || null;

    // Determine CONAMA status based on parameter limits (simplified logic)
    let conamaStatus: 'normal' | 'critical' = 'normal';
    let hasAnomaly = false;

    if (value.parameter) {
      const { conama_min, conama_max } = value.parameter;
      
      console.log('CONAMA Classification Debug:', {
        parameter: value.parameter.code,
        value: value.value,
        conama_min,
        conama_max
      });
      
      if ((conama_min !== null && value.value < conama_min) || 
          (conama_max !== null && value.value > conama_max)) {
        conamaStatus = 'critical';
        hasAnomaly = true;
        console.log('Classificado como CRÍTICO');
      } else {
        console.log('Classificado como NORMAL');
      }
    }

    const transformedReading = {
      id: `${reading.id}-${value.parameter_id}`,
      parameter: value.parameter?.description || 'Parâmetro Desconhecido', // Still display description in UI
      parameterCode: value.parameter?.code || '',
      value: value.value,
      unit: value.parameter?.unit || '',
      datetime: reading.measured_at,
      conamaStatus,
      hasAnomaly,
      point: point.name,
      conamaMin, // Include CONAMA minimum value
      conamaMax  // Include CONAMA maximum value
    };

    console.log('Reading transformado com CONAMA:', {
      ...transformedReading,
      conamaMin,
      conamaMax
    });
    return transformedReading;
  }).filter(Boolean) as Reading[];

  console.log('Total de readings transformados:', transformedReadings.length);
  console.log('CONAMA values nos dados transformados:', transformedReadings.map(r => ({
    parameter: r.parameter,
    conamaMin: r.conamaMin,
    conamaMax: r.conamaMax
  })));
  
  return transformedReadings;
};
