
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

export const useReadings = (pointIds: number[], startDate?: Date, endDate?: Date) => {
  return useQuery({
    queryKey: ['readings', pointIds, startDate, endDate],
    queryFn: async (): Promise<Reading[]> => {
      if (pointIds.length === 0) return [];
      
      let query = supabase
        .from('readings')
        .select('*')
        .in('point_id', pointIds)
        .order('measured_at', { ascending: false });
      
      if (startDate) {
        query = query.gte('measured_at', startDate.toISOString());
      }
      
      if (endDate) {
        query = query.lte('measured_at', endDate.toISOString());
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data || [];
    },
    enabled: pointIds.length > 0
  });
};

export const useReadingValues = (readingIds: number[]) => {
  return useQuery({
    queryKey: ['reading_values', readingIds],
    queryFn: async (): Promise<ReadingValue[]> => {
      if (readingIds.length === 0) return [];
      
      const { data, error } = await supabase
        .from('reading_values')
        .select(`
          *,
          parameter:parameters(code, description, unit)
        `)
        .in('reading_id', readingIds);
      
      if (error) throw error;
      return data || [];
    },
    enabled: readingIds.length > 0
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
    }
  });
};
