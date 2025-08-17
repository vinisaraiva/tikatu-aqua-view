import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface AdminNews {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: string;
  author: string;
  image_url: string | null;
  read_time: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export const useAdminNews = () => {
  return useQuery({
    queryKey: ['admin-news'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });
};

export const useCreateNews = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (newsData: {
      title: string;
      summary: string;
      content: string;
      category: string;
      author: string;
      image_url?: string;
      read_time?: string;
      is_published?: boolean;
    }) => {
      const { data, error } = await supabase
        .from('news')
        .insert([{
          ...newsData,
          read_time: newsData.read_time || '3 min',
          is_published: newsData.is_published || false
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-news'] });
      toast({
        title: 'Sucesso',
        description: 'Notícia criada com sucesso!',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro',
        description: 'Erro ao criar notícia.',
        variant: 'destructive',
      });
      console.error('Error creating news:', error);
    },
  });
};

export const useUpdateNews = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...newsData }: {
      id: string;
      title: string;
      summary: string;
      content: string;
      category: string;
      author: string;
      image_url?: string;
      read_time?: string;
      is_published?: boolean;
    }) => {
      const { data, error } = await supabase
        .from('news')
        .update(newsData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-news'] });
      queryClient.invalidateQueries({ queryKey: ['news'] });
      toast({
        title: 'Sucesso',
        description: 'Notícia atualizada com sucesso!',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar notícia.',
        variant: 'destructive',
      });
      console.error('Error updating news:', error);
    },
  });
};

export const useDeleteNews = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('news')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-news'] });
      queryClient.invalidateQueries({ queryKey: ['news'] });
      toast({
        title: 'Sucesso',
        description: 'Notícia excluída com sucesso!',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro',
        description: 'Erro ao excluir notícia.',
        variant: 'destructive',
      });
      console.error('Error deleting news:', error);
    },
  });
};