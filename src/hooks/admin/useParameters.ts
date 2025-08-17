import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Parameter {
  id: number;
  code: string;
  description: string;
  unit: string;
  conama_min: number | null;
  conama_max: number | null;
  created_at: string;
}

export const useParameters = () => {
  return useQuery({
    queryKey: ['admin-parameters'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('parameters')
        .select('*')
        .order('code');

      if (error) throw error;
      return data;
    },
  });
};

export const useCreateParameter = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (parameterData: { 
      code: string; 
      description: string; 
      unit: string; 
      conama_min?: number; 
      conama_max?: number 
    }) => {
      const { data, error } = await supabase
        .from('parameters')
        .insert([parameterData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-parameters'] });
      toast({
        title: 'Sucesso',
        description: 'Parâmetro criado com sucesso!',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro',
        description: 'Erro ao criar parâmetro.',
        variant: 'destructive',
      });
      console.error('Error creating parameter:', error);
    },
  });
};

export const useUpdateParameter = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...parameterData }: { 
      id: number;
      code: string; 
      description: string; 
      unit: string; 
      conama_min?: number; 
      conama_max?: number 
    }) => {
      const { data, error } = await supabase
        .from('parameters')
        .update(parameterData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-parameters'] });
      toast({
        title: 'Sucesso',
        description: 'Parâmetro atualizado com sucesso!',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar parâmetro.',
        variant: 'destructive',
      });
      console.error('Error updating parameter:', error);
    },
  });
};

export const useDeleteParameter = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from('parameters')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-parameters'] });
      toast({
        title: 'Sucesso',
        description: 'Parâmetro excluído com sucesso!',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro',
        description: 'Erro ao excluir parâmetro.',
        variant: 'destructive',
      });
      console.error('Error deleting parameter:', error);
    },
  });
};