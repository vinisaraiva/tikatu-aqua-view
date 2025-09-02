import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useViewApiKey = (volunteerId: number) => {
  return useQuery({
    queryKey: ['volunteer-api-key', volunteerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('volunteers')
        .select('api_key, code, nome, probe_model, probe_serial')
        .eq('id', volunteerId)
        .eq('type', 'probe')
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!volunteerId,
  });
};

export const useRegenerateApiKey = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (volunteerId: number) => {
      const newApiKey = crypto.randomUUID();
      
      const { data, error } = await supabase
        .from('volunteers')
        .update({ api_key: newApiKey })
        .eq('id', volunteerId)
        .eq('type', 'probe')
        .select('api_key, code, nome, probe_model, probe_serial')
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: 'API Key regenerada',
        description: 'Nova API key gerada com sucesso.',
      });
      queryClient.invalidateQueries({ queryKey: ['volunteers'] });
    },
    onError: () => {
      toast({
        title: 'Erro',
        description: 'Erro ao regenerar API key.',
        variant: 'destructive',
      });
    },
  });
};