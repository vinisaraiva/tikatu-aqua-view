import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface VolunteerPoint {
  point_id: number;
  point_name: string;
  river_name: string;
  city_name: string;
  is_primary: boolean;
  weekdays?: number[] | null;
  scheduled_time?: string | null;
  tolerance_minutes?: number | null;
}

export interface VolunteerScheduleInput {
  point_id: number;
  weekdays: number[];
  scheduled_time: string;
}


export interface Volunteer {
  id: number;
  code: string;
  nome?: string;
  is_active: boolean;
  created_at: string;
  type: 'manual' | 'probe';
  api_key?: string | null;
  probe_model?: string | null;
  probe_serial?: string | null;
  last_communication?: string | null;
  point_name?: string;
  river_name?: string;
  city_name?: string;
  state?: string;
  points?: VolunteerPoint[];
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
      
      // Parse points JSON se necessário
      return (data || []).map((v: any) => ({
        ...v,
        points: typeof v.points === 'string' ? JSON.parse(v.points) : v.points || []
      }));
    },
  });
};

export const useCreateVolunteer = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (volunteerData: { 
      nome: string; 
      point_ids: number[];
      primary_point_id: number;
      password?: string;
      type: 'manual' | 'probe';
      probe_model?: string;
      probe_serial?: string;
      schedules?: VolunteerScheduleInput[];

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

      // Criar voluntário (sem point_id - relacionamento via volunteer_points)
      const volunteerInsert = {
        code,
        nome: volunteerData.nome,
        password_hash,
        type: volunteerData.type,
        api_key,
        probe_model: volunteerData.probe_model,
        probe_serial: volunteerData.probe_serial,
        is_active: true
      };

      const { data: volunteer, error: volunteerError } = await supabase
        .from('volunteers')
        .insert([volunteerInsert as any])
        .select()
        .single();

      if (volunteerError) throw volunteerError;

      // Criar relacionamentos na tabela volunteer_points
      const volunteerPoints = volunteerData.point_ids.map(pointId => ({
        volunteer_id: volunteer.id,
        point_id: pointId,
        is_primary: pointId === volunteerData.primary_point_id
      }));

      const { error: pointsError } = await supabase
        .from('volunteer_points')
        .insert(volunteerPoints);

      if (pointsError) throw pointsError;

      // Criar agendas de coleta
      const schedules = (volunteerData.schedules || []).filter(s => volunteerData.point_ids.includes(s.point_id));
      if (schedules.length > 0) {
        const { error: schedulesError } = await supabase
          .from('volunteer_schedules')
          .insert(schedules.map(s => ({
            volunteer_id: volunteer.id,
            point_id: s.point_id,
            weekdays: s.weekdays,
            scheduled_time: s.scheduled_time,
          })));

        if (schedulesError) throw schedulesError;
      }

      return volunteer;

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
      nome: string;
      point_ids: number[];
      primary_point_id: number;
      is_active: boolean;
      password?: string;
      probe_model?: string;
      probe_serial?: string;
    }) => {
      const updateData: any = {
        nome: volunteerData.nome,
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

      // Atualizar voluntário
      const { data, error } = await supabase
        .from('volunteers')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Remover pontos antigos
      const { error: deleteError } = await supabase
        .from('volunteer_points')
        .delete()
        .eq('volunteer_id', id);

      if (deleteError) throw deleteError;

      // Inserir novos pontos
      const volunteerPoints = volunteerData.point_ids.map(pointId => ({
        volunteer_id: id,
        point_id: pointId,
        is_primary: pointId === volunteerData.primary_point_id
      }));

      const { error: insertError } = await supabase
        .from('volunteer_points')
        .insert(volunteerPoints);

      if (insertError) throw insertError;

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
