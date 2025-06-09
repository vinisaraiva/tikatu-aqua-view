
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface City {
  id: number;
  name: string;
}

export interface River {
  id: number;
  city_id: number;
  name: string;
}

export interface Point {
  id: number;
  river_id: number;
  name: string;
  latitude: number;
  longitude: number;
}

export const useCities = () => {
  return useQuery({
    queryKey: ['cities'],
    queryFn: async (): Promise<City[]> => {
      const { data, error } = await supabase
        .from('cities')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data || [];
    }
  });
};

export const useRivers = (cityId?: number) => {
  return useQuery({
    queryKey: ['rivers', cityId],
    queryFn: async (): Promise<River[]> => {
      let query = supabase
        .from('rivers')
        .select('*')
        .order('name');
      
      if (cityId) {
        query = query.eq('city_id', cityId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!cityId
  });
};

export const usePoints = (riverId?: number) => {
  return useQuery({
    queryKey: ['points', riverId],
    queryFn: async (): Promise<Point[]> => {
      // CORREÇÃO: Só buscar pontos se há um riverId específico
      if (!riverId) {
        return [];
      }
      
      const { data, error } = await supabase
        .from('points')
        .select('*')
        .eq('river_id', riverId)
        .order('name');
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!riverId
  });
};
