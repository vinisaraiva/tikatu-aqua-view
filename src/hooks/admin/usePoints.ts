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
      // Check for related readings
      const { data: readingsCount, error: readingsError } = await supabase
        .from('readings')
        .select('id', { count: 'exact' })
        .eq('point_id', id);
      
      if (readingsError) throw readingsError;
      
      // Check for related volunteers via volunteer_points
      const { data: volunteersCount, error: volunteersError } = await supabase
        .from('volunteer_points')
        .select('id', { count: 'exact' })
        .eq('point_id', id);
      
      if (volunteersError) throw volunteersError;
      
      const totalRelated = (readingsCount?.length || 0) + (volunteersCount?.length || 0);
      
      if (totalRelated > 0) {
        const messages = [];
        if (readingsCount && readingsCount.length > 0) {
          messages.push(`${readingsCount.length} leitura(s)`);
        }
        if (volunteersCount && volunteersCount.length > 0) {
          messages.push(`${volunteersCount.length} voluntário(s)`);
        }
        throw new Error(`Não é possível excluir este ponto pois ele possui ${messages.join(' e ')} associado(s). Exclua primeiro os registros relacionados.`);
      }

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
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao excluir ponto.',
        variant: 'destructive',
      });
      console.error('Error deleting point:', error);
    },
  });
};