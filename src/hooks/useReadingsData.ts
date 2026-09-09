
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Reading {
  id: number;
  point_id: number;
  measured_at: string;
  iqa_score: number | null;
  iet_score: number | null;
}

export interface ReadingValue {
  reading_id: number;
  parameter_id: number;
  value: number;
  parameter: {
    code: string;
    description: string;
    unit: string;
    conama_min: number | null;
    conama_max: number | null;
  };
}

export interface Parameter {
  id: number;
  code: string;
  description: string;
  unit: string;
  conama_min: number | null;
  conama_max: number | null;
}

/** Janela padrão (em dias) usada quando nenhuma data é selecionada. */
export const DEFAULT_WINDOW_DAYS = 30;

/** Teto de registros por consulta, para não pesar o carregamento. */
export const READINGS_LIMIT = 2000;

const CHUNK_SIZE = 200;
const STALE_TIME = 5 * 60 * 1000;

const chunk = <T,>(items: T[], size: number): T[][] => {
  const result: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    result.push(items.slice(i, i + size));
  }
  return result;
};

export const getDefaultStartDate = (): Date => {
  const date = new Date();
  date.setDate(date.getDate() - DEFAULT_WINDOW_DAYS);
  return date;
};

export const useReadings = (pointIds: number[], startDate?: Date, endDate?: Date) => {
  const usingDefaultWindow = !startDate && !endDate;
  const effectiveStart = startDate ?? (usingDefaultWindow ? getDefaultStartDate() : undefined);

  return useQuery({
    queryKey: [
      'readings',
      pointIds,
      effectiveStart?.toISOString().slice(0, 10),
      endDate?.toISOString(),
    ],
    queryFn: async (): Promise<Reading[]> => {
      if (pointIds.length === 0) return [];

      let query = supabase
        .from('readings')
        .select('*')
        .in('point_id', pointIds)
        .order('measured_at', { ascending: false })
        .limit(READINGS_LIMIT);

      if (effectiveStart) {
        query = query.gte('measured_at', effectiveStart.toISOString());
      }

      if (endDate) {
        query = query.lte('measured_at', endDate.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    },
    enabled: pointIds.length > 0,
    staleTime: STALE_TIME,
  });
};

export const useReadingValues = (readingIds: number[]) => {
  const sortedIds = [...readingIds].sort((a, b) => a - b);

  return useQuery({
    queryKey: ['reading_values', sortedIds],
    queryFn: async (): Promise<ReadingValue[]> => {
      if (sortedIds.length === 0) return [];

      const batches = await Promise.all(
        chunk(sortedIds, CHUNK_SIZE).map(async (ids) => {
          const { data, error } = await supabase
            .from('reading_values')
            .select(`
              *,
              parameter:parameters(code, description, unit, conama_min, conama_max)
            `)
            .in('reading_id', ids);

          if (error) throw error;
          return (data || []) as ReadingValue[];
        })
      );

      return batches.flat();
    },
    enabled: sortedIds.length > 0,
    staleTime: STALE_TIME,
  });
};

export const useParameters = () => {
  return useQuery({
    queryKey: ['parameters'],
    queryFn: async (): Promise<Parameter[]> => {
      const { data, error } = await supabase
        .from('parameters')
        .select('*')
        .order('code');

      if (error) throw error;
      return data || [];
    },
    staleTime: STALE_TIME,
  });
};
