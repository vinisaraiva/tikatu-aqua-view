import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Point {
  id: number;
  name: string;
  river_id: number;
  latitude: number;
  longitude: number;
  created_at: string;
}

export const usePoints = () => {
  return useQuery({
    queryKey: ['admin-points'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('points')
        .select(`
          *,
          rivers (
            id,
            name,
            cities (
              id,
              name,
              state
            )
          )
        `)
        .order('name');

      if (error) throw error;
      return data;
    },
  });
};

export const useCreatePoint = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (pointData: { name: string; river_id: number; latitude: number; longitude: number }) => {
      const { data, error } = await supabase
        .from('points')
        .insert([pointData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-points'] });
      toast({
        title: 'Sucesso',
        description: 'Ponto criado com sucesso!',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro',
        description: 'Erro ao criar ponto.',
        variant: 'destructive',
      });
      console.error('Error creating point:', error);
    },
  });
};

export const useUpdatePoint = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...pointData }: { id: number; name: string; river_id: number; latitude: number; longitude: number }) => {
      const { data, error } = await supabase
        .from('points')
        .update(pointData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-points'] });
      toast({
        title: 'Sucesso',
        description: 'Ponto atualizado com sucesso!',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar ponto.',
        variant: 'destructive',
      });
      console.error('Error updating point:', error);
    },
  });
};

export const useDeletePoint = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from('points')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-points'] });
      toast({
        title: 'Sucesso',
        description: 'Ponto excluído com sucesso!',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro',
        description: 'Erro ao excluir ponto.',
        variant: 'destructive',
      });
      console.error('Error deleting point:', error);
    },
  });
};