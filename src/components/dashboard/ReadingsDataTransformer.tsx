
import { ReadingValue } from '@/hooks/useReadingsData';

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

interface TransformReadingsParams {
  readingValues: ReadingValue[];
  readings: any[];
  selectedPointsData: any[];
  parameter: string; // This is now expected to be a parameter CODE
}

// Function to calculate intelligent CONAMA status with attention zones
const calculateConamaStatus = (
  value: number, 
  conamaMin: number | null, 
  conamaMax: number | null, 
  parameterCode: string
): { status: 'normal' | 'attention' | 'critical'; hasAnomaly: boolean } => {
  // If no CONAMA limits, consider as normal
  if (conamaMin === null && conamaMax === null) {
    return { status: 'normal', hasAnomaly: false };
  }

  // Define attention zone percentage (10% margin)
  const attentionZonePercent = 0.10;
  
  // Handle parameters with only maximum limit (DBO, TDS, TEMP, etc.)
  if (conamaMin === null && conamaMax !== null) {
    const attentionThreshold = conamaMax * (1 - attentionZonePercent); // 90% of max
    const criticalThreshold = conamaMax * (1 + attentionZonePercent); // 110% of max
    
    if (value > criticalThreshold) {
      return { status: 'critical', hasAnomaly: true };
    } else if (value > attentionThreshold) {
      return { status: 'attention', hasAnomaly: false };
    } else {
      return { status: 'normal', hasAnomaly: false };
    }
  }
  
  // Handle parameters with only minimum limit (OD)
  if (conamaMax === null && conamaMin !== null) {
    const attentionThreshold = conamaMin * (1 + attentionZonePercent); // 110% of min
    const criticalThreshold = conamaMin * (1 - attentionZonePercent); // 90% of min
    
    if (value < criticalThreshold) {
      return { status: 'critical', hasAnomaly: true };
    } else if (value < attentionThreshold) {
      return { status: 'attention', hasAnomaly: false };
    } else {
      return { status: 'normal', hasAnomaly: false };
    }
  }
  
  // Handle parameters with both min and max limits (pH: 6.0-9.0)
  if (conamaMin !== null && conamaMax !== null) {
    const minAttentionThreshold = conamaMin * (1 + attentionZonePercent); // 110% of min (6.6 for pH)
    const minCriticalThreshold = conamaMin * (1 - attentionZonePercent); // 90% of min (5.4 for pH)
    const maxAttentionThreshold = conamaMax * (1 - attentionZonePercent); // 90% of max (8.1 for pH)
    const maxCriticalThreshold = conamaMax * (1 + attentionZonePercent); // 110% of max (9.9 for pH)
    
    if (value < minCriticalThreshold || value > maxCriticalThreshold) {
      return { status: 'critical', hasAnomaly: true };
    } else if (value < minAttentionThreshold || value > maxAttentionThreshold) {
      return { status: 'attention', hasAnomaly: false };
    } else {
      return { status: 'normal', hasAnomaly: false };
    }
  }
  
  return { status: 'normal', hasAnomaly: false };
};

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

    // Determine CONAMA status with intelligent attention zones
    let conamaStatus: 'normal' | 'attention' | 'critical' = 'normal';
    let hasAnomaly = false;

    if (value.parameter) {
      const { conama_min, conama_max } = value.parameter;
      
      console.log('CONAMA Classification Debug:', {
        parameter: value.parameter.code,
        value: value.value,
        conama_min,
        conama_max
      });
      
      // Calculate intelligent attention zones
      const classificationResult = calculateConamaStatus(value.value, conama_min, conama_max, value.parameter.code);
      conamaStatus = classificationResult.status;
      hasAnomaly = classificationResult.hasAnomaly;
      
      console.log('Classificado como:', conamaStatus.toUpperCase(), 'Anomalia:', hasAnomaly);
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
