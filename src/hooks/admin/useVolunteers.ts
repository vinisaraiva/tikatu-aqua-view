import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Volunteer {
  id: number;
  code: string;
  point_id: number;
  is_active: boolean;
  created_at: string;
}

export const useVolunteers = () => {
  return useQuery({
    queryKey: ['admin-volunteers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('volunteers_view')
        .select('*')
        .order('code');

      if (error) throw error;
      return data;
    },
  });
};

export const useCreateVolunteer = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (volunteerData: { point_id: number; password: string }) => {
      // Generate unique code
      const code = `VOL${Date.now().toString().slice(-6)}`;
      
      // Hash password (simple approach - in production use bcrypt)
      const password_hash = btoa(volunteerData.password);

      const { data, error } = await supabase
        .from('volunteers')
        .insert([{
          code,
          point_id: volunteerData.point_id,
          password_hash,
          is_active: true
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-volunteers'] });
      toast({
        title: 'Sucesso',
        description: 'Voluntário criado com sucesso!',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro',
        description: 'Erro ao criar voluntário.',
        variant: 'destructive',
      });
      console.error('Error creating volunteer:', error);
    },
  });
};

export const useUpdateVolunteer = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...volunteerData }: { 
      id: number; 
      point_id: number; 
      is_active: boolean;
      password?: string;
    }) => {
      const updateData: any = {
        point_id: volunteerData.point_id,
        is_active: volunteerData.is_active
      };

      if (volunteerData.password) {
        updateData.password_hash = btoa(volunteerData.password);
      }

      const { data, error } = await supabase
        .from('volunteers')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-volunteers'] });
      toast({
        title: 'Sucesso',
        description: 'Voluntário atualizado com sucesso!',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar voluntário.',
        variant: 'destructive',
      });
      console.error('Error updating volunteer:', error);
    },
  });
};

export const useDeleteVolunteer = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from('volunteers')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-volunteers'] });
      toast({
        title: 'Sucesso',
        description: 'Voluntário excluído com sucesso!',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro',
        description: 'Erro ao excluir voluntário.',
        variant: 'destructive',
      });
      console.error('Error deleting volunteer:', error);
    },
  });
};