import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ReadingValue {
  reading_id: number;
  parameter_id: number;
  value: number | null;
  parameter: {
    id: number;
    code: string;
    description: string;
    unit: string;
    conama_min: number | null;
    conama_max: number | null;
  };
}

export interface Reading {
  id: number;
  point_id: number;
  measured_at: string;
  iqa_score: number | null;
  iet_score: number | null;
  cor_alterada: boolean | null;
  cheiro_alterado: boolean | null;
  chuva_48h: boolean | null;
  residuos_visiveis: boolean | null;
  volume_reduzido: boolean | null;
  context: any;
  created_at: string;
  points: {
    id: number;
    name: string;
    rivers: {
      id: number;
      name: string;
      cities: {
        id: number;
        name: string;
        state: string;
      };
    };
  };
  reading_values: ReadingValue[];
}

export const useReadings = () => {
  return useQuery({
    queryKey: ['admin-readings'],
    queryFn: async () => {
      // Buscar todas as leituras
      const { data: readings, error: readingsError } = await supabase
        .from('readings')
        .select(`
          *,
          points (
            id,
            name,
            rivers (
              id,
              name,
              cities (
                id,
                name,
                state
              )
            )
          ),
          reading_values (
            reading_id,
            parameter_id,
            value,
            parameter:parameters (
              id,
              code,
              description,
              unit,
              conama_min,
              conama_max
            )
          )
        `)
        .order('measured_at', { ascending: false });

      if (readingsError) throw readingsError;

      // Buscar todos os parâmetros disponíveis
      const { data: allParameters, error: parametersError } = await supabase
        .from('parameters')
        .select('*')
        .order('code');

      if (parametersError) throw parametersError;

      // Fazer merge dos dados para garantir que todos os parâmetros sejam exibidos
      const readingsWithAllParameters = readings?.map(reading => {
        const measuredParameterIds = reading.reading_values?.map(rv => rv.parameter_id) || [];
        
        // Criar reading_values completo com todos os parâmetros
        const completeReadingValues = allParameters?.map(param => {
          const measuredValue = reading.reading_values?.find(rv => rv.parameter_id === param.id);
          
          if (measuredValue) {
            // Parâmetro foi medido - usar valor real
            return measuredValue;
          } else {
            // Parâmetro não foi medido - criar entrada com valor nulo
            return {
              reading_id: reading.id,
              parameter_id: param.id,
              value: null,
              parameter: {
                id: param.id,
                code: param.code,
                description: param.description,
                unit: param.unit,
                conama_min: param.conama_min,
                conama_max: param.conama_max
              }
            };
          }
        }) || [];

        return {
          ...reading,
          reading_values: completeReadingValues
        };
      });

      return readingsWithAllParameters;
    },
  });
};

export const useCreateReading = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (readingData: {
      point_id: number;
      measured_at: string;
      iqa_score?: number;
      iet_score?: number;
      cor_alterada?: boolean;
      cheiro_alterado?: boolean;
      chuva_48h?: boolean;
      residuos_visiveis?: boolean;
      volume_reduzido?: boolean;
      context?: any;
    }) => {
      const { data, error } = await supabase
        .from('readings')
        .insert([readingData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-readings'] });
      toast({
        title: 'Sucesso',
        description: 'Leitura criada com sucesso!',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro',
        description: 'Erro ao criar leitura.',
        variant: 'destructive',
      });
      console.error('Error creating reading:', error);
    },
  });
};

export const useUpdateReading = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...readingData }: { 
      id: number;
      point_id: number;
      measured_at: string;
      iqa_score?: number;
      iet_score?: number;
      cor_alterada?: boolean;
      cheiro_alterado?: boolean;
      chuva_48h?: boolean;
      residuos_visiveis?: boolean;
      volume_reduzido?: boolean;
      context?: any;
    }) => {
      const { data, error } = await supabase
        .from('readings')
        .update(readingData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-readings'] });
      toast({
        title: 'Sucesso',
        description: 'Leitura atualizada com sucesso!',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar leitura.',
        variant: 'destructive',
      });
      console.error('Error updating reading:', error);
    },
  });
};

export const useDeleteReading = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      // Delete related reading values first (cascade delete)
      const { error: valuesError } = await supabase
        .from('reading_values')
        .delete()
        .eq('reading_id', id);
      
      if (valuesError) throw valuesError;
      
      // Then delete the reading
      const { error } = await supabase
        .from('readings')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-readings'] });
      toast({
        title: 'Sucesso',
        description: 'Leitura excluída com sucesso!',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao excluir leitura.',
        variant: 'destructive',
      });
      console.error('Error deleting reading:', error);
    },
  });
};