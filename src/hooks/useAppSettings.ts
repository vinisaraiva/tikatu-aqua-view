import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface AppSetting {
  id: string;
  key: string;
  value: boolean;
  description: string;
  created_at: string;
  updated_at: string;
}

export const useAppSettings = () => {
  return useQuery({
    queryKey: ['app-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('app_settings')
        .select('*')
        .order('key');
      
      if (error) throw error;
      return data as AppSetting[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useAppSetting = (key: string) => {
  return useQuery({
    queryKey: ['app-setting', key],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('app_settings')
        .select('*')
        .eq('key', key)
        .single();
      
      if (error) throw error;
      return data as AppSetting;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useUpdateAppSetting = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ key, value }: { key: string; value: boolean }) => {
      const { data, error } = await supabase
        .from('app_settings')
        .update({ value })
        .eq('key', key)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['app-settings'] });
      queryClient.invalidateQueries({ queryKey: ['app-setting'] });
    },
  });
};