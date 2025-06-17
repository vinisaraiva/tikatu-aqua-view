
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

export const useReadings = (pointIds: number[], startDate?: Date, endDate?: Date) => {
  return useQuery({
    queryKey: ['readings', pointIds, startDate, endDate],
    queryFn: async (): Promise<Reading[]> => {
      console.log('useReadings - Buscando leituras para pontos:', pointIds);
      
      if (pointIds.length === 0) {
        console.log('useReadings - Nenhum ponto selecionado, retornando array vazio');
        return [];
      }
      
      let query = supabase
        .from('readings')
        .select('*')
        .in('point_id', pointIds)
        .order('measured_at', { ascending: false });
      
      if (startDate) {
        console.log('useReadings - Aplicando filtro de data inicial:', startDate);
        query = query.gte('measured_at', startDate.toISOString());
      }
      
      if (endDate) {
        console.log('useReadings - Aplicando filtro de data final:', endDate);
        query = query.lte('measured_at', endDate.toISOString());
      }
      
      console.log('useReadings - Executando query...');
      const { data, error } = await query;
      
      if (error) {
        console.error('useReadings - Erro na query:', error);
        throw error;
      }
      
      console.log('useReadings - Dados retornados:', data?.length || 0, 'leituras');
      return data || [];
    },
    enabled: pointIds.length > 0
  });
};

export const useReadingValues = (readingIds: number[]) => {
  return useQuery({
    queryKey: ['reading_values', readingIds],
    queryFn: async (): Promise<ReadingValue[]> => {
      console.log('useReadingValues - Buscando valores para leituras:', readingIds);
      
      if (readingIds.length === 0) {
        console.log('useReadingValues - Nenhuma leitura fornecida, retornando array vazio');
        return [];
      }
      
      console.log('useReadingValues - Executando query...');
      const { data, error } = await supabase
        .from('reading_values')
        .select(`
          *,
          parameter:parameters(code, description, unit, conama_min, conama_max)
        `)
        .in('reading_id', readingIds);
      
      if (error) {
        console.error('useReadingValues - Erro na query:', error);
        throw error;
      }
      
      console.log('useReadingValues - Dados retornados:', data?.length || 0, 'valores de leitura');
      console.log('useReadingValues - Detalhes dos valores:', data);
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
