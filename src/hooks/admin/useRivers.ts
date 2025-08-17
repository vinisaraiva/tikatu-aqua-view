import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface River {
  id: number;
  name: string;
  city_id: number;
  created_at: string;
}

export const useRivers = () => {
  return useQuery({
    queryKey: ['admin-rivers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rivers')
        .select(`
          *,
          cities (
            id,
            name,
            state
          )
        `)
        .order('name');

      if (error) throw error;
      return data;
    },
  });
};

export const useCreateRiver = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (riverData: { name: string; city_id: number }) => {
      const { data, error } = await supabase
        .from('rivers')
        .insert([riverData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-rivers'] });
      toast({
        title: 'Sucesso',
        description: 'Rio criado com sucesso!',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro',
        description: 'Erro ao criar rio.',
        variant: 'destructive',
      });
      console.error('Error creating river:', error);
    },
  });
};

export const useUpdateRiver = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...riverData }: { id: number; name: string; city_id: number }) => {
      const { data, error } = await supabase
        .from('rivers')
        .update(riverData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-rivers'] });
      toast({
        title: 'Sucesso',
        description: 'Rio atualizado com sucesso!',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar rio.',
        variant: 'destructive',
      });
      console.error('Error updating river:', error);
    },
  });
};

export const useDeleteRiver = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      // Check for related points
      const { data: pointsCount, error: checkError } = await supabase
        .from('points')
        .select('id', { count: 'exact' })
        .eq('river_id', id);
      
      if (checkError) throw checkError;
      
      if (pointsCount && pointsCount.length > 0) {
        throw new Error(`Não é possível excluir este rio pois ele possui ${pointsCount.length} ponto(s) de coleta associado(s). Exclua primeiro os pontos relacionados.`);
      }

      const { error } = await supabase
        .from('rivers')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-rivers'] });
      toast({
        title: 'Sucesso',
        description: 'Rio excluído com sucesso!',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao excluir rio.',
        variant: 'destructive',
      });
      console.error('Error deleting river:', error);
    },
  });
};