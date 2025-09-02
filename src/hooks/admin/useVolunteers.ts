import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Volunteer {
  id: number;
  code: string;
  nome?: string;
  point_id: number;
  is_active: boolean;
  created_at: string;
  type: 'manual' | 'probe';
  api_key?: string | null;
  probe_model?: string | null;
  probe_serial?: string | null;
  last_communication?: string | null;
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
    mutationFn: async (volunteerData: { 
      nome: string; 
      point_id: number; 
      password?: string;
      type: 'manual' | 'probe';
      probe_model?: string;
      probe_serial?: string;
    }) => {
      // Generate unique code
      const prefix = volunteerData.type === 'probe' ? 'SND' : 'VOL';
      const code = `${prefix}${Date.now().toString().slice(-6)}`;
      
      let password_hash = null;
      let api_key = null;

      if (volunteerData.type === 'manual') {
        if (!volunteerData.password) {
          throw new Error('Password is required for manual volunteers');
        }
        password_hash = btoa(volunteerData.password);
      } else {
        // Generate API key for probes
        api_key = crypto.randomUUID();
      }

      const { data, error } = await supabase
        .from('volunteers')
        .insert([{
          code,
          nome: volunteerData.nome,
          point_id: volunteerData.point_id,
          password_hash,
          type: volunteerData.type,
          api_key,
          probe_model: volunteerData.probe_model,
          probe_serial: volunteerData.probe_serial,
          is_active: true
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
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
      nome: string;
      point_id: number; 
      is_active: boolean;
      password?: string;
      probe_model?: string;
      probe_serial?: string;
    }) => {
      const updateData: any = {
        nome: volunteerData.nome,
        point_id: volunteerData.point_id,
        is_active: volunteerData.is_active
      };

      if (volunteerData.password) {
        updateData.password_hash = btoa(volunteerData.password);
      }

      if (volunteerData.probe_model !== undefined) {
        updateData.probe_model = volunteerData.probe_model;
      }
      if (volunteerData.probe_serial !== undefined) {
        updateData.probe_serial = volunteerData.probe_serial;
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