
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
  // Filter reading values by selected parameter CODE (not description)
  const filteredReadingValues = readingValues.filter(value => {
    const parameterCode = value.parameter?.code || '';
    return !parameter || parameter === parameterCode;
  });

  const readingsById = new Map(readings.map(r => [r.id, r]));
  const pointsById = new Map(selectedPointsData.map(p => [p.id, p]));

  const transformedReadings: Reading[] = filteredReadingValues.map((value) => {
    const reading = readingsById.get(value.reading_id);
    const point = reading ? pointsById.get(reading.point_id) : undefined;

    if (!reading || !point) {
      return null;
    }

    const conamaMin = value.parameter?.conama_min ?? null;
    const conamaMax = value.parameter?.conama_max ?? null;

    let conamaStatus: 'normal' | 'attention' | 'critical' = 'normal';
    let hasAnomaly = false;

    if (value.parameter) {
      const classificationResult = calculateConamaStatus(
        value.value,
        value.parameter.conama_min,
        value.parameter.conama_max,
        value.parameter.code
      );
      conamaStatus = classificationResult.status;
      hasAnomaly = classificationResult.hasAnomaly;
    }

    return {
      id: `${reading.id}-${value.parameter_id}`,
      parameter: value.parameter?.description || 'Parâmetro Desconhecido',
      parameterCode: value.parameter?.code || '',
      value: value.value,
      unit: value.parameter?.unit || '',
      datetime: reading.measured_at,
      conamaStatus,
      hasAnomaly,
      point: point.name,
      conamaMin,
      conamaMax
    };
  }).filter(Boolean) as Reading[];

  // Ordem cronológica crescente para os gráficos temporais
  return transformedReadings.sort(
    (a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime()
  );
};
